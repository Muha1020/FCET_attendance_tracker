import { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  onClose: () => void
}

const colours: Record<ToastType, string> = {
  success: 'border-l-4 border-green-500',
  error: 'border-l-4 border-red-500',
  info: 'border-l-4 border-amber-500',
}

export default function Toast({ message, type = 'info', onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 card px-4 py-3 shadow-xl max-w-sm text-sm ${colours[type]}`}
      style={{ color: 'var(--text-primary)' }}
    >
      <div className="flex items-center gap-3">
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="shrink-0"
          style={{ color: 'var(--text-muted)' }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
