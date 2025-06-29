
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
    const { amount, paymentMethod, paymentDetails } = await req.json();
    
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

    // Check available balance
    const { data: balance } = await supabaseClient
      .from("freelancer_balances")
      .select("available_balance")
      .eq("freelancer_id", user.id)
      .single();

    if (!balance || balance.available_balance < amount) {
      throw new Error("Insufficient balance");
    }

    // Create payout request
    await supabaseClient.from("payout_requests").insert({
      freelancer_id: user.id,
      amount: amount,
      payment_method: paymentMethod,
      payment_details: paymentDetails,
      status: 'pending'
    });

    // Update available balance (move to pending)
    await supabaseClient
      .from("freelancer_balances")
      .update({
        available_balance: balance.available_balance - amount,
        pending_balance: (balance.pending_balance || 0) + amount,
        updated_at: new Date().toISOString()
      })
      .eq("freelancer_id", user.id);

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
