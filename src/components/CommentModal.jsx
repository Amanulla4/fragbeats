import { useState } from 'react'

const SAMPLE_COMMENTS = [
  { id: 1, user: '@neonwolf99', text: 'Bro that clutch was insane! 🔥', time: '2m ago' },
  { id: 2, user: '@drip_editz', text: 'The music choice is 🔥🔥🔥', time: '5m ago' },
  { id: 3, user: '@ghostfrags', text: 'How did you pull that off 💀', time: '12m ago' },
  { id: 4, user: '@fragkingAman', text: 'Thanks bhai! Took 10 attempts 😂', time: '15m ago' },
]

function CommentModal({ clip, onClose }) {
  const [comments, setComments] = useState(SAMPLE_COMMENTS)
  const [newComment, setNewComment] = useState('')

  const handleSubmit = () => {
    if (!newComment.trim()) return
    setComments(prev => [{
      id: prev.length + 1,
      user: '@fragkingAman',
      text: newComment,
      time: 'just now'
    }, ...prev])
    setNewComment('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center px-4 pb-4 md:pb-0">

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#0b1425] border border-cyan-500/20 rounded-xl overflow-hidden z-10">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/10">
          <div>
            <h3 className="font-black text-sm tracking-widest text-white" style={{ fontFamily: 'monospace' }}>
              COMMENTS
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">{clip.game} • {clip.creator}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-cyan-500/20 flex items-center justify-center text-slate-400 hover:border-cyan-400 hover:text-cyan-400 transition-all duration-200"
          >
            ✕
          </button>
        </div>

        {/* Comments List */}
        <div className="max-h-72 overflow-y-auto p-4 flex flex-col gap-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xs font-black text-black flex-shrink-0">
                {comment.user[1].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-cyan-400 text-xs font-bold">{comment.user}</span>
                  <span className="text-slate-600 text-xs">{comment.time}</span>
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
            placeholder="Drop a comment..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="flex-1 bg-[#040810] border border-cyan-500/20 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-cyan-400 transition-colors duration-200 placeholder-slate-600"
          />
          <button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-4 py-2 rounded-lg font-black text-xs tracking-widest hover:brightness-110 transition-all duration-200"
            style={{ fontFamily: 'monospace' }}
          >
            POST
          </button>
        </div>

      </div>
    </div>
  )
}

export default CommentModal