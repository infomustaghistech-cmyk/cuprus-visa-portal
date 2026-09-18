import { useState, createContext, useContext, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(({ title, message, type = 'success', duration = 5000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9)
    const toast = { id, title, message, type, duration }

    setToasts((prev) => [...prev, toast])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Bottom Right Toast Container */}
      <div
        aria-live="assertive"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onClose }) {
  const { title, message, type } = toast

  const icons = {
    success: (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
        <CheckCircle2 size={18} />
      </div>
    ),
    error: (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
        <AlertCircle size={18} />
      </div>
    ),
    warning: (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
        <AlertTriangle size={18} />
      </div>
    ),
    info: (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
        <Info size={18} />
      </div>
    )
  }

  const borderClasses = {
    success: 'border-emerald-200/90 shadow-xl ring-1 ring-emerald-500/10',
    error: 'border-rose-200/90 shadow-xl ring-1 ring-rose-500/10',
    warning: 'border-amber-200/90 shadow-xl ring-1 ring-amber-500/10',
    info: 'border-gray-200 shadow-xl ring-1 ring-gray-900/5'
  }

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-xl bg-white border transition-all animate-in fade-in slide-in-from-bottom-5 duration-300 ${
        borderClasses[type] || borderClasses.info
      }`}
      role="alert"
    >
      {icons[type] || icons.info}
      <div className="flex-1 min-w-0 pt-0.5">
        {title && <h4 className="text-sm font-semibold text-gray-900 tracking-tight">{title}</h4>}
        {message && <p className="text-xs text-gray-600 mt-1 leading-relaxed">{message}</p>}
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-md transition-colors shrink-0 -mr-1 -mt-1"
        title="Close notification"
      >
        <X size={15} />
      </button>
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
