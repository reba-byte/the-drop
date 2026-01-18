import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useGroup } from '../../context/GroupContext'

export default function Prediction({ week, onAnswer, answers, myAnswer }) {
  const { group } = useGroup()
  const [members, setMembers] = useState([])
  const [selectedMember, setSelectedMember] = useState(null)
  const [revealed, setRevealed] = useState(week.shouldReveal)

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
      setSelectedMember(myAnswer.answer)
    }
    setRevealed(week.shouldReveal)
  }, [myAnswer, week.shouldReveal])

  const handleSelect = async (memberId) => {
    if (selectedMember) return
    setSelectedMember(memberId)
    await onAnswer(memberId)
    // Don't set revealed here - let parent control it
  }

  // Count votes for each member
  const voteCounts = {}
  answers.forEach(answer => {
    voteCounts[answer.answer] = (voteCounts[answer.answer] || 0) + 1
  })

  // Find the winner (most votes)
  const winner = Object.keys(voteCounts).length > 0
    ? Object.keys(voteCounts).reduce((a, b) => voteCounts[a] > voteCounts[b] ? a : b)
    : null

  return (
    <div>
      <div className="text-center mb-6">
        <span className="text-4xl">🔮</span>
        <h2 className="text-2xl font-bold text-white mt-4 mb-2">Prediction</h2>
        <p className="text-xl text-slate-200">{week.question}</p>
      </div>

      {!revealed ? (
        <div className="space-y-3">
          <p className="text-center text-slate-400 text-sm mb-4">Make your prediction:</p>
          {members.map(member => (
            <button
              key={member.id}
              onClick={() => handleSelect(member.id)}
              disabled={!!selectedMember}
              className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all ${
                selectedMember === member.id
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                  : selectedMember
                  ? 'bg-slate-800 opacity-50 cursor-not-allowed text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
            >
              <span className="text-2xl">{member.emoji}</span>
              <span className="font-medium">{member.name}</span>
            </button>
          ))}
          
          {/* Show waiting message after prediction made */}
          {selectedMember && (
            <div className="mt-6 text-center text-slate-400 text-sm">
              ✓ Prediction made! Waiting for others to answer...
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-3">Predictions:</p>
            <div className="space-y-2">
              {members.map(member => {
                const votes = voteCounts[member.id] || 0
                const isWinner = member.id === winner
                const percentage = answers.length > 0 ? Math.round((votes / answers.length) * 100) : 0
                
                return votes > 0 ? (
                  <div key={member.id} className="flex items-center gap-3">
                    <span className="text-xl">{member.emoji}</span>
                    <span className="text-white flex-1">{member.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-700 rounded-full h-2 w-24 overflow-hidden">
                        <div 
                          className={`h-full ${isWinner ? 'bg-indigo-500' : 'bg-slate-600'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-slate-400 text-sm w-8">{votes}</span>
                      {isWinner && <span className="text-indigo-400 text-lg">👑</span>}
                    </div>
                  </div>
                ) : null
              })}
            </div>
          </div>

          {/* Show who predicted who */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-3">Who predicted what:</p>
            <div className="space-y-2">
              {answers.map((answer) => {
                const predicted = members.find(m => m.id === answer.answer)
                return (
                  <div key={answer.id} className="flex items-center gap-2 text-sm">
                    <span>{answer.member?.emoji}</span>
                    <span className="text-slate-300">{answer.member?.name}</span>
                    <span className="text-slate-500">→</span>
                    <span>{predicted?.emoji}</span>
                    <span className="text-white">{predicted?.name}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Commentary */}
          <div className="mt-6 text-center text-slate-400 text-sm italic">
            The people have spoken. We'll revisit this prediction next week to see if it came true.
          </div>
        </div>
      )}
    </div>
  )
}