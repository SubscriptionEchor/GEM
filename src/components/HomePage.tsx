import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatNumber } from '../utils/numberUtils';
import clsx from 'clsx';
import Lottie from 'lottie-react';
import { AnimatePresence } from 'framer-motion';
import fallingDiamondsAnimation from '../assets/animations/diamond falling.json';
import diamondAnimation from '../assets/animations/diamond.json';
import { useBoost } from '../contexts/BoostContext';
import Analytics from './Analytics';

interface HomePageProps {
}

const HomePage: React.FC<HomePageProps> = () => {
  const [miningActive, setMiningActive] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(8 * 60 * 60); // 8 hours in seconds
  const [gemBalance, setGemBalance] = useState(61.77871);
  const [miningRate, setMiningRate] = useState(5.00); // Base mining rate: 5 GEM/hour
  const { activeBoosts, removeExpiredBoosts, getTotalBoost } = useBoost();

  useEffect(() => {
    // Update mining rate when boosts change
    const baseRate = 5.00;
    setMiningRate(baseRate + getTotalBoost());
    
    // Check for expired boosts every minute
    const boostTimer = setInterval(removeExpiredBoosts, 60000);
    return () => clearInterval(boostTimer);
  }, [activeBoosts, getTotalBoost, removeExpiredBoosts]);

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
        
        // Only update balance if there's time remaining
        if (timeRemaining > 0) {
          setGemBalance((prev: number) => prev + (miningRate / 3600)); // Convert hourly rate to per-second
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [miningActive, timeRemaining, miningRate]);

  const handleStartMining = () => {
    if (!miningActive || timeRemaining === 0) {
    setMiningActive(true);
    setTimeRemaining(8 * 60 * 60);
    // Reset mining rate to base rate when starting new session
    setMiningRate(5.00);
    }
  };

  return (
    <main className="p-4 pb-6">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-full h-full opacity-10"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            backgroundImage: 'radial-gradient(circle, var(--accent-primary) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          {/* UID Display */}
          <div className="flex items-center gap-2 bg-background-darker/80 px-2 py-0.5 rounded-lg border border-border-medium">
            <span className="text-text-secondary text-sm">UID:</span>
            <span className="text-text-primary font-medium">1318343</span>
          </div>
          {/* Level Badge */}
          <motion.span 
            className="bg-gradient-to-r from-accent-warning to-accent-primary px-2 py-0.5 rounded-lg text-sm font-bold"
            whileHover={{ scale: 1.05 }}
          >
            Lv 0
          </motion.span>
        </div>
        
        {/* Info Button */}
        <motion.button
          onClick={() => setShowInfoModal(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-background-darker/80 text-accent-info"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </motion.button>

        {/* Info Modal */}
        <AnimatePresence>
          {showInfoModal && (
            <>
              {/* Modal Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowInfoModal(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              />
              
              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed left-0 right-0 top-0 bottom-0 m-auto h-fit w-[90%] max-w-sm
                         bg-background-darker/95 backdrop-blur-md rounded-2xl p-6 z-[101] 
                         border border-border-medium shadow-2xl flex flex-col gap-4 
                         max-h-[calc(100vh-4rem)] overflow-y-auto"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-text-primary">Mining Rules</h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowInfoModal(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-background-dark text-text-secondary hover:text-text-primary"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2 text-text-secondary">
                    <span className="text-accent-info">⏳</span>
                    Mining automatically stops after 8 hours
                  </li>
                  <li className="flex gap-2 text-text-secondary">
                    <span className="text-accent-warning">⚠️</span>
                    Users can't manually stop mining once started
                  </li>
                  <li className="flex gap-2 text-text-secondary">
                    <span className="text-accent-success">✓</span>
                    Mining continues in the background as designed
                  </li>
                  <li className="flex gap-2 text-text-secondary">
                    <span className="text-accent-primary">↻</span>
                    Users can start a new session after the current one ends
                  </li>
                </ul>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Analytics */}
      <Analytics
        totalGemsMined={gemBalance}
        totalReferralEarnings={0}
        totalReferrals={0}
      />
      
      {/* Mining Animation */}
      <div className="relative flex justify-center items-center mb-6 h-[280px]">
        {/* Active Boosts Overlay */}
        {activeBoosts.length > 0 && (
          <div className="absolute top-0 left-0 right-0 z-10">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-4 touch-pan-x">
              {activeBoosts.map((boost) => {
                const hoursLeft = Math.max(0, Math.floor((boost.expiresAt - Date.now()) / (1000 * 60 * 60)));
                return (
                  <motion.div
                    key={boost.id}
                    className="flex items-center gap-2 bg-background-darker/90 backdrop-blur-sm rounded-xl px-3 py-2 border border-border-medium whitespace-nowrap flex-shrink-0 cursor-grab active:cursor-grabbing"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse
                      ${boost.equipment === 'Bronze' ? 'bg-[#CD7F32]' :
                        boost.equipment === 'Silver' ? 'bg-[#C0C0C0]' :
                        'bg-[#FFD700]'}`}
                    />
                    <span className="text-sm font-medium text-text-primary">+{boost.boost} GEM/h</span>
                    <span className="text-xs text-text-secondary">{hoursLeft}h</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Glow Effect */}
        <div className="absolute inset-0 bg-accent-primary opacity-20 blur-3xl" />
        
        {/* Falling Diamonds Animation */}
        {miningActive && (
          <div className="absolute inset-0 -z-10">
          <Lottie
            animationData={fallingDiamondsAnimation}
            loop={true}
            autoplay={true}
            style={{ width: '100%', height: '100%' }}
          />
          </div>
        )}
        
        {/* Orbiting Elements */}
        <div className="relative w-[280px] h-[280px]">
          {miningActive && [...Array(5)].map((_, index) => {
            const randomX = (Math.random() - 0.5) * 200; // Random X position between -100 and 100
            const randomY = Math.random() * 150 + 50; // Random Y position between 50 and 200
            const randomDelay = Math.random() * 2; // Random delay between 0 and 2 seconds
            const randomDuration = 1.5 + Math.random(); // Random duration between 1.5 and 2.5 seconds
            
            return (
              <motion.div
              key={index}
              className="absolute left-1/2 top-1/2 w-8 h-8 -ml-4 -mt-4"
              initial={{ scale: 0, y: 0, x: 0 }}
              animate={{
                scale: [0, 1, 1],
                y: [0, randomY],
                x: [0, randomX],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: randomDuration,
                delay: randomDelay,
                repeat: Infinity,
                ease: "easeOut"
              }}
            >
              <span className="text-2xl">💰</span>
              </motion.div>
            );
          })}

          <motion.div
            animate={{
              y: [0, -8, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute left-1/2 top-1/2 -ml-20 -mt-20 w-40 h-40
                       flex items-center justify-center z-10"
          >
            <Lottie
              animationData={diamondAnimation}
              loop={true}
              autoplay={true}
              style={{ width: '100%', height: '100%' }}
            />
          </motion.div>
        </div>
        
        {/* Mining Rate */}
        <motion.div 
          className="absolute -bottom-8 text-center w-full"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="text-2xl font-bold bg-gradient-to-r from-accent-info to-accent-purple 
                          bg-clip-text text-transparent">
            {formatNumber(miningRate)} GEM/H
          </div>
        </motion.div>
      </div>

      {/* Timer Display */}
      <motion.div
        className="bg-background-darker rounded-3xl p-4 relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10"
        whileHover={{ scale: miningActive ? 1.02 : 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Glow effect when mining is active */}
        {miningActive && (
          <motion.div
            className="absolute inset-0 bg-accent-info/10"
            animate={{
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-background-dark rounded-lg flex items-center justify-center">
              <span role="img" aria-label="timer" className="text-accent-info">⏳</span>
            </div>
            <div className="flex flex-col">
              <h3 className={clsx(
                "font-bold text-sm tracking-wider tabular-nums leading-none whitespace-nowrap",
                miningActive ? "text-accent-info" : "text-text-primary"
              )}>
                {Math.floor(timeRemaining / 3600).toString().padStart(2, '0')}H{' '}
                {Math.floor((timeRemaining % 3600) / 60).toString().padStart(2, '0')}M{' '}
                {(timeRemaining % 60).toString().padStart(2, '0')}S
              </h3>
              <p className="text-[10px] text-text-secondary mt-0.5">Mining Session</p>
            </div>
          </div>
          
          {/* Start Mining Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartMining}
            className={clsx(
              "px-8 py-3 rounded-2xl text-base font-bold relative overflow-hidden",
              miningActive 
                ? "bg-background-dark text-text-secondary border border-border-medium"
                : "bg-gradient-to-r from-accent-primary to-accent-warning text-white"
            )}
          >
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 w-[20%] bg-gradient-to-r from-white/40 via-white/20 to-transparent skew-x-12"
              animate={{
                x: ['-200%', '400%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: 1
              }}
            />
            {/* Button text */}
            <span className="relative z-10">
            {miningActive ? 'In Progress' : 'Start Mining'}
            </span>
          </motion.button>
        </div>
        
        <div className="flex gap-2 mb-3">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={clsx(
                "flex-1 h-2 rounded-full",
                i < Math.floor((timeRemaining / (8 * 60 * 60)) * 8) 
                  ? "bg-accent-info" 
                  : "bg-background-dark"
              )}
            />
          ))}
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-text-secondary">Leave and restart</span>
          {miningActive && (
            <motion.div
              className="flex items-center gap-2 text-accent-success"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="w-2 h-2 rounded-full bg-accent-success" />
              <span className="text-xs font-medium">Mining Active</span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </main>
  );
};

export default HomePage;