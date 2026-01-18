import { supabase } from './supabase'

// Save an answer
export async function saveAnswer(weekId, memberId, answer) {
  const { data, error } = await supabase
    .from('answers')
    .insert({
      week_id: weekId,
      member_id: memberId,
      answer: answer,
    })
    .select()
    .single()
  
  return { data, error }
}

// Get all answers for a week
export async function getAnswersForWeek(weekId) {
  const { data, error } = await supabase
    .from('answers')
    .select(`
      *,
      member:members(name, emoji)
    `)
    .eq('week_id', weekId)
  
  return { data, error }
}

// Check if user already answered this week
export async function getUserAnswer(weekId, memberId) {
  const { data, error } = await supabase
    .from('answers')
    .select('*')
    .eq('week_id', weekId)
    .eq('member_id', memberId)
    .single()
  
  return { data, error }
}