import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, description, cart, customerEmail, customerName } = await req.json()

    // Configuration GeniusPay
    // Clé secrète configurée via variables d'environnement Supabase
    // Exemple d'ajout: npx supabase secrets set GENIUSPAY_SECRET_KEY=sk_sandbox_yCQhLBBt3pSjgf9jqHr2HAxWMLWn7bIw
    const GENIUSPAY_SECRET_KEY = Deno.env.get('GENIUSPAY_SECRET_KEY')

    if (!GENIUSPAY_SECRET_KEY) {
      throw new Error("Clé secrète GeniusPay manquante dans l'environnement.")
    }

    // Préparation de la requête vers GeniusPay
    const paymentPayload = {
      amount: amount,
      currency: "XOF",
      description: description,
      customer: {
        email: customerEmail,
        name: customerName,
      },
      return_url: `${req.headers.get('origin') || 'http://localhost:5173'}/payment-success`,
      cancel_url: `${req.headers.get('origin') || 'http://localhost:5173'}/payment-cancel`
    }

    console.log("Calling GeniusPay API with:", paymentPayload)

    // Appel à l'API GeniusPay
    const response = await fetch('https://pay.genius.ci/api/v1/merchant/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GENIUSPAY_SECRET_KEY}`,
        'X-API-Secret': GENIUSPAY_SECRET_KEY, // Parfois requis en plus selon la doc
      },
      body: JSON.stringify(paymentPayload)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("GeniusPay API Error:", data)
      throw new Error(data.message || "Erreur lors de la création du paiement GeniusPay")
    }

    // L'API devrait retourner un checkout_url
    // Si la structure est { data: { checkout_url: "..." } } ou { checkout_url: "..." }
    const checkoutUrl = data.checkout_url || (data.data && data.data.checkout_url)

    if (!checkoutUrl) {
      throw new Error("Aucune URL de redirection retournée par GeniusPay")
    }

    return new Response(
      JSON.stringify({ checkout_url: checkoutUrl }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error("Function Error:", error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
