// src/pages/ClipDetail.jsx
import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useNavigate, useParams } from 'react-router-dom'
import ShareModal from '../components/ShareModal'
import ReportModal from '../components/ReportModal'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import SEO from '../components/SEO'

const TYPE_GAME_COLOR = {
  BGMI: '#00f5ff',
  Valorant: '#bf00ff',
  'Free Fire': '#ff6b35',
  'COD Mobile': '#ff2d55',
  'GTA V': '#ffd700',
  Other: '#00f5ff',
}

function ClipDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()

  const [clip, setClip] = useState(null)
  const [clipCreator, setClipCreator] = useState('')
  const [clipCreatorVerified, setClipCreatorVerified] = useState(false)
  const [relatedClips, setRelatedClips] = useState([])
  const [loading, setLoading] = useState(true)

  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [likeLoading, setLikeLoading] = useState(false)

  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)
  const [usernames, setUsernames] = useState({})
  const [verifiedMap, setVerifiedMap] = useState({})

  const [following, setFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)

  const [bookmarked, setBookmarked] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)

  const followerChannelRef = useRef(null)
  const viewedClipIdRef = useRef(null)

  useEffect(() => {
    if (!id) return

    setClip(null)
    setLiked(false)
    setFollowing(false)
    setBookmarked(false)
    setClipCreator('')
    setClipCreatorVerified(false)
    viewedClipIdRef.current = null

    fetchClip()
    fetchComments()
  }, [id])

  useEffect(() => {
    if (!clip) return

    fetchCreatorProfile(clip.user_id)
    fetchFollowerCount(clip.user_id)
    subscribeToFollowers(clip.user_id)

    if (user) {
      checkIfLiked()
      checkIfFollowing()
      checkIfBookmarked()
    }

    return cleanupFollowerChannel
  }, [clip?.id, user?.id])

  function cleanupFollowerChannel() {
    if (followerChannelRef.current) {
      supabase.removeChannel(followerChannelRef.current)
      followerChannelRef.current = null
    }
  }

  function subscribeToFollowers(creatorId) {
    cleanupFollowerChannel()

    const channel = supabase
      .channel(`followers:${creatorId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'follows', filter: `following_id=eq.${creatorId}` },
        () => setFollowerCount((prev) => prev + 1)
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'follows', filter: `following_id=eq.${creatorId}` },
        () => setFollowerCount((prev) => Math.max(0, prev - 1))
      )
      .subscribe()

    followerChannelRef.current = channel
  }

  async function fetchClip() {
    setLoading(true)

    const { data, error } = await supabase.from('clips').select('*').eq('id', id).single()

    if (error || !data) {
      setClip(null)
      setLoading(false)
      return
    }

    const nextViews = (data.views || 0) + 1

    setClip({ ...data, views: nextViews })
    setLikeCount(data.likes || 0)
    fetchRelatedClips(data.game, data.id)

    if (viewedClipIdRef.current !== data.id) {
      viewedClipIdRef.current = data.id
      await supabase.from('clips').update({ views: nextViews }).eq('id', data.id)
    }

    setLoading(false)
  }

  async function fetchCreatorProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('username, verified')
      .eq('user_id', userId)
      .single()

    setClipCreator(data?.username || '')
    setClipCreatorVerified(data?.verified || false)
  }

  async function fetchFollowerCount(userId) {
    const { count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId)

    setFollowerCount(count || 0)
  }

  async function fetchRelatedClips(game, currentId) {
    const { data } = await supabase
      .from('clips')
      .select('*')
      .eq('game', game)
      .neq('id', currentId)
      .not('video_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(3)

    setRelatedClips(data || [])
  }

  async function checkIfLiked() {
    const { data } = await supabase
      .from('clip_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('clip_id', id)
      .maybeSingle()

    setLiked(Boolean(data))
  }

  async function checkIfFollowing() {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', clip.user_id)
      .maybeSingle()

    setFollowing(Boolean(data))
  }

  async function checkIfBookmarked() {
    const { data } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('clip_id', id)
      .maybeSingle()

    setBookmarked(Boolean(data))
  }

  async function fetchComments() {
    setCommentsLoading(true)

    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('clip_id', id)
      .order('created_at', { ascending: false })

    const commentData = data || []
    setComments(commentData)

    const uniqueIds = [...new Set(commentData.map((comment) => comment.user_id).filter(Boolean))]

    if (uniqueIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, verified')
        .in('user_id', uniqueIds)

      if (profiles) {
        const map = {}
        const vMap = {}

        profiles.forEach((profile) => {
          map[profile.user_id] = profile.username
          vMap[profile.user_id] = profile.verified || false
        })

        setUsernames(map)
        setVerifiedMap(vMap)
      }
    }

    setCommentsLoading(false)
  }

  async function sendNotification(toUserId, type, message) {
    if (!user || !toUserId || user.id === toUserId) return

    await supabase.from('notifications').insert({
      user_id: toUserId,
      from_user_id: user.id,
      type,
      clip_id: type === 'follow' ? null : Number(id),
      message,
      read: false,
    })
  }

  async function handleLike() {
    if (!user) { navigate('/auth'); return }
    if (likeLoading) return
    setLikeLoading(true)

    if (liked) {
      const nextCount = Math.max(0, likeCount - 1)
      await supabase.from('clip_likes').delete().eq('user_id', user.id).eq('clip_id', id)
      await supabase.from('clips').update({ likes: nextCount }).eq('id', id)
      setLiked(false)
      setLikeCount(nextCount)
      setLikeLoading(false)
      return
    }

    const { error } = await supabase.from('clip_likes').insert({ user_id: user.id, clip_id: id })

    if (!error) {
      const nextCount = likeCount + 1
      await supabase.from('clips').update({ likes: nextCount }).eq('id', id)
      setLiked(true)
      setLikeCount(nextCount)
      await sendNotification(clip.user_id, 'like', `liked your clip "${clip.title}"`)
    }

    setLikeLoading(false)
  }

  async function handleFollow() {
    if (!user) { navigate('/auth'); return }
    if (followLoading || user.id === clip?.user_id) return
    setFollowLoading(true)

    if (following) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', clip.user_id)
      setFollowing(false)
      setFollowLoading(false)
      return
    }

    const { error } = await supabase.from('follows').insert({ follower_id: user.id, following_id: clip.user_id })

    if (!error) {
      setFollowing(true)
      await sendNotification(clip.user_id, 'follow', 'started following you')
    }

    setFollowLoading(false)
  }

  async function handleBookmark() {
    if (!user) { navigate('/auth'); return }

    if (bookmarked) {
      await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('clip_id', id)
      setBookmarked(false)
      return
    }

    const { error } = await supabase.from('bookmarks').insert({ user_id: user.id, clip_id: Number(id) })
    if (!error) setBookmarked(true)
  }

  async function handleComment() {
    if (!user) { navigate('/auth'); return }

    const text = newComment.trim()
    if (!text || posting) return
    setPosting(true)

    const { data, error } = await supabase
      .from('comments')
      .insert({ user_id: user.id, clip_id: Number(id), text })
      .select()
      .single()

    if (!error && data) {
      if (!usernames[user.id]) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, verified')
          .eq('user_id', user.id)
          .single()

        if (profile?.username) {
          setUsernames((prev) => ({ ...prev, [user.id]: profile.username }))
          setVerifiedMap((prev) => ({ ...prev, [user.id]: profile.verified || false }))
        }
      }

      setComments((prev) => [data, ...prev])
      setNewComment('')
      await sendNotification(clip.user_id, 'comment', `commented on your clip "${clip.title}"`)
    }

    setPosting(false)
  }

  function handleWhatsAppShare() {
    const url = `${window.location.origin}/clip/${clip.id}`
    const text = `Check out this frag on FragBeats!\n"${clip.title}" - ${clip.game}\n${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }

  function getUsername(userId) {
    return usernames[userId] || userId?.slice(0, 8) || 'user'
  }

  function isVerified(userId) {
    return verifiedMap[userId] || false
  }

  function formatTime(timestamp) {
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <Navbar />
        <div className="text-cyan-400 text-xs tracking-widest animate-pulse" style={{ fontFamily: 'monospace' }}>
          LOADING CLIP...
        </div>
      </div>
    )
  }

  if (!clip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'var(--bg)' }}>
        <SEO title="Clip Not Found" url={`/clip/${id}`} />
        <Navbar />
        <div className="text-center">
          <div className="text-5xl mb-4">💀</div>
          <p className="text-slate-400 text-sm tracking-widest">CLIP NOT FOUND</p>
          <button onClick={() => navigate('/explore')} className="mt-4 text-cyan-400 text-xs tracking-widest">
            ← BACK TO EXPLORE
          </button>
        </div>
      </div>
    )
  }

  const isOwnClip = user?.id === clip.user_id
  const creatorName = clipCreator || clip.user_id?.slice(0, 8) || 'creator'
  const accentColor = TYPE_GAME_COLOR[clip.game] || clip.color || '#00f5ff'

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <SEO
        title={clip.title || 'Gaming Clip'}
        description={`${clip.game || 'Gaming'} clip by @${creatorName} on FragBeats. ${clip.views || 0} views.`}
        image={clip.thumbnail_url || undefined}
        url={`/clip/${clip.id}`}
        type="video.other"
      />
      <Navbar />

      <div className="max-w-6xl mx-auto px-5 md:px-8 pt-32 pb-44 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div
              className="w-full aspect-video bg-[#0b1425] rounded-xl border border-cyan-500/20 flex items-center justify-center relative overflow-hidden mb-4"
              style={{ background: `linear-gradient(135deg, #0b1425, ${accentColor}11)` }}
            >
              {clip.video_url ? (
                <video src={clip.video_url} controls playsInline className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="text-8xl">{clip.emoji || '🎮'}</div>
              )}

              <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-3">
                <span className="text-lg">🎵</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-bold truncate">{clip.music || 'No music selected'}</div>
                  <div className="w-full h-1 bg-white/20 rounded-full mt-1">
                    <div className="w-1/3 h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="font-black text-2xl text-white mb-1" style={{ fontFamily: 'monospace' }}>
                    {clip.title} {clip.emoji}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-slate-500 text-sm">
                    <span>👁 {clip.views || 0} views</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-bold">{clip.game}</span>
                    <span>•</span>
                    <span>{new Date(clip.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0 flex-wrap">
                  <button
                    onClick={handleLike}
                    disabled={likeLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all duration-200 disabled:opacity-50 ${
                      liked
                        ? 'border-pink-400 text-pink-400 bg-pink-400/10'
                        : 'border-cyan-500/20 text-slate-400 hover:border-pink-400 hover:text-pink-400'
                    }`}
                  >
                    {liked ? '❤️' : '🤍'} {likeCount}
                  </button>

                  <button
                    onClick={handleBookmark}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all duration-200 ${
                      bookmarked
                        ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10'
                        : 'border-cyan-500/20 text-slate-400 hover:border-yellow-400 hover:text-yellow-400'
                    }`}
                  >
                    {bookmarked ? '🔖' : '📌'}
                  </button>

                  <button
                    onClick={handleWhatsAppShare}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all duration-200 hover:brightness-110"
                    style={{ borderColor: 'rgba(37,211,102,0.4)', color: '#25D366', background: 'rgba(37,211,102,0.08)' }}
                  >
                    Share
                  </button>

                  <button
                    onClick={() => setShareOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-500/20 text-slate-400 text-sm hover:border-cyan-400 hover:text-cyan-400 transition-all duration-200"
                  >
                    🔗 Link
                  </button>

                  {user && !isOwnClip && (
                    <button
                      onClick={() => setReportOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all duration-200 hover:brightness-110"
                      style={{ borderColor: 'rgba(255,45,85,0.3)', color: '#ff2d55', background: 'rgba(255,45,85,0.08)' }}
                    >
                      🚩 Report
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0b1425] border border-cyan-500/10 rounded-xl">
                <button
                  className="flex items-center gap-3 group active:opacity-70 transition-opacity"
                  onClick={() => clipCreator && navigate(`/u/${clipCreator}`)}
                  style={{ cursor: clipCreator ? 'pointer' : 'default' }}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xl">
                    🎮
                  </div>

                  <div>
                    <div className="flex items-center gap-1">
                      <div className="text-cyan-400 font-bold text-sm group-hover:text-cyan-300 transition-colors">
                        @{creatorName}
                      </div>
                      {clipCreatorVerified && <span title="Verified Creator" className="text-sm">✅</span>}
                    </div>

                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                      <span>{followerCount} followers</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse ml-1" title="Live" />
                    </div>
                  </div>
                </button>

                {!isOwnClip ? (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`px-4 py-2 rounded-lg text-xs font-black tracking-widest transition-all duration-200 disabled:opacity-50 ${
                      following
                        ? 'border border-cyan-500/20 text-slate-400 hover:border-red-400 hover:text-red-400'
                        : 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black hover:brightness-110'
                    }`}
                    style={{ fontFamily: 'monospace' }}
                  >
                    {followLoading ? '...' : following ? 'Following ✓' : 'Follow'}
                  </button>
                ) : (
                  <span className="text-slate-600 text-xs tracking-widest">Your clip</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-black text-lg text-white mb-4 tracking-widest" style={{ fontFamily: 'monospace' }}>
                COMMENTS ({comments.length})
              </h3>

              <div className="flex gap-3 mb-6">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-sm flex-shrink-0">
                  🎮
                </div>

                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder={user ? 'Drop a comment...' : 'Login to comment...'}
                    value={newComment}
                    onChange={(event) => setNewComment(event.target.value)}
                    onKeyDown={(event) => event.key === 'Enter' && handleComment()}
                    disabled={!user || posting}
                    className="flex-1 bg-[#0b1425] border border-cyan-500/20 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-cyan-400 transition-colors duration-200 placeholder-slate-600 disabled:opacity-50"
                  />

                  <button
                    onClick={handleComment}
                    disabled={!user || posting || !newComment.trim()}
                    className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-4 py-2 rounded-lg font-black text-xs tracking-widest hover:brightness-110 transition-all duration-200 disabled:opacity-50"
                    style={{ fontFamily: 'monospace' }}
                  >
                    {posting ? '...' : 'POST'}
                  </button>
                </div>
              </div>

              {commentsLoading && (
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex gap-3 animate-pulse">
                      <div className="w-9 h-9 rounded-full bg-cyan-500/10 flex-shrink-0" />
                      <div className="flex-1 bg-[#0b1425] border border-cyan-500/10 rounded-lg px-4 py-3">
                        <div className="h-3 bg-cyan-500/10 rounded w-1/4 mb-2" />
                        <div className="h-3 bg-cyan-500/10 rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!commentsLoading && comments.length === 0 && (
                <div className="text-center py-10 border border-cyan-500/10 rounded-xl">
                  <p className="text-slate-600 text-xs tracking-widest">NO COMMENTS YET</p>
                </div>
              )}

              {!commentsLoading && comments.length > 0 && (
                <div className="flex flex-col gap-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xs font-black text-black flex-shrink-0">
                        {getUsername(comment.user_id)[0].toUpperCase()}
                      </div>

                      <div className="flex-1 bg-[#0b1425] border border-cyan-500/10 rounded-lg px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                          {usernames[comment.user_id] ? (
                            <button
                              className="text-cyan-400 text-xs font-bold hover:text-cyan-300 transition-colors"
                              onClick={() => navigate(`/u/${usernames[comment.user_id]}`)}
                            >
                              @{usernames[comment.user_id]}
                            </button>
                          ) : (
                            <span className="text-cyan-400 text-xs font-bold">
                              @{getUsername(comment.user_id)}
                            </span>
                          )}
                          {isVerified(comment.user_id) && <span className="text-xs">✅</span>}
                          <span className="text-slate-600 text-xs">{formatTime(comment.created_at)}</span>
                        </div>

                        <p className="text-slate-300 text-sm">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-black text-sm text-white mb-4 tracking-widest" style={{ fontFamily: 'monospace' }}>
              RELATED CLIPS
            </h3>

            <div className="flex flex-col gap-4">
              {relatedClips.length === 0 && (
                <p className="text-slate-600 text-xs tracking-widest">No related clips yet</p>
              )}

              {relatedClips.map((related) => (
                <div
                  key={related.id}
                  onClick={() => navigate(`/clip/${related.id}`)}
                  className="bg-[#0b1425] border border-cyan-500/10 rounded-lg overflow-hidden cursor-pointer hover:border-cyan-400/30 transition-all duration-300 group"
                >
                  <div
                    className="h-24 flex items-center justify-center relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, #0b1425, ${related.color || '#00f5ff'}22)` }}
                  >
                    {related.thumbnail_url ? (
                      <img src={related.thumbnail_url} alt={related.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">{related.emoji || '🎮'}</span>
                    )}

                    <div className="absolute w-10 h-10 rounded-full border-2 border-white/20 bg-black/50 flex items-center justify-center text-sm group-hover:border-cyan-400/60 transition-all duration-300">
                      ▶
                    </div>
                  </div>

                  <div className="p-3">
                    <div className="text-white text-xs font-bold mb-1">{related.title}</div>
                    <div className="text-slate-500 text-xs">
                      {related.game} • 👁 {related.views || 0}
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => navigate('/explore')}
                className="w-full py-3 border border-cyan-500/20 text-cyan-400 text-xs tracking-widest rounded-lg hover:border-cyan-400 transition-all duration-200"
              >
                VIEW MORE CLIPS →
              </button>
            </div>
          </div>
        </div>
      </div>

      {shareOpen && <ShareModal clip={clip} onClose={() => setShareOpen(false)} />}
      {reportOpen && <ReportModal clip={clip} onClose={() => setReportOpen(false)} />}

      <Footer />
    </div>
  )
}

export default ClipDetail