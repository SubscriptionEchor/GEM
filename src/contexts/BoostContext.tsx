import React, { createContext, useContext, useState, useEffect } from 'react'
import getSupabaseClient from '../utils/supabaseClient'
import settings from '../settings'

export interface Boost {
  id: string
  name: string
  type: string
  boost: number
  equipment: string
  expiresAt: number
}

interface BoostContextType {
  activeBoosts: Boost[]
  addBoost: (boost: Omit<Boost, 'expiresAt'>, duration: number) => Promise<void>
  removeExpiredBoosts: () => void
  getTotalBoost: () => number
  getBoostCountByType: (type: string) => number
  calculateBoostEffectiveness: (type: string) => number
  isLoadingBoosts: boolean
  error: string | null
  fetchBoosts: () => Promise<void>
}

const BoostContext = createContext<BoostContextType | undefined>(undefined)

export const BoostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeBoosts, setActiveBoosts] = useState<Boost[]>([])
  const [isLoadingBoosts, setIsLoadingBoosts] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBoosts = async () => {
    try {
      setIsLoadingBoosts(true)
      setError(null)

      const supabase = getSupabaseClient()
      const { data, error: boostsError } = await supabase
        .from('boosts')
        .select('*')
        .eq('status', true)
        .gt('end_time', new Date().toISOString())

      if (boostsError) throw boostsError

      if (data) {
        // Transform database boosts to application format
        const transformedBoosts: Boost[] = data.map(boost => {
          let boostName = '24-Hour Boost'
          let equipment = 'Bronze'

          if (boost.boost_type === '3d') {
            boostName = '3-Day Boost'
            equipment = 'Silver'
          } else if (boost.boost_type === '7d') {
            boostName = '7-Day Boost'
            equipment = 'Gold'
          }

          return {
            id: boost.id.toString(),
            name: boostName,
            type: boost.boost_type,
            boost: settings.BASE_BOOST_RATE, // Standard boost amount as per docs
            equipment,
            expiresAt: new Date(boost.end_time).getTime()
          }
        })

        setActiveBoosts(transformedBoosts)
      }
    } catch (err) {
      console.error('Error fetching boosts:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch boosts')
    } finally {
      setIsLoadingBoosts(false)
    }
  }

  // Fetch boosts on mount
  useEffect(() => {
    fetchBoosts()

    // Set up interval to check for expired boosts
    const interval = setInterval(removeExpiredBoosts, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  const getBoostCountByType = (type: string): number => {
    return activeBoosts.filter(boost => boost.type === type).length
  }

  const calculateBoostEffectiveness = (type: string): number => {
    const count = getBoostCountByType(type)
    if (count === 0) return 1 // First boost is 100% effective
    if (count === 1) return 0.9 // Second boost is 90% effective
    if (count === 2) return 0.8 // Third boost is 80% effective
    return Math.max(0.5, 1 - (count * 0.1)) // Minimum 50% effectiveness
  }

  const addBoost = async (boost: Omit<Boost, 'expiresAt'>, duration: number) => {
    try {
      setError(null)

      const supabase = getSupabaseClient()
      const { error: boostError } = await supabase.rpc('add_boost', {
        p_boost_type: boost.type
      })

      if (boostError) throw boostError

      // After successful Supabase call, update local state
      const expiresAt = Date.now() + (duration * 60 * 60 * 1000) // Convert hours to milliseconds
      setActiveBoosts(prev => [...prev, { ...boost, expiresAt }])

      // Refetch to ensure synchronization with server
      await fetchBoosts()
    } catch (err) {
      console.error('Failed to add boost:', err)
      setError(err instanceof Error ? err.message : 'Failed to add boost')
      throw err
    }
  }

  const removeExpiredBoosts = () => {
    const now = Date.now()
    setActiveBoosts(prev => prev.filter(boost => boost.expiresAt > now))
  }

  const getTotalBoost = () => {
    // Group boosts by type and apply diminishing returns
    const boostsByType = activeBoosts.reduce((acc, boost) => {
      acc[boost.type] = acc[boost.type] || []
      acc[boost.type].push(boost)
      return acc
    }, {} as Record<string, Boost[]>)

    return Object.entries(boostsByType).reduce((total, [_, boosts]) => {
      return total + boosts.reduce((typeTotal, boost, index) => {
        const effectiveness = 1 - (index * 0.1) // Decrease by 10% for each additional boost
        return typeTotal + (boost.boost * Math.max(0.5, effectiveness)) // Minimum 50% effectiveness
      }, 0)
    }, 0)
  }

  return (
    <BoostContext.Provider value={{
      activeBoosts,
      addBoost,
      removeExpiredBoosts,
      getTotalBoost,
      getBoostCountByType,
      calculateBoostEffectiveness,
      isLoadingBoosts,
      error,
      fetchBoosts
    }}>
      {children}
    </BoostContext.Provider>
  )
}

export const useBoost = () => {
  const context = useContext(BoostContext)
  if (context === undefined) {
    throw new Error('useBoost must be used within a BoostProvider')
  }
  return context
}