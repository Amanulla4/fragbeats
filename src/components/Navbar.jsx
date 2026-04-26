import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (path) => {
    navigate(path)
    setMenuOpen(false)
  }

  const navLinks = [
    { label: 'Explore', path: '/explore' },
    { label: 'Music', path: '/music' },
    { label: '🏆', path: '/leaderboard' },
    { label: 'Profile', path: '/profile' },
    { label: '📊', path: '/analytics' },
    { label: '🔍', path: '/search' },
    { label: '🔔', path: '/notifications' },
  ]

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 transition-all duration-300 ${scrolled ? 'backdrop-blur-lg border-b border-cyan-500/10' : ''}`}
        style={{ background: scrolled ? 'var(--bg)' : 'transparent' }}
      >
        <div onClick={() => handleNavClick('/')} className="font-black text-xl tracking-widest bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent cursor-pointer" style={{ fontFamily: 'monospace' }}>
          FRAGBEATS
        </div>

        <ul className="hidden md:flex gap-8 list-none">
          {navLinks.map(link => (
            <li key={link.label}>
              <span onClick={() => handleNavClick(link.path)} className="text-slate-400 text-sm tracking-widest uppercase cursor-pointer hover:text-cyan-400 transition-colors duration-200">
                {link.label}
              </span>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex gap-3 items-center">
          <button onClick={toggleTheme} className="w-10 h-10 rounded-full border border-cyan-500/20 flex items-center justify-center text-lg hover:border-cyan-400 transition-all duration-200">
            {isDark ? '☀️' : '🌙'}
          </button>
          <button onClick={() => handleNavClick('/upload')} className="border border-cyan-500/20 text-slate-400 px-5 py-2 rounded text-sm tracking-widest hover:border-cyan-400 hover:text-cyan-400 transition-all duration-200 bg-transparent">
            Upload
          </button>
          <button onClick={() => handleNavClick('/auth')} className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-5 py-2 rounded text-xs font-black tracking-widest hover:brightness-110 transition-all duration-200" style={{ fontFamily: 'monospace' }}>
            JOIN FREE
          </button>
        </div>

        <div className="flex md:hidden gap-3 items-center">
          <button onClick={toggleTheme} className="w-9 h-9 rounded-full border border-cyan-500/20 flex items-center justify-center text-base hover:border-cyan-400 transition-all duration-200">
            {isDark ? '☀️' : '🌙'}
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 rounded border border-cyan-500/20 flex flex-col items-center justify-center gap-1.5 hover:border-cyan-400 transition-all duration-200"
          >
            <span className={`block w-4 h-0.5 bg-cyan-400 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-4 h-0.5 bg-cyan-400 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-4 h-0.5 bg-cyan-400 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 border-b border-cyan-500/10 backdrop-blur-lg px-8 py-6 flex flex-col gap-4 md:hidden" style={{ background: 'var(--bg)' }}>
          {navLinks.map(link => (
            <span
              key={link.label}
              onClick={() => handleNavClick(link.path)}
              className="text-slate-400 text-sm tracking-widest uppercase cursor-pointer hover:text-cyan-400 transition-colors duration-200 py-2 border-b border-cyan-500/10"
            >
              {link.label}
            </span>
          ))}
          <button onClick={() => handleNavClick('/upload')} className="border border-cyan-500/20 text-slate-400 px-5 py-3 rounded text-sm tracking-widest hover:border-cyan-400 hover:text-cyan-400 transition-all duration-200 bg-transparent text-left">
            Upload
          </button>
          <button onClick={() => handleNavClick('/auth')} className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-5 py-3 rounded text-xs font-black tracking-widest hover:brightness-110 transition-all duration-200" style={{ fontFamily: 'monospace' }}>
            JOIN FREE
          </button>
        </div>
      )}
    </>
  )
}

export default Navbar