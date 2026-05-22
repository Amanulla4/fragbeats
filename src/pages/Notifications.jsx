import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../hooks/useNotifications'

const TYPE_ICON = { like: '❤️', comment: '💬', follow: '👤' }
const TYPE_COLOR = { like: '#ff6b9d', comment: '#00f5ff', follow: '#bf00ff' }

function Notifications() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { clearUnread } = useNotifications()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [usernames, setUsernames] = useState({})

  useEffect(() => {
    if (user) {
      fetchNotifications()
      // Mark all read and clear badge when page opens
      markAllReadSilent()
      clearUnread()
    }
  }, [user])

  async function fetchNotifications() {
    setLoading(true)
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      setNotifications(data)
      const uniqueIds = [...new Set(data.map(n => n.from_user_id).filter(Boolean))]
      if (uniqueIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username')
          .in('user_id', uniqueIds)
        if (profiles) {
          const map = {}
          profiles.forEach(p => { map[p.user_id] = p.username })
          setUsernames(map)
        }
      }
    }
    setLoading(false)
  }

  async function markAllReadSilent() {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)
  }

  async function markAllRead() {
    await markAllReadSilent()
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    clearUnread()
  }

  async function markRead(id) {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  function formatTime(timestamp) {
    const diff = Math.floor((Date.now() - new Date(timestamp)) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago'
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago'
    return Math.floor(diff / 86400) + 'd ago'
  }

  function getUsername(userId) {
    return usernames[userId] ? `@${usernames[userId]}` : `@${userId?.slice(0, 8) || 'user'}`
  }

  const filtered = notifications.filter(n => {
    if (filter === 'All') return true
    if (filter === 'Unread') return !n.read
    return n.type === filter.toLowerCase()
  })

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      <div className="max-w-2xl mx-auto px-8 pt-32 pb-16">

        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-cyan-400 text-xs tracking-widest uppercase mb-2">// NOTIFICATIONS</p>
            <h1 className="font-black text-4xl text-white" style={{ fontFamily: 'monospace' }}>
              Activity 🔔
            </h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-cyan-400 text-xs tracking-widest uppercase hover:text-cyan-300 transition-colors duration-200 border border-cyan-500/20 px-4 py-2 rounded-lg hover:border-cyan-400">
              Mark all read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap mb-8">
          {['All', 'Unread', 'Like', 'Comment', 'Follow'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest transition-all duration-200 ${
                filter === f
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black'
                  : 'bg-[#0b1425] border border-cyan-500/20 text-slate-400 hover:border-cyan-400 hover:text-cyan-400'
              }`}
              style={{ fontFamily: 'monospace' }}>
              {f} {f === 'Unread' && unreadCount > 0 && `(${unreadCount})`}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-cyan-500/10 bg-[#0b1425] animate-pulse">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-cyan-500/10 rounded w-3/4" />
                  <div className="h-3 bg-cyan-500/10 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notifications List */}
        {!loading && (
          <div className="flex flex-col gap-3">
            {filtered.length > 0 ? filtered.map(n => (
              <div key={n.id}
                onClick={() => {
                  markRead(n.id)
                  if (n.clip_id) navigate(`/clip/${n.clip_id}`)
                }}
                className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:border-cyan-400/30 ${
                  n.read ? 'border-cyan-500/10 bg-[#0b1425]' : 'border-cyan-500/30 bg-cyan-500/5'
                }`}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: `${TYPE_COLOR[n.type] || '#00f5ff'}22` }}>
                  {TYPE_ICON[n.type] || '🔔'}
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="text-cyan-400 font-bold">{getUsername(n.from_user_id)}</span>
                    {' '}
                    <span className="text-slate-300">{n.message}</span>
                  </p>
                  <p className="text-slate-600 text-xs mt-1">{formatTime(n.created_at)}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />}
              </div>
            )) : (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔔</div>
                <p className="text-slate-400">No notifications yet</p>
                <p className="text-slate-500 text-sm mt-2">When someone likes or comments on your clips, it shows here</p>
              </div>
            )}
          </div>
        )}

      </div>
      <Footer />
    </div>
  )
}

export default Notifications