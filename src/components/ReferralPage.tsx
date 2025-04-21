import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatNumber } from '../utils/numberUtils'
import getSupabaseClient from '../utils/supabaseClient'
import config from '../config'
import settings from '../settings'

interface ReferralPageProps { }

interface ReferralStats {
  referralCode: string
  totalReferrals: number
  totalEarned: number
}

const ReferralPage: React.FC<ReferralPageProps> = () => {
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    referralCode: 'Loading...',
    totalReferrals: 0,
    totalEarned: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showCopyFeedback, setShowCopyFeedback] = useState(false)
  const [showShareFallback, setShowShareFallback] = useState(false)
  const refUrl = `${config.telegramUrl}?startapp=${referralStats.referralCode}`

  useEffect(() => {
    fetchReferralData()
  }, [])

  const fetchReferralData = async () => {
    try {
      setIsLoading(true)
      const supabase = getSupabaseClient()

      // Use the new RPC function to get referral stats
      const { data, error } = await supabase
        .from('user')
        .select('balance, referral_code, total_referrals, referred_earnings')
        .single()


      if (error) throw error

      if (data) {
        const stats = data
        setReferralStats({
          referralCode: stats.referral_code || 'ERROR',
          totalReferrals: parseInt(stats.total_referrals) || 0,
          totalEarned: parseFloat(stats.referred_earnings) || 0
        })
      }
    } catch (error) {
      console.error('Error fetching referral data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(
        refUrl
      )
      setShowCopyFeedback(true)
      setTimeout(() => setShowCopyFeedback(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'GEM Token Mining - Join & Earn',
        text: `Join me on GEM Token Mining! Use my referral code ${referralStats.referralCode} to start mining and we'll both earn rewards. Base mining rate: ${settings.BASE_MINING_RATE} GEM/hour`,
        url: refUrl,
      })
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        handleCopyCode()
        setShowShareFallback(true)
        setTimeout(() => setShowShareFallback(false), 3000)
      }
    }
  }

  return (
    <main className="p-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Referral Program</h1>
      </div>

      {/* Detailed Referral Analytics */}
      <div className="bg-background-darker rounded-xl p-4 border border-border-medium mb-6">
        <h2 className="text-lg font-semibold text-text-primary mb-3">Referral Analytics</h2>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <motion.div
            className="bg-background-dark rounded-lg p-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-accent-warning">👥</span>
              <span className="text-sm text-text-secondary">Active Refs</span>
            </div>
            <p className="text-lg font-bold text-text-primary">{referralStats.totalReferrals}</p>
            <p className="text-xs text-text-secondary mt-1">Total</p>
          </motion.div>

          <motion.div
            className="bg-background-dark rounded-lg p-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-accent-success">💎</span>
              <span className="text-sm text-text-secondary">Earned</span>
            </div>
            <p className="text-lg font-bold text-text-primary">{formatNumber(referralStats.totalEarned)}</p>
            <p className="text-xs text-text-secondary mt-1">Total earnings</p>
          </motion.div>
        </div>

        {/* Earnings Rate */}
        <motion.div
          className="bg-background-dark rounded-lg p-3 mb-4"
          whileHover={{ scale: 1.02 }}
          style={{ display: 'none' }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between mb-2 d-none">
            <div className="flex items-center gap-2">
              <span className="text-accent-info">⚡</span>
              <span className="text-sm text-text-secondary">Earning Rate</span>
            </div>
            <p className="text-sm font-medium text-text-primary">
              {formatNumber(referralStats.totalReferrals * 0.1)} GEM/hour
            </p>
          </div>
          <div className="h-1 bg-background-darker rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent-info"
              style={{ width: `${Math.min((referralStats.totalReferrals / 10) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-text-secondary mt-2">
            Based on {referralStats.totalReferrals} active referrals
          </p>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="bg-background-dark rounded-lg p-3"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ display: 'none' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-accent-purple">📊</span>
            <span className="text-sm text-text-secondary">Recent Activity</span>
          </div>
          {referralStats.totalReferrals === 0 ? (
            <p className="text-sm text-text-secondary">No recent activity</p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">Last 24h</span>
                <span className="text-xs font-medium text-text-primary">
                  +{formatNumber(referralStats.totalEarned * 0.1)} GEM
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">Last 7d</span>
                <span className="text-xs font-medium text-text-primary">
                  +{formatNumber(referralStats.totalEarned * 0.4)} GEM
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Referral Code Section */}
      <div className="bg-background-darker rounded-xl p-6 border border-border-medium relative mb-6">
        <h2 className="text-lg font-semibold text-text-primary mb-2">Your Referral Code</h2>
        <p className="text-sm text-text-secondary mb-4">
          Share your code and earn 2% of GEMs mined by referred users
        </p>

        <div className="flex gap-3 mb-6">
          <div className="flex-1 bg-background-dark rounded-xl px-4 py-3 flex items-center justify-between">
            <p className="text-lg font-mono font-bold text-text-primary tracking-wider select-all">
              {isLoading ? '...' : referralStats.referralCode}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyCode}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors duration-200 ${showCopyFeedback
                ? 'text-accent-success'
                : 'text-text-secondary hover:text-text-primary'
                }`}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                {showCopyFeedback ? (
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                ) : (
                  <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 0 012 2m0 0h2a2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                )}
              </svg>
              <span className="text-sm font-medium">{showCopyFeedback ? 'Copied!' : 'Copy'}</span>
            </motion.button>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleShare}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-info to-accent-purple text-white font-medium"
        >
          Share on Telegram
        </motion.button>

        {/* Share Fallback Toast */}
        <AnimatePresence>
          {showShareFallback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-background-dark text-text-primary text-sm px-4 py-2 rounded-lg shadow-lg border border-border-medium whitespace-nowrap"
            >
              Code copied! Share with friends on Telegram
            </motion.div>
          )}
        </AnimatePresence>
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
              <h3 className="font-medium text-text-primary mb-0.5">Share Your Code</h3>
              <p className="text-sm text-text-secondary">Send your unique referral code to friends</p>
            </div>
          </li>
          <li className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-accent-warning/20 flex items-center justify-center text-accent-warning">
              2
            </div>
            <div>
              <h3 className="font-medium text-text-primary mb-0.5">Friends Start Mining</h3>
              <p className="text-sm text-text-secondary">They use your code when they join</p>
            </div>
          </li>
          <li className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-accent-success/20 flex items-center justify-center text-accent-success">
              3
            </div>
            <div>
              <h3 className="font-medium text-text-primary mb-0.5">Earn Rewards</h3>
              <p className="text-sm text-text-secondary">Get 2% of all GEMs they mine</p>
            </div>
          </li>
        </ul>
      </div>
    </main>
  )
}

export default ReferralPage
