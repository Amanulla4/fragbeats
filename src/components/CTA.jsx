function CTA() {
  return (
    <section className="relative py-24 px-8 text-center border-t border-b border-cyan-500/10 overflow-hidden">

      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/8 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto">
        <p className="text-cyan-400 text-xs tracking-widest uppercase mb-6">// JOIN THE COMMUNITY</p>

        <h2 className="font-black text-4xl md:text-6xl text-white mb-6 leading-none" style={{ fontFamily: 'monospace' }}>
          Ready to Drop{' '}
          <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Your Frags?
          </span>
        </h2>

        <p className="text-slate-400 text-lg mb-10 leading-relaxed">
          Join thousands of gamers already sharing their best moments with the world. It's free. Always.
        </p>

        <button className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-10 py-4 rounded font-black text-sm tracking-widest hover:brightness-110 hover:-translate-y-1 transition-all duration-300" style={{ fontFamily: 'monospace' }}>
          CREATE YOUR ACCOUNT →
        </button>
      </div>

    </section>
  )
}

export default CTA