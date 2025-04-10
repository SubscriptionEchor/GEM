import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  referral_code: string;
  referred_by: string | null;
  created_at: string;
  total_gems_mined: number;
  total_referral_earnings: number;
  total_referrals: number;
}

export interface ReferralEarning {
  id: string;
  referrer_id: string;
  referred_id: string;
  amount: number;
  created_at: string;
}

export async function createUser(referralCode?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No authenticated user');

  const { data, error } = await supabase.rpc('create_user_with_referral', {
    user_id: user.id,
    referral_code: referralCode
  });

  if (error) throw error;
  return data as User;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateMiningRewards(amount: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No authenticated user');

  // Start a transaction to update both the user and their referrer
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('referred_by, total_gems_mined')
    .eq('id', user.id)
    .single();

  if (userError) throw userError;

  // Update user's mined amount
  const { error: updateError } = await supabase
    .from('users')
    .update({ total_gems_mined: userData.total_gems_mined + amount })
    .eq('id', user.id);

  if (updateError) throw updateError;

  // If user was referred, calculate and add referral earnings
  if (userData.referred_by) {
    const referralAmount = amount * 0.02; // 2% referral reward

    // Add referral earning record
    const { error: earningError } = await supabase
      .from('referral_earnings')
      .insert({
        referrer_id: userData.referred_by,
        referred_id: user.id,
        amount: referralAmount
      });

    if (earningError) throw earningError;

    // Update referrer's total earnings
    const { error: referrerError } = await supabase.rpc('update_referrer_earnings', {
      referrer_id: userData.referred_by,
      earning_amount: referralAmount
    });

    if (referrerError) throw referrerError;
  }
}