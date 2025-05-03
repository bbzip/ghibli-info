import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';

// Stripe needs the raw body to verify webhook signatures
export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

// Webhook secret from Stripe dashboard
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;

    // Verify the signature using the webhook secret
    try {
      event = stripe.webhooks.constructEvent(buf.toString(), sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).json({ error: 'Webhook signature verification failed' });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        // Here you could handle successful payments, e.g., update a database
        console.log('Payment successful for session:', session.id);
        break;
      
      case 'payment_intent.payment_failed':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error('Payment failed for intent:', paymentIntent.id);
        break;
        
      default:
        // Unexpected event type
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ 
      error: 'Webhook error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 