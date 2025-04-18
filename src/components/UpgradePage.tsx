import React from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import diamondAnimation from '../assets/animations/diamond.json';
import { useMining } from '../contexts/MiningContext';
import { formatNumber } from '../utils/numberUtils';
import { useBoost, Boost } from '../contexts/BoostContext';
import { AnimatePresence } from 'framer-motion';

interface UpgradeOption {
  id: string;
  name: string;
  type: string;
  cost: number;
  boost: number;
  duration: number;
  equipment: string;
  description: string;
}

const upgradeOptions: UpgradeOption[] = [
  {
    id: '24h',
    type: '24h',
    name: '24-Hour Boost',
    cost: 5,
    boost: 1,
    duration: 24,
    equipment: 'Bronze',
    description: 'Perfect for new miners'
  },
  {
    id: '3d',
    type: '3d',
    name: '3-Day Boost',
    cost: 13,
    boost: 1,
    duration: 72,
    equipment: 'Silver',
    description: 'Great value for regular miners'
  },
  {
    id: '7d',
    type: '7d',
    name: '7-Day Boost',
    cost: 28,
    boost: 1,
    duration: 168,
    equipment: 'Gold',
    description: 'Best value for committed miners'
  }
];

interface UpgradePageProps {
  onNavigate: (page: string) => void;
}

