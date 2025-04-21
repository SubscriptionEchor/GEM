-- Enable Row Level Security (RLS) for all tables
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "boosts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mining_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "spin_history" ENABLE ROW LEVEL SECURITY;

-- CREATE POLICIES FOR USER TABLE
-- Allow users to view only their own data
CREATE POLICY "Users can view their own data" 
ON "user"
FOR SELECT
TO authenticated
USING (
  ((auth.jwt() ->> 'sub')::bigint = id)
);

-- CREATE POLICIES FOR BOOSTS TABLE
-- Allow users to view only their own boosts
CREATE POLICY "Users can view their own boosts" 
ON "boosts"
FOR SELECT
TO authenticated
USING (
  ((auth.jwt() ->> 'sub')::bigint = user_id)
);

-- CREATE POLICIES FOR MINING_SESSIONS TABLE
-- Allow users to view only their own mining sessions
CREATE POLICY "Users can view their own mining sessions" 
ON "mining_sessions"
FOR SELECT
TO authenticated
USING (
  ((auth.jwt() ->> 'sub')::bigint = user_id)
);

-- CREATE POLICIES FOR SPIN_HISTORY TABLE
-- Allow users to view only their own spin history
CREATE POLICY "Users can view their own spin history" 
ON "spin_history"
FOR SELECT
TO authenticated
USING (
  ((auth.jwt() ->> 'sub')::bigint = user_id)
);

-- Revoke INSERT, UPDATE, DELETE permissions but keep SELECT
REVOKE INSERT, UPDATE, DELETE ON "user" FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON "boosts" FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON "mining_sessions" FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON "spin_history" FROM authenticated;

-- Grant SELECT permissions to authenticated users
GRANT SELECT ON "user" TO authenticated;
GRANT SELECT ON "boosts" TO authenticated;
GRANT SELECT ON "mining_sessions" TO authenticated;
GRANT SELECT ON "spin_history" TO authenticated;

-- Ensure appropriate function execution permissions are maintained

-- Function permissions fix after enabling RLS
-- These settings allow functions to bypass RLS for specific operations while maintaining security

-- Allow functions to access tables regardless of RLS policies
ALTER FUNCTION spin_wheel() SECURITY DEFINER;
ALTER FUNCTION get_remaining_spins() SECURITY DEFINER;
ALTER FUNCTION start_mining() SECURITY DEFINER;
ALTER FUNCTION get_mining_status() SECURITY DEFINER;
ALTER FUNCTION add_boost(TEXT) SECURITY DEFINER;
ALTER FUNCTION get_user_sub() SECURITY DEFINER; -- Already has SECURITY DEFINER

-- Update function owner to be the same as table owner for proper access
ALTER FUNCTION spin_wheel() OWNER TO postgres;
ALTER FUNCTION get_remaining_spins() OWNER TO postgres;
ALTER FUNCTION start_mining() OWNER TO postgres;
ALTER FUNCTION get_mining_status() OWNER TO postgres;
ALTER FUNCTION add_boost(TEXT) OWNER TO postgres;

-- Ensure proper grants for authenticated users
GRANT EXECUTE ON FUNCTION spin_wheel() TO authenticated;
GRANT EXECUTE ON FUNCTION get_remaining_spins() TO authenticated;
GRANT EXECUTE ON FUNCTION start_mining() TO authenticated;
GRANT EXECUTE ON FUNCTION get_mining_status() TO authenticated;
GRANT EXECUTE ON FUNCTION add_boost(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_sub() TO authenticated;

-- Grant calculate_rewards function to postgres role for cron job execution
GRANT EXECUTE ON FUNCTION calculate_rewards() TO postgres;