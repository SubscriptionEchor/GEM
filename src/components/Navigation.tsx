import React from 'react';
import { motion } from 'framer-motion';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  return (
    <nav className="w-full bg-background-dark backdrop-blur-md z-50">
      <div className="flex justify-between items-center px-8 py-3 mx-auto max-w-md border-t border-border-medium">
        <motion.button 
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center gap-2 group relative ${
            currentPage === 'home' ? 'text-text-primary' : 'text-text-secondary'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-8 h-8 flex items-center justify-center relative">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span className="text-sm font-medium tracking-wide">Home</span>
        </motion.button>

        <motion.button 
          onClick={() => onNavigate('upgrade')}
          className={`flex flex-col items-center gap-2 group relative ${
            currentPage === 'upgrade' ? 'text-text-primary' : 'text-text-secondary'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-8 h-8 flex items-center justify-center relative overflow-hidden rounded-lg">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-accent-primary to-accent-warning opacity-10"
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
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"
              animate={{
                rotate: [0, 360],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <span className="text-sm font-medium tracking-wide">
            Upgrade
          </span>
        </motion.button>

        <motion.button 
          onClick={() => onNavigate('leaderboard')}
          className={`flex flex-col items-center gap-2 group relative ${
            currentPage === 'leaderboard' ? 'text-text-primary' : 'text-text-secondary'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-8 h-8 flex items-center justify-center relative">
            {currentPage === 'leaderboard' && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-accent-primary/30 to-accent-warning/30 rounded-lg blur-sm"
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
            )}
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
            </svg>
          </div>
          <span className="text-sm font-medium tracking-wide">Leaderboard</span>
        </motion.button>

        <motion.button 
          onClick={() => onNavigate('referral')}
          className={`flex flex-col items-center gap-2 group relative ${
            currentPage === 'referral' ? 'text-text-primary' : 'text-text-secondary'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-8 h-8 flex items-center justify-center relative">
            {currentPage === 'referral' && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-accent-primary/30 to-accent-warning/30 rounded-lg blur-sm"
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
            )}
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
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
  );
};

export default Navigation;