import React from 'react';
import { motion } from 'framer-motion';
import { formatNumber } from '../utils/numberUtils';

interface ReferralPageProps {
  onNavigate: (page: string) => void;
}

const ReferralPage: React.FC<ReferralPageProps> = ({ onNavigate }) => {
  const [referralCode] = React.useState('GEM7X9KL');
  const [totalReferrals] = React.useState(0);
  const [totalEarned] = React.useState(0);
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join GEM Token Mining',
        text: `Use my referral code ${referralCode} to start mining GEM tokens!`,
        url: `https://gem-mining.app/ref/${referralCode}`
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-background-primary flex flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto scrollbar-hide p-4 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Referral Program</h1>
        </div>

        {/* Referral Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.div
            className="bg-background-darker rounded-xl p-4 border border-border-medium"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-sm text-text-secondary mb-1">Total Referrals</h3>
            <p className="text-2xl font-bold text-text-primary">{totalReferrals}</p>
          </motion.div>
          
          <motion.div
            className="bg-background-darker rounded-xl p-4 border border-border-medium"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-sm text-text-secondary mb-1">Total Earned</h3>
            <p className="text-2xl font-bold text-text-primary">{formatNumber(totalEarned)} GEM</p>
          </motion.div>
        </div>

        {/* Referral Code Section */}
        <div className="bg-background-darker rounded-xl p-6 border border-border-medium mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-2">Your Referral Code</h2>
          <p className="text-sm text-text-secondary mb-4">
            Share your code and earn 2% of GEMs mined by referred users
          </p>
          
          <div className="flex gap-3 mb-6">
            <div className="flex-1 bg-background-dark rounded-xl px-4 py-3 border border-border-medium">
              <p className="text-xs text-text-secondary mb-1">Code</p>
              <p className="text-lg font-mono font-bold text-text-primary tracking-wider">
                {referralCode}
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyCode}
              className="w-12 h-full bg-background-dark rounded-xl flex items-center justify-center border border-border-medium text-text-secondary hover:text-text-primary"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </motion.button>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-info to-accent-purple text-white font-medium relative overflow-hidden"
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
            <span className="relative z-10">Share Referral Link</span>
          </motion.button>
        </div>

        {/* How It Works */}
        <div className="bg-background-darker rounded-xl p-6 border border-border-medium">
          <h2 className="text-lg font-semibold text-text-primary mb-4">How It Works</h2>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-accent-info/20 flex items-center justify-center text-accent-info">
                1
              </div>
              <div>
                <h3 className="font-medium text-text-primary">Share Your Code</h3>
                <p className="text-sm text-text-secondary">Send your unique referral code to friends</p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-accent-warning/20 flex items-center justify-center text-accent-warning">
                2
              </div>
              <div>
                <h3 className="font-medium text-text-primary">Friends Start Mining</h3>
                <p className="text-sm text-text-secondary">They use your code when they join</p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-accent-success/20 flex items-center justify-center text-accent-success">
                3
              </div>
              <div>
                <h3 className="font-medium text-text-primary">Earn Rewards</h3>
                <p className="text-sm text-text-secondary">Get 2% of all GEMs they mine</p>
              </div>
            </li>
          </ul>
        </div>
      </main>

      {/* Navigation */}
      <nav className="w-full bg-background-dark backdrop-blur-md z-50">
        <div className="flex justify-between items-center px-8 py-3 mx-auto max-w-md border-t border-border-medium">
          <motion.button 
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
          </motion.button>

          <motion.button 
            onClick={() => onNavigate('upgrade')}
            className="flex flex-col items-center gap-1.5 text-text-secondary group relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ fill: 'var(--fill-light)' }}>
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <span className="text-sm font-medium tracking-wide">Upgrade</span>
          </motion.button>

          <motion.button 
            className="flex flex-col items-center gap-1.5 text-text-primary group relative"
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
    </div>
  );
}

export default ReferralPage;