import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGroup } from '../context/GroupContext'
import { supabase } from '../lib/supabase'

const questionTypes = [
  { id: 'debate', label: '⚔️ Debate', category: '⚔️ DEBATE', hasOptions: true },
  { id: 'hot-take', label: '🔥 Hot Take', category: '🔥 HOT TAKE', hasOptions: false },
  { id: 'this-or-that', label: '🤯 This or That', category: '🤯 THIS OR THAT', hasOptions: true },
  { id: 'trivia', label: '🧠 Trivia', category: '🧠 TRIVIA', hasAnswer: true },
  { id: 'confession', label: '🫣 Confession', category: '🫣 CONFESSION', hasOptions: false },
  { id: 'family-poll', label: '👀 Group Poll', category: '👀 GROUP POLL', hasOptions: false },
]

export default function Curator() {
  const navigate = useNavigate()
  const { member, group } = useGroup()
  
  const [weeks, setWeeks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  
  // Form state
  const [type, setType] = useState('debate')
  const [question, setQuestion] = useState('')
  const [optionA, setOptionA] = useState('')
  const [optionB, setOptionB] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [saving, setSaving] = useState(false)
  const [dropsAt, setDropsAt] = useState('')
  const [revealsAt, setRevealsAt] = useState('')
  
  // Group settings state
  const [groupName, setGroupName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [savingGroup, setSavingGroup] = useState(false)
  const [groupMessage, setGroupMessage] = useState('')
const [dropDay, setDropDay] = useState('sunday')
const [dropTime, setDropTime] = useState('09:00')
const [revealDay, setRevealDay] = useState('wednesday')
const [revealTime, setRevealTime] = useState('18:00')


function getNextDate(dayName, timeStr) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const targetDay = days.indexOf(dayName.toLowerCase())
  
  const now = new Date()
  const currentDay = now.getDay()
  
  let daysUntil = targetDay - currentDay
  if (daysUntil <= 0) daysUntil += 7 // Next week if today or past
  
  const nextDate = new Date(now)
  nextDate.setDate(now.getDate() + daysUntil)
  
  const [hours, minutes] = timeStr.split(':')
  nextDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
  
  return nextDate
}

  useEffect(() => {
    if (group) loadWeeks()
  }, [group])

useEffect(() => {
  if (group) {
    setGroupName(group.name || '')
    setInviteCode(group.invite_code || '')
    setDropDay(group.drop_day || 'sunday')
    setDropTime(group.drop_time || '09:00')
    setRevealDay(group.reveal_day || 'wednesday')
    setRevealTime(group.reveal_time || '18:00')
  }
}, [group])

  async function loadWeeks() {
    const { data, error } = await supabase
      .from('weeks')
      .select('*')
      .eq('group_id', group.id)
      .order('week_number', { ascending: false })

    if (error) {
      console.log('Error loading weeks:', error.message)
    } else {
      setWeeks(data || [])
    }
    setLoading(false)
  }

async function handleSaveGroup() {
  if (!groupName.trim() || !inviteCode.trim()) {
    setGroupMessage('Name and invite code are required')
    return
  }

  setSavingGroup(true)
  setGroupMessage('')

  const { error } = await supabase
    .from('groups')
    .update({
      name: groupName.trim(),
      invite_code: inviteCode.trim().toUpperCase(),
      drop_day: dropDay,
      drop_time: dropTime,
      reveal_day: revealDay,
      reveal_time: revealTime
    })
    .eq('id', group.id)

  if (error) {
    setGroupMessage('Error: ' + error.message)
  } else {
    setGroupMessage('Saved!')
    setTimeout(() => setGroupMessage(''), 2000)
  }

  setSavingGroup(false)
}

  async function handleSubmit(e) {
    e.preventDefault()
    if (!question.trim()) return

    setSaving(true)

    const selectedType = questionTypes.find(t => t.id === type)
    const nextWeekNumber = weeks.length > 0 ? Math.max(...weeks.map(w => w.week_number)) + 1 : 1

 // Calculate dates from group schedule if not manually set
const calculatedDropsAt = dropsAt 
  ? new Date(dropsAt) 
  : getNextDate(dropDay, dropTime)

const calculatedRevealsAt = revealsAt 
  ? new Date(revealsAt) 
  : getNextDate(revealDay, revealTime)

// Make sure reveal is after drop
if (calculatedRevealsAt <= calculatedDropsAt) {
  calculatedRevealsAt.setDate(calculatedRevealsAt.getDate() + 7)
}

const newWeek = {
  group_id: group.id,
  week_number: nextWeekNumber,
  type: type,
  category: selectedType.category,
  question: question.trim(),
  option_a: selectedType.hasOptions ? optionA.trim() : null,
  option_b: selectedType.hasOptions ? optionB.trim() : null,
  correct_answer: selectedType.hasAnswer ? correctAnswer.trim() : null,
  status: 'scheduled',
  drops_at: calculatedDropsAt.toISOString(),
  reveals_at: calculatedRevealsAt.toISOString()
}

    const { data, error } = await supabase
      .from('weeks')
      .insert(newWeek)
      .select()
      .single()

    if (error) {
      console.log('Error creating question:', error.message)
    } else {
      setWeeks([data, ...weeks])
      setShowForm(false)
      resetForm()
    }

    setSaving(false)
  }

  function resetForm() {
    setType('debate')
    setQuestion('')
    setOptionA('')
    setOptionB('')
    setCorrectAnswer('')
    setDropsAt('')
    setRevealsAt('')
  }

  async function deleteWeek(weekId) {
    if (!confirm('Delete this question?')) return

    const { error } = await supabase
      .from('weeks')
      .delete()
      .eq('id', weekId)

    if (error) {
      console.log('Error deleting:', error.message)
    } else {
      setWeeks(weeks.filter(w => w.id !== weekId))
    }
  }

  // Only curators can access
  if (member && !member.is_curator) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Only curators can access this page.</p>
          <button onClick={() => navigate('/')} className="text-violet-400">
            ← Back to home
          </button>
        </div>
      </div>
    )
  }

  const selectedType = questionTypes.find(t => t.id === type)

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
          <span className="text-violet-400 text-sm font-medium">Curator Mode</span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-6">Manage Questions</h1>

        {/* Group Settings */}
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700">
          <h2 className="text-white font-semibold mb-4">Group Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Group Name</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="My Family"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
            
            <div>
              <label className="block text-slate-400 text-sm mb-2">Invite Code</label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="FAMILY123"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white uppercase placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
              <p className="text-slate-500 text-xs mt-1">Share this code with people you want to join</p>
            </div>

