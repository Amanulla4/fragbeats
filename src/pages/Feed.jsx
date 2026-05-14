import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function Feed() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [clips, setClips] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [likes, setLikes] = useState({})
  const [likeCounts, setLikeCounts] = useState({})
  const [usernames, setUsernames] = useState({})
  const [following, setFollowing] = useState({})

  // Double tap state
  const [heartAnim, setHeartAnim] = useState({}) // { clipId: true/false }
  const lastTapRef = useRef({}) // { clipId: timestamp }

  const containerRef = useRef(null)
  const videoRefs = useRef({})

  useEffect(() => { fetchClips() }, [])

  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([index, video]) => {
      if (!video) return
      if (parseInt(index) === currentIndex) video.play().catch(() => {})
      else { video.pause(); video.currentTime = 0 }
    })
  }, [currentIndex])

  async function fetchClips() {
    setLoading(true)
    const { data } = await supabase.from('clips').select('*').order('created_at', { ascending: false }).limit(20)

    if (data) {
      setClips(data)
      const counts = {}
      const likedMap = {}
      data.forEach(c => { counts[c.id] = c.likes || 0 })
      setLikeCounts(counts)

      if (user) {
        const { data: likedData } = await supabase.from('clip_likes').select('clip_id').eq('user_id', user.id)
        if (likedData) likedData.forEach(l => { likedMap[l.clip_id] = true })
        setLikes(likedMap)

        const { data: followData } = await supabase.from('follows').select('following_id').eq('follower_id', user.id)
        if (followData) {
          const fMap = {}
          followData.forEach(f => { fMap[f.following_id] = true })
          setFollowing(fMap)
        }
      }

      const uniqueIds = [...new Set(data.map(c => c.user_id).filter(Boolean))]
      if (uniqueIds.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('user_id, username').in('user_id', uniqueIds)
        if (profiles) {
          const map = {}
          profiles.forEach(p => { map[p.user_id] = p.username })
          setUsernames(map)
        }
      }
    }
    setLoading(false)
  }

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    const scrollTop = containerRef.current.scrollTop
    const height = window.innerHeight
    const index = Math.round(scrollTop / height)
    setCurrentIndex(index)
    const clip = clips[index]
    if (clip) supabase.from('clips').update({ views: (clip.views || 0) + 1 }).eq('id', clip.id)
  }, [clips])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  async function handleLike(clip) {
    if (!user) { navigate('/auth'); return }
    const isLiked = likes[clip.id]
    const currentCount = likeCounts[clip.id] || 0

    if (isLiked) {
      await supabase.from('clip_likes').delete().eq('user_id', user.id).eq('clip_id', clip.id)
      await supabase.from('clips').update({ likes: currentCount - 1 }).eq('id', clip.id)
      setLikes(prev => ({ ...prev, [clip.id]: false }))
      setLikeCounts(prev => ({ ...prev, [clip.id]: currentCount - 1 }))
    } else {
      await supabase.from('clip_likes').insert({ user_id: user.id, clip_id: clip.id })
      await supabase.from('clips').update({ likes: currentCount + 1 }).eq('id', clip.id)
      setLikes(prev => ({ ...prev, [clip.id]: true }))
      setLikeCounts(prev => ({ ...prev, [clip.id]: currentCount + 1 }))
      if (user.id !== clip.user_id) {
        await supabase.from('notifications').insert({
          user_id: clip.user_id, from_user_id: user.id,
          type: 'like', clip_id: clip.id,
          message: `liked your clip "${clip.title}"`, read: false,
        })
      }
    }
  }

  // Double tap handler
  function handleDoubleTap(clip) {
    const now = Date.now()
    const last = lastTapRef.current[clip.id] || 0
    const DOUBLE_TAP_DELAY = 300

    if (now - last < DOUBLE_TAP_DELAY) {
      // Double tap detected!
      if (!likes[clip.id]) {
        // Only like, don't unlike on double tap (TikTok behavior)
        handleLike(clip)
      }
      // Show heart animation
      setHeartAnim(prev => ({ ...prev, [clip.id]: true }))
      setTimeout(() => setHeartAnim(prev => ({ ...prev, [clip.id]: false })), 1000)
    }
    lastTapRef.current[clip.id] = now
  }

  async function handleFollow(clip) {
    if (!user) { navigate('/auth'); return }
    if (user.id === clip.user_id) return
    const isFollowing = following[clip.user_id]
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', clip.user_id)
      setFollowing(prev => ({ ...prev, [clip.user_id]: false }))
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: clip.user_id })
      setFollowing(prev => ({ ...prev, [clip.user_id]: true }))
      if (user.id !== clip.user_id) {
        await supabase.from('notifications').insert({
          user_id: clip.user_id, from_user_id: user.id,
          type: 'follow', clip_id: null,
          message: 'started following you', read: false,
        })
      }
    }
  }

  function getUsername(userId) {
    return usernames[userId] || userId?.slice(0, 8) || 'creator'
  }

  const gameColors = {
    'BGMI': '#00f5ff', 'Valorant': '#bf00ff', 'Free Fire': '#ff6b35',
    'COD Mobile': '#ff2d55', 'GTA V': '#ffd700', 'Other': '#00f5ff'
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🎮</div>
          <p className="text-cyan-400 text-xs tracking-widest animate-pulse" style={{ fontFamily: 'monospace' }}>LOADING FRAGS...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 pt-4 pb-2"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}>
        <button onClick={() => navigate(-1)} className="text-white text-xl w-10 h-10 flex items-center justify-center">←</button>
        <div className="font-black text-white tracking-widest text-sm" style={{ fontFamily: 'monospace' }}>FRAGBEATS</div>
        <button onClick={() => navigate('/explore')} className="text-cyan-400 text-xs tracking-widest" style={{ fontFamily: 'monospace' }}>EXPLORE</button>
      </div>

      {/* Feed Container */}
      <div ref={containerRef} className="h-full overflow-y-scroll" style={{ scrollSnapType: 'y mandatory', scrollBehavior: 'smooth' }}>
        {clips.map((clip, index) => (
          <div
            key={clip.id}
            className="relative w-full flex items-center justify-center"
            style={{ height: '100dvh', scrollSnapAlign: 'start', background: '#000' }}
          >
            {/* Video or Fallback — double tap zone */}
            <div className="w-full h-full" onClick={() => handleDoubleTap(clip)}>
              {clip.video_url ? (
                <video
                  ref={el => videoRefs.current[index] = el}
                  src={clip.video_url}
                  loop
                  muted={false}
                  playsInline
                  className="w-full h-full object-cover"
                  onClick={e => {
                    e.stopPropagation()
                    handleDoubleTap(clip)
                    if (e.target.paused) e.target.play()
                    else e.target.pause()
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-9xl"
                  style={{ background: `linear-gradient(135deg, #040810, ${gameColors[clip.game] || '#00f5ff'}33)` }}>
                  {clip.emoji || '🎮'}
                </div>
              )}
            </div>

            {/* ❤️ Double tap heart animation */}
            {heartAnim[clip.id] && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                <div className="text-8xl animate-ping" style={{ animationDuration: '0.6s' }}>❤️</div>
              </div>
            )}

            {/* Gradient overlays */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%, rgba(0,0,0,0.3) 100%)' }} />

            {/* Bottom Info */}
            <div className="absolute bottom-0 left-0 right-16 p-5 pointer-events-none">
              <div className="inline-block px-2 py-1 rounded text-xs font-black tracking-widest mb-2"
                style={{ background: `${gameColors[clip.game] || '#00f5ff'}33`, color: gameColors[clip.game] || '#00f5ff', fontFamily: 'monospace' }}>
                {clip.game}
              </div>
              <h2 className="text-white font-black text-xl mb-1 leading-tight" style={{ fontFamily: 'monospace' }}>{clip.title}</h2>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xs font-black text-black">
                  {getUsername(clip.user_id)[0]?.toUpperCase() || 'G'}
                </div>
                <span className="text-white text-sm font-bold">@{getUsername(clip.user_id)}</span>
                {user?.id !== clip.user_id && (
                  <button
                    onClick={() => handleFollow(clip)}
                    className={`ml-2 px-3 py-1 rounded text-xs font-black tracking-widest pointer-events-auto transition-all duration-200 ${following[clip.user_id] ? 'border border-white/30 text-white/70' : 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black'}`}
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
              {/* Double tap hint */}
              <p className="text-white/30 text-xs mt-2">💡 Double tap to like</p>
            </div>

            {/* Right Action Buttons */}
            <div className="absolute right-3 bottom-24 flex flex-col items-center gap-6">
              <button onClick={() => handleLike(clip)} className="flex flex-col items-center gap-1 group">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-200 ${likes[clip.id] ? 'scale-110' : 'group-hover:scale-110'}`}
                  style={{ background: likes[clip.id] ? 'rgba(255,107,157,0.2)' : 'rgba(255,255,255,0.1)' }}>
                  {likes[clip.id] ? '❤️' : '🤍'}
                </div>
                <span className="text-white text-xs font-bold">
                  {likeCounts[clip.id] > 999 ? (likeCounts[clip.id] / 1000).toFixed(1) + 'K' : likeCounts[clip.id] || 0}
                </span>
              </button>

              <button onClick={() => navigate(`/clip/${clip.id}`)} className="flex flex-col items-center gap-1 group">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.1)' }}>💬</div>
                <span className="text-white text-xs font-bold">View</span>
              </button>

              <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/clip/${clip.id}`)} className="flex flex-col items-center gap-1 group">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.1)' }}>🔗</div>
                <span className="text-white text-xs font-bold">Share</span>
              </button>

              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ background: 'rgba(255,255,255,0.1)' }}>👁</div>
                <span className="text-white text-xs font-bold">
                  {clip.views > 999 ? (clip.views / 1000).toFixed(1) + 'K' : clip.views || 0}
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
              <p className="text-cyan-400 font-black text-xl tracking-widest mb-2" style={{ fontFamily: 'monospace' }}>YOU'RE ALL CAUGHT UP</p>
              <p className="text-slate-500 text-sm mb-6">You've seen all the frags!</p>
              <button onClick={() => navigate('/upload')}
                className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-6 py-3 rounded-lg font-black text-sm tracking-widest hover:brightness-110 transition-all"
                style={{ fontFamily: 'monospace' }}>
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