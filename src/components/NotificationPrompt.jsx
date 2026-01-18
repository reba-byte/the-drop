import { useState, useEffect } from 'react'
import { requestNotificationPermission, checkNotificationPermission } from '../lib/pushNotifications'
import { supabase } from '../lib/supabase'
import { useGroup } from '../context/GroupContext'

export default function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const { member } = useGroup()

  useEffect(() => {
    // Don't run if member isn't loaded yet
    if (!member) return
    
    async function checkPermission() {
      const permission = await checkNotificationPermission()
      console.log('Permission check:', permission)
      if (permission === 'default') {
        setShowPrompt(true)
      }
    }
    checkPermission()
  }, [member])

  const handleEnable = async () => {
    try {
      const subscription = await requestNotificationPermission()
      
      // Save subscription to database
      await supabase
        .from('push_subscriptions')
        .upsert({
          member_id: member.id,
          subscription: subscription.toJSON(),
        })
      
      setShowPrompt(false)
    } catch (error) {
      console.error('Error enabling notifications:', error)
      alert('Could not enable notifications. Please try again or check your browser settings.')
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
  }

  // Don't render anything if member isn't loaded
  if (!member) return null
  
  if (!showPrompt) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
    >
      <div 
        className="bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-slate-700 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
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
            className="w-full bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors touch-manipulation"
          >
            Let's go
          </button>
          <button
            onClick={handleDismiss}
            className="w-full text-slate-400 hover:text-slate-300 active:text-white py-2 text-sm transition-colors touch-manipulation"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}