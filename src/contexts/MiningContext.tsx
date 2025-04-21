import React, { createContext, useContext, useState, useEffect } from 'react'
import { useBoost } from './BoostContext'
import getSupabaseClient from '../utils/supabaseClient'
import { delay } from '../utils/timeUtils'
import settings from '../settings'

interface MiningStatusResponse {
  is_mining: boolean
  time_remaining: string
  current_rate: number
  balance: number
  total_referrals: number
}

interface MiningContextType {
  miningActive: boolean
  timeRemaining: number
  miningRate: number
  balance: number
  spinCount: number
  setSpinCount: React.Dispatch<React.SetStateAction<number>>
  referralCount: number
  error: string | null
  startMining: () => Promise<void>
}

const MiningContext = createContext<MiningContextType | undefined>(undefined)

export const MiningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [miningActive, setMiningActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(24 * 60 * 60) // 24 hours in seconds
  const [miningRate, setMiningRate] = useState(settings.BASE_MINING_RATE) // Base mining rate: 5 GEM/hour
  const [error, setError] = useState<string | null>(null)
  const [balance, setBalance] = useState(0)
  const [spinCount, setSpinCount] = useState(0)
  const [referralCount, setReferralCount] = useState(0)
  const { getTotalBoost } = useBoost()

  const fetchMiningStatus = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data, error: supabaseError } = await supabase.rpc('get_mining_status')

      if (supabaseError) throw supabaseError

      if (data) {
        const miningStatus = data?.[0] as MiningStatusResponse
        setMiningActive(miningStatus.is_mining)
        setBalance(
          parseFloat(String(miningStatus?.balance)) || 0
        )
        setReferralCount(
          parseInt(String(miningStatus?.total_referrals)) || 0
        )

        // Convert time_remaining from PostgreSQL interval to seconds
        if (miningStatus.is_mining && miningStatus.time_remaining) {
          const intervalParts = miningStatus.time_remaining.match(/(\d+):(\d+):(\d+)/)
          if (intervalParts && intervalParts.length === 4) {
            const hours = parseInt(intervalParts[1])
            const minutes = parseInt(intervalParts[2])
            const seconds = parseInt(intervalParts[3])
            const totalSeconds = hours * 3600 + minutes * 60 + seconds
            setTimeRemaining(totalSeconds)
          }
        }

        // Set mining rate from database
        if (miningStatus.current_rate) {
          setMiningRate(miningStatus.current_rate)
        }
        const { data: spinData, error: _spinError } = await supabase.rpc('get_remaining_spins')
        if (spinData) {
          setSpinCount(parseInt(spinData) || 0)
        }

        // console.log('Mining status fetched:', miningStatus, 'Mining rate:', miningStatus.current_rate)
        // console.log('Time remaining:', miningStatus.time_remaining)
        // console.log('Mining active:', miningStatus.is_mining)
      } else {
        console.error('No mining status data returned')
      }
    } catch (error) {
      console.error('Error fetching mining status:', error)
      if (error instanceof Error) {
        setError(error.message)
      }
    }
  }

  // Fetch mining status on component mount
  useEffect(() => {
    fetchMiningStatus()
  }, [])

  useEffect(() => {
    const baseRate = settings.BASE_MINING_RATE
    setMiningRate(baseRate + getTotalBoost())
  }, [getTotalBoost])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (miningActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = Math.max(0, prev - 1)
          // If time runs out, stop mining
          if (newTime === 0) {
            setMiningActive(false)
          }
          return newTime
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [miningActive, timeRemaining])

  const startMining = async () => {
    try {
      setError(null)

      // Check if already mining
      if (miningActive && timeRemaining > 0) {
        return
      }

      // Call Supabase RPC to start mining
      const supabase = getSupabaseClient()
      const { error: supabaseError } = await supabase.rpc('start_mining')

      if (supabaseError) throw supabaseError

      await delay(2) // Wait for 2 seconds to allow the server to process the request
      await fetchMiningStatus() // Fetch the updated mining status
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to initialize mining session')
      }
      if (miningActive) {
        setMiningActive(false)
      }
      throw error
    }
  }

  return (
    <MiningContext.Provider
      value={{
        miningActive,
        timeRemaining,
        miningRate,
        error,
        balance,
        startMining,
        spinCount,
        setSpinCount,
        referralCount,
      }}
    >
      {children}
    </MiningContext.Provider>
  )
}

export const useMining = () => {
  const context = useContext(MiningContext)
  if (context === undefined) {
    throw new Error('useMining must be used within a MiningProvider')
  }
  return context
}