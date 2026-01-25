import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    const payload = await req.json()
    console.log('Answer inserted, checking if all answered...')
    
    if (!payload.record) {
      return new Response(JSON.stringify({ error: 'No record' }), { status: 400 })
    }
    
    const weekId = payload.record.week_id
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get the week
    const { data: week } = await supabase
      .from('weeks')
      .select('id, group_id, question')
      .eq('id', weekId)
      .single()
    
    if (!week) {
      return new Response(JSON.stringify({ error: 'Week not found' }), { status: 404 })
    }
    
    // Count total members
    const { data: members } = await supabase
      .from('members')
      .select('id')
      .eq('group_id', week.group_id)
    
    const totalMembers = members?.length || 0
    
    // Count answers for this week
    const { data: answers } = await supabase
      .from('answers')
      .select('id')
      .eq('week_id', weekId)
    
    const totalAnswers = answers?.length || 0
    
    console.log(`Week ${weekId}: ${totalAnswers}/${totalMembers} answered`)
    
    // If everyone has answered, send notification
    if (totalAnswers >= totalMembers && totalMembers > 0) {
      console.log('All answered! Sending notifications...')
      
      const notificationUrl = `${supabaseUrl}/functions/v1/send-push-notification`
      
      const response = await fetch(notificationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({
          groupId: week.group_id,
          title: '🎉 All answers are in!',
          body: 'Everyone has answered. Check out the results!',
          url: `/question/${week.id}`
        })
      })
      
      const result = await response.json()
      console.log('Notification result:', result)
      
      return new Response(
        JSON.stringify({ message: 'Notifications sent', result }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    return new Response(
      JSON.stringify({ message: 'Not all answered yet', answered: totalAnswers, total: totalMembers }),
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