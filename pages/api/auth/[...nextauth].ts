// 不需要导入全局代理

import NextAuth, { NextAuthOptions, Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import { SupabaseAdapter } from "@auth/supabase-adapter";
import * as jose from 'jose';
import supabase from '../../../utils/supabase';

// Extended session and user types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isSubscribed: boolean;
      generationCount: number;
    }
  }
  interface User {
    id: string;
    email: string;
    name?: string;
    isSubscribed?: boolean;
    generationCount?: number;
  }
}

// Helper function to create or update user in Supabase
async function upsertUser(user: any) {
  const { id, email, name } = user;
  
  // Check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  
  if (existingUser) {
    // Update login timestamp
    await supabase
      .from('users')
      .update({ login_at: new Date().toISOString() })
      .eq('id', id);
      
    return {
      id,
      email,
      name,
      isSubscribed: existingUser.is_subscribed,
      generationCount: existingUser.generation_count
    };
  } else {
    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        { 
          id, 
          email, 
          name: name || email.split('@')[0],
          created_at: new Date().toISOString(),
          login_at: new Date().toISOString(),
          generation_count: 0,
          is_subscribed: false
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user in Supabase:', error);
      throw error;
    }
    
    return {
      id,
      email,
      name: newUser.name,
      isSubscribed: false,
      generationCount: 0
    };
  }
}

export const authOptions: NextAuthOptions = {
  debug: true,
  logger: {
    error: (code, ...message) => {
      console.error(code, ...message);
    },
    warn: (code, ...message) => {
      console.warn(code, ...message);
    },
    debug: (code, ...message) => {
      console.log(code, ...message);
    },
  },
  providers: [
    // 使用最简化的 Google Provider 配置，没有任何代理设置
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST!,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER!,
          pass: process.env.EMAIL_SERVER_PASSWORD!,
        },
      },
      from: process.env.EMAIL_FROM || 'noreply@ghibli-generator.com',
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  }) as any,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow sign in
      return true;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        // Update or create user in our custom table
        const userData = await upsertUser(user);

        token.id = userData.id;
        token.isSubscribed = userData.isSubscribed;
        token.generationCount = userData.generationCount;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.isSubscribed = token.isSubscribed as boolean;
        session.user.generationCount = token.generationCount as number;
      }
      
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions); 