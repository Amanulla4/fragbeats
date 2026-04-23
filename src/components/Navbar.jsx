import { useState, useEffect } from 'react'

function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 transition-all duration-300 ${scrolled ? 'bg-[#040810]/90 backdrop-blur-lg border-b border-cyan-500/10' : ''}`}>
      
      {/* Logo */}
      <div className="font-black text-xl tracking-widest bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent" style={{ fontFamily: 'monospace' }}>
        FRAGBEATS
      </div>

      {/* Nav Links */}
      <ul className="hidden md:flex gap-8 list-none">
        {['Explore', 'Trending', 'Artists', 'Community'].map(link => (
          <li key={link}>
            <a className="text-slate-400 text-sm tracking-widest uppercase cursor-pointer hover:text-cyan-400 transition-colors duration-200">
              {link}
            </a>
          </li>
        ))}
      </ul>

      {/* Buttons */}
      <div className="flex gap-3 items-center">
        <button className="border border-cyan-500/20 text-slate-400 px-5 py-2 rounded text-sm tracking-widest hover:border-cyan-400 hover:text-cyan-400 transition-all duration-200 bg-transparent">
          Log In
        </button>
        <button className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-5 py-2 rounded text-xs font-black tracking-widest hover:brightness-110 transition-all duration-200" style={{ fontFamily: 'monospace' }}>
          JOIN FREE
        </button>
      </div>

    </nav>
  )
}

export default Navbar