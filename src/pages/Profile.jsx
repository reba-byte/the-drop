import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useGroup } from '../context/GroupContext'
import { supabase } from '../lib/supabase'

const emojiOptions = ['👩', '👨', '🧑', '👧', '👦', '🦋', '🐝', '🌟', '🔥', '💀', '🎯', '🎨', '🎸', '🏀', '📚', '🌮', '🍕', '☕', '🌴', '🦊']

export default function Profile() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { member, group } = useGroup()
  
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('👤')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (member) {
      setName(member.name || '')
      setEmoji(member.emoji || '👤')
      setPhone(member.phone || '')
    }
  }, [member])

  const handleSave = async () => {
    if (!name.trim()) {
      setMessage('Name is required')
      return
    }

    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('members')
      .update({
        name: name.trim(),
        emoji: emoji,
        phone: phone.trim() || null
      })
      .eq('id', member.id)

    if (error) {
      setMessage('Error saving: ' + error.message)
    } else {
      setMessage('Saved!')
      setHasChanges(false) 
      setTimeout(() => setMessage(''), 2000)
    }

    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="max-w-md mx-auto pt-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/')}
            className="text-slate-400 active:text-white"
          >
            ← Back
          </button>
          <span className="text-slate-500 text-sm">Profile</span>
        </div>

        {/* Current look */}
        <div className="text-center mb-8">
          <span className="text-6xl">{emoji}</span>
          <p className="text-white text-xl font-bold mt-2">{name || 'Your Name'}</p>
          {group && <p className="text-slate-400 text-sm">{group.name}</p>}
        </div>

        {/* Form */}
        <div className="space-y-6">
          
          {/* Name */}
          <div>
            <label className="block text-slate-400 text-sm mb-2">Nickname</label>
            <input
              type="text"
              value={name}
onChange={(e) => { setName(e.target.value); setHasChanges(true); }}              placeholder="What should we call you?"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Emoji picker */}
          <div>
            <label className="block text-slate-400 text-sm mb-2">Your emoji</label>
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map((e) => (
                <button
                  key={e}
onClick={() => { setEmoji(e); setHasChanges(true); }}                  className={`text-2xl p-2 rounded-lg transition-all ${
                    emoji === e 
                      ? 'bg-violet-600 scale-110' 
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-slate-400 text-sm mb-2">Phone number (for notifications)</label>
            <input
              type="tel"
              value={phone}
onChange={(e) => { setPhone(e.target.value); setHasChanges(true); }}              placeholder="+1 555 123 4567"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
            <p className="text-slate-500 text-xs mt-1">We'll text you when The Drop lands</p>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-3 rounded-lg text-sm text-center ${
              message === 'Saved!' ? 'bg-emerald-900/50 text-emerald-300' : 'bg-red-900/50 text-red-300'
            }`}>
              {message}
            </div>
          )}

          {/* Save button */}
         <button
  onClick={handleSave}
  disabled={saving || !hasChanges}
  className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-4 px-6 rounded-xl transition-all"
>
  {saving ? 'Saving...' : 'Save changes'}
</button>

          {/* Sign out */}
          <button
            onClick={signOut}
            className="w-full text-slate-500 hover:text-slate-300 text-sm py-2"
          >
            Sign out
          </button>

        </div>
      </div>
    </div>
  )
}