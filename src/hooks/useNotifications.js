import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useNotifications() {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const channelRef = useRef(null)

  useEffect(() => {
    if (!user) return
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
    if (channelRef.current) supabase.removeChannel(channelRef.current)

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const n = payload.new
          setUnreadCount(prev => prev + 1)
          showBrowserNotification(n)
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
        () => {
          // Recount after mark-as-read
          fetchUnreadCount()
        }
      )
      .subscribe()

    channelRef.current = channel
  }

  async function showBrowserNotification(notification) {
    if (!('Notification' in window)) return

    // Request permission if not decided yet
    if (Notification.permission === 'default') {
      await Notification.requestPermission()
    }

    if (Notification.permission !== 'granted') return

    const TYPE_ICON = { like: '❤️', comment: '💬', follow: '👤' }
    const icon = '/favicon.ico'

    // Fetch sender username
    let senderName = 'Someone'
    if (notification.from_user_id) {
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', notification.from_user_id)
        .single()
      if (data?.username) senderName = `@${data.username}`
    }

    const title = `FragBeats ${TYPE_ICON[notification.type] || '🔔'}`
    const body = `${senderName} ${notification.message}`

    const notif = new Notification(title, {
      body,
      icon,
      badge: icon,
      tag: `fragbeats-${notification.id}`,
      renotify: true,
    })

    // Click opens the clip
    notif.onclick = () => {
      window.focus()
      if (notification.clip_id) {
        window.location.href = `/clip/${notification.clip_id}`
      }
      notif.close()
    }

    // Auto-close after 5 seconds
    setTimeout(() => notif.close(), 5000)
  }

  function clearUnread() {
    setUnreadCount(0)
  }

  return { unreadCount, clearUnread }
}