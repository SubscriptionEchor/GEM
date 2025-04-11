import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wheel } from 'react-custom-roulette';
import clsx from 'clsx';
import Lottie from 'lottie-react';
import confetti from 'canvas-confetti';
import diamondAnimation from '../assets/animations/diamond.json';

interface SpinData {
  option: string;
  style: {
    backgroundColor: string;
    textColor: string;
  };
}

const SpinPage: React.FC = () => {
  const [availableSpins, setAvailableSpins] = useState(3);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastPrize, setLastPrize] = useState<string>('');

  const data: SpinData[] = [
    { option: '5 GEM', style: { backgroundColor: '#1a1a1a', textColor: '#ec4e02' } },
    { option: '10 GEM', style: { backgroundColor: '#1f1f1f', textColor: '#eab308' } },
    { option: '25 GEM', style: { backgroundColor: '#1a1a1a', textColor: '#3b82f6' } },
    { option: '50 GEM', style: { backgroundColor: '#1f1f1f', textColor: '#a855f7' } },
    { option: '100 GEM', style: { backgroundColor: '#1a1a1a', textColor: '#ec4e02' } },
    { option: '250 GEM', style: { backgroundColor: '#1f1f1f', textColor: '#eab308' } },
    { option: '500 GEM', style: { backgroundColor: '#1a1a1a', textColor: '#3b82f6' } },
    { option: '1000 GEM', style: { backgroundColor: '#1f1f1f', textColor: '#a855f7' } },
  ];

  const handleSpinClick = () => {
    if (availableSpins > 0 && !mustSpin) {
      // Generate random prize number
      const newPrizeNumber = Math.floor(Math.random() * data.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
      setAvailableSpins(prev => prev - 1);
    }
  };

  const handleSpinStop = () => {
    setMustSpin(false);
    setLastPrize(data[prizeNumber].option);
    
    // Trigger confetti effect
    const duration = 3 * 1000;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const animationEnd = Date.now() + duration;

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    setShowSuccessModal(true);
  };

  return (
    <main className="p-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Spin & Win</h1>
        <div className="flex items-center gap-2 bg-background-darker/80 px-3 py-1.5 rounded-lg">
          <span className="text-text-secondary">Spins:</span>
          <span className="text-text-primary font-medium">{availableSpins}</span>
        </div>
      </div>

      {/* Spin Wheel Container */}
      <div className="bg-background-darker rounded-xl p-6 border border-border-medium mb-6 relative overflow-hidden">
        {/* Background glow effects */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-accent-primary/20 to-accent-warning/20"
          animate={{
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at center, var(--accent-primary) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
          animate={{
            opacity: [0.05, 0.1, 0.05],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        <div className="flex justify-center mb-6 relative">
          <div className="relative">
            <Wheel
              mustStartSpinning={mustSpin}
              prizeNumber={prizeNumber}
              data={data}
              onStopSpinning={handleSpinStop}
              backgroundColors={data.map(item => item.style.backgroundColor)}
              textColors={['#ffffff']}
              fontSize={14}
              radiusLineWidth={1}
              outerBorderWidth={0}
              innerBorderWidth={0}
              innerRadius={40}
              textDistance={75}
              perpendicularText={true}
              spinDuration={0.8}
            />
            
            {/* Center Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                          w-24 h-24 rounded-full bg-background-dark
                          border-2 border-accent-primary/30 flex items-center justify-center
                          shadow-[0_0_20px_rgba(236,78,2,0.2)]">
              <motion.div 
                className="w-16 h-16"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Lottie
                  animationData={diamondAnimation}
                  loop={true}
                  style={{ width: '100%', height: '100%' }}
                />
              </motion.div>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSpinClick}
          disabled={availableSpins === 0 || mustSpin}
          className={clsx(
            "w-full py-4 rounded-xl text-lg font-bold relative overflow-hidden",
            (availableSpins === 0 || mustSpin)
              ? "bg-background-dark text-text-secondary cursor-not-allowed"
              : "bg-gradient-to-r from-accent-primary to-accent-warning text-white"
          )}
        >
          {availableSpins === 0 
            ? 'No Spins Left Today'
            : mustSpin 
              ? 'Spinning...'
              : 'Spin Now'}
        </motion.button>
      </div>

      {/* Rules Section */}
      <div className="bg-background-darker rounded-xl p-6 border border-border-medium">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Spin Rules</h2>
        <ul className="space-y-3">
          <li className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-accent-info/20 flex items-center justify-center text-accent-info">
              1
            </div>
            <div>
              <h3 className="font-medium text-text-primary">Daily Spins</h3>
              <p className="text-sm text-text-secondary">Get 3 free spins every day</p>
            </div>
          </li>
          <li className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-accent-warning/20 flex items-center justify-center text-accent-warning">
              2
            </div>
            <div>
              <h3 className="font-medium text-text-primary">Win GEMs</h3>
              <p className="text-sm text-text-secondary">Chance to win up to 1000 GEMs</p>
            </div>
          </li>
          <li className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-accent-success/20 flex items-center justify-center text-accent-success">
              3
            </div>
            <div>
              <h3 className="font-medium text-text-primary">Guaranteed Rewards</h3>
              <p className="text-sm text-text-secondary">Every spin wins something!</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Result Modal */}
      <AnimatePresence mode="wait">
        {showSuccessModal && (
          <>
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-0 right-0 top-0 bottom-0 m-auto h-fit w-[90%] max-w-sm
                       bg-background-darker/95 backdrop-blur-md rounded-2xl p-6 z-[51] 
                       border border-border-medium shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 mb-4">
                  <Lottie
                    animationData={diamondAnimation}
                    loop={true}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
                
                <h3 className="text-2xl font-bold text-text-primary mb-2">
                  Congratulations! 🎉
                </h3>
                
                <p className="text-text-secondary mb-6">
                  You've won an amazing prize!
                </p>
                
                <div className="bg-background-dark w-full rounded-xl p-4 mb-6">
                  <p className="text-text-secondary mb-2">Prize Amount</p>
                  <p className="text-3xl font-bold text-accent-success">
                    {lastPrize}
                  </p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-primary to-accent-warning 
                           text-white font-medium"
                >
                  Awesome!
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
};

export default SpinPage;