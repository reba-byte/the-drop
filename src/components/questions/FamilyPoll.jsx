import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useGroup } from '../../context/GroupContext'

export default function FamilyPoll({ week, onAnswer, answers, myAnswer }) {
  const { group } = useGroup()
  const [members, setMembers] = useState([])
  const [selected, setSelected] = useState(myAnswer?.answer || null)
  const [revealed, setRevealed] = useState(!!myAnswer)

  useEffect(() => {
    async function loadMembers() {
      const { data } = await supabase
        .from('members')
        .select('*')
        .eq('group_id', group.id)

      setMembers(data || [])
    }

    if (group) loadMembers()
  }, [group])

  useEffect(() => {
    if (myAnswer) {
      setSelected(myAnswer.answer)
      setRevealed(true)
    }
  }, [myAnswer])

  const handleSelect = async (memberId) => {
    if (selected) return
    setSelected(memberId)
    await onAnswer(memberId)
    setRevealed(true)
  }

  // Count votes for each member
  const voteCounts = {}
  answers.forEach(a => {
    voteCounts[a.answer] = (voteCounts[a.answer] || 0) + 1
  })
  const maxVotes = Math.max(...Object.values(voteCounts), 0)

  return (
    <div>
      <h2 className="text-2xl font-bold text-white text-center mb-8">
        {week.question}
      </h2>

      <div className="space-y-3">
        {members.map((m) => (
          <button
            key={m.id}
            onClick={() => handleSelect(m.id)}
            className={`w-full p-4 rounded-xl flex items-center justify-between transition-all ${
              selected === m.id
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 active:bg-slate-700 text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{m.emoji}</span>
              <span className="font-medium">{m.name}</span>
            </div>
            {revealed && (
              <div className="flex items-center gap-2">
                <div className="h-2 bg-amber-400/30 rounded-full w-24">
                  <div
                    className="h-2 bg-amber-400 rounded-full transition-all"
                    style={{ width: maxVotes > 0 ? `${((voteCounts[m.id] || 0) / maxVotes) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-amber-300 text-sm w-4">{voteCounts[m.id] || 0}</span>
                {voteCounts[m.id] === maxVotes && maxVotes > 0 && <span>👑</span>}
              </div>
            )}
          </button>
        ))}
      </div>

      {revealed && (
        <div className="mt-6 text-center text-slate-400 text-sm">
          {answers.length === 1 
            ? "You're the first to vote!" 
            : `${answers.length} votes cast`}
        </div>
      )}
    </div>
  )
}