const UpgradePage: React.FC<UpgradePageProps> = ({ onNavigate }) => {
  const [selectedUpgrade, setSelectedUpgrade] = React.useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [showMiningRequiredModal, setShowMiningRequiredModal] = React.useState(false);
  const [gemBalance, setGemBalance] = React.useState(61.77871);
  const { activeBoosts, addBoost, getBoostCountByType, calculateBoostEffectiveness, getTotalBoost } = useBoost();
  const { miningActive } = useMining();

  const handlePurchase = () => {
    if (!selectedUpgrade) return;
    
    const option = upgradeOptions.find(opt => opt.id === selectedUpgrade);
    if (!option) return;
    
    if (!miningActive) {
      setShowMiningRequiredModal(true);
      setShowConfirmModal(false);
      return;
    }
    
    if (gemBalance >= option.cost) {
      try {
        addBoost({
          id: `${option.id}-${Date.now()}`,
          name: option.name,
          type: option.type,
          boost: option.boost,
          equipment: option.equipment
        }, option.duration);
        setGemBalance(prev => prev - option.cost);
        setShowConfirmModal(false);
        setSelectedUpgrade(null);
      } catch (error) {
        console.error('Failed to add boost:', error);
      }
    }
  };

  return (
    <main className="p-4 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Upgrade Mining</h1>
          <div className="flex items-center gap-2 bg-background-darker/80 px-3 py-1.5 rounded-lg">
            <span className="text-text-secondary">Balance:</span>
            <span className="text-text-primary font-medium">{formatNumber(61.77871)} GEM</span>
          </div>
        </div>

        {/* Active Boosts Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-text-secondary mb-4">Active Boosts</h2>
          <div className="bg-background-darker rounded-xl p-4 border border-border-medium">
            {/* Boost Summary */}
            {activeBoosts.length > 0 && (
              <div className="mb-4 p-3 rounded-lg bg-background-dark/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-secondary">Total Active Boosts:</span>
                  <span className="text-sm font-medium text-text-primary">{activeBoosts.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Total Boost Effect:</span>
                  <span className="text-sm font-medium text-accent-success">
                    +{getTotalBoost().toFixed(2)} GEM/h
                  </span>
                </div>
              </div>
            )}

            <div className="max-h-[240px] overflow-y-auto">
            {activeBoosts.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-text-secondary text-sm">No active boosts</p>
              </div>
            ) : (
              <div>
                {/* Group boosts by type */}
                {Object.entries(
                  activeBoosts.reduce((acc, boost) => {
                    acc[boost.type] = acc[boost.type] || [];
                    acc[boost.type].push(boost);
                    return acc;
                  }, {} as Record<string, Boost[]>)
                ).map(([type, boosts]) => (
                  <div key={type} className="mb-4 last:mb-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-text-secondary">
                        {boosts[0].name} × {boosts.length}
                      </span>
                      <span className="text-xs text-text-secondary">
                        Total: +{boosts.reduce((sum, boost, index) => {
                          const effectiveness = 1 - (index * 0.1);
                          return sum + (boost.boost * Math.max(0.5, effectiveness));
                        }, 0).toFixed(2)} GEM/h
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {boosts.map((boost, index) => {
                        const hoursLeft = Math.max(0, Math.floor((boost.expiresAt - Date.now()) / (1000 * 60 * 60)));
                        const effectiveness = 1 - (index * 0.1);
                        const actualBoost = boost.boost * Math.max(0.5, effectiveness);
                        
                        return (
                          <div
                            key={boost.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-background-dark/50"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full animate-pulse
                                ${boost.equipment === 'Bronze' ? 'bg-[#CD7F32]' :
                                  boost.equipment === 'Silver' ? 'bg-[#C0C0C0]' :
                                  'bg-[#FFD700]'}`}
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-sm font-medium text-text-primary">
                                    {boost.name}
                                  </h3>
                                  {index > 0 && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-background-darker text-text-secondary">
                                      {Math.round(effectiveness * 100)}% effective
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-text-secondary">
                                  +{actualBoost.toFixed(2)} GEM/h boost
                                </p>
                              </div>
                            </div>
                            <div className="text-sm text-text-secondary whitespace-nowrap">
                              {hoursLeft}h left
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
            
            {/* Info Banner */}
            {activeBoosts.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-accent-info/10 border border-accent-info/20">
                <div className="flex items-start gap-2">
                  <span className="text-accent-info mt-0.5">ℹ️</span>
                  <div>
                    <p className="text-xs text-text-secondary">
                      Stacking multiple boosts of the same type reduces their effectiveness:
                    </p>
                    <ul className="mt-1 space-y-0.5 text-xs text-text-secondary">
                      <li>• First boost: 100% effective</li>
                      <li>• Second boost: 90% effective</li>
                      <li>• Third boost: 80% effective</li>
                      <li>• Additional boosts: -10% each (minimum 50%)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Available Upgrades */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-secondary">Available Upgrades</h2>
          
          {upgradeOptions.map((option) => (
            <motion.div
              key={option.id}
              className={`bg-background-darker rounded-xl p-4 border transition-colors ${
                selectedUpgrade === option.id 
                  ? 'border-accent-primary' 
                  : 'border-border-medium'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (!miningActive) {
                  setShowMiningRequiredModal(true);
                  return;
                }
                setSelectedUpgrade(option.id);
                setShowConfirmModal(true);
              }}
            >
              <div className="flex items-center gap-4">
                {/* Equipment Icon */}
                <div className="w-12 h-12 rounded-lg bg-background-dark flex items-center justify-center">
                  <Lottie
                    animationData={diamondAnimation}
                    loop={true}
                    style={{ width: 40, height: 40 }}
                  />
                </div>

                {/* Upgrade Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-text-primary">{option.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium
                      ${option.equipment === 'Bronze' ? 'bg-[#CD7F32]/20 text-[#CD7F32]' :
                        option.equipment === 'Silver' ? 'bg-[#C0C0C0]/20 text-[#C0C0C0]' :
                        'bg-[#FFD700]/20 text-[#FFD700]'}`}>
                      {option.equipment}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mt-1">{option.description}</p>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-accent-success">⚡</span>
                      <span className="text-sm text-text-secondary">
                        +{(option.boost * calculateBoostEffectiveness(option.type)).toFixed(2)} GEM/h
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-accent-warning">⏱️</span>
                      <span className="text-sm text-text-secondary">{option.duration}h</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-accent-info">💎</span>
                      <span className="text-sm text-text-primary font-medium">{option.cost} GEM</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Purchase Confirmation Modal */}
        <AnimatePresence>
          {showConfirmModal && selectedUpgrade && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowConfirmModal(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed left-0 right-0 top-0 bottom-0 m-auto h-fit w-[90%] max-w-sm
                         bg-background-darker/95 backdrop-blur-md rounded-2xl p-6 z-[51] 
                         border border-border-medium shadow-2xl max-h-[calc(100vh-4rem)] 
                         overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-text-primary">Confirm Purchase</h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowConfirmModal(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-background-dark text-text-secondary hover:text-text-primary"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
                
                {(() => {
                  const option = upgradeOptions.find(opt => opt.id === selectedUpgrade);
                  if (!option) return null;
                  
                  const currentCount = getBoostCountByType(option.type);
                  const effectiveness = calculateBoostEffectiveness(option.type);
                  const actualBoost = option.boost * effectiveness;
                  
                  return (
                    <>
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center">
                          <span className="text-text-secondary">Cost:</span>
                          <span className="text-text-primary font-medium">{option.cost} GEM</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-text-secondary">Boost:</span>
                          <span className="text-accent-success">
                            +{actualBoost.toFixed(2)} GEM/h
                            {currentCount > 0 && (
                              <span className="text-xs text-text-secondary ml-2">
                                ({Math.round(effectiveness * 100)}% effective)
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-text-secondary">Duration:</span>
                          <span className="text-text-primary">{option.duration}h</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowConfirmModal(false)}
                          className="flex-1 py-3 rounded-xl bg-background-dark text-text-secondary border border-border-medium"
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handlePurchase}
                          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-accent-primary to-accent-warning text-white font-medium"
                          disabled={gemBalance < option.cost}
                        >
                          Confirm
                        </motion.button>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            </>
          )}
        </AnimatePresence>
        
        {/* Mining Required Modal */}
        <AnimatePresence>
          {showMiningRequiredModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMiningRequiredModal(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed left-0 right-0 top-0 bottom-0 m-auto h-fit w-[90%] max-w-sm
                         bg-background-darker/95 backdrop-blur-md rounded-2xl p-6 z-[51] 
                         border border-border-medium shadow-2xl"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 mb-4 text-accent-warning">
                    ⚠️
                  </div>
                  
                  <h3 className="text-xl font-bold text-text-primary mb-2">
                    Mining Required
                  </h3>
                  
                  <p className="text-text-secondary mb-6">
                    You need to start a mining session before you can activate any boosts.
                  </p>
                  
                  <div className="flex gap-3 w-full">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowMiningRequiredModal(false)}
                      className="flex-1 py-3 rounded-xl bg-background-dark text-text-secondary border border-border-medium"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowMiningRequiredModal(false);
                        onNavigate('home');
                      }}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-accent-primary to-accent-warning text-white font-medium"
                    >
                      Start Mining
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
    </main>
  );
};

export default UpgradePage;