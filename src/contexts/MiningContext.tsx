import React, { createContext, useContext, useState, useEffect } from 'react';
import { updateMiningRewards, getCurrentUser, createUser, supabase } from '../lib/supabase';
import { useBoost } from './BoostContext';

interface MiningContextType {
  miningActive: boolean;
  timeRemaining: number;
  miningRate: number;
  error: string | null;
  setError: (error: string | null) => void;
  startMining: () => Promise<void>;
}

const MiningContext = createContext<MiningContextType | undefined>(undefined);

export const MiningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [miningActive, setMiningActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(8 * 60 * 60); // 8 hours in seconds
  const [miningRate, setMiningRate] = useState(5.00); // Base mining rate: 5 GEM/hour
  const [error, setError] = useState<string | null>(null);
  const { getTotalBoost } = useBoost();

  // Check authentication status
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        try {
          const user = await getCurrentUser();
          if (!user) {
            await createUser();
          }
        } catch (error) {
          console.error('Error initializing user:', error);
          setError('Failed to initialize user data');
        }
      } else if (event === 'SIGNED_OUT') {
        setMiningActive(false);
        setError(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Update mining rate when boosts change
    const baseRate = 5.00;
    setMiningRate(baseRate + getTotalBoost());
  }, [getTotalBoost]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (miningActive && timeRemaining > 0) {
      timer = setInterval(async () => {
        setTimeRemaining(prev => {
          const newTime = Math.max(0, prev - 1);
          // If time runs out, stop mining
          if (newTime === 0) {
            setMiningActive(false);
          }
          return newTime;
        });
        
        // Only update balance if there's time remaining
        if (timeRemaining > 0) {
          try {
            await updateMiningRewards(miningRate / 3600);
          } catch (error) {
            setError('Failed to update mining rewards');
            console.error('Failed to update mining rewards:', error);
            // Stop mining if there's an error updating rewards
            setMiningActive(false);
          }
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [miningActive, timeRemaining, miningRate]);

  const startMining = async () => {
    // Prevent starting if already mining
    if (miningActive) {
      return;
    }

    if (!miningActive || timeRemaining === 0) {
      setError(null);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.error('No active session');
          setError('Authentication required to start mining');
          return;
        }

        try {
          // Check if user exists in database
          const user = await getCurrentUser();
          console.log('Current user:', user);
          
          // If user doesn't exist, create them
          if (!user) {
            const newUser = await createUser();
            console.log('Created new user:', newUser);
          }
          
          setMiningActive(true);
          setTimeRemaining(8 * 60 * 60);
          console.log('Mining started successfully');
        } catch (error) {
          console.error('Failed to start mining:', error);
          setError('Failed to initialize mining session');
          setMiningActive(false);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setError('Authentication error');
        setMiningActive(false);
      }
    }
  };

  return (
    <MiningContext.Provider value={{
      miningActive,
      timeRemaining,
      miningRate,
      error,
      setError,
      startMining
    }}>
      {children}
    </MiningContext.Provider>
  );
};

export const useMining = () => {
  const context = useContext(MiningContext);
  if (context === undefined) {
    throw new Error('useMining must be used within a MiningProvider');
  }
  return context;
};