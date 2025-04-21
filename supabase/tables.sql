-- Supabase project name is "Gem" , org name is "Echor tech"

-- User table
CREATE TABLE IF NOT EXISTS "user" (
    id BIGINT PRIMARY KEY,
    balance NUMERIC DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- referrals
    referral_code TEXT UNIQUE,
    total_referrals INT DEFAULT 0,
    referred_earnings NUMERIC DEFAULT 0,
    referred_by BIGINT REFERENCES "user"(id) ON DELETE SET NULL DEFAULT NULL
);

-- Boosts table
CREATE TABLE IF NOT EXISTS boosts (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES "user"(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    amount NUMERIC NOT NULL,
    boost_type TEXT CHECK (boost_type IN ('24h', '3d', '7d')),
    status BOOLEAN DEFAULT TRUE -- active or inactive
);

-- Mining sessions table
CREATE TABLE IF NOT EXISTS mining_sessions (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES "user"(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL
    -- is_active BOOLEAN DEFAULT TRUE
);

-- Spindle wheel history table
CREATE TABLE IF NOT EXISTS spin_history (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES "user"(id),
    prize_amount NUMERIC NOT NULL,
    prize_option TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);




GRANT USAGE ON SCHEMA public TO authenticated;
