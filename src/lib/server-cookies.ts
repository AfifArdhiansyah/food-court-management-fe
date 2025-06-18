import { cookies } from 'next/headers'
import { COOKIE_KEYS } from './cookies'
import { User } from '@/types'

/**
 * Server-side cookie utilities for Next.js App Router
 * Use these in Server Components and Server Actions
 */

/**
 * Get authentication token from cookies (server-side)
 */
export async function getServerToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_KEYS.TOKEN)?.value
    return token || null
  } catch (error) {
    console.error('Error getting server token:', error)
    return null
  }
}

/**
 * Get user data from cookies (server-side)
 */
export async function getServerUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const userData = cookieStore.get(COOKIE_KEYS.USER)?.value

    if (!userData) return null

    return JSON.parse(userData) as User
  } catch (error) {
    console.error('Error getting server user:', error)
    return null
  }
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isServerAuthenticated(): Promise<boolean> {
  const token = await getServerToken()
  return !!token
}

/**
 * Get current authenticated user (server-side)
 */
export async function getCurrentServerUser(): Promise<User | null> {
  if (!(await isServerAuthenticated())) return null
  return await getServerUser()
}
