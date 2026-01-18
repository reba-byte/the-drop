import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    console.log('Running reminder check...')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get all active weeks (questions that have dropped)
    const { data: activeWeeks } = await supabase
      .from('weeks')
      .select('id, group_id, question')
      .eq('status', 'active')
    
    if (!activeWeeks || activeWeeks.length === 0) {
      return new Response(JSON.stringify({ message: 'No active questions' }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    let remindersSent = 0
    
    for (const week of activeWeeks) {
      // Get all members in this group
      const { data: members } = await supabase
        .from('members')
        .select('id')
        .eq('group_id', week.group_id)
      
      if (!members) continue
      
      // Get members who haven't answered yet
      const { data: answers } = await supabase
        .from('answers')
        .select('member_id')
        .eq('week_id', week.id)
      
      const answeredMemberIds = answers?.map(a => a.member_id) || []
      const unansweredMembers = members.filter(m => !answeredMemberIds.includes(m.id))
      
      if (unansweredMembers.length === 0) continue
      
      // Get push subscriptions for unanswered members
      const { data: subscriptions } = await supabase
        .from('push_subscriptions')
        .select('subscription')
        .in('member_id', unansweredMembers.map(m => m.id))
      
      if (!subscriptions || subscriptions.length === 0) continue
      
      // Send reminder notification
      const notificationUrl = `${supabaseUrl}/functions/v1/send-push-notification`
      
      await fetch(notificationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({
          groupId: week.group_id,
          title: '⏰ Reminder',
          body: `Don't forget to answer: ${week.question.substring(0, 60)}...`,
          url: `/question/${week.id}`
        })
      })
      
      remindersSent += subscriptions.length
      console.log(`Sent ${subscriptions.length} reminders for week ${week.id}`)
    }
    
    return new Response(
      JSON.stringify({ message: `Sent ${remindersSent} reminders` }),
      { headers: { 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})