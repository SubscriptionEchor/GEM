import SplashScreen from './components/SplashScreen';
import HomePage from './components/HomePage';
import { useState, useEffect } from 'react';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app">
      {showSplash ? <SplashScreen /> : <HomePage />}
    </div>
  );
}

export default App;