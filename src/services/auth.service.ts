import { AxiosResponse } from 'axios'
import { BaseService } from './base.service'
import { LoginRequest, LoginResponse, User, ApiResponse } from '@/types'
import { tokenUtils, userUtils, clearAuthData, getCurrentUser } from '@/lib/cookies'

class AuthService extends BaseService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.api.post('/auth/login', credentials)

    // Store token and user data in cookies
    if (response.data.token) {
      tokenUtils.set(response.data.token)
      userUtils.set(response.data.user)
    }

    return response.data
  }

  async getMe(): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/me')
    return response.data
  }

  async register(data: {
    username: string
    email: string
    password: string
    full_name: string
    role?: string
  }): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.post('/auth/register', data)
    return response.data
  }

  async refreshToken(): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.api.post('/auth/refresh')
    return response.data
  }

  logout(): void {
    clearAuthData()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  /**
   * Get current user from cookies (for SSR compatibility)
   */
  getCurrentUser(): User | null {
    return getCurrentUser()
  }
}

export const authService = new AuthService()
