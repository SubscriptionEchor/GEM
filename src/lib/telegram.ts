import WebApp from '@twa-dev/sdk';

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
      };
    };
  }
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export function isTelegramWebApp(): boolean {
  return !!window.Telegram?.WebApp;
}

export function getTelegramUser(): TelegramUser | null {
  if (!WebApp.initDataUnsafe?.user) {
    return null;
  }
  return WebApp.initDataUnsafe.user;
}

export function initializeTelegramWebApp() {
  WebApp.ready();
  WebApp.expand();
}