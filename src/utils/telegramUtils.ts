import crypto from 'crypto';

export interface TelegramInitData {
  query_id?: string;
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  };
  auth_date?: number;
  hash?: string;
}

export function validateTelegramWebAppData(initData: string, botToken: string): boolean {
  try {
    // Parse the data
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    if (!hash) return false;
    
    // Remove hash from data before checking
    urlParams.delete('hash');
    
    // Generate data-check-string
    const dataCheckArray = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`);
      
    const dataCheckString = dataCheckArray.join('\n');
    
    // Generate secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
      
    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
      
    // Verify hash
    return calculatedHash === hash;
  } catch (error) {
    console.error('Error validating Telegram data:', error);
    return false;
  }
}

export function validateAuthDate(authDate?: number): boolean {
  if (!authDate) return false;
  
  // Check if auth_date is not older than 24h
  const MAX_AGE = 24 * 60 * 60; // 24 hours in seconds
  const now = Math.floor(Date.now() / 1000);
  return (now - authDate) < MAX_AGE;
}