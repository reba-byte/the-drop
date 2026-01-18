import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Function called!')
  
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
    const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')

    console.log('Account SID exists:', !!TWILIO_ACCOUNT_SID)
    console.log('Auth Token exists:', !!TWILIO_AUTH_TOKEN)
    console.log('Phone Number:', TWILIO_PHONE_NUMBER)

    const { to, message } = await req.json()
    console.log('Sending to:', to)
    console.log('Message:', message)

    if (!to || !message) {
      console.log('Missing to or message')
      return new Response(
        JSON.stringify({ error: 'Missing "to" or "message"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const authHeader = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)

    console.log('Calling Twilio API...')
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: to,
          From: TWILIO_PHONE_NUMBER!,
          Body: message,
        }),
      }
    )

    const data = await response.json()
    console.log('Twilio response:', JSON.stringify(data))

    if (!response.ok) {
      console.log('Twilio error:', data.message)
      return new Response(
        JSON.stringify({ error: data.message }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('SMS sent successfully!')
    return new Response(
      JSON.stringify({ success: true, sid: data.sid }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.log('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})