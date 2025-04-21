AUTOMATED REWARD CALCULATION (CRON)
---------------------------------
The calculate_rewards() function is scheduled to run every hour using pg_cron:

1. Cron Job Setup:
   - Job name: 'calculate-mining-rewards'
   - Schedule: Every hour at minute 0 ('0 * * * *')
   - Command executed:
     SELECT public.calculate_rewards();

2. Required Permissions:
   - GRANT EXECUTE ON FUNCTION public.calculate_rewards() TO postgres;

3. Cron Job Creation SQL:
   SELECT cron.schedule(
       'calculate-mining-rewards',
       '0 * * * *',
       $$SELECT public.calculate_rewards();$$
   );
