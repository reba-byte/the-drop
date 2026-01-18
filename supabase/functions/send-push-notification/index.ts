import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    const payload = await req.json()
    
    // Handle both webhook format and direct call format
    let groupId, title, body, url
    
    if (payload.record) {
      // Webhook format - check if status changed to active
      const oldStatus = payload.old_record?.status
      const newStatus = payload.record?.status
      
      // Only send notification if status changed from scheduled to active
      if (oldStatus !== 'scheduled' || newStatus !== 'active') {
        return new Response(
          JSON.stringify({ message: 'Status not changed to active, skipping notification' }),
          { headers: { 'Content-Type': 'application/json' } }
        )
      }
      
      groupId = payload.record.group_id
      title = '🔥 New Drop!'
      body = payload.record.question
      url = `/question/${payload.record.id}`
    } else {
      // Direct call format
      groupId = payload.groupId
      title = payload.title
      body = payload.body
      url = payload.url
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get all members in this group
    const { data: members } = await supabase
      .from('members')
      .select('id')
      .eq('group_id', groupId)
    
    if (!members || members.length === 0) {
      return new Response(JSON.stringify({ error: 'No members found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    // Get all push subscriptions for these members
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .in('member_id', members.map(m => m.id))
    
    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: 'No subscriptions found' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    // Send to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const subscription = sub.subscription
        
        const payload = JSON.stringify({ title, body, url })
        
        const response = await fetch(subscription.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'TTL': '86400',
          },
          body: payload,
        })
        
        if (!response.ok) {
          throw new Error(`Push failed: ${response.status}`)
        }
        
        return { success: true }
      })
    )
    
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    
    return new Response(
      JSON.stringify({ 
        message: `Sent ${successful} notifications, ${failed} failed`,
        successful,
        failed 
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