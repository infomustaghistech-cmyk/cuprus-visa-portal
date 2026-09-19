import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, title, subtitle, onClose, children }) {
  const panel = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const prevOpenRef = useRef(false)

  useEffect(() => {
    if (!open) {
      prevOpenRef.current = false
      return
    }

    const onKey = (e) => {
      if (e.key === 'Escape') onCloseRef.current?.()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'

    // Only set initial focus when modal transitions from closed to open
    if (!prevOpenRef.current) {
      prevOpenRef.current = true
      // Small timeout to allow DOM to render
      setTimeout(() => {
        if (panel.current && !panel.current.contains(document.activeElement)) {
          panel.current.querySelector('input, button')?.focus()
        }
      }, 50)
    }

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm animate-pop" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-md animate-pop rounded-t-2xl bg-white p-6 shadow-lift sm:rounded-2xl"
      >
        <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1.5 text-ink-mute hover:text-ink" aria-label="Close dialog">
          <X size={18} />
        </button>
        <h2 className="text-xl font-semibold">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-ink-mute">{subtitle}</p>}
        <div className="mt-5">{children}</div>
      </div>
    </div>
  )
}
