function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#040810] px-8">

      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 border border-cyan-500/30 rounded-full px-4 py-2 text-cyan-400 text-xs tracking-widest uppercase mb-8 bg-cyan-500/5">
          <span>🎮</span> Gaming Meets Music
        </div>

        {/* Title */}
        <h1 className="font-black leading-none mb-6" style={{ fontFamily: 'monospace' }}>
          <span className="block text-white text-6xl md:text-8xl tracking-tight">GAME.</span>
          <span className="block text-6xl md:text-8xl tracking-tight bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-400 bg-clip-text text-transparent">
            EDIT. VIBE.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
          Upload your clutch moments, drop a lo-fi beat, and share it with a community that actually gets you. This is your stage.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center flex-wrap mb-16">
          <button className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-8 py-4 rounded font-black text-sm tracking-widest hover:brightness-110 hover:-translate-y-1 transition-all duration-300" style={{ fontFamily: 'monospace' }}>
            START UPLOADING
          </button>
          <button className="border border-cyan-500/30 text-cyan-400 px-8 py-4 rounded text-sm tracking-widest uppercase hover:bg-cyan-500/10 hover:-translate-y-1 transition-all duration-300">
            Explore Clips ▶
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-12 justify-center flex-wrap">
          {[
            ['12K+', 'Creators'],
            ['89K+', 'Clips Shared'],
            ['4.2M', 'Vibes Heard'],
          ].map(([num, label]) => (
            <div key={label} className="text-center">
              <div className="font-black text-3xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent" style={{ fontFamily: 'monospace' }}>
                {num}
              </div>
              <div className="text-slate-500 text-xs tracking-widest uppercase mt-1">{label}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default Hero