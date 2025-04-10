import React from 'react';
import { motion } from 'framer-motion';

const SplashScreen: React.FC = () => {
  return (
    <motion.div 
      className="splash-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="logo-container">
        <motion.h1 
          className="logo"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 1.2,
            ease: "easeOut",
            delay: 0.3
          }}
          style={{ fontWeight: 500 }}
        >
          GEM
        </motion.h1>
      </div>
    </motion.div>
  );
};

export default SplashScreen;