
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { proposalId, projectId, freelancerId } = await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get project and client details
    const { data: project } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:client_id (
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', projectId)
      .single()

    // Get freelancer details
    const { data: freelancer } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', freelancerId)
      .single()

    if (project && freelancer) {
      console.log(`New proposal received for project "${project.title}" from ${freelancer.first_name} ${freelancer.last_name}`)
      
      // Here you would normally send an email notification
      // For now, we'll just log it
      console.log(`Notification would be sent to: ${project.profiles.email}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
