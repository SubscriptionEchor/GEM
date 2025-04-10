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
          className={`flex flex-col items-center gap-1.5 group ${
            currentPage === 'home' ? 'text-text-primary' : 'text-text-secondary'
          }`}
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
          onClick={() => onNavigate('upgrade')}
          className="flex flex-col items-center gap-1.5 group relative"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
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
            <svg 
              viewBox="0 0 24 24" 
              className="w-6 h-6 relative z-10 fill-[var(--fill-muted)]"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <span className={`text-sm font-medium tracking-wide ${
            currentPage === 'upgrade' ? 'text-text-primary' : 'text-text-secondary'
          }`}>
            Upgrade
          </span>
        </motion.button>

        <motion.button 
          onClick={() => onNavigate('referral')}
          className={`flex flex-col items-center gap-1.5 group ${
            currentPage === 'referral' ? 'text-text-primary' : 'text-text-secondary'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
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