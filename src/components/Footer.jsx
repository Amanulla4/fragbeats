import { useNavigate } from 'react-router-dom'

function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="border-t border-cyan-500/10 py-8 px-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto">

        {/* Top */}
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">

          {/* Brand */}
          <div>
            <div
              className="font-black text-xl tracking-widest bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent cursor-pointer mb-2"
              style={{ fontFamily: 'monospace' }}
              onClick={() => navigate('/')}
            >
              FRAGBEATS
            </div>
            <p className="text-slate-500 text-sm max-w-xs">
              Game. Edit. Vibe. The home for gaming clips and lo-fi music.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12 flex-wrap">
            <div>
              <div className="text-white text-xs font-black tracking-widest mb-3" style={{ fontFamily: 'monospace' }}>
                PLATFORM
              </div>
              <div className="flex flex-col gap-2">
                {[
                  ['Explore', '/explore'],
                  ['Music', '/music'],
                  ['Leaderboard', '/leaderboard'],
                  ['Upload', '/upload'],
                ].map(([label, path]) => (
                  <span
                    key={label}
                    onClick={() => navigate(path)}
                    className="text-slate-500 text-sm cursor-pointer hover:text-cyan-400 transition-colors duration-200"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-white text-xs font-black tracking-widest mb-3" style={{ fontFamily: 'monospace' }}>
                COMPANY
              </div>
              <div className="flex flex-col gap-2">
                {[
  ['About', '/about'],
  ['Blog', '/blog'],
  ['Pricing', '/pricing'],
  ['Waitlist', '/waitlist'],
  ['Contact', '/about'],
].map(([label, path]) => (
                  <span
                    key={label}
                    onClick={() => navigate(path)}
                    className="text-slate-500 text-sm cursor-pointer hover:text-cyan-400 transition-colors duration-200"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-cyan-500/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-slate-500 text-sm">
            © 2025 FragBeats. Built for gamers, by gamers.
          </div>
          <div className="flex gap-6">
            {[['Privacy', '/terms'], ['Terms', '/terms']].map(([label, path]) => (
  <span
    key={label}
    onClick={() => navigate(path)}
    className="text-slate-500 text-sm cursor-pointer hover:text-cyan-400 transition-colors duration-200"
  >
    {label}
  </span>
))}
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer