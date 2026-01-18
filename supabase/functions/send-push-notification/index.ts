import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    const payload = await req.json()
    console.log('Received payload:', JSON.stringify(payload, null, 2))
    
    // Handle both webhook format and direct call format
    let groupId, title, body, url
    
    if (payload.record) {
      console.log('Webhook format detected')
      // Webhook format - check if status changed to active
      const oldStatus = payload.old_record?.status
      const newStatus = payload.record?.status
      
      console.log(`Status change: ${oldStatus} -> ${newStatus}`)
      
      // Only send notification if status changed from scheduled to active
      if (oldStatus !== 'scheduled' || newStatus !== 'active') {
        console.log('Status not changed to active, skipping')
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
      console.log('Direct call format detected')
      // Direct call format
      groupId = payload.groupId
      title = payload.title
      body = payload.body
      url = payload.url
    }
    
    console.log('Notification details:', { groupId, title, body, url })
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get all members in this group
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('id')
      .eq('group_id', groupId)
    
    console.log(`Found ${members?.length || 0} members`)
    if (membersError) console.error('Members error:', membersError)
    
    if (!members || members.length === 0) {
      return new Response(JSON.stringify({ error: 'No members found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    // Get all push subscriptions for these members
    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .in('member_id', members.map(m => m.id))
    
    console.log(`Found ${subscriptions?.length || 0} subscriptions`)
    if (subsError) console.error('Subscriptions error:', subsError)
    
    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: 'No subscriptions found' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    // Send to all subscriptions
    console.log('Sending push notifications...')
    const results = await Promise.allSettled(
      subscriptions.map(async (sub, index) => {
        const subscription = sub.subscription
        console.log(`Sending to subscription ${index + 1}/${subscriptions.length}`)
        
        const payload = JSON.stringify({ title, body, url })
        
        const response = await fetch(subscription.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'TTL': '86400',
          },
          body: payload,
        })
        
        console.log(`Response ${index + 1}: ${response.status}`)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Push failed for ${index + 1}:`, errorText)
          throw new Error(`Push failed: ${response.status} - ${errorText}`)
        }
        
        return { success: true }
      })
    )
    
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    
    console.log(`Results: ${successful} successful, ${failed} failed`)
    
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