import { useState, useEffect } from 'react'
import OneSignal from 'react-onesignal'

export default function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if they've already granted/denied permission
    const checkPermission = async () => {
      try {
        const permission = await OneSignal.Notifications.permissionNative
        // Only show prompt if they haven't decided yet (permission is "default")
        if (permission === 'default') {
          setShowPrompt(true)
        }
      } catch (error) {
        console.error('Error checking permission:', error)
      }
    }
    
    checkPermission()
  }, [])

  const handleEnable = async () => {
    try {
      await OneSignal.Notifications.requestPermission()
      setShowPrompt(false)
    } catch (error) {
      console.error('Error requesting permission:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-slate-700 shadow-xl">
        <div className="text-center mb-4">
          <span className="text-5xl">🔥</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2 text-center">
          Don't miss The Drop!
        </h3>
        <p className="text-slate-300 text-center mb-6">
          Get pinged every Sunday when the new question drops. Your family's waiting...
        </p>
        <div className="space-y-2">
          <button
            onClick={handleEnable}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Let's go
          </button>
          <button
            onClick={handleDismiss}
            className="w-full text-slate-400 hover:text-slate-300 py-2 text-sm transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}