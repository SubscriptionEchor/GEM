-- Function to perform a spin and record the result
CREATE OR REPLACE FUNCTION spin_wheel()
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    prize_amount NUMERIC,
    prize_option TEXT,
    spins_remaining INTEGER
) AS $$
DECLARE
    p_user_id BIGINT := (SELECT public.get_user_sub()::BIGINT);
    today_start TIMESTAMP := date_trunc('day', NOW());
    today_end TIMESTAMP := today_start + INTERVAL '1 day';
    spins_used INTEGER;
    max_daily_spins CONSTANT INTEGER := 3;
    random_prize RECORD;
    prize_options TEXT[] := ARRAY['1 GEM', '2 GEM', '1 GEM', '1 GEM', '5 GEM', '10 GEM', '20 GEM', '100 GEM'];
    prize_weights NUMERIC[] := ARRAY[0.25, 0.15, 0.25, 0.25, 0.05, 0.03, 0.015, 0.005]; -- probabilities add up to 1
    prize_values NUMERIC[] := ARRAY[1, 2, 1, 1, 5, 10, 20, 100];
    prize_index INTEGER;
    random_value NUMERIC;
    cumulative_probability NUMERIC := 0;
BEGIN
    -- Count spins already used today
    SELECT COUNT(*) INTO spins_used
    FROM spin_history
    WHERE user_id = p_user_id 
    AND created_at >= today_start 
    AND created_at < today_end;
    
    -- Check if user has spins remaining
    IF spins_used >= max_daily_spins THEN
        success := FALSE;
        message := 'No spins remaining today';
        prize_amount := 0;
        prize_option := '';
        spins_remaining := 0;
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Generate a random value between 0 and 1
    random_value := random();
    
    -- Determine prize based on weighted probabilities
    FOR i IN 1..array_length(prize_options, 1) LOOP
        cumulative_probability := cumulative_probability + prize_weights[i];
        IF random_value <= cumulative_probability THEN
            prize_index := i;
            EXIT;
        END IF;
    END LOOP;
    
    -- Record the spin result
    INSERT INTO spin_history (user_id, prize_amount, prize_option)
    VALUES (p_user_id, prize_values[prize_index], prize_options[prize_index]);
    
    -- Add the prize to user's balance
    UPDATE "user"
    SET balance = balance + prize_values[prize_index]
    WHERE id = p_user_id;
    
    -- Return results
    success := TRUE;
    message := 'Spin successful';
    prize_amount := prize_values[prize_index];
    prize_option := prize_options[prize_index];
    spins_remaining := max_daily_spins - spins_used - 1;
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to get remaining spins for today
CREATE OR REPLACE FUNCTION get_remaining_spins()
RETURNS INTEGER AS $$
DECLARE
    p_user_id BIGINT := (SELECT public.get_user_sub()::BIGINT);
    today_start TIMESTAMP := date_trunc('day', NOW());
    today_end TIMESTAMP := today_start + INTERVAL '1 day';
    spins_used INTEGER;
    max_daily_spins CONSTANT INTEGER := 3;
BEGIN
    -- Count spins already used today
    SELECT COUNT(*) INTO spins_used
    FROM spin_history
    WHERE user_id = p_user_id 
    AND created_at >= today_start 
    AND created_at < today_end;
    
    RETURN max_daily_spins - spins_used;
END;
$$ LANGUAGE plpgsql;




CREATE OR REPLACE FUNCTION calculate_rewards()
RETURNS VOID AS $$
DECLARE
    user_record RECORD;
    reward NUMERIC;
    direct_referrer_reward NUMERIC;
    grandparent_referrer_reward NUMERIC;
    active_boosts_count INTEGER;
    boost_effectiveness NUMERIC;
    total_boost NUMERIC;
    direct_referral_bonus CONSTANT NUMERIC := 0.25; -- 25% direct referral bonus
    grandparent_referral_bonus CONSTANT NUMERIC := 0.15; -- 15% grandparent referral bonus
    base_boost_rate CONSTANT NUMERIC := 0.1; -- Base boost rate per boost
    base_mining_rate CONSTANT NUMERIC := 0.1; -- Base mining rate per hour
    direct_referrer_id BIGINT;
    grandparent_referrer_id BIGINT;
