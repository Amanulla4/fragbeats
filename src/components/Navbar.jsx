import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useNotifications } from '../context/NotificationContext'

const BOTTOM_NAV = [
  { icon: '🏠', label: 'Home', path: '/explore' },
  { icon: '▶', label: 'Feed', path: '/feed' },
  { icon: '➕', label: 'Upload', path: '/upload', protected: true },
  { icon: '🔔', label: 'Activity', path: '/notifications', protected: true },
  { icon: '👤', label: 'Profile', path: '/profile', protected: true },
]

const TOP_NAV = [
  { label: 'Explore', path: '/explore' },
  { label: '▶ Feed', path: '/feed' },
  { label: '🗂️ Collections', path: '/collections' },
  { label: 'Music', path: '/music' },
  { label: '🏆', path: '/leaderboard' },
  { label: 'Profile', path: '/profile', protected: true },
  { label: '📊', path: '/analytics', protected: true },
  { label: '🔍', path: '/search' },
  { label: '🔔', path: '/notifications', protected: true },
  { label: '⚙️', path: '/settings', protected: true },
]

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [verified, setVerified] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()
  const { unreadCount, clearUnread } = useNotifications()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)

    handleScroll()
    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!user) {
      setUsername('')
      setVerified(false)
      return
    }

    fetchProfile()
  }, [user?.id])

  async function fetchProfile() {
    const { data } = await supabase
      .from('profiles')
      .select('username, verified')
      .eq('user_id', user.id)
      .single()

    setUsername(data?.username || user.email?.split('@')[0] || 'gamer')
    setVerified(data?.verified || false)
  }

  function handleNavClick(link) {
    const path = typeof link === 'string' ? link : link.path
    const isProtected = typeof link === 'object' && link.protected

    if (isProtected && !user) {
      navigate('/auth')
      setMenuOpen(false)
      return
    }

    if (path === '/notifications' && user) {
      clearUnread()
    }

    navigate(path)
    setMenuOpen(false)
  }

  async function handleSignOut() {
    await signOut()
    setUsername('')
    setVerified(false)
    navigate('/')
  }

  if (location.pathname === '/feed') return null

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-8 py-4 transition-all duration-300 ${
          scrolled ? 'backdrop-blur-lg border-b border-cyan-500/10' : ''
        }`}
        style={{ background: scrolled ? 'var(--bg)' : 'transparent' }}
      >
        <button
          type="button"
          onClick={() => handleNavClick('/')}
          className="font-black text-xl tracking-widest bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent cursor-pointer"
          style={{ fontFamily: 'monospace' }}
          aria-label="Go to home"
        >
          FRAGBEATS
        </button>

        <ul className="hidden md:flex md:gap-4 lg:gap-6 xl:gap-8 list-none">
          {TOP_NAV.map((link) => (
            <li key={link.label} className="relative">
              <button
                type="button"
                onClick={() => handleNavClick(link)}
                className={`text-sm tracking-widest uppercase cursor-pointer transition-colors duration-200 ${
                  location.pathname === link.path
                    ? 'text-cyan-400'
                    : link.path === '/feed'
                      ? 'text-purple-400 hover:text-purple-300'
                      : link.path === '/collections'
                        ? 'text-cyan-300 hover:text-cyan-400'
                        : 'text-slate-400 hover:text-cyan-400'
                }`}
              >
                {link.label}
              </button>

              {link.path === '/notifications' && unreadCount > 0 && (
                <span className="absolute -top-2 -right-3 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 leading-none">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </li>
          ))}
        </ul>

        <div className="hidden md:flex gap-3 items-center">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full border border-cyan-500/20 flex items-center justify-center text-lg hover:border-cyan-400 transition-all duration-200"
            aria-label="Toggle theme"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {user ? (
            <>
              <div
                className="text-cyan-400 text-xs tracking-widest hidden lg:flex items-center gap-1 font-bold"
                style={{ fontFamily: 'monospace' }}
              >
                @{username}
                {verified && (
                  <span title="Verified Creator" className="text-sm">
                    ✅
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="border border-red-500/30 text-red-400 px-5 py-2 rounded text-sm tracking-widest hover:border-red-400 hover:text-red-300 transition-all duration-200 bg-transparent"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleNavClick('/auth')}
                className="border border-cyan-500/20 text-slate-400 px-5 py-2 rounded text-sm tracking-widest hover:border-cyan-400 hover:text-cyan-400 transition-all duration-200 bg-transparent"
              >
                Log In
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('/auth')}
                className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-5 py-2 rounded text-xs font-black tracking-widest hover:brightness-110 transition-all duration-200"
                style={{ fontFamily: 'monospace' }}
              >
                JOIN FREE
              </button>
            </>
          )}
        </div>

        <div className="flex md:hidden gap-3 items-center">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full border border-cyan-500/20 flex items-center justify-center text-base hover:border-cyan-400 transition-all duration-200"
            aria-label="Toggle theme"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="w-9 h-9 rounded border border-cyan-500/20 flex flex-col items-center justify-center gap-1.5 hover:border-cyan-400 transition-all duration-200"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span className={`block w-4 h-0.5 bg-cyan-400 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-4 h-0.5 bg-cyan-400 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-4 h-0.5 bg-cyan-400 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div
          className="fixed top-16 left-0 right-0 z-40 border-b border-cyan-500/10 backdrop-blur-lg px-8 py-6 flex flex-col gap-4 md:hidden"
          style={{ background: 'var(--bg)' }}
        >
          {user && (
            <div
              className="flex items-center gap-1 text-cyan-400 text-xs tracking-widest font-bold pb-2 border-b border-cyan-500/10"
              style={{ fontFamily: 'monospace' }}
            >
              @{username}
              {verified && <span>✅</span>}
            </div>
          )}

          {TOP_NAV.map((link) => (
            <div key={link.label} className="relative w-fit">
              <button
                type="button"
                onClick={() => handleNavClick(link)}
                className={`text-sm tracking-widest uppercase cursor-pointer transition-colors duration-200 py-2 border-b border-cyan-500/10 block text-left ${
                  location.pathname === link.path
                    ? 'text-cyan-400 font-bold'
                    : link.path === '/feed'
                      ? 'text-purple-400'
                      : link.path === '/collections'
                        ? 'text-cyan-300 hover:text-cyan-400'
                        : 'text-slate-400 hover:text-cyan-400'
                }`}
              >
                {link.label}
              </button>

              {link.path === '/notifications' && unreadCount > 0 && (
                <span className="absolute -top-1 -right-5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 leading-none">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
          ))}

          {user ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="border border-red-500/30 text-red-400 px-5 py-3 rounded text-sm tracking-widest hover:border-red-400 transition-all duration-200 bg-transparent text-left"
            >
              Logout
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleNavClick('/auth')}
                className="border border-cyan-500/20 text-slate-400 px-5 py-3 rounded text-sm tracking-widest hover:border-cyan-400 hover:text-cyan-400 transition-all duration-200 bg-transparent text-left"
              >
                Log In
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('/auth')}
                className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-5 py-3 rounded text-xs font-black tracking-widest hover:brightness-110 transition-all duration-200"
                style={{ fontFamily: 'monospace' }}
              >
                JOIN FREE
              </button>
            </>
          )}
        </div>
      )}

      <div
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-cyan-500/10 backdrop-blur-lg"
        style={{
          background: 'rgba(4, 8, 16, 0.95)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {BOTTOM_NAV.map((item) => {
            const isActive = location.pathname === item.path
            const isUpload = item.path === '/upload'
            const isNotifications = item.path === '/notifications'

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNavClick(item)}
                className="flex flex-col items-center gap-1 flex-1 py-1 transition-all duration-200 relative"
                aria-label={item.label}
              >
                {isUpload ? (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center text-xl text-black shadow-lg shadow-cyan-500/30 -translate-y-2">
                    ➕
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <span className={`text-2xl transition-all duration-200 ${isActive ? 'scale-110' : 'opacity-60'}`}>
                        {item.icon}
                      </span>

                      {isNotifications && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-2 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 leading-none">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-xs tracking-widest transition-all duration-200 ${
                        isActive ? 'text-cyan-400 font-bold' : 'text-slate-600'
                      }`}
                      style={{ fontFamily: 'monospace', fontSize: '9px' }}
                    >
                      {item.label}
                    </span>

                    {isActive && <div className="w-1 h-1 rounded-full bg-cyan-400" />}
                  </>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default Navbar