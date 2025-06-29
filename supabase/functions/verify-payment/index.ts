
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
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
    const { projectId } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get payment record
    const { data: payment } = await supabaseClient
      .from("project_payments")
      .select("*")
      .eq("project_id", projectId)
      .single();

    if (!payment?.stripe_payment_intent_id) {
      throw new Error("Payment record not found");
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(payment.stripe_payment_intent_id);
    
    if (paymentIntent.status === "succeeded") {
      // Update payment status
      await supabaseClient
        .from("project_payments")
        .update({ 
          payment_status: 'paid', 
          paid_at: new Date().toISOString() 
        })
        .eq("project_id", projectId);

      // Update project status
      await supabaseClient
        .from("projects")
        .update({ payment_status: 'paid' })
        .eq("id", projectId);

      // Create escrow transaction
      const { data: project } = await supabaseClient
        .from("projects")
        .select("client_id")
        .eq("id", projectId)
        .single();

      return new Response(JSON.stringify({ 
        success: true, 
        payment_status: 'paid' 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      payment_status: paymentIntent.status 
    }), {
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
