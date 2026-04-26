import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'
import ShareModal from '../components/ShareModal'

const COMMENTS = [
  { id: 1, user: '@neonwolf99', text: 'Bro that clutch was insane! 🔥', time: '2m ago' },
  { id: 2, user: '@drip_editz', text: 'The music choice is perfect 🎵', time: '5m ago' },
  { id: 3, user: '@ghostfrags', text: 'How did you pull that off 💀', time: '12m ago' },
  { id: 4, user: '@cityvibes', text: 'Straight fire bhai 🔥🔥', time: '25m ago' },
  { id: 5, user: '@flashpoint', text: 'Best BGMI clip I have seen today', time: '1h ago' },
]

const RELATED_CLIPS = [
  { id: 2, game: 'BGMI', title: 'Solo vs Squad win', creator: '@fragkingAman', views: '89K', emoji: '🎯', color: '#00f5ff' },
  { id: 3, game: 'Valorant', title: 'Ace round highlight', creator: '@neonwolf99', views: '94K', emoji: '🔫', color: '#bf00ff' },
  { id: 4, game: 'Free Fire', title: 'Headshot compilation', creator: '@drip_editz', views: '211K', emoji: '🔥', color: '#ff6b35' },
]

function ClipDetail() {
  const navigate = useNavigate()
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState(COMMENTS)
  const [newComment, setNewComment] = useState('')
  const [following, setFollowing] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  const clip = { id: 1, game: 'BGMI', creator: '@fragkingAman' }

  const handleComment = () => {
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
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-8 pt-32 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left - Main Clip */}
          <div className="lg:col-span-2">

            {/* Video Player */}
            <div className="w-full aspect-video bg-[#0b1425] rounded-xl border border-cyan-500/20 flex items-center justify-center relative overflow-hidden mb-4"
              style={{ background: 'linear-gradient(135deg, #0b1425, #00f5ff11)' }}>
              <div className="text-8xl">🎮</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-2 border-white/30 bg-black/50 flex items-center justify-center text-3xl backdrop-blur-sm cursor-pointer hover:scale-110 transition-all duration-300">
                  ▶
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-3">
                <span className="text-lg">🎵</span>
                <div className="flex-1">
                  <div className="text-white text-xs font-bold">Chill Lo-fi Vol.3</div>
                  <div className="w-full h-1 bg-white/20 rounded-full mt-1">
                    <div className="w-1/3 h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full" />
                  </div>
                </div>
                <span className="text-slate-400 text-xs">1:12 / 3:24</span>
              </div>
            </div>

            {/* Clip Info */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="font-black text-2xl text-white mb-1" style={{ fontFamily: 'monospace' }}>
                    Insane 1v4 Clutch 🎮
                  </h1>
                  <div className="flex items-center gap-3 text-slate-500 text-sm">
                    <span>👁 128K views</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-bold">BGMI</span>
                    <span>•</span>
                    <span>2 hours ago</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 flex-shrink-0">
                  <button
                    onClick={() => setLiked(!liked)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all duration-200 ${liked ? 'border-pink-400 text-pink-400 bg-pink-400/10' : 'border-cyan-500/20 text-slate-400 hover:border-pink-400 hover:text-pink-400'}`}
                  >
                    {liked ? '❤️' : '🤍'} 4.2K
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
                    <div className="text-cyan-400 font-bold text-sm">@fragkingAman</div>
                    <div className="text-slate-500 text-xs">1.2K followers • 3 clips</div>
                  </div>
                </div>
                <button
                  onClick={() => setFollowing(!following)}
                  className={`px-4 py-2 rounded-lg text-xs font-black tracking-widest transition-all duration-200 ${following ? 'border border-cyan-500/20 text-slate-400' : 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black'}`}
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
                    placeholder="Drop a comment..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleComment()}
                    className="flex-1 bg-[#0b1425] border border-cyan-500/20 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-cyan-400 transition-colors duration-200 placeholder-slate-600"
                  />
                  <button
                    onClick={handleComment}
                    className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-4 py-2 rounded-lg font-black text-xs tracking-widest hover:brightness-110 transition-all duration-200"
                    style={{ fontFamily: 'monospace' }}
                  >
                    POST
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xs font-black text-black flex-shrink-0">
                      {comment.user[1].toUpperCase()}
                    </div>
                    <div className="flex-1 bg-[#0b1425] border border-cyan-500/10 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-cyan-400 text-xs font-bold">{comment.user}</span>
                        <span className="text-slate-600 text-xs">{comment.time}</span>
                      </div>
                      <p className="text-slate-300 text-sm">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Related Clips */}
          <div>
            <h3 className="font-black text-sm text-white mb-4 tracking-widest" style={{ fontFamily: 'monospace' }}>
              RELATED CLIPS
            </h3>
            <div className="flex flex-col gap-4">
              {RELATED_CLIPS.map(clip => (
                <div
                  key={clip.id}
                  onClick={() => navigate(`/clip/${clip.id}`)}
                  className="bg-[#0b1425] border border-cyan-500/10 rounded-lg overflow-hidden cursor-pointer hover:border-cyan-400/30 transition-all duration-300 group"
                >
                  <div
                    className="h-24 flex items-center justify-center text-4xl relative"
                    style={{ background: `linear-gradient(135deg, #0b1425, ${clip.color}22)` }}
                  >
                    {clip.emoji}
                    <div className="absolute w-10 h-10 rounded-full border-2 border-white/20 bg-black/50 flex items-center justify-center text-sm group-hover:border-cyan-400/60 transition-all duration-300">
                      ▶
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-white text-xs font-bold mb-1">{clip.title}</div>
                    <div className="text-slate-500 text-xs">{clip.creator} • 👁 {clip.views}</div>
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
        <ShareModal
          clip={clip}
          onClose={() => setShareOpen(false)}
        />
      )}

      <Footer />
    </div>
  )
}

export default ClipDetail