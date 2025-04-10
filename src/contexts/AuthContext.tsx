import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { validateTelegramWebAppData, validateAuthDate } from '../utils/telegramUtils';

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  userInfo: WebAppUser | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

interface WebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  color_scheme?: string;
  theme_params?: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        platform: string;
        colorScheme: string;
        themeParams: {
          bg_color: string;
          text_color: string;
          hint_color: string;
          button_color: string;
          button_text_color: string;
        };
        initData: string;
        initDataUnsafe: {
          user?: WebAppUser;
          query_id?: string;
          auth_date?: number;
          hash?: string;
        };
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
      };
    };
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<WebAppUser | null>(null);

  useEffect(() => {
    const initTelegramAuth = async () => {
      // Check if we're running in Telegram WebApp environment
      if (window.Telegram?.WebApp) {
        // Tell Telegram WebApp we're ready
        window.Telegram.WebApp.ready();

        try {
          // Get user data and validate
          const webApp = window.Telegram.WebApp;
          
          // Validate Telegram data
          const isValid = validateTelegramWebAppData(
            webApp.initData,
            process.env.VITE_BOT_TOKEN || ''
          );
          
          const isAuthDateValid = validateAuthDate(webApp.initDataUnsafe.auth_date);
          
          if (!isValid || !isAuthDateValid) {
            throw new Error('Invalid or expired Telegram data');
          }
          
          const user = webApp.initDataUnsafe.user;
          
          // Enhance user data with theme info
          const enhancedUser = user ? {
            ...user,
            color_scheme: webApp.colorScheme,
            theme_params: webApp.themeParams
          } : null;

          
          if (enhancedUser) {
            // Use Telegram user ID as our user ID
            const telegramUserId = enhancedUser.id.toString();
            
            // Sign in with Supabase using custom JWT
            const { error } = await supabase.auth.signInWithPassword({
              email: `${telegramUserId}@telegram.user`,
              password: 'telegram-user-password'
            });

            if (error) {
              // If user doesn't exist, create one
              if (error.status === 400) {
                const { error: signUpError } = await supabase.auth.signUp({
                  email: `${telegramUserId}@telegram.user`,
                  password: 'telegram-user-password'
                });

                if (signUpError) throw signUpError;
              } else {
                throw error;
              }
            }

            setIsAuthenticated(true);
            setUserId(telegramUserId);
            setUserInfo(enhancedUser);

            // Apply Telegram theme
            if (enhancedUser.theme_params) {
              document.documentElement.style.setProperty('--tg-theme-bg-color', enhancedUser.theme_params.bg_color);
              document.documentElement.style.setProperty('--tg-theme-text-color', enhancedUser.theme_params.text_color);
              document.documentElement.style.setProperty('--tg-theme-hint-color', enhancedUser.theme_params.hint_color);
              document.documentElement.style.setProperty('--tg-theme-button-color', enhancedUser.theme_params.button_color);
              document.documentElement.style.setProperty('--tg-theme-button-text-color', enhancedUser.theme_params.button_text_color);
            }
          } else {
            // Fallback to dummy user for development
            await signInAsDummy();
          }
        } catch (error) {
          console.error('Error during Telegram auth:', error);
          // Fallback to dummy user
          await signInAsDummy();
        }
      } else {
        // Not in Telegram WebApp, use dummy user
        await signInAsDummy();
      }
    };

    initTelegramAuth();
  }, []);

  const signInAsDummy = async () => {
    try {
      const DUMMY_USER_ID = 'c3bb130d-fed1-48ed-bc65-e2af328ea5c6';
      
      const { error } = await supabase.auth.signInWithPassword({
        email: 'dummy@example.com',
        password: 'dummyPassword123'
      });

      if (error) {
        // Create dummy user if it doesn't exist
        const { error: signUpError } = await supabase.auth.signUp({
          email: 'dummy@example.com',
          password: 'dummyPassword123'
        });

        if (signUpError) throw signUpError;
      }

      setIsAuthenticated(true);
      setUserId(DUMMY_USER_ID);
      setUserInfo({
        id: parseInt(DUMMY_USER_ID.split('-')[0], 16),
        first_name: 'Dummy',
        username: 'dummy_user'
      });
    } catch (error) {
      console.error('Error signing in as dummy user:', error);
    }
  };

  const signIn = async () => {
    // This is now handled automatically in useEffect
    console.warn('Manual sign in is disabled when using Telegram WebApp');
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setIsAuthenticated(false);
      setUserId(null);
      setUserInfo(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      userId,
      userInfo,
      signIn,
      signOut
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