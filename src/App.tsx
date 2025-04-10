import SplashScreen from './components/SplashScreen';
import HomePage from './components/HomePage';
import UpgradePage from './components/UpgradePage';
import ReferralPage from './components/ReferralPage';
import { useState, useEffect } from 'react';
import { BoostProvider } from './contexts/BoostContext';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app">
      <BoostProvider>
        {showSplash ? (
          <SplashScreen />
        ) : (
          <>
            {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
            {currentPage === 'upgrade' && <UpgradePage onNavigate={setCurrentPage} />}
            {currentPage === 'referral' && <ReferralPage onNavigate={setCurrentPage} />}
          </>
        )}
      </BoostProvider>
    </div>
  );
}

export default App;