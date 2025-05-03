# NextAuth.js with Supabase Setup Guide

This guide explains how to set up NextAuth.js with Supabase for authentication in the Ghibli Generator project.

## Prerequisites

1. A Supabase account and project
2. Google Cloud project (for Google OAuth)
3. SMTP server details (for email login)

## Setup Steps

### 1. Configure Supabase

1. Create a new table in your Supabase project with the SQL in `supabase_schema.sql`:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  login_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  generation_count INTEGER DEFAULT 0,
  is_subscribed BOOLEAN DEFAULT FALSE
);

-- Create function to increment generation count
CREATE OR REPLACE FUNCTION increment_generation_count()
RETURNS INTEGER
LANGUAGE SQL
AS $$
  UPDATE users
  SET generation_count = generation_count + 1
  WHERE id = auth.uid()
  RETURNING generation_count;
$$;
```

2. Make sure Row Level Security is enabled

### 2. Configure Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-at-least-32-chars

# Google Provider
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Provider (SMTP) - Optional if you want email login
EMAIL_SERVER_USER=your-email-server-user
EMAIL_SERVER_PASSWORD=your-email-server-password
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_FROM=noreply@ghibli-generator.com
```

### 3. Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application"
6. Add your application URLs:
   - Authorized JavaScript origins: `http://localhost:3000` (add your production URL too)
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google` (add your production URL too)
7. Copy the Client ID and Client Secret to your .env.local file

### 4. Email Provider Setup (Optional)

If you want to use email (magic link) login:

1. Configure an SMTP server (you can use services like SendGrid, Mailgun, etc.)
2. Add the SMTP details to your .env.local file

## Testing the Authentication

1. Run the development server:
```
npm run dev
```

2. Navigate to `http://localhost:3000/login` and test both Google and email login

## Understanding the Code

- `pages/api/auth/[...nextauth].ts`: The main NextAuth.js configuration
- `utils/useAuth.ts`: React hook to access authentication functionality
- `utils/supabase.ts`: Supabase client setup
- `pages/api/user/increment-generation.ts`: API endpoint to update user's generation count
- `components/Header.tsx`: Updated header with user display
- `pages/login.tsx`: Login page with Google and email options

## Additional Notes

- User data is stored in the JWT token
- When a user logs in for the first time, a record is created in the Supabase `users` table
- The login timestamp is updated on each authentication
- The generation count is incremented when a user generates an image