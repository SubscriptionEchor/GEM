import SplashScreen from './components/SplashScreen';
import HomePage from './components/HomePage';
import UpgradePage from './components/UpgradePage';
import ReferralPage from './components/ReferralPage';
import { useState, useEffect } from 'react';
import { BoostProvider } from './contexts/BoostContext';
import Navigation from './components/Navigation';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { initializeTelegramWebApp } from './lib/telegram';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');

  if (loading) {
    return <SplashScreen />;
  }

  if (!user) {
    return (
      <div className="fixed inset-0 bg-background-primary flex items-center justify-center">
        <p className="text-text-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <BoostProvider>
      <div className="fixed inset-0 bg-background-primary flex flex-col">
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {currentPage === 'home' && <HomePage />}
          {currentPage === 'upgrade' && <UpgradePage />}
          {currentPage === 'referral' && <ReferralPage />}
        </div>
        <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      </div>
    </BoostProvider>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Initialize Telegram WebApp
    initializeTelegramWebApp();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <div className="app">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </div>
  );
}

export default App;