function PageLoader() {
  return (
    <div className="fixed inset-0 bg-[#040810] z-50 flex items-center justify-center">

      {/* Animated logo */}
      <div className="text-center">
        <div
          className="font-black text-3xl tracking-widest bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-6"
          style={{ fontFamily: 'monospace' }}
        >
          FRAGBEATS
        </div>

        {/* Loading bar */}
        <div className="w-48 h-1 bg-cyan-500/20 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-pulse" style={{
            animation: 'loading 1.2s ease-in-out infinite'
          }} />
        </div>

        <style>{`
          @keyframes loading {
            0% { width: 0%; margin-left: 0%; }
            50% { width: 70%; margin-left: 15%; }
            100% { width: 0%; margin-left: 100%; }
          }
        `}</style>
      </div>

    </div>
  )
}

export default PageLoader