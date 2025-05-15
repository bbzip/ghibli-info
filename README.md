# Ghibli Generator

A web application that transforms user photos into Ghibli-style artwork.

## Features

- Upload a photo and convert it to Ghibli art style using Replicate API
- Internationalization: Supports English and Chinese languages
- Automatically detects user's language
- Different UI/UX for Chinese and English users
- Generates platform-specific images (Instagram Stories, Pinterest, Xiaohongshu, WeChat)
- Adds random artistic captions to match the generated image
- User quota system (free tier: first image for anonymous users, 3 images per week for registered users)
- Payment integration with Stripe for purchasing additional generation credits
- Responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **API**: Replicate API for image generation
- **Authentication**: Simple cookie-based auth (Magic Link for MVP)
- **Payments**: Stripe
- **Internationalization**: next-i18next
- **Styling**: Tailwind CSS with custom Ghibli-inspired theme

## Getting Started

### Prerequisites

- Node.js 14+ and npm/yarn
- A Replicate API key
- A Stripe account (for payment integration)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ghibli-generator.git
cd ghibli-generator
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Create a `.env.local` file in the root directory with the following:
```
NEXT_PUBLIC_REPLICATE_API_TOKEN=your_replicate_api_key

# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_your_test_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Site URL for Stripe redirects (no trailing slash)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Setting up Supabase Storage

1. Create a [Supabase account](https://supabase.io) if you don't have one
2. Create a new project and retrieve your `URL` and `service_role_key` from the API settings
3. Create a new storage bucket named `generated-images` in the Storage section
4. Set up bucket permissions to allow public access for reading generated images
5. Add your Supabase credentials to the environment variables

### Setting up Stripe

1. Create a [Stripe account](https://stripe.com) if you don't have one
2. In the Stripe Dashboard, go to Developers > API keys and copy your test API keys
3. Set up your products and prices in the Stripe Dashboard:
   - Create 3 products that match your subscription plans (Basic, Standard, Premium)
   - For each product, create a price with the matching amount ($1.99, $4.99, $9.99)
   - Copy the Price IDs and update them in the `components/SubscriptionModal.tsx` file
4. Set up a webhook endpoint in the Stripe Dashboard:
   - Go to Developers > Webhooks
   - Add an endpoint with the URL: `https://your-website-url.com/api/stripe/webhook`
   - Select events: `checkout.session.completed` and `payment_intent.payment_failed`
   - Copy the webhook signing secret and add it to your environment variables

## Deployment

### Deploying to Vercel

The easiest way to deploy this application is using [Vercel](https://vercel.com):

1. Push your code to a GitHub repository.
2. Import your project in Vercel.
3. Add the environment variables for your Replicate API key and Stripe API keys.
4. Deploy.
5. Update your Stripe webhook endpoint to point to your deployed URL.

## Future Enhancements (Post-MVP)

- User profile management
- Image history/gallery for users
- More customization options for the generated images
- Additional AI art styles
- Social sharing functionality 