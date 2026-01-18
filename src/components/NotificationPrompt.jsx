import { useEffect } from 'react'
import OneSignal from 'react-onesignal'

export default function NotificationPrompt() {
  useEffect(() => {
    // Wait a bit for OneSignal to fully initialize
    setTimeout(async () => {
      try {
        const permission = await OneSignal.Notifications.permissionNative
        
        // Only show if they haven't decided yet
        if (permission === 'default') {
          // Use OneSignal's native slidedown prompt
          OneSignal.Slidedown.promptPush()
        }
      } catch (error) {
        console.error('Error showing OneSignal prompt:', error)
      }
    }, 2000)
  }, [])

  return null // No custom UI needed, OneSignal handles it
}