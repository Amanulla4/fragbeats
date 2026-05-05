import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useNavigate, useParams } from 'react-router-dom'
import ShareModal from '../components/ShareModal'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function ClipDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()

  const [clip, setClip] = useState(null)
  const [clipCreator, setClipCreator] = useState('')
  const [relatedClips, setRelatedClips] = useState([])
  const [loading, setLoading] = useState(true)

  // Likes
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [likeLoading, setLikeLoading] = useState(false)

  // Comments
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)

  // Usernames cache { user_id: username }
  const [usernames, setUsernames] = useState({})

  const [following, setFollowing] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  useEffect(() => {
    if (id) {
      fetchClip()
      fetchComments()
    }
  }, [id])

  useEffect(() => {
    if (clip && user) checkIfLiked()
    if (clip?.user_id) fetchCreatorUsername(clip.user_id)
  }, [clip, user])

  async function fetchClip() {
    setLoading(true)
    const { data, error } = await supabase
      .from('clips')
      .select('*')
      .eq('id', id)
      .single()

    if (!error && data) {
      setClip(data)
      setLikeCount(data.likes || 0)
      fetchRelatedClips(data.game, data.id)
    }
    setLoading(false)
  }

  async function fetchCreatorUsername(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('user_id', userId)
      .single()
    if (data?.username) setClipCreator(data.username)
  }

  async function fetchRelatedClips(game, currentId) {
    const { data } = await supabase
      .from('clips')
      .select('*')
      .eq('game', game)
      .neq('id', currentId)
      .limit(3)
    if (data) setRelatedClips(data)
  }

  async function checkIfLiked() {
    if (!user) return
    const { data } = await supabase
      .from('clip_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('clip_id', id)
      .single()
    if (data) setLiked(true)
  }

  async function fetchComments() {
    setCommentsLoading(true)
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('clip_id', id)
      .order('created_at', { ascending: false })

    if (data) {
      setComments(data)
      // Fetch usernames for all unique user_ids in comments
      const uniqueIds = [...new Set(data.map(c => c.user_id))]
      if (uniqueIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username')
          .in('user_id', uniqueIds)

        if (profiles) {
          const map = {}
          profiles.forEach(p => { map[p.user_id] = p.username })
          setUsernames(map)
        }
      }
    }
    setCommentsLoading(false)
  }

  async function handleLike() {
    if (!user) { navigate('/auth'); return }
    if (likeLoading) return
    setLikeLoading(true)

    if (liked) {
      await supabase.from('clip_likes').delete().eq('user_id', user.id).eq('clip_id', id)
      await supabase.from('clips').update({ likes: likeCount - 1 }).eq('id', id)
      setLiked(false)
      setLikeCount(prev => prev - 1)
    } else {
      await supabase.from('clip_likes').insert({ user_id: user.id, clip_id: id })
      await supabase.from('clips').update({ likes: likeCount + 1 }).eq('id', id)
      setLiked(true)
      setLikeCount(prev => prev + 1)
    }
    setLikeLoading(false)
  }

  async function handleComment() {
    if (!newComment.trim()) return
    if (!user) { navigate('/auth'); return }
    setPosting(true)

    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: user.id,
        clip_id: parseInt(id),
        text: newComment.trim()
      })
      .select()
      .single()

    if (!error && data) {
      // Add current user's username to cache if not there
      if (!usernames[user.id]) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('user_id', user.id)
          .single()
        if (profile?.username) {
          setUsernames(prev => ({ ...prev, [user.id]: profile.username }))
        }
      }
      setComments(prev => [data, ...prev])
      setNewComment('')
    }
    setPosting(false)
  }

  function getUsername(userId) {
    return usernames[userId] || userId?.slice(0, 8) || 'user'
  }

  function formatTime(timestamp) {
    const diff = Math.floor((Date.now() - new Date(timestamp)) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago'
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago'
    return Math.floor(diff / 86400) + 'd ago'
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

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-8 pt-32 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left - Main Clip */}
          <div className="lg:col-span-2">

            {/* Video Player */}
            <div
              className="w-full aspect-video bg-[#0b1425] rounded-xl border border-cyan-500/20 flex items-center justify-center relative overflow-hidden mb-4"
              style={{ background: 'linear-gradient(135deg, #0b1425, #00f5ff11)' }}
            >
              {clip.video_url ? (
                <video src={clip.video_url} controls className="w-full h-full object-cover rounded-xl" />
              ) : (
                <>
                  <div className="text-8xl">{clip.emoji || '🎮'}</div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-2 border-white/30 bg-black/50 flex items-center justify-center text-3xl backdrop-blur-sm cursor-pointer hover:scale-110 transition-all duration-300">
                      ▶
                    </div>
                  </div>
                </>
              )}
              <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-3">
                <span className="text-lg">🎵</span>
                <div className="flex-1">
                  <div className="text-white text-xs font-bold">{clip.music || 'Lo-fi Beats'}</div>
                  <div className="w-full h-1 bg-white/20 rounded-full mt-1">
                    <div className="w-1/3 h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Clip Info */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="font-black text-2xl text-white mb-1" style={{ fontFamily: 'monospace' }}>
                    {clip.title} {clip.emoji}
                  </h1>
                  <div className="flex items-center gap-3 text-slate-500 text-sm">
                    <span>👁 {clip.views || 0} views</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-bold">{clip.game}</span>
                    <span>•</span>
                    <span>{new Date(clip.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-3 flex-shrink-0">
                  <button
                    onClick={handleLike}
                    disabled={likeLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all duration-200 ${
                      liked
                        ? 'border-pink-400 text-pink-400 bg-pink-400/10'
                        : 'border-cyan-500/20 text-slate-400 hover:border-pink-400 hover:text-pink-400'
                    }`}
                  >
                    {liked ? '❤️' : '🤍'} {likeCount}
                  </button>
                  <button
                    onClick={() => setShareOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-500/20 text-slate-400 text-sm hover:border-cyan-400 hover:text-cyan-400 transition-all duration-200"
                  >
                    🔗 Share
                  </button>
                </div>
              </div>

              {/* Creator Info */}
              <div className="flex items-center justify-between p-4 bg-[#0b1425] border border-cyan-500/10 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xl">
                    🎮
                  </div>
                  <div>
                    <div className="text-cyan-400 font-bold text-sm">
                      @{clipCreator || clip.user_id?.slice(0, 8) || 'creator'}
                    </div>
                    <div className="text-slate-500 text-xs">FragBeats Creator</div>
                  </div>
                </div>
                <button
                  onClick={() => setFollowing(!following)}
                  className={`px-4 py-2 rounded-lg text-xs font-black tracking-widest transition-all duration-200 ${
                    following
                      ? 'border border-cyan-500/20 text-slate-400'
                      : 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black'
                  }`}
                  style={{ fontFamily: 'monospace' }}
                >
                  {following ? 'Following ✓' : 'Follow'}
                </button>
              </div>
            </div>

            {/* Comments */}
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
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleComment()}
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
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3 animate-pulse">
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
                  <p className="text-slate-600 text-xs tracking-widest">NO COMMENTS YET — BE THE FIRST 🔥</p>
                </div>
              )}

              {!commentsLoading && comments.length > 0 && (
                <div className="flex flex-col gap-4">
                  {comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xs font-black text-black flex-shrink-0">
                        {getUsername(comment.user_id)[0].toUpperCase()}
                      </div>
                      <div className="flex-1 bg-[#0b1425] border border-cyan-500/10 rounded-lg px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-cyan-400 text-xs font-bold">
                            @{getUsername(comment.user_id)}
                          </span>
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

          {/* Right - Related Clips */}
          <div>
            <h3 className="font-black text-sm text-white mb-4 tracking-widest" style={{ fontFamily: 'monospace' }}>
              RELATED CLIPS
            </h3>
            <div className="flex flex-col gap-4">
              {relatedClips.length === 0 && (
                <p className="text-slate-600 text-xs tracking-widest">No related clips yet</p>
              )}
              {relatedClips.map(related => (
                <div
                  key={related.id}
                  onClick={() => navigate(`/clip/${related.id}`)}
                  className="bg-[#0b1425] border border-cyan-500/10 rounded-lg overflow-hidden cursor-pointer hover:border-cyan-400/30 transition-all duration-300 group"
                >
                  <div className="h-24 flex items-center justify-center text-4xl relative"
                    style={{ background: `linear-gradient(135deg, #0b1425, ${related.color || '#00f5ff'}22)` }}>
                    {related.emoji || '🎮'}
                    <div className="absolute w-10 h-10 rounded-full border-2 border-white/20 bg-black/50 flex items-center justify-center text-sm group-hover:border-cyan-400/60 transition-all duration-300">
                      ▶
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-white text-xs font-bold mb-1">{related.title}</div>
                    <div className="text-slate-500 text-xs">{related.game} • 👁 {related.views || 0}</div>
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

      {shareOpen && (
        <ShareModal clip={clip} onClose={() => setShareOpen(false)} />
      )}

      <Footer />
    </div>
  )
}

export default ClipDetail