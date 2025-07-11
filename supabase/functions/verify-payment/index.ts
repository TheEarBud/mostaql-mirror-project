
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
    console.log("Starting payment verification process");
    
    const { projectId } = await req.json();
    console.log("Verifying payment for project:", projectId);
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Get payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from("project_payments")
      .select("*")
      .eq("project_id", projectId)
      .single();

    if (paymentError || !payment) {
      console.error("Payment record not found:", paymentError);
      throw new Error("Payment record not found");
    }

    if (!payment.stripe_payment_intent_id) {
      throw new Error("No Stripe session ID found");
    }

    console.log("Found payment record with session ID:", payment.stripe_payment_intent_id);

    // Since we're storing session ID, we need to retrieve the session and then the payment intent
    const session = await stripe.checkout.sessions.retrieve(payment.stripe_payment_intent_id);
    console.log("Retrieved session:", session.id, "Status:", session.payment_status);

    if (session.payment_status === "paid") {
      console.log("Payment is successful, updating records");
      
      // Update payment status
      await supabaseClient
        .from("project_payments")
        .update({ 
          payment_status: 'paid', 
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("project_id", projectId);

      // Update project status
      await supabaseClient
        .from("projects")
        .update({ 
          payment_status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq("id", projectId);

      console.log("Payment verification completed successfully");

      return new Response(JSON.stringify({ 
        success: true, 
        payment_status: 'paid' 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log("Payment not yet completed, status:", session.payment_status);

    return new Response(JSON.stringify({ 
      success: false, 
      payment_status: session.payment_status || 'pending'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Payment verification failed",
      details: error.toString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
