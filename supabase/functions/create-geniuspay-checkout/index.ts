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
    const { amount, description, cart, customerEmail, customerName, paymentMethod, customerPhone } = await req.json()

    // Configuration GeniusPay
    // Clé publique configurée via variables d'environnement Supabase (X-API-Key)
    const GENIUSPAY_PUBLIC_KEY = Deno.env.get('GENIUSPAY_PUBLIC_KEY')
    // Clé secrète configurée via variables d'environnement Supabase (X-API-Secret)
    const GENIUSPAY_SECRET_KEY = Deno.env.get('GENIUSPAY_SECRET_KEY')

    if (!GENIUSPAY_PUBLIC_KEY || !GENIUSPAY_SECRET_KEY) {
      throw new Error("Clé publique ou secrète GeniusPay manquante dans l'environnement.")
    }

    // Préparation de la requête vers GeniusPay
    const paymentPayload: any = {
      amount: amount,
      currency: "XOF",
      description: description,
      customer: {
        email: customerEmail,
        name: customerName,
        phone: customerPhone || undefined, // format +228... ou +225...
      },
      return_url: `${req.headers.get('origin') || 'http://localhost:5173'}/payment-success`,
      error_url: `${req.headers.get('origin') || 'http://localhost:5173'}/payment-cancel`
    }

    // Ajoute le provider si ce n'est pas "card" et qu'un provider spécifique a été choisi
    if (paymentMethod && paymentMethod !== 'card') {
      paymentPayload.payment_method = paymentMethod
    } else if (paymentMethod === 'card') {
       paymentPayload.payment_method = 'card'
    }

    console.log("Calling GeniusPay API with:", paymentPayload)

    // Appel à l'API GeniusPay
    const response = await fetch('https://geniuspay.ci/api/v1/merchant/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': GENIUSPAY_PUBLIC_KEY,
        'X-API-Secret': GENIUSPAY_SECRET_KEY,
      },
      body: JSON.stringify(paymentPayload)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("GeniusPay API Error:", data)
      throw new Error(data.message || "Erreur lors de la création du paiement GeniusPay")
    }

    // L'API peut retourner un checkout_url, un payment_url (pour Wave/Paystack), ou juste un status pending pour Mobile Money USSD
    const responseData = data.data || data;

    return new Response(
      JSON.stringify(responseData),
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
