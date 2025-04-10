import WebApp from '@twa-dev/sdk';

const TELEGRAM_INIT_TIMEOUT = 10000; // Increased timeout for slower connections
const IS_PREVIEW = !window.Telegram && process.env.NODE_ENV === 'development';

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
          auth_date: number;
          hash: string;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        isExpanded: boolean;
      };
    };
  }
}

// Wait for Telegram Web App to be initialized
function waitForTelegramWebApp(): Promise<void> {
  return new Promise((resolve) => {
    // Check if WebApp is already initialized
    if (window.Telegram?.WebApp?.initDataUnsafe?.user || IS_PREVIEW) {
      resolve();
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      // Check if WebApp is initialized or we're in preview mode
      if (window.Telegram?.WebApp?.initDataUnsafe?.user || IS_PREVIEW) {
        clearInterval(checkInterval);
        resolve();
        return;
      }

      if (Date.now() - startTime > TELEGRAM_INIT_TIMEOUT) {
        clearInterval(checkInterval);
        console.warn('Telegram Web App initialization timeout, falling back to preview mode');
        resolve(); // Don't reject, just continue in preview mode
      }
    }, 100);
  });
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export function isTelegramWebApp(): boolean {
  return IS_PREVIEW || !!window.Telegram?.WebApp;
}

export async function getTelegramUser(): Promise<TelegramUser | null> {
  if (!isTelegramWebApp()) {
    return null;
  }

  // Return mock user data in preview mode
  if (IS_PREVIEW) {
    return {
      id: 12345678,
      first_name: 'Preview',
      username: 'preview_user'
    };
  }
  
  try {
    await waitForTelegramWebApp();
    return WebApp.initDataUnsafe.user || null;
  } catch (error) {
    console.error('Failed to get Telegram user:', error);
    return null;
  }
}

export async function initializeTelegramWebApp() {
  // Skip actual initialization in preview mode
  if (IS_PREVIEW) {
    return;
  }

  if (!window.Telegram?.WebApp) {
    console.warn('Telegram WebApp not available');
    return;
  }

  try {
    await waitForTelegramWebApp();
    WebApp.ready();
    if (!WebApp.isExpanded) {
      WebApp.expand();
    }
  } catch (error) {
    console.error('Failed to initialize Telegram Web App:', error);
    throw error;
  }
}