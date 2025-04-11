import React from 'react';
import { motion } from 'framer-motion';
import { formatNumber } from '../utils/numberUtils';

interface AnalyticsProps {
  totalAvailableGems: number;
  totalReferrals: number;
  onNavigate: (page: string) => void;
}

const Analytics: React.FC<AnalyticsProps> = ({
  totalAvailableGems,
  totalReferrals,
  onNavigate
}) => {
  return (
    <div className="bg-background-darker rounded-xl p-4 border border-border-medium mb-6">
      <h2 className="text-lg font-semibold text-text-primary mb-3">Analytics</h2>
      
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          className="bg-background-dark rounded-lg p-3"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-accent-primary">⚡</span>
            <span className="text-sm text-text-secondary">Available</span>
          </div>
          <p className="text-lg font-bold text-text-primary">
            {totalAvailableGems.toFixed(1)}
          </p>
        </motion.div>

        <motion.div
          className="bg-background-dark rounded-lg p-3"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('spin')}
          style={{ cursor: 'pointer' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-accent-warning">🎲</span>
            <span className="text-sm text-text-secondary">Spin</span>
          </div>
          <p className="text-lg font-bold text-text-primary">
            0
          </p>
        </motion.div>

        <motion.div
          className="bg-background-dark rounded-lg p-3"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-accent-warning">👥</span>
            <span className="text-sm text-text-secondary">Refs</span>
          </div>
          <p className="text-lg font-bold text-text-primary">
            {totalReferrals}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;