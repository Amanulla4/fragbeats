import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const NotificationContext = createContext({
  unreadCount: 0,
  fetchUnreadCount: () => {},
  clearUnread: () => {},
})

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const channelRef = useRef(null)

  useEffect(() => {
    cleanupChannel()

    if (!user) {
      setUnreadCount(0)
      return
    }

    fetchUnreadCount()
    subscribeToNotifications()

    return cleanupChannel
  }, [user?.id])

  function cleanupChannel() {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
  }

  async function fetchUnreadCount() {
    if (!user) return

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)

    if (error) {
      console.error('Unread notification count error:', error.message)
      return
    }

    setUnreadCount(count || 0)
  }

  function subscribeToNotifications() {
    if (!user) return

    const channel = supabase
      .channel(`notif-ctx:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setUnreadCount((prev) => prev + 1)
          showBrowserNotification(payload.new)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        fetchUnreadCount
      )
      .subscribe()

    channelRef.current = channel
  }

  async function showBrowserNotification(notification) {
    if (!notification || !('Notification' in window)) return

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return
    }

    if (Notification.permission !== 'granted') return

    const typeIcon = {
      like: '❤️',
      comment: '💬',
      follow: '👤',
    }

    let senderName = 'Someone'

    if (notification.from_user_id) {
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', notification.from_user_id)
        .single()

      if (data?.username) {
        senderName = `@${data.username}`
      }
    }

    const browserNotification = new Notification(
      `FragBeats ${typeIcon[notification.type] || '🔔'}`,
      {
        body: `${senderName} ${notification.message}`,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: `fragbeats-${notification.id}`,
        renotify: true,
      }
    )

    browserNotification.onclick = () => {
      window.focus()

      if (notification.clip_id) {
        window.location.href = `/clip/${notification.clip_id}`
      } else {
        window.location.href = '/notifications'
      }

      browserNotification.close()
    }

    setTimeout(() => {
      browserNotification.close()
    }, 5000)
  }

  async function clearUnread() {
    setUnreadCount(0)

    if (!user) return

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)

    if (error) {
      console.error('Clear notifications error:', error.message)
      fetchUnreadCount()
    }
  }

  return (
    <NotificationContext.Provider value={{ unreadCount, fetchUnreadCount, clearUnread }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}