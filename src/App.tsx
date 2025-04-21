import { useEffect, useState } from 'react'
import SplashScreen from './components/SplashScreen'
import HomePage from './components/HomePage'
import UpgradePage from './components/UpgradePage'
import SpinPage from './components/SpinPage'
import ReferralPage from './components/ReferralPage'
import LeaderboardPage from './components/LeaderboardPage'
import { BoostProvider } from './contexts/BoostContext'
import { MiningProvider } from './contexts/MiningContext'
import { AuthProvider } from './contexts/AuthContext'
import Navigation from './components/Navigation'
import axios from 'axios'
import config from './config'

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [currentPage, setCurrentPage] = useState('home')

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem('jwt_token')

      if (!token) {
        try {
          // @ts-ignore: 'window.Telegram' is possibly 'undefined'
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          let initData = window.Telegram?.WebApp?.initDataUnsafe

          // initData = {
          //   user: {
          //     id: 1,
          //     first_name: 'test',
          //     last_name: '',
          //     username: 'test',
          //     language_code: 'en'
          //   },
          //   hash: 'testhash'
          // }

          // Parse any referral code from startParam if it exists
          const referralCode = initData?.start_param || null

          // Send both initData and referralCode to the backend
          const response = await axios.post(`${config.baseURL}/login`, {
            initData,
            referralCode
          })

          // Save the token
          const { token } = response.data
          if (token) {
            localStorage.setItem('jwt_token', token)
          }
        } catch (error) {
          console.error('Failed to validate Telegram init data:', error)
        }
      }
    }

    checkLogin().catch((error) => {
      console.error('Error during login check:', error)
    })

  }, [])


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
                  {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
                  {currentPage === 'spin' && <SpinPage />}
                  {currentPage === 'upgrade' && <UpgradePage onNavigate={setCurrentPage} />}
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
  )
}

export default App