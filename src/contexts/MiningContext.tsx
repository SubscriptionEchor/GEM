import React, { createContext, useContext, useState, useEffect } from 'react';
import { useBoost } from './BoostContext';

interface MiningContextType {
  miningActive: boolean;
  timeRemaining: number;
  miningRate: number;
  error: string | null;
  startMining: () => Promise<void>;
}

const MiningContext = createContext<MiningContextType | undefined>(undefined);

export const MiningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [miningActive, setMiningActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(8 * 60 * 60); // 8 hours in seconds
  const [miningRate, setMiningRate] = useState(5.00); // Base mining rate: 5 GEM/hour
  const [error, setError] = useState<string | null>(null);
  const { getTotalBoost } = useBoost();

  useEffect(() => {
    // Update mining rate when boosts change
    const baseRate = 5.00;
    setMiningRate(baseRate + getTotalBoost());
  }, [getTotalBoost]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (miningActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = Math.max(0, prev - 1);
          // If time runs out, stop mining
          if (newTime === 0) {
            setMiningActive(false);
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [miningActive, timeRemaining]);

  const startMining = async () => {
    try {
      setError(null);

      // Check if already mining
      if (miningActive && timeRemaining > 0) {
        return;
      }
      
      // Start mining session
      setMiningActive(true);
      setTimeRemaining(8 * 60 * 60);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to initialize mining session');
      }
      if (miningActive) {
        setMiningActive(false);
      }
      throw error;
    }
  };

  return (
    <MiningContext.Provider value={{
      miningActive,
      timeRemaining,
      miningRate,
      error,
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