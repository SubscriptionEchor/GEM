import { createClient, SupabaseClient } from '@supabase/supabase-js'
import axios from 'axios'
import config from '../config'

// Access environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yfplgpkkgfjzrhvbffbv.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcGxncGtrZ2ZqenJodmJmZmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0ODkxNzQsImV4cCI6MjA2MDA2NTE3NH0.WOenG5O_6Oig0GQjlU40DW_1KzMso7zaW3mEENVnt8c'

let supabaseClient: SupabaseClient | null = null
const REFRESH_TOKEN_THRESHOLD = 10 * 60 * 1000 // 10 minutes in milliseconds

const isTokenExpiringSoon = (token: string): boolean => {
  try {
    const base64Payload = token.split('.')[1]
    const payload = JSON.parse(atob(base64Payload))

    if (!payload.exp) return true

    const expirationTime = payload.exp * 1000 // Convert to milliseconds
    const currentTime = Date.now()

    return (expirationTime - currentTime) < REFRESH_TOKEN_THRESHOLD
  } catch (error) {
    console.error('Error decoding JWT token:', error)
    return true
  }
}

const refreshToken = async () => {
  try {
    // @ts-ignore: 'window.Telegram' is possibly 'undefined'
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    const initData = window.Telegram?.WebApp?.initDataUnsafe
    const response = await axios.post(`${config.baseURL}/login`, {
      initData,
    })
    if (!response.data || !response.data.token) {
      console.error('No token received from refresh token request')
      return
    }
    // Save the new token
    localStorage.setItem('jwt_token', response.data.token)
    supabaseClient = null // Reset supabase client to force reinitialization
  } catch (error) {
    console.error('Failed to refresh token:', error)
  }
}

// Create supabase client
const getSupabaseClient = (): SupabaseClient => {
  let token = localStorage.getItem('jwt_token')
  if (token && isTokenExpiringSoon(token)) {
    refreshToken()
  }

  if (supabaseClient) {
    return supabaseClient
  }

  if (!token) {
    return createClient(supabaseUrl, supabaseAnonKey)
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    }
  })

  supabaseClient.auth.onAuthStateChange(async (event, _session) => {
    if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_OUT') {
      supabaseClient = null
      await refreshToken()
    }
  })

  return supabaseClient
}

export default getSupabaseClient