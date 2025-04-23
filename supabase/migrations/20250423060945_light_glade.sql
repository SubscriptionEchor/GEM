/*
  # Update Referral Rewards System

  1. Changes
    - Updates calculate_rewards() function to implement two-level referral system
    - Direct referrals now earn 25% of mined GEMs
    - Second-level referrals earn 15% of mined GEMs
    - Adds tracking for both levels of referral earnings

  2. Security
    - Maintains existing RLS policies
    - No changes to table permissions required
*/

-- Update the calculate_rewards function with new referral percentages
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