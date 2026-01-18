import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const emojiOptions = ['👩', '👨', '🧑', '👧', '👦', '🦋', '🐝', '🌟', '🔥', '💀', '🎯', '🎨', '🎸', '🏀', '📚', '🌮', '🍕', '☕', '🌴', '🦊']

export default function JoinGroup() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [step, setStep] = useState(1) // 1 = enter code, 2 = set profile
  const [inviteCode, setInviteCode] = useState('')
  const [group, setGroup] = useState(null)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('👤')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCodeSubmit(e) {
    e.preventDefault()
    if (!inviteCode.trim()) return

    setLoading(true)
    setError('')

    const { data, error: fetchError } = await supabase
      .from('groups')
      .select('*')
      .eq('invite_code', inviteCode.trim().toUpperCase())
      .single()

    if (fetchError || !data) {
      setError('Invalid invite code. Check with your group curator.')
    } else {
      setGroup(data)
      setStep(2)
    }

    setLoading(false)
  }

  async function handleJoin(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Name is required')
      return
    }

    setLoading(true)
    setError('')

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('members')
      .select('*')
      .eq('user_id', user.id)
      .eq('group_id', group.id)
      .single()

    if (existingMember) {
      setError('You are already a member of this group!')
      setLoading(false)
      return
    }

    // Create member record
    const { error: insertError } = await supabase
      .from('members')
      .insert({
        user_id: user.id,
        group_id: group.id,
        name: name.trim(),
        emoji: emoji,
        phone: phone.trim() || null,
        is_curator: false
      })

    if (insertError) {
      setError('Error joining group: ' + insertError.message)
    } else {
      // Refresh the page to reload group context
      window.location.href = '/'
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="max-w-md mx-auto pt-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">The Drop</h1>
          <p className="text-slate-400">
            {step === 1 ? 'Enter your invite code' : `Join ${group?.name}`}
          </p>
        </div>

        {/* Step 1: Enter code */}
        {step === 1 && (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Invite Code</label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="FAMILY123"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white text-center text-2xl uppercase placeholder-slate-500 focus:outline-none focus:border-violet-500 tracking-widest"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg text-sm bg-red-900/50 text-red-300 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !inviteCode.trim()}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 text-white font-semibold py-4 px-6 rounded-xl transition-all"
            >
              {loading ? 'Checking...' : 'Continue'}
            </button>
          </form>
        )}

        {/* Step 2: Set profile */}
        {step === 2 && (
          <form onSubmit={handleJoin} className="space-y-6">
            
            {/* Group confirmation */}
            <div className="bg-violet-900/30 border border-violet-700/50 rounded-xl p-4 text-center">
              <p className="text-violet-300 text-sm">You're joining</p>
              <p className="text-white text-xl font-bold">{group?.name}</p>
            </div>

            {/* Preview */}
            <div className="text-center">
              <span className="text-6xl">{emoji}</span>
              <p className="text-white text-xl font-bold mt-2">{name || 'Your Name'}</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-slate-400 text-sm mb-2">Your nickname</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should we call you?"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>

            {/* Emoji picker */}
            <div>
              <label className="block text-slate-400 text-sm mb-2">Pick your emoji</label>
              <div className="flex flex-wrap gap-2">
                {emojiOptions.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={`text-2xl p-2 rounded-lg transition-all ${
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
              <label className="block text-slate-400 text-sm mb-2">Phone (optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 123 4567"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
              <p className="text-slate-500 text-xs mt-1">For notifications when The Drop lands</p>
            </div>

            {error && (
              <div className="p-3 rounded-lg text-sm bg-red-900/50 text-red-300 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 text-white font-semibold py-4 px-6 rounded-xl transition-all"
            >
              {loading ? 'Joining...' : 'Join Group'}
            </button>

            <button
              type="button"
              onClick={() => { setStep(1); setGroup(null); setError(''); }}
              className="w-full text-slate-500 hover:text-slate-300 text-sm"
            >
              ← Use different code
            </button>
          </form>
        )}

      </div>
    </div>
  )
}