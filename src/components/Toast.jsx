import { useState, useEffect, createContext, useContext } from 'react'

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random()
    const toast = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration
    }

    setToasts((prev) => [...prev, toast])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function Toast({ toast, onClose }) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (toast.duration > 0) {
      const startTime = Date.now()
      const interval = setInterval(() => {
        const elapsedTime = Date.now() - startTime
        const newProgress = Math.max(0, 100 - (elapsedTime / toast.duration) * 100)
        setProgress(newProgress)
        if (newProgress === 0) clearInterval(interval)
      }, 10)

      return () => clearInterval(interval)
    }
  }, [toast.duration])

  const getToastConfig = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-white border-green-100 shadow-green-100/50',
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          progress: 'bg-green-500',
          accent: 'bg-green-500'
        }
      case 'error':
        return {
          bg: 'bg-white border-red-100 shadow-red-100/50',
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          progress: 'bg-red-500',
          accent: 'bg-red-500'
        }
      case 'warning':
        return {
          bg: 'bg-white border-yellow-100 shadow-yellow-100/50',
          icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
          progress: 'bg-yellow-500',
          accent: 'bg-yellow-500'
        }
      case 'info':
      default:
        return {
          bg: 'bg-white border-blue-100 shadow-blue-100/50',
          icon: <Info className="w-5 h-5 text-blue-500" />,
          progress: 'bg-blue-500',
          accent: 'bg-blue-500'
        }
    }
  }

  const config = getToastConfig()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`pointer-events-auto relative overflow-hidden group flex items-start space-x-3 p-4 rounded-2xl shadow-2xl border ${config.bg} backdrop-blur-xl transition-all duration-300`}
    >
      {/* Accent Line */}
      <div className={`absolute top-0 left-0 w-1 h-full ${config.accent}`} />

      {/* Progress Bar */}
      {toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
          <motion.div
            className={`h-full ${config.progress}`}
            initial={{ width: "100%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.1 }}
          />
        </div>
      )}

      <div className="flex-shrink-0 mt-0.5">
        {config.icon}
      </div>

      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm font-bold text-gray-900 leading-tight">{toast.message}</p>
      </div>

      <button
        onClick={onClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-1 rounded-lg transition-all duration-200"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

export default Toast

