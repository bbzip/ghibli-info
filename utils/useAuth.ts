import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

interface User {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  isSubscribed: boolean;
  generationCount: number;
}

/**
 * Custom authentication hook that provides user information and authentication methods
 */
export const useAuth = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user as User | undefined;
  const isLoading = status === 'loading';
  const isAuthenticated = !!session;

  // Login with Google
  const loginWithGoogle = async () => {
    await signIn('google', { callbackUrl: '/' });
  };

  // Login with email (magic link)
  const loginWithEmail = async (email: string) => {
    await signIn('email', { email, callbackUrl: '/' });
  };

  // Logout
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    loginWithGoogle,
    loginWithEmail,
    logout: handleLogout,
  };
};

export default useAuth; 