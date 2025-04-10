import React from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import diamondAnimation from '../assets/animations/diamond.json';

interface LeaderboardPageProps {}

const LeaderboardPage: React.FC<LeaderboardPageProps> = () => {
  return (
    <main className="p-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Leaderboard</h1>
      </div>

      {/* Coming Soon Content */}
      <div className="flex flex-col items-center justify-center mt-20 text-center">
        <motion.div
          className="w-32 h-32 mb-6"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 4,
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

        <h2 className="text-xl font-bold text-text-primary mb-3">
          Coming Soon!
        </h2>
        
        <p className="text-text-secondary max-w-sm mb-6">
          We're working on an exciting leaderboard feature to showcase top miners and referrers.
          Stay tuned for updates!
        </p>

        <div className="bg-background-darker rounded-xl p-6 border border-border-medium w-full max-w-sm">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Planned Features
          </h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-primary/20 flex items-center justify-center text-accent-primary">
                🏆
              </div>
              <span className="text-text-secondary">Top Miners Ranking</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-warning/20 flex items-center justify-center text-accent-warning">
                👥
              </div>
              <span className="text-text-secondary">Top Referrers Board</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-success/20 flex items-center justify-center text-accent-success">
                🎁
              </div>
              <span className="text-text-secondary">Special Rewards</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
};

export default LeaderboardPage;