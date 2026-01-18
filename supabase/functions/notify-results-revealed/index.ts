import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    console.log('Checking for questions to reveal...')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const now = new Date().toISOString()
    
    // Get active weeks where reveals_at has passed
    const { data: weeksToReveal } = await supabase
      .from('weeks')
      .select('id, group_id, question, reveals_at')
      .eq('status', 'active')
      .lte('reveals_at', now)
    
    if (!weeksToReveal || weeksToReveal.length === 0) {
      return new Response(JSON.stringify({ message: 'No questions to reveal' }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    console.log(`Found ${weeksToReveal.length} questions to reveal`)
    
    let notificationsSent = 0
    
    for (const week of weeksToReveal) {
      // Send notification
      const notificationUrl = `${supabaseUrl}/functions/v1/send-push-notification`
      
      await fetch(notificationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({
          groupId: week.group_id,
          title: '👀 Results Revealed!',
          body: 'See what everyone said!',
          url: `/question/${week.id}`
        })
      })
      
      notificationsSent++
      console.log(`Sent reveal notification for week ${week.id}`)
    }
    
    return new Response(
      JSON.stringify({ 
        message: `Revealed ${weeksToReveal.length} questions, sent ${notificationsSent} notifications` 
      }),
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