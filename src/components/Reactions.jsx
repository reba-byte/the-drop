import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useGroup } from '../context/GroupContext'

const REACTIONS = [
  { emoji: '🧢', label: 'Cap' },
  { emoji: '✅', label: 'No Cap' },
  { emoji: '👀', label: 'Sus' },
  { emoji: '💅', label: 'Slay' },
  { emoji: '💀', label: 'Dead' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '😬', label: 'Cringe' },
  { emoji: '⚰️', label: 'Deceased' },
  { emoji: '💯', label: 'Valid' },
  { emoji: '🤡', label: 'Clown' },
  { emoji: '👑', label: 'Queen' },
  { emoji: '✨', label: 'Chef\'s Kiss' },
  { emoji: '📠', label: 'Facts' },
  { emoji: '🚩', label: 'Red Flag' },
  { emoji: '💀💀', label: 'Done' },
]

export default function Reactions({ targetId, type }) {
  const { member } = useGroup()
  const [reactions, setReactions] = useState([])
  const [myReactions, setMyReactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPicker, setShowPicker] = useState(false)

  const table = type === 'question' ? 'question_reactions' : 'comment_reactions'
  const idField = type === 'question' ? 'week_id' : 'comment_id'

  useEffect(() => {
    loadReactions()
  }, [targetId])

  async function loadReactions() {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq(idField, targetId)

    if (error) {
      console.error('Error loading reactions:', error)
    } else {
      setReactions(data)
      setMyReactions(data.filter(r => r.member_id === member.id).map(r => r.reaction))
    }
    setLoading(false)
  }

  async function toggleReaction(reactionLabel) {
    const hasReacted = myReactions.includes(reactionLabel)

    if (hasReacted) {
      // Remove reaction
      const { error } = await supabase
        .from(table)
        .delete()
        .eq(idField, targetId)
        .eq('member_id', member.id)
        .eq('reaction', reactionLabel)

      if (!error) {
        setMyReactions(myReactions.filter(r => r !== reactionLabel))
        setReactions(reactions.filter(r => !(r.member_id === member.id && r.reaction === reactionLabel)))
      }
    } else {
      // Add reaction
      const newReaction = {
        [idField]: targetId,
        member_id: member.id,
        reaction: reactionLabel,
      }

      const { data, error } = await supabase
        .from(table)
        .insert(newReaction)
        .select()
        .single()

      if (!error) {
        setMyReactions([...myReactions, reactionLabel])
        setReactions([...reactions, data])
      }
    }
    
    setShowPicker(false)
  }

  function getReactionCount(reactionLabel) {
    return reactions.filter(r => r.reaction === reactionLabel).length
  }

  // Get unique reactions that have been used
  const usedReactions = [...new Set(reactions.map(r => r.reaction))]
    .map(label => REACTIONS.find(r => r.label === label))
    .filter(Boolean)

  if (loading) return null

  return (
    <div className="relative">
      {/* Compact reaction bar */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Show reactions that have been used */}
        {usedReactions.map(({ emoji, label }) => {
          const count = getReactionCount(label)
          const isActive = myReactions.includes(label)
          
          return (
            <button
  key={label}
  onClick={() => toggleReaction(label)}
  className={`
    flex flex-col items-center gap-1 p-2 rounded-lg transition-all
    ${isActive 
      ? 'bg-violet-600 text-white' 
      : 'hover:bg-slate-700 text-slate-300'
    }
  `}
>
  <span className="text-2xl">{emoji}</span>
  <span className="text-[10px] leading-tight">{label}</span>
</button>
          )
        })}
        
        {/* Add reaction button */}
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 text-lg transition-all"
        >
          +
        </button>
      </div>

      {/* Reaction picker popup */}
      {showPicker && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowPicker(false)}
          />
          
          {/* Picker */}
          <div className="absolute top-full left-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl z-50 max-w-xs">
            <div className="grid grid-cols-5 gap-2">
              {REACTIONS.map(({ emoji, label }) => {
                const isActive = myReactions.includes(label)
                
                return (
                  <button
                    key={label}
                    onClick={() => toggleReaction(label)}
                    className={`
                      flex flex-col items-center gap-1 p-2 rounded-lg transition-all
                      ${isActive 
                        ? 'bg-violet-600' 
                        : 'hover:bg-slate-700'
                      }
                    `}
                    title={label}
                  >
                    <span className="text-2xl">{emoji}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}