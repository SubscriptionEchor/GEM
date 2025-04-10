import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatNumber, formatUSDT } from '../utils/numberUtils';
import clsx from 'clsx';
import Lottie from 'lottie-react';
import miningAnimation from '../assets/animations/mining.json';

const HomePage: React.FC = () => {
  const [miningActive, setMiningActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(8 * 60 * 60); // 8 hours in seconds
  const [gemBalance, setGemBalance] = useState(61.77871);
  const [miningRate, setMiningRate] = useState(4.02);
  const usdtValue = 0.006956; // Convert to constant since it's not being updated

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (miningActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
        // Update GEM balance based on mining rate
        setGemBalance(prev => prev + (miningRate / 3600)); // Convert hourly rate to per-second
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [miningActive, timeRemaining, miningRate]);

  const handleStartMining = () => {
    setMiningActive(true);
    setTimeRemaining(8 * 60 * 60);
    // Reset mining rate when starting new session
    setMiningRate(4.02);
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
        
        {/* Orbiting Coins */}
        {[0, 120, 240].map((degree, index) => (
          <motion.div
            key={index}
            className="absolute w-8 h-8"
            animate={{
              rotate: [degree, degree + 360]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              transformOrigin: "120px center"
            }}
          >
            <span className="text-2xl">💰</span>
          </motion.div>
        ))}

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
          className="w-40 h-40 bg-gradient-to-br from-accent-primary to-accent-warning 
                     rounded-full flex items-center justify-center shadow-2xl relative z-10
                     border-4 border-white/10 overflow-hidden"
        >
          <Lottie
            animationData={miningAnimation}
            loop={true}
            autoplay={true}
            style={{ width: '100%', height: '100%' }}
          />
        </motion.div>
        
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
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-info/20 rounded-xl flex items-center justify-center">
              <span role="img" aria-label="timer" className="text-accent-info">⏳</span>
            </div>
            <div>
              <h3 className="font-bold text-text-primary text-2xl tracking-wider">
                {Math.floor(timeRemaining / 3600).toString().padStart(2, '0')}H{' '}
                {Math.floor((timeRemaining % 3600) / 60).toString().padStart(2, '0')}M{' '}
                {(timeRemaining % 60).toString().padStart(2, '0')}S
              </h3>
              <p className="text-sm text-text-secondary">Mining Session</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 mb-3">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={clsx(
                "flex-1 h-2 rounded-full",
                i < Math.floor((timeRemaining / (8 * 60 * 60)) * 8) ? "bg-accent-info" : "bg-background-dark"
              )}
            />
          ))}
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Leave and restart</span>
        </div>
      </motion.div>

      {/* Mining Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleStartMining}
        className={clsx(
          "w-full py-4 rounded-2xl text-2xl font-bold shadow-xl relative overflow-hidden group",
          "bg-gradient-to-r from-accent-primary to-accent-warning",
          "border border-border-light",
          miningActive && "animate-pulse"
        )}
      >
        {/* Light beam animation */}
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
        {/* Button text with glow effect */}
        <span className="relative z-10 group-hover:text-white transition-colors duration-200">
        {miningActive ? 'Mining in progress' : 'Start Mining'}
        </span>
      </motion.button>
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