import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!

webpush.setVapidDetails(
  'mailto:notifications@thedropgame.app',
  vapidPublicKey,
  vapidPrivateKey
)

serve(async (req) => {
  try {
    const payload = await req.json()
    console.log('Received webhook')
    
    let groupId, title, body, url, excludeMemberId
    
    if (payload.record) {
      const oldStatus = payload.old_record?.status
      const newStatus = payload.record?.status
      
      console.log(`Status change: ${oldStatus} -> ${newStatus}`)
      
      if (oldStatus !== 'scheduled' || newStatus !== 'active') {
        console.log('Skipping - not a scheduled->active change')
        return new Response(
          JSON.stringify({ message: 'Status not changed to active' }),
          { headers: { 'Content-Type': 'application/json' } }
        )
      }
      
      groupId = payload.record.group_id
      title = '🔥 New Drop!'
      body = payload.record.question
      url = `/question/${payload.record.id}`
    } else {
      groupId = payload.groupId
      title = payload.title
      body = payload.body
      url = payload.url
      excludeMemberId = payload.excludeMemberId
    }
    
    console.log('Sending notification:', { title, body })
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data: members } = await supabase
      .from('members')
      .select('id')
      .eq('group_id', groupId)
    
    console.log(`Found ${members?.length || 0} members`)
    
    if (!members || members.length === 0) {
      return new Response(JSON.stringify({ error: 'No members' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    // Filter out excluded member if provided
    let memberIds = members.map(m => m.id)
    if (excludeMemberId) {
      memberIds = memberIds.filter(id => id !== excludeMemberId)
      console.log(`Excluding member ${excludeMemberId}, sending to ${memberIds.length} members`)
    }
    
    if (memberIds.length === 0) {
      return new Response(JSON.stringify({ message: 'No members to notify after exclusion' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .in('member_id', memberIds)
    
    console.log(`Found ${subscriptions?.length || 0} subscriptions`)
    
    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: 'No subscriptions' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    const notificationPayload = JSON.stringify({ title, body, url })
    
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(sub.subscription, notificationPayload)
          console.log('✓ Sent successfully')
          return { success: true }
        } catch (error) {
          console.error('✗ Send failed:', error.message)
          throw error
        }
      })
    )
    
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    
    console.log(`Final: ${successful} sent, ${failed} failed`)
    
    return new Response(
      JSON.stringify({ 
        message: `Sent ${successful}, failed ${failed}`,
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