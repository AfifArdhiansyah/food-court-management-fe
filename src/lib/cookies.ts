import Cookies from 'js-cookie'
import { User } from '@/types'

// Cookie configuration
const COOKIE_CONFIG = {
  // Token expires in 7 days
  TOKEN_EXPIRES: 7,
  // User data expires in 7 days  
  USER_EXPIRES: 7,
  // Cookie options for security
  SECURE_OPTIONS: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax' as const, // CSRF protection
    httpOnly: false, // Allow JS access (needed for client-side)
  }
}

// Cookie keys
export const COOKIE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
} as const

/**
 * Token management utilities
 */
export const tokenUtils = {
  /**
   * Set authentication token in cookie
   */
  set: (token: string): void => {
    // Only set cookies on client-side
    if (typeof window !== 'undefined') {
      Cookies.set(COOKIE_KEYS.TOKEN, token, {
        expires: COOKIE_CONFIG.TOKEN_EXPIRES,
        ...COOKIE_CONFIG.SECURE_OPTIONS,
      })
    }
  },

  /**
   * Get authentication token from cookie
   */
  get: (): string | null => {
    if (typeof window !== 'undefined') {
      // Client-side
      return Cookies.get(COOKIE_KEYS.TOKEN) || null
    }
    // Server-side: return null, let middleware handle auth
    return null
  },

  /**
   * Remove authentication token from cookie
   */
  remove: (): void => {
    if (typeof window !== 'undefined') {
      // Client-side
      Cookies.remove(COOKIE_KEYS.TOKEN)
    }
  },
}

/**
 * User data management utilities
 */
export const userUtils = {
  /**
   * Set user data in cookie
   */
  set: (user: User): void => {
    const userData = JSON.stringify(user)

    if (typeof window !== 'undefined') {
      // Client-side
      Cookies.set(COOKIE_KEYS.USER, userData, {
        expires: COOKIE_CONFIG.USER_EXPIRES,
        ...COOKIE_CONFIG.SECURE_OPTIONS,
      })
    }
  },

  /**
   * Get user data from cookie
   */
  get: (): User | null => {
    try {
      if (typeof window !== 'undefined') {
        // Client-side
        const userData = Cookies.get(COOKIE_KEYS.USER)
        if (!userData) return null
        return JSON.parse(userData) as User
      }
      // Server-side: return null, let middleware handle auth
      return null
    } catch (error) {
      console.error('Error parsing user data from cookie:', error)
      // Remove corrupted cookie
      userUtils.remove()
      return null
    }
  },

  /**
   * Remove user data from cookie
   */
  remove: (): void => {
    if (typeof window !== 'undefined') {
      // Client-side
      Cookies.remove(COOKIE_KEYS.USER)
    }
  },
}

/**
 * Clear all authentication data
 */
export const clearAuthData = (): void => {
  tokenUtils.remove()
  userUtils.remove()
}

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = (): boolean => {
  const token = tokenUtils.get()
  return !!token
}

/**
 * Get current authenticated user
 */
export const getCurrentUser = (): User | null => {
  if (!isAuthenticated()) return null
  return userUtils.get()
}
