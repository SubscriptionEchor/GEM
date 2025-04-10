import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  userInfo: WebAppUser | null;
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
  const [userInfo, setUserInfo] = useState<WebAppUser | null>(null);

  useEffect(() => {
    const initTelegramAuth = () => {
      // Check if we're running in Telegram WebApp environment
      if (window.Telegram?.WebApp) {
        // Tell Telegram WebApp we're ready
        window.Telegram.WebApp.ready();

        try {
          // Get user data and validate
          const webApp = window.Telegram.WebApp;
          const user = webApp.initDataUnsafe.user;
          
          // Enhance user data with theme info
          const enhancedUser = user ? {
            ...user,
            color_scheme: webApp.colorScheme,
            theme_params: webApp.themeParams
          } : null;

          if (enhancedUser) {
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
            // Use dummy user for development
            setUserInfo({
              id: 12345,
              first_name: 'Test',
              username: 'test_user'
            });
          }
        } catch (error) {
          console.error('Error during Telegram auth:', error);
          // Use dummy user for development
          setUserInfo({
            id: 12345,
            first_name: 'Test',
            username: 'test_user'
          });
        }
      } else {
        // Not in Telegram WebApp, use dummy user
        setUserInfo({
          id: 12345,
          first_name: 'Test',
          username: 'test_user'
        });
      }
    };

    initTelegramAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ userInfo }}>
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