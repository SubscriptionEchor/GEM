import React from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import diamondAnimation from '../assets/animations/diamond.json';
import { formatNumber } from '../utils/numberUtils';
import { useBoost } from '../contexts/BoostContext';
import { AnimatePresence } from 'framer-motion';

interface UpgradeOption {
  id: string;
  name: string;
  cost: number;
  boost: number;
  duration: number;
  equipment: string;
  description: string;
}

const upgradeOptions: UpgradeOption[] = [
  {
    id: '24h',
    name: '24-Hour Boost',
    cost: 5,
    boost: 1,
    duration: 24,
    equipment: 'Bronze',
    description: 'Perfect for new miners'
  },
  {
    id: '3d',
    name: '3-Day Boost',
    cost: 13,
    boost: 1,
    duration: 72,
    equipment: 'Silver',
    description: 'Great value for regular miners'
  },
  {
    id: '7d',
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
  const [gemBalance, setGemBalance] = React.useState(61.77871);
  const { activeBoosts, addBoost } = useBoost();

  const handlePurchase = () => {
    if (!selectedUpgrade) return;
    
    const option = upgradeOptions.find(opt => opt.id === selectedUpgrade);
    if (!option) return;
    
    if (gemBalance >= option.cost) {
      addBoost({
        id: `${option.id}-${Date.now()}`,
        name: option.name,
        boost: option.boost,
        equipment: option.equipment
      }, option.duration);
      
      setGemBalance(prev => prev - option.cost);
      setShowConfirmModal(false);
      setSelectedUpgrade(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-background-primary flex flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto scrollbar-hide p-4 pb-20">
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
            {activeBoosts.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-text-secondary text-sm">No active boosts</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeBoosts.map((boost) => {
                  const hoursLeft = Math.max(0, Math.floor((boost.expiresAt - Date.now()) / (1000 * 60 * 60)));
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
                          <h3 className="text-sm font-medium text-text-primary">{boost.name}</h3>
                          <p className="text-xs text-text-secondary">+{boost.boost} GEM/h boost</p>
                        </div>
                      </div>
                      <div className="text-sm text-text-secondary">{hoursLeft}h left</div>
                    </div>
                  );
                })}
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
                      <span className="text-sm text-text-secondary">+{option.boost} GEM/h</span>
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
                  
                  return (
                    <>
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center">
                          <span className="text-text-secondary">Cost:</span>
                          <span className="text-text-primary font-medium">{option.cost} GEM</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-text-secondary">Boost:</span>
                          <span className="text-accent-success">+{option.boost} GEM/h</span>
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
      </main>

      {/* Bottom Navigation */}
      <nav className="w-full bg-background-dark backdrop-blur-md z-50">
        <div className="flex justify-between items-center px-8 py-3 mx-auto max-w-md border-t border-border-medium">
          <motion.a 
            onClick={() => onNavigate('home')}
            className="flex flex-col items-center gap-1.5 text-text-secondary group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className="text-sm font-medium tracking-wide">Home</span>
          </motion.a>

          <motion.button 
            className="flex flex-col items-center gap-1.5 text-text-primary group relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Glowing background circle */}
            <motion.div 
              className="absolute top-0 w-14 h-14 rounded-full bg-gradient-to-br from-accent-primary/30 to-accent-warning/30 blur-lg"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Main circle background */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-primary to-accent-warning flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-[2px] rounded-full bg-background-darker/95" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                animate={{
                  rotate: [0, 180],
                  scale: [1, 1.5, 1]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <svg viewBox="0 0 24 24" className="w-6 h-6 relative z-10" style={{ fill: 'var(--fill-muted)' }}>
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <span className="text-sm font-medium tracking-wide">Upgrade</span>
          </motion.button>

          <motion.a 
            className="flex flex-col items-center gap-1.5 text-text-secondary group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('referral')}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ fill: 'var(--fill-light)' }}>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span className="text-sm font-medium tracking-wide">Referral</span>
          </motion.a>
        </div>
      </nav>
    </div>
  );
};

export default UpgradePage;