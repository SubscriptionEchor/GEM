import SplashScreen from './components/SplashScreen';
import HomePage from './components/HomePage';
import UpgradePage from './components/UpgradePage';
import ReferralPage from './components/ReferralPage';
import LeaderboardPage from './components/LeaderboardPage';
import { useState, useEffect } from 'react';
import { BoostProvider } from './contexts/BoostContext';
import { MiningProvider } from './contexts/MiningContext';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';

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
      <AuthProvider>
        <BoostProvider>
          <MiningProvider>
            {showSplash ? (
              <SplashScreen />
            ) : (
              <div className="fixed inset-0 bg-background-primary flex flex-col">
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                  {currentPage === 'home' && <HomePage />}
                  {currentPage === 'upgrade' && <UpgradePage />}
                  {currentPage === 'referral' && <ReferralPage />}
                  {currentPage === 'leaderboard' && <LeaderboardPage />}
                </div>
                <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
              </div>
            )}
          </MiningProvider>
        </BoostProvider>
      </AuthProvider>
    </div>
  );
}

export default App;