BEGIN
    -- Loop through all users with active mining sessions
    FOR user_record IN (
        SELECT u.id AS user_id, u.balance, u.referred_by, ms.start_time, ms.end_time
        FROM "user" u
        INNER JOIN mining_sessions ms ON u.id = ms.user_id
        WHERE ms.start_time <= NOW() AND ms.end_time > NOW()
    )
    LOOP
        -- Calculate total boost with diminishing returns
        total_boost := 0;
        active_boosts_count := 0;
        
        -- Count active boosts for this user
        SELECT COUNT(*)
        INTO active_boosts_count
        FROM boosts
        WHERE user_id = user_record.user_id 
        AND start_time <= NOW() 
        AND end_time > NOW() 
        AND status = TRUE;

        -- Apply diminishing returns based on number of active boosts
        FOR i IN 1..active_boosts_count LOOP
            -- Calculate effectiveness for each boost
            CASE 
                WHEN i = 1 THEN boost_effectiveness := 1.0; -- 100%
                WHEN i = 2 THEN boost_effectiveness := 0.9; -- 90%
                WHEN i = 3 THEN boost_effectiveness := 0.8; -- 80%
                WHEN i = 4 THEN boost_effectiveness := 0.7; -- 70%
                WHEN i = 5 THEN boost_effectiveness := 0.6; -- 60%
                ELSE boost_effectiveness := 0.5; -- -10% each time, minimum 50%
            END CASE;

            total_boost := total_boost + (base_boost_rate * boost_effectiveness);
        END LOOP;

        reward := base_mining_rate + total_boost;

        -- Update user balance
        UPDATE "user"
        SET balance = balance + reward
        WHERE id = user_record.user_id;

        -- Check for direct referrer (parent) and award 25% of the reward
        IF user_record.referred_by IS NOT NULL THEN
            direct_referrer_id := user_record.referred_by;
            direct_referrer_reward := reward * direct_referral_bonus; -- 25% of the user's reward

            -- Update direct referrer's balance and referred_earnings
            UPDATE "user"
            SET balance = balance + direct_referrer_reward,
                referred_earnings = referred_earnings + direct_referrer_reward
            WHERE id = direct_referrer_id;
            
            -- Check for grandparent referrer and award 15% of the reward
            SELECT referred_by INTO grandparent_referrer_id
            FROM "user"
            WHERE id = direct_referrer_id;
            
            IF grandparent_referrer_id IS NOT NULL THEN
                grandparent_referrer_reward := reward * grandparent_referral_bonus; -- 15% of the user's reward
                
                -- Update grandparent referrer's balance and referred_earnings
                UPDATE "user"
                SET balance = balance + grandparent_referrer_reward,
                    referred_earnings = referred_earnings + grandparent_referrer_reward
                WHERE id = grandparent_referrer_id;
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Stored procedure to start a mining session for a user
CREATE OR REPLACE FUNCTION start_mining()
RETURNS VOID AS $$
DECLARE
    p_user_id BIGINT := (SELECT public.get_user_sub()::BIGINT);
BEGIN
    -- Check if user already has an active mining session
    IF EXISTS (
        SELECT 1 
        FROM mining_sessions 
        WHERE user_id = p_user_id 
        AND start_time <= NOW() 
        AND end_time > NOW()
    ) THEN
        RAISE EXCEPTION 'User already has an active mining session';
    END IF;

    INSERT INTO mining_sessions (user_id, start_time, end_time)
    VALUES (p_user_id, NOW(), NOW() + INTERVAL '24 hours');
END;
$$ LANGUAGE plpgsql;


-- Function to get user's mining status
CREATE OR REPLACE FUNCTION get_mining_status()
RETURNS TABLE (
    is_mining BOOLEAN,
    time_remaining INTERVAL,
    current_rate NUMERIC,
    balance NUMERIC,
    total_referrals INTEGER
) AS $$
DECLARE
    p_user_id BIGINT := (SELECT public.get_user_sub()::BIGINT);
    active_session RECORD;
    base_mining_rate CONSTANT NUMERIC := 0.1;
    total_boost NUMERIC := 0;
    active_boosts_count INTEGER;
    boost_effectiveness NUMERIC;
    base_boost_rate CONSTANT NUMERIC := 0.1;
    user_balance NUMERIC;
    user_total_referrals INTEGER;
