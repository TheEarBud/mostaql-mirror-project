
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, freelancerId, amount } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    
    if (!user) throw new Error("User not authenticated");

    // Verify user is the project client
    const { data: project } = await supabaseClient
      .from("projects")
      .select("client_id")
      .eq("id", projectId)
      .single();

    if (project?.client_id !== user.id) {
      throw new Error("Unauthorized");
    }

    // Create escrow transaction
    await supabaseClient.from("escrow_transactions").insert({
      project_id: projectId,
      client_id: user.id,
      freelancer_id: freelancerId,
      amount: amount,
      status: 'released'
    });

    // Update freelancer balance
    const { data: balance } = await supabaseClient
      .from("freelancer_balances")
      .select("*")
      .eq("freelancer_id", freelancerId)
      .single();

    if (balance) {
      await supabaseClient
        .from("freelancer_balances")
        .update({
          available_balance: balance.available_balance + amount,
          total_earned: balance.total_earned + amount,
          updated_at: new Date().toISOString()
        })
        .eq("freelancer_id", freelancerId);
    } else {
      await supabaseClient
        .from("freelancer_balances")
        .insert({
          freelancer_id: freelancerId,
          available_balance: amount,
          total_earned: amount
        });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