{/* Schedule */}
<div className="pt-4 border-t border-slate-700">
  <label className="block text-slate-400 text-sm mb-3">Weekly Schedule</label>
  
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <span className="text-slate-300 text-sm w-20">Drops:</span>
      <select
        value={dropDay}
        onChange={(e) => setDropDay(e.target.value)}
        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm"
      >
        <option value="sunday">Sunday</option>
        <option value="monday">Monday</option>
        <option value="tuesday">Tuesday</option>
        <option value="wednesday">Wednesday</option>
        <option value="thursday">Thursday</option>
        <option value="friday">Friday</option>
        <option value="saturday">Saturday</option>
      </select>
      <input
        type="time"
        value={dropTime}
        onChange={(e) => setDropTime(e.target.value)}
        className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm"
        style={{ colorScheme: 'dark' }}
      />
    </div>

    <div className="flex items-center gap-2">
      <span className="text-slate-300 text-sm w-20">Reveals:</span>
      <select
        value={revealDay}
        onChange={(e) => setRevealDay(e.target.value)}
        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm"
      >
        <option value="sunday">Sunday</option>
        <option value="monday">Monday</option>
        <option value="tuesday">Tuesday</option>
        <option value="wednesday">Wednesday</option>
        <option value="thursday">Thursday</option>
        <option value="friday">Friday</option>
        <option value="saturday">Saturday</option>
      </select>
      <input
        type="time"
        value={revealTime}
        onChange={(e) => setRevealTime(e.target.value)}
        className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm"
        style={{ colorScheme: 'dark' }}
      />
    </div>
    
    <p className="text-slate-500 text-xs">Or reveals when everyone answers, whichever comes first</p>
  </div>
