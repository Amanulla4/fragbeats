import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (link) => {
    if (link === 'Explore') navigate('/explore')
    if (link === 'Music') navigate('/music')
    if (link === 'Profile') navigate('/profile')
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 transition-all duration-300 ${scrolled ? 'backdrop-blur-lg border-b border-cyan-500/10' : ''}`}
style={{ background: scrolled ? 'var(--bg)' : 'transparent' }}>

      <div onClick={() => navigate('/')} className="font-black text-xl tracking-widest bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent cursor-pointer" style={{ fontFamily: 'monospace' }}>
        FRAGBEATS
      </div>

      <ul className="hidden md:flex gap-8 list-none">
        {['Explore', 'Music', 'Profile'].map(link => (
          <li key={link}>
            <span onClick={() => handleNavClick(link)} className="text-slate-400 text-sm tracking-widest uppercase cursor-pointer hover:text-cyan-400 transition-colors duration-200">
              {link}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex gap-3 items-center">

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full border border-cyan-500/20 flex items-center justify-center text-lg hover:border-cyan-400 transition-all duration-200"
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        <button onClick={() => navigate('/upload')} className="border border-cyan-500/20 text-slate-400 px-5 py-2 rounded text-sm tracking-widest hover:border-cyan-400 hover:text-cyan-400 transition-all duration-200 bg-transparent">
          Upload
        </button>
        <button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-5 py-2 rounded text-xs font-black tracking-widest hover:brightness-110 transition-all duration-200" style={{ fontFamily: 'monospace' }}>
          JOIN FREE
        </button>
      </div>

    </nav>
  )
}

export default Navbar