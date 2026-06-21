// src/pages/Notifications.jsx
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import SEO from '../components/SEO'

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
  const { user } = useAuth()
  const navigate = useNavigate()
  const { clearUnread } = useNotifications()

  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [usernames, setUsernames] = useState({})

  useEffect(() => {
    if (!user) return
    fetchNotifications()
  }, [user?.id])

  async function fetchNotifications() {
    setLoading(true)

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Notifications fetch error:', error.message)
      setLoading(false)
      return
    }

    const notificationData = data || []
    setNotifications(notificationData)

    const uniqueUserIds = [
      ...new Set(notificationData.map((item) => item.from_user_id).filter(Boolean)),
    ]

    if (uniqueUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('user_id', uniqueUserIds)

      if (profiles) {
        const usernameMap = {}
        profiles.forEach((profile) => {
          usernameMap[profile.user_id] = profile.username
        })
        setUsernames(usernameMap)
      }
    }

    await markAllReadOnOpen()
    setLoading(false)
  }

  async function markAllReadOnOpen() {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
    await clearUnread()
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
    await clearUnread()
  }

  async function markRead(notification) {
    if (notification.read) return

    setNotifications((prev) =>
      prev.map((item) => (item.id === notification.id ? { ...item, read: true } : item))
    )

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notification.id)

    if (error) {
      console.error('Mark notification read error:', error.message)
    }
  }

  function openNotification(notification) {
    markRead(notification)

    if (notification.clip_id) {
      navigate(`/clip/${notification.clip_id}`)
    }
  }

  function formatTime(timestamp) {
    if (!timestamp) return ''

    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)

    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`

    return `${Math.floor(diff / 86400)}d ago`
  }

  function getUsername(userId) {
    return usernames[userId] ? `@${usernames[userId]}` : `@${userId?.slice(0, 8) || 'user'}`
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'All') return true
    if (filter === 'Unread') return !notification.read
    return notification.type === filter.toLowerCase()
  })

  const unreadCount = notifications.filter((notification) => !notification.read).length

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <SEO title="Notifications" url="/notifications" />
      <Navbar />

      <div className="max-w-2xl mx-auto px-8 pt-32 pb-40 md:pb-24">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-cyan-400 text-xs tracking-widest uppercase mb-2">
              // NOTIFICATIONS
            </p>
            <h1 className="font-black text-4xl text-white" style={{ fontFamily: 'monospace' }}>
              Activity 🔔
            </h1>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-cyan-400 text-xs tracking-widest uppercase hover:text-cyan-300 transition-colors duration-200 border border-cyan-500/20 px-4 py-2 rounded-lg hover:border-cyan-400"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="flex gap-3 flex-wrap mb-8">
          {['All', 'Unread', 'Like', 'Comment', 'Follow'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest transition-all duration-200 ${
                filter === item
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black'
                  : 'bg-[#0b1425] border border-cyan-500/20 text-slate-400 hover:border-cyan-400 hover:text-cyan-400'
              }`}
              style={{ fontFamily: 'monospace' }}
            >
              {item} {item === 'Unread' && unreadCount > 0 ? `(${unreadCount})` : ''}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex items-center gap-4 p-4 rounded-lg border border-cyan-500/10 bg-[#0b1425] animate-pulse"
              >
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-cyan-500/10 rounded w-3/4" />
                  <div className="h-3 bg-cyan-500/10 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <div className="flex flex-col gap-3">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => openNotification(notification)}
                  className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:border-cyan-400/30 text-left ${
                    notification.read
                      ? 'border-cyan-500/10 bg-[#0b1425]'
                      : 'border-cyan-500/30 bg-cyan-500/5'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: `${TYPE_COLOR[notification.type] || '#00f5ff'}22` }}
                  >
                    {TYPE_ICON[notification.type] || '🔔'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed">
                      <span className="text-cyan-400 font-bold">
                        {getUsername(notification.from_user_id)}
                      </span>{' '}
                      <span className="text-slate-300">{notification.message}</span>
                    </p>

                    <p className="text-slate-600 text-xs mt-1">
                      {formatTime(notification.created_at)}
                    </p>
                  </div>

                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
                  )}
                </button>
              ))
            ) : (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔔</div>
                <p className="text-slate-400">
                  {filter === 'Unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  When someone likes, comments, or follows you, it shows here.
                </p>
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