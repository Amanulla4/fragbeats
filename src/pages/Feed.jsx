// src/pages/Feed.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import SEO from '../components/SEO'

function Feed() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()

  const [clips, setClips] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [soundOn, setSoundOn] = useState(false)
  const [likes, setLikes] = useState({})
  const [likeCounts, setLikeCounts] = useState({})
  const [usernames, setUsernames] = useState({})
  const [verifiedMap, setVerifiedMap] = useState({})
  const [following, setFollowing] = useState({})
  const [bookmarks, setBookmarks] = useState({})
  const [bookmarkAnim, setBookmarkAnim] = useState({})
  const [heartAnim, setHeartAnim] = useState({})

  const lastTapRef = useRef({})
  const containerRef = useRef(null)
  const videoRefs = useRef({})
  const viewedClipIdsRef = useRef(new Set())

  useEffect(() => {
    fetchClips()
  }, [user?.id])

  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([index, video]) => {
      if (!video) return
      video.muted = !soundOn
      if (Number(index) === currentIndex) {
        video.play().catch(() => {})
      } else {
        video.pause()
        video.currentTime = 0
      }
    })
  }, [currentIndex, soundOn])

  async function fetchClips() {
    setLoading(true)

    const { data, error } = await supabase
      .from('clips')
      .select('*')
      .not('video_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Feed clips error:', error.message)
      toast.error('Could not load feed. Pull to refresh.')
      setLoading(false)
      return
    }

    const clipData = data || []
    setClips(clipData)

    const counts = {}
    const likedMap = {}

    clipData.forEach((clip) => {
      counts[clip.id] = clip.likes || 0
    })

    setLikeCounts(counts)

    if (user) {
      const { data: likedData } = await supabase
        .from('clip_likes')
        .select('clip_id')
        .eq('user_id', user.id)

      if (likedData) likedData.forEach((like) => { likedMap[like.clip_id] = true })
      setLikes(likedMap)

      const { data: followData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)

      if (followData) {
        const followMap = {}
        followData.forEach((follow) => { followMap[follow.following_id] = true })
        setFollowing(followMap)
      }

      const { data: bookmarkData } = await supabase
        .from('bookmarks')
        .select('clip_id')
        .eq('user_id', user.id)

      if (bookmarkData) {
        const bookmarkMap = {}
        bookmarkData.forEach((bookmark) => { bookmarkMap[bookmark.clip_id] = true })
        setBookmarks(bookmarkMap)
      }
    } else {
      setLikes({})
      setFollowing({})
      setBookmarks({})
    }

    const uniqueUserIds = [...new Set(clipData.map((clip) => clip.user_id).filter(Boolean))]

    if (uniqueUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, verified')
        .in('user_id', uniqueUserIds)

      if (profiles) {
        const usernameMap = {}
        const verifiedUsers = {}

        profiles.forEach((profile) => {
          usernameMap[profile.user_id] = profile.username
          verifiedUsers[profile.user_id] = profile.verified || false
        })

        setUsernames(usernameMap)
        setVerifiedMap(verifiedUsers)
      }
    }

    setLoading(false)
  }

  async function countClipView(clip) {
    if (!clip || viewedClipIdsRef.current.has(clip.id)) return

    viewedClipIdsRef.current.add(clip.id)
    const nextViews = (clip.views || 0) + 1

    setClips((prev) =>
      prev.map((item) => (item.id === clip.id ? { ...item, views: nextViews } : item))
    )

    // Non-critical, fail silently — view count isn't worth interrupting the user
    await supabase.from('clips').update({ views: nextViews }).eq('id', clip.id)
  }

  const handleScroll = useCallback(() => {
    if (!containerRef.current || clips.length === 0) return

    const scrollTop = containerRef.current.scrollTop
    const height = window.innerHeight
    const nextIndex = Math.round(scrollTop / height)
    const safeIndex = Math.max(0, Math.min(nextIndex, clips.length - 1))

    setCurrentIndex((prev) => (prev === safeIndex ? prev : safeIndex))
    countClipView(clips[safeIndex])
  }, [clips])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    if (clips.length > 0) countClipView(clips[0])
  }, [clips.length])

  function toggleSound() {
    const nextSoundState = !soundOn
    setSoundOn(nextSoundState)

    const currentVideo = videoRefs.current[currentIndex]
    if (currentVideo) {
      currentVideo.muted = !nextSoundState
      currentVideo.volume = 1
      currentVideo.play().catch(() => {})
    }
  }

  function handleDoubleTap(clip) {
    const now = Date.now()
    const lastTap = lastTapRef.current[clip.id] || 0

    if (now - lastTap < 300) {
      if (!likes[clip.id]) handleLike(clip)

      setHeartAnim((prev) => ({ ...prev, [clip.id]: true }))
      setTimeout(() => {
        setHeartAnim((prev) => ({ ...prev, [clip.id]: false }))
      }, 1000)
    }

    lastTapRef.current[clip.id] = now
  }

  // ── Like: optimistic update with rollback on failure ──────────────────────
  async function handleLike(clip) {
    if (!user) { navigate('/auth'); return }

    const isLiked = likes[clip.id]
    const currentCount = likeCounts[clip.id] || 0

    if (isLiked) {
      const nextCount = Math.max(0, currentCount - 1)

      // Optimistic update first
      setLikes((prev) => ({ ...prev, [clip.id]: false }))
      setLikeCounts((prev) => ({ ...prev, [clip.id]: nextCount }))

      const { error: deleteError } = await supabase
        .from('clip_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('clip_id', clip.id)

      if (deleteError) {
        // Rollback
        setLikes((prev) => ({ ...prev, [clip.id]: true }))
        setLikeCounts((prev) => ({ ...prev, [clip.id]: currentCount }))
        toast.error('Could not unlike. Try again.')
        return
      }

      await supabase.from('clips').update({ likes: nextCount }).eq('id', clip.id)
      return
    }

    // Optimistic update first
    setLikes((prev) => ({ ...prev, [clip.id]: true }))
    setLikeCounts((prev) => ({ ...prev, [clip.id]: currentCount + 1 }))

    const { error } = await supabase
      .from('clip_likes')
      .insert({ user_id: user.id, clip_id: clip.id })

    if (error) {
      // Rollback
      setLikes((prev) => ({ ...prev, [clip.id]: false }))
      setLikeCounts((prev) => ({ ...prev, [clip.id]: currentCount }))
      toast.error('Could not like clip. Try again.')
      return
    }

    const nextCount = currentCount + 1
    await supabase.from('clips').update({ likes: nextCount }).eq('id', clip.id)

    if (clip.user_id && user.id !== clip.user_id) {
      await supabase.from('notifications').insert({
        user_id: clip.user_id,
        from_user_id: user.id,
        type: 'like',
        clip_id: clip.id,
        message: `liked your clip "${clip.title}"`,
        read: false,
      })
    }
  }

  // ── Bookmark: optimistic update with rollback + toast ──────────────────────
  async function handleBookmark(clip) {
    if (!user) { navigate('/auth'); return }

    const isBookmarked = bookmarks[clip.id]

    if (isBookmarked) {
      setBookmarks((prev) => ({ ...prev, [clip.id]: false }))

      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('clip_id', clip.id)

      if (error) {
        setBookmarks((prev) => ({ ...prev, [clip.id]: true }))
        toast.error('Could not remove bookmark.')
        return
      }

      toast.show('Removed from saved', { icon: '🗑️' })
      return
    }

    setBookmarks((prev) => ({ ...prev, [clip.id]: true }))
    setBookmarkAnim((prev) => ({ ...prev, [clip.id]: true }))

    const { error } = await supabase
      .from('bookmarks')
      .insert({ user_id: user.id, clip_id: clip.id })

    if (error) {
      setBookmarks((prev) => ({ ...prev, [clip.id]: false }))
      setBookmarkAnim((prev) => ({ ...prev, [clip.id]: false }))
      toast.error('Could not save clip.')
      return
    }

    toast.success('Saved to your collection', { icon: '🔖' })

    setTimeout(() => {
      setBookmarkAnim((prev) => ({ ...prev, [clip.id]: false }))
    }, 600)
  }

  function handleWhatsAppShare(clip) {
    const url = `${window.location.origin}/clip/${clip.id}`
    const text = `Check out this frag on FragBeats!\n"${clip.title}" - ${clip.game}\n${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }

  // ── Follow: optimistic update with rollback + toast ─────────────────────────
  async function handleFollow(clip) {
    if (!user) { navigate('/auth'); return }
    if (!clip.user_id || user.id === clip.user_id) return

    const isFollowing = following[clip.user_id]
    const username = usernames[clip.user_id]

    if (isFollowing) {
      setFollowing((prev) => ({ ...prev, [clip.user_id]: false }))

      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', clip.user_id)

      if (error) {
        setFollowing((prev) => ({ ...prev, [clip.user_id]: true }))
        toast.error('Could not unfollow. Try again.')
        return
      }

      return
    }

    setFollowing((prev) => ({ ...prev, [clip.user_id]: true }))

    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: user.id, following_id: clip.user_id })

    if (error) {
      setFollowing((prev) => ({ ...prev, [clip.user_id]: false }))
      toast.error('Could not follow. Try again.')
      return
    }

    toast.success(username ? `Following @${username}` : 'Following', { icon: '✅' })

    await supabase.from('notifications').insert({
      user_id: clip.user_id,
      from_user_id: user.id,
      type: 'follow',
      clip_id: null,
      message: 'started following you',
      read: false,
    })
  }

  function getUsername(userId) {
    return usernames[userId] || userId?.slice(0, 8) || 'creator'
  }

  function isVerified(userId) {
    return verifiedMap[userId] || false
  }

  function handleCreatorClick(e, clip) {
    e.stopPropagation()
    const username = usernames[clip.user_id]
    if (username) navigate(`/u/${username}`)
  }

  const gameColors = {
    BGMI: '#00f5ff',
    Valorant: '#bf00ff',
    'Free Fire': '#ff6b35',
    'COD Mobile': '#ff2d55',
    'GTA V': '#ffd700',
    Other: '#00f5ff',
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🎮</div>
          <p className="text-cyan-400 text-xs tracking-widest animate-pulse" style={{ fontFamily: 'monospace' }}>
            LOADING FRAGS...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <SEO
        title="Feed"
        description="Scroll through the latest gaming frags on FragBeats."
        url="/feed"
      />

      <div
        className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 pt-4 pb-2"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}
      >
        <button onClick={() => navigate(-1)} className="text-white text-xl w-10 h-10 flex items-center justify-center">
          ←
        </button>
        <div className="font-black text-white tracking-widest text-sm" style={{ fontFamily: 'monospace' }}>
          FRAGBEATS
        </div>
        <button onClick={() => navigate('/explore')} className="text-cyan-400 text-xs tracking-widest" style={{ fontFamily: 'monospace' }}>
          EXPLORE
        </button>
      </div>

      <button
        type="button"
        onClick={toggleSound}
        className="absolute top-16 right-4 z-50 px-3 py-2 rounded-full bg-black/60 border border-white/20 text-white text-xs font-bold backdrop-blur-sm"
        style={{ fontFamily: 'monospace' }}
      >
        {soundOn ? '🔊 SOUND ON' : '🔇 MUTED'}
      </button>

      <div ref={containerRef} className="h-full overflow-y-scroll" style={{ scrollSnapType: 'y mandatory', scrollBehavior: 'smooth' }}>
        {clips.length === 0 && (
          <div className="flex items-center justify-center px-8 text-center" style={{ height: '100dvh', background: '#040810' }}>
            <div>
              <div className="text-5xl mb-4">🎮</div>
              <p className="text-cyan-400 font-black text-xl tracking-widest mb-2" style={{ fontFamily: 'monospace' }}>
                NO VIDEO CLIPS YET
              </p>
              <p className="text-slate-500 text-sm mb-6">Upload the first playable frag.</p>
              <button
                onClick={() => navigate('/upload')}
                className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-6 py-3 rounded-lg font-black text-sm tracking-widest hover:brightness-110 transition-all"
                style={{ fontFamily: 'monospace' }}
              >
                + UPLOAD YOUR FRAG
              </button>
            </div>
          </div>
        )}

        {clips.map((clip, index) => (
          <div key={clip.id} className="relative w-full flex items-center justify-center" style={{ height: '100dvh', scrollSnapAlign: 'start', background: '#000' }}>
            <div className="w-full h-full" onClick={() => handleDoubleTap(clip)}>
              <video
                ref={(el) => { videoRefs.current[index] = el }}
                src={clip.video_url}
                loop
                muted={!soundOn}
                playsInline
                preload="metadata"
                className="w-full h-full object-cover"
                onClick={(event) => {
                  event.stopPropagation()
                  handleDoubleTap(clip)
                  if (event.currentTarget.paused) {
                    event.currentTarget.play().catch(() => {})
                  } else {
                    event.currentTarget.pause()
                  }
                }}
              />
            </div>

            {heartAnim[clip.id] && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                <div className="text-8xl animate-ping" style={{ animationDuration: '0.6s' }}>❤️</div>
              </div>
            )}

            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%, rgba(0,0,0,0.3) 100%)' }}
            />

            <div className="absolute bottom-0 left-0 right-16 p-5 pointer-events-none">
              <div
                className="inline-block px-2 py-1 rounded text-xs font-black tracking-widest mb-2"
                style={{
                  background: `${gameColors[clip.game] || '#00f5ff'}33`,
                  color: gameColors[clip.game] || '#00f5ff',
                  fontFamily: 'monospace',
                }}
              >
                {clip.game}
              </div>

              <h2 className="text-white font-black text-xl mb-1 leading-tight" style={{ fontFamily: 'monospace' }}>
                {clip.title}
              </h2>

              <div className="flex items-center gap-2">
                <button
                  className="flex items-center gap-2 pointer-events-auto active:opacity-70 transition-opacity"
                  onClick={(e) => handleCreatorClick(e, clip)}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xs font-black text-black">
                    {getUsername(clip.user_id)[0]?.toUpperCase() || 'G'}
                  </div>
                  <span className="text-white text-sm font-bold">@{getUsername(clip.user_id)}</span>
                  {isVerified(clip.user_id) && <span className="text-sm" title="Verified Creator">✅</span>}
                </button>

                {user?.id !== clip.user_id && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleFollow(clip) }}
                    className={`ml-1 px-3 py-1 rounded text-xs font-black tracking-widest pointer-events-auto transition-all duration-200 ${
                      following[clip.user_id]
                        ? 'border border-white/30 text-white/70'
                        : 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black'
                    }`}
                    style={{ fontFamily: 'monospace' }}
                  >
                    {following[clip.user_id] ? 'Following' : '+ Follow'}
                  </button>
                )}
              </div>

              {clip.music && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg">🎵</span>
                  <span className="text-white/70 text-xs">{clip.music}</span>
                </div>
              )}

              <p className="text-white/30 text-xs mt-2">
                {soundOn ? 'Tap video to pause' : 'Tap 🔇 to turn sound on'}
              </p>
            </div>

            <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5">
              <button onClick={() => handleLike(clip)} className="flex flex-col items-center gap-1 group">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-200 ${
                    likes[clip.id] ? 'scale-110' : 'group-hover:scale-110'
                  }`}
                  style={{ background: likes[clip.id] ? 'rgba(255,107,157,0.2)' : 'rgba(255,255,255,0.1)' }}
                >
                  {likes[clip.id] ? '❤️' : '🤍'}
                </div>
                <span className="text-white text-xs font-bold">
                  {likeCounts[clip.id] > 999 ? `${(likeCounts[clip.id] / 1000).toFixed(1)}K` : likeCounts[clip.id] || 0}
                </span>
              </button>

              <button onClick={() => navigate(`/clip/${clip.id}`)} className="flex flex-col items-center gap-1 group">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-all duration-200" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  💬
                </div>
                <span className="text-white text-xs font-bold">View</span>
              </button>

              <button onClick={() => handleBookmark(clip)} className="flex flex-col items-center gap-1 group">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-200 ${
                    bookmarkAnim[clip.id] ? 'scale-125' : 'group-hover:scale-110'
                  }`}
                  style={{ background: bookmarks[clip.id] ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.1)' }}
                >
                  {bookmarks[clip.id] ? '🔖' : '📌'}
                </div>
                <span className="text-white text-xs font-bold">Save</span>
              </button>

              <button onClick={() => handleWhatsAppShare(clip)} className="flex flex-col items-center gap-1 group">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-all duration-200" style={{ background: 'rgba(37,211,102,0.15)' }}>
                  📤
                </div>
                <span className="text-white text-xs font-bold">Share</span>
              </button>

              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  👁
                </div>
                <span className="text-white text-xs font-bold">
                  {clip.views > 999 ? `${(clip.views / 1000).toFixed(1)}K` : clip.views || 0}
                </span>
              </div>
            </div>

            {index === 0 && currentIndex === 0 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce pointer-events-none">
                <span className="text-white/50 text-xs tracking-widest">SCROLL</span>
                <span className="text-white/50 text-lg">↓</span>
              </div>
            )}
          </div>
        ))}

        {clips.length > 0 && (
          <div className="flex items-center justify-center" style={{ height: '100dvh', background: '#040810' }}>
            <div className="text-center">
              <div className="text-5xl mb-4">🎮</div>
              <p className="text-cyan-400 font-black text-xl tracking-widest mb-2" style={{ fontFamily: 'monospace' }}>
                YOU'RE ALL CAUGHT UP
              </p>
              <p className="text-slate-500 text-sm mb-6">You've seen all the frags!</p>
              <button
                onClick={() => navigate('/upload')}
                className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-6 py-3 rounded-lg font-black text-sm tracking-widest hover:brightness-110 transition-all"
                style={{ fontFamily: 'monospace' }}
              >
                + UPLOAD YOUR FRAG
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Feed