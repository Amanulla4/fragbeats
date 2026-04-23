const TRENDING = [
  { game: 'BGMI', creator: '@fragkingAman', music: 'Chill Lo-fi Vol.3', views: '128K', color: '#00f5ff', emoji: '🎮' },
  { game: 'Valorant', creator: '@neonwolf99', music: 'Midnight Vibes', views: '94K', color: '#bf00ff', emoji: '🔫' },
  { game: 'Free Fire', creator: '@drip_editz', music: 'Synthwave Dreams', views: '211K', color: '#ff6b35', emoji: '🔥' },
  { game: 'COD Mobile', creator: '@ghostfrags', music: 'Rain & Bass', views: '76K', color: '#00f5ff', emoji: '💀' },
]

function Trending() {
  return (
    <section className="bg-[#040810] py-24 px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <p className="text-cyan-400 text-xs tracking-widest uppercase mb-3">// TRENDING NOW</p>
        <h2 className="font-black text-4xl md:text-5xl text-white mb-4" style={{ fontFamily: 'monospace' }}>
          Hot Right Now 🔥
        </h2>
        <p className="text-slate-400 max-w-md mb-12 leading-relaxed">
          The clips everyone's watching. Your turn to drop something bigger.
        </p>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TRENDING.map((clip) => (
            <div
              key={clip.creator}
              className="bg-[#0b1425] border border-cyan-500/10 rounded-lg overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-300 hover:border-cyan-400/30 group"
            >
              {/* Thumbnail */}
              <div
                className="h-36 flex items-center justify-center text-5xl relative"
                style={{ background: `linear-gradient(135deg, #0b1425, ${clip.color}22)`, borderBottom: `2px solid ${clip.color}33` }}
              >
                {clip.emoji}
                {/* Play Button */}
                <div className="absolute w-12 h-12 rounded-full border-2 border-white/20 bg-black/50 flex items-center justify-center text-sm backdrop-blur-sm group-hover:border-cyan-400/60 group-hover:scale-110 transition-all duration-300">
                  ▶
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div
                  className="font-black text-xs tracking-widest mb-1"
                  style={{ fontFamily: 'monospace', color: clip.color }}
                >
                  {clip.game}
                </div>
                <div className="text-slate-400 text-xs mb-3">{clip.creator}</div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-xs">🎵 {clip.music}</span>
                  <span className="text-slate-500 text-xs">👁 {clip.views}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default Trending