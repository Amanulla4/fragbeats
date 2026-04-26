import { useNavigate } from 'react-router-dom'

function Footer() {
  const navigate = useNavigate()
  const links = ['About', 'Privacy', 'Terms', 'Contact']

  return (
    <footer className="border-t border-cyan-500/10 py-8 px-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

        <div className="font-black text-lg tracking-widest bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent cursor-pointer" style={{ fontFamily: 'monospace' }} onClick={() => navigate('/')}>
          FRAGBEATS
        </div>

        <div className="text-slate-500 text-sm">
          © 2025 FragBeats. Built for gamers, by gamers.
        </div>

        <div className="flex gap-6">
          {links.map(link => (
            <span
              key={link}
              onClick={() => link === 'About' && navigate('/about')}
              className="text-slate-500 text-sm cursor-pointer hover:text-cyan-400 transition-colors duration-200"
            >
              {link}
            </span>
          ))}
        </div>

      </div>
    </footer>
  )
}

export default Footer