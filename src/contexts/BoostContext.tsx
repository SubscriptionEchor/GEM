import React, { createContext, useContext, useState } from 'react';

export interface Boost {
  id: string;
  name: string;
  boost: number;
  equipment: string;
  expiresAt: number;
}

interface BoostContextType {
  activeBoosts: Boost[];
  addBoost: (boost: Omit<Boost, 'expiresAt'>, duration: number) => void;
  removeExpiredBoosts: () => void;
  getTotalBoost: () => number;
}

const BoostContext = createContext<BoostContextType | undefined>(undefined);

export const BoostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeBoosts, setActiveBoosts] = useState<Boost[]>([]);

  const addBoost = (boost: Omit<Boost, 'expiresAt'>, duration: number) => {
    const expiresAt = Date.now() + (duration * 60 * 60 * 1000); // Convert hours to milliseconds
    setActiveBoosts(prev => [...prev, { ...boost, expiresAt }]);
  };

  const removeExpiredBoosts = () => {
    const now = Date.now();
    setActiveBoosts(prev => prev.filter(boost => boost.expiresAt > now));
  };

  const getTotalBoost = () => {
    return activeBoosts.reduce((total, boost) => total + boost.boost, 0);
  };

  return (
    <BoostContext.Provider value={{ activeBoosts, addBoost, removeExpiredBoosts, getTotalBoost }}>
      {children}
    </BoostContext.Provider>
  );
};

export const useBoost = () => {
  const context = useContext(BoostContext);
  if (context === undefined) {
    throw new Error('useBoost must be used within a BoostProvider');
  }
  return context;
};