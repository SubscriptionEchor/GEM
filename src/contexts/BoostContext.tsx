import React, { createContext, useContext, useState } from 'react';

export interface Boost {
  id: string;
  name: string;
  type: string;
  boost: number;
  equipment: string;
  expiresAt: number;
}

interface BoostContextType {
  activeBoosts: Boost[];
  addBoost: (boost: Omit<Boost, 'expiresAt'>, duration: number) => void;
  removeExpiredBoosts: () => void;
  getTotalBoost: () => number;
  getBoostCountByType: (type: string) => number;
  calculateBoostEffectiveness: (type: string) => number;
}

const BoostContext = createContext<BoostContextType | undefined>(undefined);

export const BoostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeBoosts, setActiveBoosts] = useState<Boost[]>([]);

  const getBoostCountByType = (type: string): number => {
    return activeBoosts.filter(boost => boost.type === type).length;
  };

  const calculateBoostEffectiveness = (type: string): number => {
    const count = getBoostCountByType(type);
    if (count === 0) return 1; // First boost is 100% effective
    if (count === 1) return 0.9; // Second boost is 90% effective
    if (count === 2) return 0.8; // Third boost is 80% effective
    return Math.max(0.5, 1 - (count * 0.1)); // Minimum 50% effectiveness
  };

  const addBoost = (boost: Omit<Boost, 'expiresAt'>, duration: number) => {
    const expiresAt = Date.now() + (duration * 60 * 60 * 1000); // Convert hours to milliseconds
    setActiveBoosts(prev => [...prev, { ...boost, expiresAt }]);
  };

  const removeExpiredBoosts = () => {
    const now = Date.now();
    setActiveBoosts(prev => prev.filter(boost => boost.expiresAt > now));
  };

  const getTotalBoost = () => {
    // Group boosts by type and apply diminishing returns
    const boostsByType = activeBoosts.reduce((acc, boost) => {
      acc[boost.type] = acc[boost.type] || [];
      acc[boost.type].push(boost);
      return acc;
    }, {} as Record<string, Boost[]>);

    return Object.entries(boostsByType).reduce((total, [_, boosts]) => {
      return total + boosts.reduce((typeTotal, boost, index) => {
        const effectiveness = 1 - (index * 0.1); // Decrease by 10% for each additional boost
        return typeTotal + (boost.boost * Math.max(0.5, effectiveness)); // Minimum 50% effectiveness
      }, 0);
    }, 0);
  };

  return (
    <BoostContext.Provider value={{ 
      activeBoosts, 
      addBoost, 
      removeExpiredBoosts, 
      getTotalBoost,
      getBoostCountByType,
      calculateBoostEffectiveness
    }}>
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