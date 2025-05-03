import Cookies from 'js-cookie';

// Cookie names
const AUTH_COOKIE = 'ghibli_auth';
const EMAIL_COOKIE = 'ghibli_email';

interface User {
  email: string;
  isLoggedIn: boolean;
}

// Mock login function
export const login = (email: string): User => {
  // In a real app, this would validate credentials with a backend
  // For MVP, we'll just set cookies
  Cookies.set(AUTH_COOKIE, 'true', { expires: 7 }); // 7 days
  Cookies.set(EMAIL_COOKIE, email, { expires: 7 });
  
  return { email, isLoggedIn: true };
};

// Mock logout function
export const logout = (): void => {
  Cookies.remove(AUTH_COOKIE);
  Cookies.remove(EMAIL_COOKIE);
};

// Check if user is logged in
export const isLoggedIn = (): boolean => {
  return Cookies.get(AUTH_COOKIE) === 'true';
};

// Get current user
export const getCurrentUser = (): User | null => {
  const isAuthenticated = isLoggedIn();
  const email = Cookies.get(EMAIL_COOKIE);
  
  if (isAuthenticated && email) {
    return { email, isLoggedIn: true };
  }
  
  return null;
};

// Send magic link (mock implementation)
export const sendMagicLink = async (email: string): Promise<boolean> => {
  // In a real app, this would send an email with a magic link
  // For MVP, we'll just simulate success
  console.log(`Magic link would be sent to ${email}`);
  
  // Auto-login for demo purposes
  login(email);
  
  return true;
}; 