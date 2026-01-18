import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!

serve(async (req) => {
  try {
    const { subscriptions, title, body, url } = await req.json()
    
    const results = await Promise.all(
      subscriptions.map(async (subscription: any) => {
        try {
          await sendPushNotification(subscription, { title, body, url })
          return { success: true }
        } catch (error) {
          console.error('Failed to send to subscription:', error)
          return { success: false, error: error.message }
        }
      })
    )
    
    return new Response(JSON.stringify({ results }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

async function sendPushNotification(subscription: any, payload: any) {
  const vapidHeaders = generateVAPIDHeaders(subscription.endpoint)
  
  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'TTL': '86400',
      ...vapidHeaders,
    },
    body: JSON.stringify(payload),
  })
  
  if (!response.ok) {
    throw new Error(`Push failed: ${response.status}`)
  }
}

function generateVAPIDHeaders(endpoint: string) {
  const url = new URL(endpoint)
  const audience = `${url.protocol}//${url.host}`
  
  const vapidHeaders = {
    'Authorization': `vapid t=${createJWT(audience)}, k=${VAPID_PUBLIC_KEY}`,
  }
  
  return vapidHeaders
}

function createJWT(audience: string): string {
  const header = { typ: 'JWT', alg: 'ES256' }
  const jwtData = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    sub: 'mailto:notifications@thedropgame.app',
  }
  
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedData = base64UrlEncode(JSON.stringify(jwtData))
  const unsignedToken = `${encodedHeader}.${encodedData}`
  
  // For now, return unsigned (we'll need to add proper signing later)
  return unsignedToken
}

function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}