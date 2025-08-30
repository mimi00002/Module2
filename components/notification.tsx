"use client"

import { useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react"

interface NotificationProps {
  type: "success" | "error" | "info"
  message: string
  show: boolean
  onClose: () => void
}

export function Notification({ type, message, show, onClose }: NotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  if (!show) return null

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
      case "error":
        return <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
      case "info":
        return <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50 text-green-800 shadow-green-100"
      case "error":
        return "border-red-200 bg-red-50 text-red-800 shadow-red-100"
      case "info":
        return "border-blue-200 bg-blue-50 text-blue-800 shadow-blue-100"
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full px-4 sm:px-0 animate-in slide-in-from-top-2 duration-300">
      <Alert className={`${getStyles()} shadow-lg border-l-4 backdrop-blur-sm`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {getIcon()}
            <AlertDescription className="text-sm font-medium leading-relaxed break-words">{message}</AlertDescription>
          </div>
          <button
            onClick={onClose}
            className="opacity-70 hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-white/20 flex-shrink-0"
            aria-label="ปิดการแจ้งเตือน"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </Alert>
    </div>
  )
}
