import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const { phone_numbers, message } = await req.json()
    
    // Convert phone numbers to Verizon email addresses
    const verizonEmails = phone_numbers.map((num: string) => {
      // Remove any formatting (dashes, spaces, parentheses)
      const cleaned = num.replace(/\D/g, '')
      return `${cleaned}@vtext.com`
    })
    
    // Send via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
from: 'The Drop <notifications@thedropgame.app>',        to: verizonEmails,
        subject: '', // Leave blank - SMS doesn't show subjects
        text: message,
      }),
    })

    const data = await response.json()
    
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})