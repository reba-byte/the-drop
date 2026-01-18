import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGroup } from '../context/GroupContext'
import { supabase } from '../lib/supabase'
import Debate from '../components/questions/Debate'
import FamilyPoll from '../components/questions/FamilyPoll'
import HotTake from '../components/questions/HotTake'
import Confession from '../components/questions/Confession'
import ThisOrThat from '../components/questions/ThisOrThat'
import Trivia from '../components/questions/Trivia'
import Comments from '../components/Comments'
import RankThese from '../components/questions/RankThese'
import Prediction from '../components/questions/Prediction'

const colorMap = {
  debate: 'from-rose-950',
  'family-poll': 'from-amber-950',
  'hot-take': 'from-red-950',
  confession: 'from-emerald-950',
  'this-or-that': 'from-purple-950',
  trivia: 'from-cyan-950',
  'rank-these': 'from-orange-950',     // ADD THIS
  'prediction': 'from-indigo-950',      // ADD THIS
}

export default function Question() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { member } = useGroup()
  
  const [week, setWeek] = useState(null)
  const [answers, setAnswers] = useState([])
  const [myAnswer, setMyAnswer] = useState(null)
  const [loading, setLoading] = useState(true)

useEffect(() => {
  async function loadQuestion() {
    // Get the week
    const { data: weekData, error: weekError } = await supabase
      .from('weeks')
      .select('*')
      .eq('id', id)
      .single()

    if (weekError) {
      console.log('Error loading week:', weekError.message)
      setLoading(false)
      return
    }

    setWeek(weekData)

    // Get all answers for this week
    const { data: answersData } = await supabase
      .from('answers')
      .select('*, member:members(name, emoji)')
      .eq('week_id', id)

    setAnswers(answersData || [])

    // Check if I already answered
    const mine = answersData?.find(a => a.member_id === member?.id)
    setMyAnswer(mine || null)

    // Get total member count for this group
    const { data: membersData } = await supabase
      .from('members')
      .select('id')
      .eq('group_id', weekData.group_id)

    const totalMembers = membersData?.length || 0
    const allAnswered = answersData?.length >= totalMembers

    // Check if results should be revealed
    const now = new Date()
    const revealsAt = weekData.reveals_at ? new Date(weekData.reveals_at) : null
    const shouldReveal = allAnswered || (revealsAt && now >= revealsAt)

    // Store this for the question components
    weekData.shouldReveal = shouldReveal
    weekData.allAnswered = allAnswered
    setWeek({...weekData})

    setLoading(false)
  }

  loadQuestion()
}, [id, member])

  const handleAnswer = async (answer) => {
    // Save to database
    const { data, error } = await supabase
      .from('answers')
      .insert({
        week_id: id,
        member_id: member.id,
        answer: answer,
      })
      .select('*, member:members(name, emoji)')
      .single()

    if (error) {
      console.log('Error saving answer:', error.message)
      return
    }

    // Update local state
    setMyAnswer(data)
    setAnswers([...answers, data])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }

  if (!week) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Question not found</p>
      </div>
    )
  }

  const bgColor = colorMap[week.type] || 'from-slate-950'

  const renderQuestion = () => {
  const props = { 
    week, 
    onAnswer: handleAnswer, 
    answers, 
    myAnswer,
    member 
  }
  
  switch (week.type) {
    case 'debate':
      return <Debate {...props} />
    case 'family-poll':
      return <FamilyPoll {...props} />
    case 'hot-take':
      return <HotTake {...props} />
    case 'confession':
      return <Confession {...props} />
    case 'this-or-that':
      return <ThisOrThat {...props} />
    case 'trivia':
      return <Trivia {...props} />
    case 'rank-these':
      return <RankThese {...props} />
    case 'prediction':
      return <Prediction {...props} />
    default:
      return <Debate {...props} />
  }
}

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgColor} via-slate-900 to-slate-950 p-4`}>
      <div className="max-w-md mx-auto pt-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/')}
            className="text-slate-400 active:text-white"
          >
            ← Back
          </button>
          <span className="text-slate-500 text-sm">Week {week.week_number}</span>
        </div>

        {/* Category badge */}
        <div className="text-center mb-6">
          <span className="bg-slate-800/50 px-4 py-1.5 rounded-full text-sm font-medium text-slate-300">
            {week.category}
          </span>
        </div>

        {/* Question component */}
        {renderQuestion()}
        {/* Comments - show after user has answered */}
        {myAnswer && <Comments weekId={id} />}
        
      </div>
    </div>
  )
}