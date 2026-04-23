const FEATURES = [
  {
    icon: '🎮',
    title: 'Upload Your Clips',
    desc: 'Drop your best gaming moments — clutch plays, funny fails, insane frags. Raw or edited, we want it all.',
    accent: '#00f5ff',
  },
  {
    icon: '🎵',
    title: 'Add Your Beats',
    desc: 'Pick from our lo-fi library or upload your own track. Let the vibe match the moment.',
    accent: '#bf00ff',
  },
  {
    icon: '🔥',
    title: 'Go Viral',
    desc: 'Share with a community that actually gets it. Gamers, editors, music heads — your people are here.',
    accent: '#ff6b35',
  },
]

function Features() {
  return (
    <section className="bg-[#070d1a] border-t border-b border-cyan-500/10 py-24 px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <p className="text-cyan-400 text-xs tracking-widest uppercase mb-3">// HOW IT WORKS</p>
        <h2 className="font-black text-4xl md:text-5xl text-white mb-4" style={{ fontFamily: 'monospace' }}>
          Built for the Culture
        </h2>
        <p className="text-slate-400 max-w-md mb-12 leading-relaxed">
          Three steps to turn your gameplay into something the internet can't ignore.
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-[#0b1425] border border-cyan-500/10 rounded-lg p-8 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/40 group"
            >
              <div className="text-4xl mb-5">{f.icon}</div>
              <h3 className="font-black text-base tracking-widest mb-3 text-white group-hover:text-cyan-400 transition-colors duration-300" style={{ fontFamily: 'monospace' }}>
                {f.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default Features