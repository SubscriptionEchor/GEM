import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, User, createUser } from '../lib/supabase';
import { TelegramUser, getTelegramUser, isTelegramWebApp } from '../lib/telegram';

interface AuthContextType {
  user: User | null;
  telegramUser: TelegramUser | null;
  loading: boolean;
  error: string | null;
  initializeAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    checkUser();
    
    // Initialize auth only if we're in Telegram Mini App
    if (isTelegramWebApp()) {
      initializeAuth();
    } else {
      setLoading(false);
    }

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserData(session.user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user data');
    }
  };

  const initializeAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      // Only proceed with Telegram auth if we're in the Telegram Mini App
      if (!isTelegramWebApp()) {
        console.log('Not running in Telegram Mini App environment');
        return;
      }

      // Get user data from Telegram WebApp
      const tgUser = getTelegramUser();
      if (!tgUser) {
        throw new Error('Failed to get Telegram user data');
      }

      // Sign in with Telegram user ID as custom token
      const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
        email: `${tgUser.id}@telegram.user`,
        password: `tg-${tgUser.id}`, // Use predictable but secure password
      });

      if (signInError) {
        // If sign in fails, try to sign up
        const { data: { session: newSession }, error: signUpError } = await supabase.auth.signUp({
          email: `${tgUser.id}@telegram.user`,
          password: `tg-${tgUser.id}`,
        });

        if (signUpError) throw signUpError;

        if (newSession?.user) {
          // Create user profile
          const user = await createUser();
          setUser(user);
        }
      }

      setTelegramUser(tgUser);
    } catch (error) {
      console.error('Error during Telegram auth:', error);
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setTelegramUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      setError('Logout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      telegramUser,
      loading,
      error,
      initializeAuth,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};