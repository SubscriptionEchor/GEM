/*
  # Create users and referrals tables

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Telegram user ID
      - `referral_code` (text, unique) - User's unique referral code
      - `referred_by` (uuid, foreign key) - ID of user who referred them
      - `created_at` (timestamptz) - Account creation timestamp
      - `total_gems_mined` (numeric) - Total GEMs mined by user
      - `total_referral_earnings` (numeric) - Total GEMs earned from referrals
      - `total_referrals` (integer) - Count of users referred

    - `referral_earnings`
      - `id` (uuid, primary key)
      - `referrer_id` (uuid, foreign key) - User who referred
      - `referred_id` (uuid, foreign key) - User who was referred
      - `amount` (numeric) - Amount earned from this referral
      - `created_at` (timestamptz) - When the earning occurred

  2. Security
    - Enable RLS on both tables
    - Add policies for secure access
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code text UNIQUE NOT NULL,
  referred_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  total_gems_mined numeric DEFAULT 0,
  total_referral_earnings numeric DEFAULT 0,
  total_referrals integer DEFAULT 0,
  
  CONSTRAINT positive_gems_mined CHECK (total_gems_mined >= 0),
  CONSTRAINT positive_referral_earnings CHECK (total_referral_earnings >= 0),
  CONSTRAINT positive_referrals CHECK (total_referrals >= 0)
);

-- Create referral_earnings table
CREATE TABLE IF NOT EXISTS referral_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES users(id) NOT NULL,
  referred_id uuid REFERENCES users(id) NOT NULL,
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_earnings ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Policies for referral_earnings table
CREATE POLICY "Users can read own referral earnings"
  ON referral_earnings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text AS $$
DECLARE
  chars text[] := '{A,B,C,D,E,F,G,H,J,K,L,M,N,P,Q,R,S,T,U,V,W,X,Y,Z,2,3,4,5,6,7,8,9}';
  result text := 'GEM';
  i integer;
BEGIN
  FOR i IN 1..5 LOOP
    result := result || chars[1+random()*(array_length(chars, 1)-1)];
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to create new user with referral
CREATE OR REPLACE FUNCTION create_user_with_referral(
  user_id uuid,
  referral_code text DEFAULT NULL
)
RETURNS users AS $$
DECLARE
  new_referral_code text;
  referring_user_id uuid;
  new_user users;
BEGIN
  -- Generate unique referral code
  LOOP
    new_referral_code := generate_referral_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM users WHERE referral_code = new_referral_code);
  END LOOP;

  -- Look up referring user if code provided
  IF referral_code IS NOT NULL THEN
    SELECT id INTO referring_user_id
    FROM users
    WHERE referral_code = referral_code;
  END IF;

  -- Create new user
  INSERT INTO users (id, referral_code, referred_by)
  VALUES (user_id, new_referral_code, referring_user_id)
  RETURNING * INTO new_user;

  -- Update referrer's stats if applicable
  IF referring_user_id IS NOT NULL THEN
    UPDATE users
    SET total_referrals = total_referrals + 1
    WHERE id = referring_user_id;
  END IF;

  RETURN new_user;
END;
$$ LANGUAGE plpgsql;