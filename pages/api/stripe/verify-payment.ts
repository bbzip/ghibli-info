import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16', 
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify the payment was successful
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ 
        success: false, 
        error: 'Payment was not successful' 
      });
    }

    // Get the credits from the session metadata
    const credits = session.metadata?.credits ? parseInt(session.metadata.credits, 10) : 0;

    // Return success response with credits
    return res.status(200).json({ 
      success: true, 
      credits, 
      planId: session.metadata?.planId || 'basic' 
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Error verifying payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 