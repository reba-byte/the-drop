import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function sendSMS(to, message) {
  const { data, error } = await supabase.functions.invoke('send-sms', {
    body: { to, message }
  })
  return { data, error }
}