BEGIN
    -- Get user's balance and total referrals
    SELECT u.balance, u.total_referrals INTO user_balance, user_total_referrals
    FROM "user" u
    WHERE u.id = p_user_id;

    -- Get active session if exists
    SELECT * INTO active_session
    FROM mining_sessions
    WHERE user_id = p_user_id
    AND start_time <= NOW()
    AND end_time > NOW();

    -- Calculate if mining and time remaining
    is_mining := FOUND;
    time_remaining := CASE 
        WHEN FOUND THEN active_session.end_time - NOW()
        ELSE INTERVAL '0'
    END;

    -- Calculate current mining rate including boosts
    IF FOUND THEN
        -- Count active boosts
        SELECT COUNT(*)
        INTO active_boosts_count
        FROM boosts
        WHERE user_id = p_user_id 
        AND start_time <= NOW() 
        AND end_time > NOW() 
        AND status = TRUE;

        -- Calculate total boost with diminishing returns
        FOR i IN 1..active_boosts_count LOOP
            CASE 
                WHEN i = 1 THEN boost_effectiveness := 1.0;
                WHEN i = 2 THEN boost_effectiveness := 0.9;
                WHEN i = 3 THEN boost_effectiveness := 0.8;
                WHEN i = 4 THEN boost_effectiveness := 0.7;
                WHEN i = 5 THEN boost_effectiveness := 0.6;
                ELSE boost_effectiveness := 0.5;
            END CASE;
            total_boost := total_boost + (base_boost_rate * boost_effectiveness);
        END LOOP;

        current_rate := base_mining_rate + total_boost;
    ELSE
        current_rate := 0;
    END IF;

    -- Set balance and total_referrals values from the query
    balance := user_balance;
    total_referrals := user_total_referrals;

    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;


-- add a boost for a user with mining session check based on start and end times
CREATE OR REPLACE FUNCTION add_boost(
    p_boost_type TEXT
) RETURNS VOID AS $$
DECLARE
    p_user_id BIGINT := (SELECT public.get_user_sub()::BIGINT);
    v_start_time TIMESTAMP := NOW();
    v_end_time TIMESTAMP;
    boost_cost NUMERIC;
    v_boost_cost_24h NUMERIC := 2;
    v_boost_cost_3d NUMERIC := 5;
    v_boost_cost_7d NUMERIC := 10;
    total_boosts INTEGER;
BEGIN
    -- Check if the user has an active mining session based on start and end times
    IF NOT EXISTS (
        SELECT 1 FROM mining_sessions 
        WHERE user_id = p_user_id AND start_time <= NOW() AND end_time > NOW()
    ) THEN
        RAISE EXCEPTION 'User does not have an active mining session';
    END IF;

    -- Check if user has reached the maximum limit of 30 boosts
    SELECT COUNT(*) INTO total_boosts
    FROM boosts
    WHERE user_id = p_user_id AND end_time > NOW();
    
    IF total_boosts >= 30 THEN
        RAISE EXCEPTION 'Maximum boost limit reached (30)';
    END IF;

    -- Determine boost cost and end time based on boost type
    CASE p_boost_type
        WHEN '24h' THEN
            boost_cost := v_boost_cost_24h; -- Cost for 24-hour boost
            v_end_time := v_start_time + INTERVAL '24 hours';
        WHEN '3d' THEN
            boost_cost := v_boost_cost_3d; -- Cost for 3-day boost
            v_end_time := v_start_time + INTERVAL '3 days';
        WHEN '7d' THEN
            boost_cost := v_boost_cost_7d; -- Cost for 7-day boost
            v_end_time := v_start_time + INTERVAL '7 days';
        ELSE
            RAISE EXCEPTION 'Invalid boost type';
    END CASE;

    -- Check if user has sufficient balance
    IF NOT EXISTS (
        SELECT 1 FROM "user" WHERE id = p_user_id AND balance >= boost_cost
    ) THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;

    -- Deduct boost cost from user balance
    UPDATE "user"
    SET balance = balance - boost_cost
    WHERE id = p_user_id;

    -- Insert boost into the boosts table
    INSERT INTO boosts (user_id, start_time, end_time, amount, boost_type, status)
    VALUES (p_user_id, v_start_time, v_end_time, boost_cost, p_boost_type, TRUE);
END;
$$ LANGUAGE plpgsql;

-- Function to extract user ID from JWT token claims
CREATE OR REPLACE FUNCTION public.get_user_sub()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Extract the "sub" value from the JWT payload
    RETURN (SELECT auth.jwt() ->> 'sub');
END;
$$;

