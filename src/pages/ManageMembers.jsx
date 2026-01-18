import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGroup } from '../context/GroupContext'
import { supabase } from '../lib/supabase'

const EMOJI_OPTIONS = [
  '👨', '👩', '👦', '👧', '🧑', '👴', '👵', 
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻',
  '🌟', '⭐', '✨', '💫', '🔥', '💎', '👑',
  '🎮', '🎸', '🎨', '📚', '⚽', '🏀', '🎯'
]

export default function ManageMembers() {
  const navigate = useNavigate()
  const { group, member } = useGroup()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberEmoji, setNewMemberEmoji] = useState('👤')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadMembers()
  }, [group])

  async function loadMembers() {
    if (!group) return

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('group_id', group.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error loading members:', error)
    } else {
      setMembers(data || [])
    }
    setLoading(false)
  }

  async function handleAddMember(e) {
    e.preventDefault()
    if (!newMemberName.trim() || saving) return

    setSaving(true)

    const { data, error } = await supabase
      .from('members')
      .insert({
        group_id: group.id,
        name: newMemberName.trim(),
        emoji: newMemberEmoji,
        user_id: null, // Placeholder - will be filled when they sign up
        is_curator: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding member:', error)
      alert('Error adding member: ' + error.message)
    } else {
      setMembers([...members, data])
      setNewMemberName('')
      setNewMemberEmoji('👤')
      setShowAddForm(false)
    }

    setSaving(false)
  }

  async function handleDeleteMember(memberId) {
    if (!confirm('Are you sure? This will delete all their answers and cannot be undone.')) {
      return
    }

    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', memberId)

    if (error) {
      console.error('Error deleting member:', error)
      alert('Error deleting member: ' + error.message)
    } else {
      setMembers(members.filter(m => m.id !== memberId))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }

  if (!member?.is_curator) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Only curators can manage members</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/curator')}
            className="text-slate-400 hover:text-white"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-white">Manage Family</h1>
          <div className="w-16"></div>
        </div>

        {/* Add Member Button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 px-6 rounded-xl mb-6"
          >
            + Add Family Member
          </button>
        )}

        {/* Add Member Form */}
        {showAddForm && (
          <form onSubmit={handleAddMember} className="bg-slate-800/30 rounded-xl p-6 mb-6 border border-slate-700">
            <h3 className="text-white font-semibold mb-4">Add Family Member</h3>
            
            <div className="mb-4">
              <label className="block text-slate-400 text-sm mb-2">Name</label>
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Enter name"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-slate-400 text-sm mb-2">Emoji</label>
              <div className="grid grid-cols-10 gap-2">
                {EMOJI_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewMemberEmoji(emoji)}
                    className={`
                      text-2xl p-2 rounded-lg transition-all
                      ${newMemberEmoji === emoji 
                        ? 'bg-violet-600 scale-110' 
                        : 'bg-slate-800 hover:bg-slate-700'
                      }
                    `}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!newMemberName.trim() || saving}
                className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-2 px-4 rounded-lg"
              >
                {saving ? 'Adding...' : 'Add Member'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setNewMemberName('')
                  setNewMemberEmoji('👤')
                }}
                className="px-4 py-2 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Members List */}
        <div className="space-y-3">
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-3">
            Family Members ({members.length})
          </h3>
          
          {members.map((m) => (
            <div key={m.id} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{m.emoji}</span>
                <div>
                  <p className="text-white font-medium">{m.name}</p>
                  <p className="text-slate-500 text-xs">
                    {m.user_id ? 'Active' : 'Not signed up yet'}
                    {m.is_curator && ' • Curator'}
                  </p>
                </div>
              </div>
              
              {m.id !== member.id && (
                <button
                  onClick={() => handleDeleteMember(m.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-slate-800/20 rounded-xl border border-slate-700">
          <p className="text-slate-400 text-sm">
            💡 <strong>Tip:</strong> Add all family members here first. When they sign up, they'll be able to claim their profile.
          </p>
        </div>
      </div>
    </div>
  )
}