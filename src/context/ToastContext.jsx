// src/context/ToastContext.jsx
import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext()

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef({})

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id])
      delete timersRef.current[id]
    }
  }, [])

  const showToast = useCallback((message, options = {}) => {
    const id = ++idCounter
    const type = options.type || 'default'
    const duration = options.duration ?? 3000

    setToasts((prev) => {
      const next = [...prev, { id, message, type, icon: options.icon }]
      // Cap at 3 visible toasts — oldest gets pushed out
      return next.length > 3 ? next.slice(next.length - 3) : next
    })

    if (duration > 0) {
      timersRef.current[id] = setTimeout(() => removeToast(id), duration)
    }

    return id
  }, [removeToast])

  const toast = {
    show: showToast,
    success: (message, options) => showToast(message, { ...options, type: 'success', icon: options?.icon || '✅' }),
    error: (message, options) => showToast(message, { ...options, type: 'error', icon: options?.icon || '❌' }),
    info: (message, options) => showToast(message, { ...options, type: 'info', icon: options?.icon || 'ℹ️' }),
    loading: (message, options) => showToast(message, { ...options, type: 'loading', icon: options?.icon || '⏳', duration: 0 }),
    dismiss: removeToast,
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastViewport({ toasts, onDismiss }) {
  if (toasts.length === 0) return null

  const typeStyles = {
    success: { border: 'rgba(34,197,94,0.4)', bg: 'rgba(34,197,94,0.08)' },
    error: { border: 'rgba(255,45,85,0.4)', bg: 'rgba(255,45,85,0.08)' },
    info: { border: 'rgba(0,245,255,0.4)', bg: 'rgba(0,245,255,0.08)' },
    loading: { border: 'rgba(148,163,184,0.4)', bg: 'rgba(148,163,184,0.08)' },
    default: { border: 'rgba(0,245,255,0.3)', bg: 'rgba(11,20,37,0.95)' },
  }

  return (
    <div
      className="fixed z-[200] flex flex-col gap-2 pointer-events-none"
      style={{
        bottom: 'max(20px, env(safe-area-inset-bottom))',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(92vw, 380px)',
      }}
    >
      {toasts.map((t) => {
        const style = typeStyles[t.type] || typeStyles.default

        return (
          <div
            key={t.id}
            onClick={() => onDismiss(t.id)}
            className="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl backdrop-blur-md cursor-pointer animate-toast-in"
            style={{
              background: '#0b1425ee',
              border: `1px solid ${style.border}`,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}
          >
            {t.icon && (
              <span className={`text-base flex-shrink-0 ${t.type === 'loading' ? 'animate-spin' : ''}`}>
                {t.icon}
              </span>
            )}
            <span className="text-white text-sm font-medium flex-1">{t.message}</span>
          </div>
        )
      })}
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
}