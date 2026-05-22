import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const NotificationContext = createContext({ unreadCount: 0, clearUnread: () => {} })

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const channelRef = useRef(null)

  useEffect(() => {
    if (!user) { setUnreadCount(0); return }
    fetchUnreadCount()
    subscribeToNotifications()
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [user])

  async function fetchUnreadCount() {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)
    setUnreadCount(count || 0)
  }

  function subscribeToNotifications() {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    const channel = supabase
      .channel(`notif-ctx:${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          setUnreadCount(prev => prev + 1)
          showBrowserNotification(payload.new)
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => fetchUnreadCount()
      )
      .subscribe()

    channelRef.current = channel
  }

  async function showBrowserNotification(notification) {
    if (!('Notification' in window)) return
    if (Notification.permission === 'default') await Notification.requestPermission()
    if (Notification.permission !== 'granted') return

    const TYPE_ICON = { like: '❤️', comment: '💬', follow: '👤' }

    let senderName = 'Someone'
    if (notification.from_user_id) {
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', notification.from_user_id)
        .single()
      if (data?.username) senderName = `@${data.username}`
    }

    const notif = new Notification(`FragBeats ${TYPE_ICON[notification.type] || '🔔'}`, {
      body: `${senderName} ${notification.message}`,
      icon: '/favicon.ico',
      tag: `fragbeats-${notification.id}`,
      renotify: true,
    })

    notif.onclick = () => {
      window.focus()
      if (notification.clip_id) window.location.href = `/clip/${notification.clip_id}`
      notif.close()
    }

    setTimeout(() => notif.close(), 5000)
  }

  function clearUnread() { setUnreadCount(0) }

  return (
    <NotificationContext.Provider value={{ unreadCount, clearUnread }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}