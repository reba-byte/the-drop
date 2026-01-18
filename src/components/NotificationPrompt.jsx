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
      
      // On iOS, if permission is default OR unsupported, show prompt
      // (unsupported means not added to home screen yet)
      if (permission === 'default' || permission === 'unsupported') {
        setShowPrompt(true)
      }
    }
    checkPermission()
  }, [member])

  const handleEnable = async () => {
    try {
      alert('Starting subscription...')
      const subscription = await requestNotificationPermission()
      alert('Got subscription, saving to DB...')
      
      // Save subscription to database
      await supabase
        .from('push_subscriptions')
        .upsert({
          member_id: member.id,
          subscription: subscription.toJSON(),
        })
      
      alert('Success! 🎉')
      setShowPrompt(false)
    } catch (error) {
      console.error('Full error:', error)
      alert('ERROR:\n' + error.message + '\n\nType: ' + error.name + '\n\nStack: ' + (error.stack || 'no stack'))
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