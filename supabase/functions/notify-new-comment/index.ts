import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    const payload = await req.json()
    console.log('New comment, sending notifications...')
    
    if (!payload.record) {
      return new Response(JSON.stringify({ error: 'No record' }), { status: 400 })
    }
    
    const comment = payload.record
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get the week and commenter info
    const { data: week } = await supabase
      .from('weeks')
      .select('id, group_id, question')
      .eq('id', comment.week_id)
      .single()
    
    if (!week) {
      return new Response(JSON.stringify({ error: 'Week not found' }), { status: 404 })
    }
    
    // Get the commenter's name
    const { data: commenter } = await supabase
      .from('members')
      .select('name, emoji')
      .eq('id', comment.member_id)
      .single()
    
    // Send notification to everyone EXCEPT the commenter
    const notificationUrl = `${supabaseUrl}/functions/v1/send-push-notification`
    
    const response = await fetch(notificationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({
        groupId: week.group_id,
        title: `${commenter?.emoji} ${commenter?.name} commented`,
        body: comment.text.substring(0, 100),
        url: `/question/${week.id}`,
        excludeMemberId: comment.member_id
      })
    })
    
    const result = await response.json()
    console.log('Notification result:', result)
    
    return new Response(
      JSON.stringify({ message: 'Notifications sent', result }),
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