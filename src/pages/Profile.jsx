import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function Profile() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [clips, setClips] = useState([])
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchMyClips()
    }
  }, [user])

  async function fetchProfile() {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()

    if (data?.username) setUsername(data.username)
  }

  async function fetchMyClips() {
    setLoading(true)
    const { data, error } = await supabase
      .from('clips')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error) setClips(data)
    setLoading(false)
  }

  const totalViews = clips.reduce((sum, c) => sum + (c.views || 0), 0)
  const totalLikes = clips.reduce((sum, c) => sum + (c.likes || 0), 0)

  const displayName = username || user?.email?.split('@')[0] || 'gamer'

  const STATS = [
    { label: 'Clips', value: clips.length },
    { label: 'Total Views', value: totalViews > 999 ? (totalViews / 1000).toFixed(1) + 'K' : totalViews },
    { label: 'Total Likes', value: totalLikes > 999 ? (totalLikes / 1000).toFixed(1) + 'K' : totalLikes },
    { label: 'Followers', value: '0' },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-8 pt-32 pb-16">

        {/* Profile Header */}
        <div className="bg-[#0b1425] border border-cyan-500/20 rounded-xl p-8 mb-8 relative overflow-hidden">

          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">

            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-4xl flex-shrink-0">
              🎮
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-black text-2xl text-white tracking-widest mb-1" style={{ fontFamily: 'monospace' }}>
                @{displayName}
              </h1>
              <p className="text-cyan-400 text-sm mb-3 tracking-widest">FragBeats Creator</p>
              <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                {user?.email}
              </p>

              <div className="flex gap-3 mt-4 justify-center md:justify-start">
                <button
                  onClick={() => navigate('/upload')}
                  className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-5 py-2 rounded font-black text-xs tracking-widest hover:brightness-110 transition-all duration-200"
                  style={{ fontFamily: 'monospace' }}
                >
                  + UPLOAD CLIP
                </button>
                <button className="border border-cyan-500/20 text-slate-400 px-5 py-2 rounded text-xs tracking-widest hover:border-cyan-400 hover:text-cyan-400 transition-all duration-200">
                  Edit Profile
                </button>
              </div>
            </div>

          </div>

          {/* Stats */}
          <div className="relative z-10 grid grid-cols-4 gap-4 mt-8 pt-8 border-t border-cyan-500/10">
            {STATS.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="font-black text-2xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent" style={{ fontFamily: 'monospace' }}>
                  {stat.value}
                </div>
                <div className="text-slate-500 text-xs tracking-widest uppercase mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* My Clips */}
        <p className="text-cyan-400 text-xs tracking-widest uppercase mb-3">// MY CLIPS</p>
        <h2 className="font-black text-3xl text-white mb-6" style={{ fontFamily: 'monospace' }}>
          My Frags 🎮
        </h2>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#0b1425] border border-cyan-500/10 rounded-lg overflow-hidden animate-pulse">
                <div className="h-36 bg-cyan-500/10" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-cyan-500/10 rounded w-1/3" />
                  <div className="h-4 bg-cyan-500/10 rounded w-2/3" />
                  <div className="h-3 bg-cyan-500/10 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No clips */}
        {!loading && clips.length === 0 && (
          <div className="text-center py-20 border border-cyan-500/10 rounded-xl bg-[#0b1425]">
            <div className="text-5xl mb-4">🎮</div>
            <p className="text-slate-400 text-sm tracking-widest mb-4">NO CLIPS YET</p>
            <button
              onClick={() => navigate('/upload')}
              className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-6 py-2 rounded font-black text-xs tracking-widest hover:brightness-110 transition-all"
              style={{ fontFamily: 'monospace' }}
            >
              UPLOAD YOUR FIRST CLIP
            </button>
          </div>
        )}

        {/* Real Clips Grid */}
        {!loading && clips.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {clips.map(clip => (
              <div
                key={clip.id}
                onClick={() => navigate(`/clip/${clip.id}`)}
                className="bg-[#0b1425] border border-cyan-500/10 rounded-lg overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-300 hover:border-cyan-400/30 group"
              >
                <div
                  className="h-36 flex items-center justify-center text-5xl relative"
                  style={{
                    background: `linear-gradient(135deg, #0b1425, ${clip.color || '#00f5ff'}22)`,
                    borderBottom: `2px solid ${clip.color || '#00f5ff'}33`
                  }}
                >
                  {clip.emoji || '🎮'}
                  <div className="absolute w-12 h-12 rounded-full border-2 border-white/20 bg-black/50 flex items-center justify-center text-sm backdrop-blur-sm group-hover:border-cyan-400/60 group-hover:scale-110 transition-all duration-300">
                    ▶
                  </div>
                </div>

                <div className="p-4">
                  <div
                    className="font-black text-xs tracking-widest mb-1"
                    style={{ fontFamily: 'monospace', color: clip.color || '#00f5ff' }}
                  >
                    {clip.game}
                  </div>
                  <div className="text-white text-sm font-bold mb-1">{clip.title}</div>
                  <div className="text-slate-500 text-xs mb-3">🎵 {clip.music}</div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs">👁 {clip.views || 0}</span>
                    <span className="text-slate-500 text-xs">❤️ {clip.likes || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
      <Footer />
    </div>
  )
}

export default Profile