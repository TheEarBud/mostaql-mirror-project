
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
    console.log("Starting payment creation process");
    
    const { projectId, amount } = await req.json();
    console.log("Received data:", { projectId, amount });
    
    if (!projectId || !amount) {
      throw new Error("Missing projectId or amount");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user?.email) {
      console.error("User authentication error:", userError);
      throw new Error("User not authenticated");
    }

    const user = userData.user;
    console.log("User authenticated:", user.email);

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Found existing customer:", customerId);
    } else {
      console.log("No existing customer found");
    }

    // Create payment session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Project Payment - Escrow` },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/project/${projectId}?payment=success`,
      cancel_url: `${req.headers.get("origin")}/project/${projectId}?payment=cancelled`,
      metadata: {
        projectId: projectId,
        userId: user.id,
      },
    });

    console.log("Stripe session created:", session.id);

    // Create or update project payment record
    const { error: upsertError } = await supabaseClient.from("project_payments").upsert({
      project_id: projectId,
      client_id: user.id,
      amount: amount,
      payment_status: 'unpaid',
      stripe_payment_intent_id: session.id, // Store session ID instead of payment intent ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (upsertError) {
      console.error("Database upsert error:", upsertError);
      throw new Error(`Database error: ${upsertError.message}`);
    }

    console.log("Payment record created/updated successfully");

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Payment creation failed",
      details: error.toString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
