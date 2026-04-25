import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const NOTIFICATIONS = [
  { id: 1, type: 'like', user: '@neonwolf99', text: 'liked your clip', clip: 'Insane 1v4 clutch', time: '2m ago', read: false },
  { id: 2, type: 'comment', user: '@drip_editz', text: 'commented on your clip', clip: 'Solo vs Squad win', time: '5m ago', read: false },
  { id: 3, type: 'follow', user: '@ghostfrags', text: 'started following you', clip: null, time: '12m ago', read: false },
  { id: 4, type: 'like', user: '@cityvibes', text: 'liked your clip', clip: 'Headshot compilation', time: '1h ago', read: true },
  { id: 5, type: 'comment', user: '@flashpoint', text: 'commented on your clip', clip: 'Insane 1v4 clutch', time: '2h ago', read: true },
  { id: 6, type: 'follow', user: '@blazeshot', text: 'started following you', clip: null, time: '3h ago', read: true },
  { id: 7, type: 'like', user: '@sniperking', text: 'liked your clip', clip: 'Solo vs Squad win', time: '5h ago', read: true },
]

const TYPE_ICON = {
  like: '❤️',
  comment: '💬',
  follow: '👤',
}

const TYPE_COLOR = {
  like: '#ff6b9d',
  comment: '#00f5ff',
  follow: '#bf00ff',
}

function Notifications() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS)
  const [filter, setFilter] = useState('All')

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
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

        {/* Header */}
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
              className="text-cyan-400 text-xs tracking-widest uppercase hover:text-cyan-300 transition-colors duration-200 border border-cyan-500/20 px-4 py-2 rounded-lg hover:border-cyan-400"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap mb-8">
          {['All', 'Unread', 'Like', 'Comment', 'Follow'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest transition-all duration-200 ${filter === f
                ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black'
                : 'bg-[#0b1425] border border-cyan-500/20 text-slate-400 hover:border-cyan-400 hover:text-cyan-400'}`}
              style={{ fontFamily: 'monospace' }}
            >
              {f} {f === 'Unread' && unreadCount > 0 && `(${unreadCount})`}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex flex-col gap-3">
          {filtered.length > 0 ? filtered.map(notification => (
            <div
              key={notification.id}
              onClick={() => setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n))}
              className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:border-cyan-400/30 ${notification.read ? 'border-cyan-500/10 bg-[#0b1425]' : 'border-cyan-500/30 bg-cyan-500/5'}`}
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: `${TYPE_COLOR[notification.type]}22` }}
              >
                {TYPE_ICON[notification.type]}
              </div>

              {/* Content */}
              <div className="flex-1">
                <p className="text-sm">
                  <span className="text-cyan-400 font-bold">{notification.user}</span>
                  {' '}
                  <span className="text-slate-300">{notification.text}</span>
                  {notification.clip && (
                    <span className="text-white font-bold"> "{notification.clip}"</span>
                  )}
                </p>
                <p className="text-slate-600 text-xs mt-1">{notification.time}</p>
              </div>

              {/* Unread dot */}
              {!notification.read && (
                <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
              )}
            </div>
          )) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔔</div>
              <p className="text-slate-400">No notifications yet</p>
            </div>
          )}
        </div>

      </div>
      <Footer />
    </div>
  )
}

export default Notifications