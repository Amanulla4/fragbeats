import { useNavigate } from 'react-router-dom'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#040810] flex items-center justify-center px-8 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Grid */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Content */}
      <div className="relative z-10 text-center">

        <div className="font-black text-[8rem] md:text-[12rem] leading-none bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4" style={{ fontFamily: 'monospace' }}>
          404
        </div>

        <h2 className="font-black text-2xl text-white mb-4 tracking-widest" style={{ fontFamily: 'monospace' }}>
          PAGE NOT FOUND
        </h2>

        <p className="text-slate-400 mb-8 max-w-sm mx-auto leading-relaxed">
          Looks like this frag missed the target 💀 The page you're looking for doesn't exist.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-8 py-3 rounded font-black text-sm tracking-widest hover:brightness-110 hover:-translate-y-1 transition-all duration-300"
            style={{ fontFamily: 'monospace' }}
          >
            GO HOME →
          </button>
          <button
            onClick={() => navigate('/explore')}
            className="border border-cyan-500/30 text-cyan-400 px-8 py-3 rounded text-sm tracking-widest uppercase hover:bg-cyan-500/10 hover:-translate-y-1 transition-all duration-300"
          >
            Explore Clips
          </button>
        </div>

      </div>
    </div>
  )
}

export default NotFound