</div>

            {groupMessage && (
              <div className={`p-2 rounded-lg text-sm text-center ${
                groupMessage === 'Saved!' ? 'bg-emerald-900/50 text-emerald-300' : 'bg-red-900/50 text-red-300'
              }`}>
                {groupMessage}
              </div>
            )}

            <button
              onClick={handleSaveGroup}
              disabled={savingGroup}
              className="w-full bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white py-3 rounded-lg font-medium transition-all"
            >
              {savingGroup ? 'Saving...' : 'Save Group Settings'}
            </button>
          </div>
        </div>

        {/* Add new button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-4 px-6 rounded-xl mb-6 transition-all"
          >
            + Add New Question
          </button>
        )}

        {/* Add form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700">
            <h2 className="text-white font-semibold mb-4">New Question</h2>
            
            {/* Type selector */}
            <div className="mb-4">
              <label className="block text-slate-400 text-sm mb-2">Type</label>
              <div className="grid grid-cols-2 gap-2">
                {questionTypes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`p-2 rounded-lg text-sm text-left transition-all ${
                      type === t.id
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question */}
            <div className="mb-4">
              <label className="block text-slate-400 text-sm mb-2">Question</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={type === 'hot-take' ? 'Enter a statement...' : 'Enter your question...'}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 h-20 resize-none"
              />
            </div>

            {/* Options (for debate and this-or-that) */}
            {selectedType?.hasOptions && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Option A</label>
                  <input
                    type="text"
                    value={optionA}
                    onChange={(e) => setOptionA(e.target.value)}
                    placeholder="First option"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Option B</label>
                  <input
                    type="text"
                    value={optionB}
                    onChange={(e) => setOptionB(e.target.value)}
                    placeholder="Second option"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            )}

            {/* Correct answer (for trivia) */}
            {selectedType?.hasAnswer && (
              <div className="mb-4">
                <label className="block text-slate-400 text-sm mb-2">Correct Answer</label>
                <input
                  type="text"
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  placeholder="The right answer"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>
            )}

           {/* Scheduling */}
<div className="mb-4 p-3 bg-slate-800/50 rounded-lg">
  <label className="block text-slate-400 text-sm mb-2">Schedule</label>
  <p className="text-slate-300 text-sm mb-3">
    Drops: {dropDay.charAt(0).toUpperCase() + dropDay.slice(1)} at {dropTime}<br/>
    Reveals: {revealDay.charAt(0).toUpperCase() + revealDay.slice(1)} at {revealTime}
  </p>
  
  <button
    type="button"
    onClick={() => document.getElementById('custom-schedule').classList.toggle('hidden')}
    className="text-violet-400 text-sm hover:text-violet-300"
  >
    Override for this question →
  </button>
  
  <div id="custom-schedule" className="hidden mt-3 grid grid-cols-2 gap-3">
    <div>
      <label className="block text-slate-500 text-xs mb-1">Custom drop</label>
      <input
        type="datetime-local"
        value={dropsAt}
        onChange={(e) => setDropsAt(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-violet-500"
        style={{ colorScheme: 'dark' }}
      />
    </div>
    <div>
      <label className="block text-slate-500 text-xs mb-1">Custom reveal</label>
      <input
        type="datetime-local"
        value={revealsAt}
        onChange={(e) => setRevealsAt(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-violet-500"
        style={{ colorScheme: 'dark' }}
      />
    </div>
  </div>
</div>

            {/* Form buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                className="flex-1 bg-slate-700 text-slate-300 py-3 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !question.trim()}
                className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 text-white py-3 rounded-lg font-medium"
              >
                {saving ? 'Adding...' : 'Add Question'}
              </button>
            </div>
          </form>
        )}

        {/* Questions list */}
        <div className="space-y-2">
          {loading ? (
            <p className="text-slate-500 text-center py-4">Loading...</p>
          ) : weeks.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No questions yet</p>
          ) : (
            weeks.map((week) => (
              <div 
                key={week.id}
                className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className="text-slate-500 text-xs">{week.category}</span>
                    <p className="text-slate-200 text-sm">{week.question}</p>
                    {week.option_a && (
                      <p className="text-slate-500 text-xs mt-1">
                        {week.option_a} vs {week.option_b}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteWeek(week.id)}
                    className="text-slate-600 hover:text-red-400 text-sm p-1"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}