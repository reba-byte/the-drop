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
  // type is either 'question' or 'comment'
  const { member } = useGroup()
  const [reactions, setReactions] = useState([])
  const [myReactions, setMyReactions] = useState([])
  const [loading, setLoading] = useState(true)

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
  }

  function getReactionCount(reactionLabel) {
    return reactions.filter(r => r.reaction === reactionLabel).length
  }

  if (loading) return null

  return (
    <div className="flex flex-wrap gap-2">
      {REACTIONS.map(({ emoji, label }) => {
        const count = getReactionCount(label)
        const isActive = myReactions.includes(label)
        
        return (
          <button
            key={label}
            onClick={() => toggleReaction(label)}
            className={`
              flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all
              ${isActive 
                ? 'bg-violet-600 text-white scale-110' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }
              ${count > 0 ? 'opacity-100' : 'opacity-60'}
            `}
          >
            <span>{emoji}</span>
            {count > 0 && <span className="font-medium">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}