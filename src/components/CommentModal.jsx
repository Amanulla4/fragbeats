// src/components/CommentModal.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function CommentModal({ clip, onClose }) {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [comments, setComments] = useState([])
  const [usernames, setUsernames] = useState({})
  const [verifiedMap, setVerifiedMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    if (clip?.id) fetchComments()
  }, [clip?.id])

  async function fetchComments() {
    setLoading(true)

    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('clip_id', clip.id)
      .order('created_at', { ascending: false })

    const commentData = data || []
    setComments(commentData)

    const uniqueIds = [...new Set(commentData.map((c) => c.user_id).filter(Boolean))]

    if (uniqueIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, verified')
        .in('user_id', uniqueIds)

      if (profiles) {
        const uMap = {}
        const vMap = {}
        profiles.forEach((p) => {
          uMap[p.user_id] = p.username
          vMap[p.user_id] = p.verified || false
        })
        setUsernames(uMap)
        setVerifiedMap(vMap)
      }
    }

    setLoading(false)
  }

  async function handleSubmit() {
    if (!user) {
      onClose()
      navigate('/auth')
      return
    }

    const text = newComment.trim()
    if (!text || posting) return
    setPosting(true)

    const { data, error } = await supabase
      .from('comments')
      .insert({ user_id: user.id, clip_id: Number(clip.id), text })
      .select()
      .single()

    if (!error && data) {
      // Resolve current user's username if not already loaded
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

      // Notify clip owner
      if (clip.user_id && user.id !== clip.user_id) {
        await supabase.from('notifications').insert({
          user_id: clip.user_id,
          from_user_id: user.id,
          type: 'comment',
          clip_id: Number(clip.id),
          message: `commented on your clip "${clip.title}"`,
          read: false,
        })
      }
    }

    setPosting(false)
  }

  function getUsername(userId) {
    return usernames[userId] || userId?.slice(0, 8) || 'user'
  }

  function handleUsernameClick(userId) {
    const username = usernames[userId]
    if (username) {
      onClose()
      navigate(`/u/${username}`)
    }
  }

  function formatTime(timestamp) {
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center px-4 pb-4 md:pb-0">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#0b1425] border border-cyan-500/20 rounded-xl overflow-hidden z-10">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/10">
          <div>
            <h3 className="font-black text-sm tracking-widest text-white" style={{ fontFamily: 'monospace' }}>
              COMMENTS ({comments.length})
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">{clip.game} • {clip.title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-cyan-500/20 flex items-center justify-center text-slate-400 hover:border-cyan-400 hover:text-cyan-400 transition-all duration-200"
          >
            ✕
          </button>
        </div>

        {/* Comments list */}
        <div className="max-h-72 overflow-y-auto p-4 flex flex-col gap-4">
          {loading && (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-2.5 bg-cyan-500/10 rounded w-1/4" />
                    <div className="h-2.5 bg-cyan-500/10 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && comments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-600 text-xs tracking-widest">NO COMMENTS YET</p>
              <p className="text-slate-700 text-xs mt-1">Be the first to drop one 👇</p>
            </div>
          )}

          {!loading && comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xs font-black text-black flex-shrink-0">
                {getUsername(comment.user_id)[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {/* ✅ Clickable username → /u/:username */}
                  {usernames[comment.user_id] ? (
                    <button
                      className="text-cyan-400 text-xs font-bold hover:text-cyan-300 transition-colors"
                      onClick={() => handleUsernameClick(comment.user_id)}
                    >
                      @{usernames[comment.user_id]}
                    </button>
                  ) : (
                    <span className="text-cyan-400 text-xs font-bold">
                      @{getUsername(comment.user_id)}
                    </span>
                  )}
                  {verifiedMap[comment.user_id] && <span className="text-xs">✅</span>}
                  <span className="text-slate-600 text-xs">{formatTime(comment.created_at)}</span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-cyan-500/10 flex gap-3">
          <input
            type="text"
            placeholder={user ? 'Drop a comment...' : 'Login to comment...'}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            disabled={posting}
            className="flex-1 bg-[#040810] border border-cyan-500/20 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-cyan-400 transition-colors duration-200 placeholder-slate-600 disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={posting || !newComment.trim()}
            className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-4 py-2 rounded-lg font-black text-xs tracking-widest hover:brightness-110 transition-all duration-200 disabled:opacity-50"
            style={{ fontFamily: 'monospace' }}
          >
            {posting ? '...' : 'POST'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CommentModal