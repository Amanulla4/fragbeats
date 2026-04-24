import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'

const MY_CLIPS = [
  { id: 1, game: 'BGMI', title: 'Insane 1v4 clutch', music: 'Chill Lo-fi Vol.3', views: '128K', likes: '4.2K', emoji: '🎮', color: '#00f5ff' },
  { id: 2, game: 'BGMI', title: 'Solo vs Squad win', music: 'Deep Focus', views: '89K', likes: '3.8K', emoji: '🎯', color: '#00f5ff' },
  { id: 3, game: 'Free Fire', title: 'Headshot compilation', music: 'Synthwave Dreams', views: '211K', likes: '8.7K', emoji: '🔥', color: '#ff6b35' },
]

const STATS = [
  { label: 'Clips', value: '3' },
  { label: 'Total Views', value: '428K' },
  { label: 'Followers', value: '1.2K' },
  { label: 'Following', value: '348' },
]

function Profile() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#040810]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-8 pt-32 pb-16">

        {/* Profile Header */}
        <div className="bg-[#0b1425] border border-cyan-500/20 rounded-xl p-8 mb-8 relative overflow-hidden">

          {/* Background glow */}
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
                @fragkingAman
              </h1>
              <p className="text-cyan-400 text-sm mb-3 tracking-widest">BGMI • Free Fire • Lo-fi Enthusiast</p>
              <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                Dropping frags and vibes since 2021. BGMI rank — Conqueror 🏆 Building FragBeats from Latur 🔥
              </p>

              {/* Action buttons */}
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {MY_CLIPS.map(clip => (
            <div
              key={clip.id}
              className="bg-[#0b1425] border border-cyan-500/10 rounded-lg overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-300 hover:border-cyan-400/30 group"
            >
              {/* Thumbnail */}
              <div
                className="h-36 flex items-center justify-center text-5xl relative"
                style={{ background: `linear-gradient(135deg, #0b1425, ${clip.color}22)`, borderBottom: `2px solid ${clip.color}33` }}
              >
                {clip.emoji}
                <div className="absolute w-12 h-12 rounded-full border-2 border-white/20 bg-black/50 flex items-center justify-center text-sm backdrop-blur-sm group-hover:border-cyan-400/60 group-hover:scale-110 transition-all duration-300">
                  ▶
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="font-black text-xs tracking-widest mb-1" style={{ fontFamily: 'monospace', color: clip.color }}>
                  {clip.game}
                </div>
                <div className="text-white text-sm font-bold mb-1">{clip.title}</div>
                <div className="text-slate-500 text-xs mb-3">🎵 {clip.music}</div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-xs">👁 {clip.views}</span>
                  <span className="text-slate-500 text-xs">❤️ {clip.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
      <Footer />
    </div>
  )
}

export default Profile