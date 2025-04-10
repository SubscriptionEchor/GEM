import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatNumber, formatUSDT } from '../utils/numberUtils';
import clsx from 'clsx';
import Lottie from 'lottie-react';
import fallingDiamondsAnimation from '../assets/animations/diamond falling.json';
import diamondAnimation from '../assets/animations/diamond.json';

const HomePage: React.FC = () => {
  const [miningActive, setMiningActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(8 * 60 * 60); // 8 hours in seconds
  const [gemBalance, setGemBalance] = useState(61.77871);
  const [miningRate, setMiningRate] = useState(5.00); // Base mining rate: 5 GEM/hour
  const usdtValue = 0.006956; // Convert to constant since it's not being updated

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
          setGemBalance(prev => prev + (miningRate / 3600)); // Convert hourly rate to per-second
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
    <div className="fixed inset-0 bg-background-primary flex flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto scrollbar-hide p-4 pb-20">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
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
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-background-darker/80 px-2 py-0.5 rounded-lg border border-border-medium">
            <span className="text-text-secondary text-sm">UID:</span>
            <span className="text-text-primary font-medium">1318343</span>
          </div>
          <motion.span 
            className="bg-gradient-to-r from-accent-warning to-accent-primary px-2 py-0.5 rounded-lg text-sm font-bold"
            whileHover={{ scale: 1.05 }}
          >
            Lv 0
          </motion.span>
        </div>
      </div>

      {/* Balance Display */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <motion.span 
            className="text-text-primary text-5xl font-bold tracking-tight"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {formatNumber(gemBalance)} GEM
          </motion.span>
        </div>
        <div className="text-text-tertiary text-sm">
          ={formatUSDT(gemBalance * usdtValue)} USDT
        </div>
      </motion.div>

      {/* Mining Animation */}
      <div className="relative flex justify-center items-center mb-12">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-accent-primary opacity-20 blur-3xl" />

        {/* Falling Diamonds Animation */}
        <div className="absolute inset-0 -z-10">
          <Lottie
            animationData={fallingDiamondsAnimation}
            loop={true}
            autoplay={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        
        {/* Orbiting Elements */}
        <div className="relative w-[280px] h-[280px]">
          {[...Array(5)].map((_, index) => {
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
        className="bg-background-darker rounded-3xl p-6 mb-8 relative overflow-hidden"
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
            <div className="w-8 h-8 bg-accent-info/20 rounded-lg flex items-center justify-center">
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
                x: ['-100%', '400%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
                repeatDelay: 0.5
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

      {/* Navigation */}
      <nav className="w-full bg-background-dark backdrop-blur-md z-50">
        <div className="flex justify-between items-center px-8 py-3 mx-auto max-w-md border-t border-border-medium">
          <motion.button 
            className="flex flex-col items-center gap-1.5 text-text-primary relative group"
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
          </motion.button>

          <motion.button 
            className="flex flex-col items-center gap-1.5 text-text-secondary group relative"
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

          <motion.button 
            className="flex flex-col items-center gap-1.5 text-text-secondary group relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
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
          </motion.button>
        </div>
      </nav>
    </div>
  );
};

export default HomePage;