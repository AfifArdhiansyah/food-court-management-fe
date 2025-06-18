import { AxiosResponse } from 'axios'
import { BaseService } from './base.service'
import { Menu, CreateMenuRequest, ApiResponse } from '@/types'

class MenuService extends BaseService {
  async getMenusByKios(kiosId: number, params?: { 
    category?: string
    available?: boolean
    search?: string
  }): Promise<ApiResponse<Menu[]>> {
    const response: AxiosResponse<ApiResponse<Menu[]>> = await this.api.get(`/kios/${kiosId}/menus`, { params })
    return response.data
  }

  async getMenuById(id: number): Promise<ApiResponse<Menu>> {
    const response: AxiosResponse<ApiResponse<Menu>> = await this.api.get(`/menus/${id}`)
    return response.data
  }

  async createMenu(kiosId: number, data: CreateMenuRequest): Promise<ApiResponse<Menu>> {
    const response: AxiosResponse<ApiResponse<Menu>> = await this.api.post(`/kios/${kiosId}/menus`, data)
    return response.data
  }

  async updateMenu(id: number, data: Partial<CreateMenuRequest>): Promise<ApiResponse<Menu>> {
    const response: AxiosResponse<ApiResponse<Menu>> = await this.api.put(`/menus/${id}`, data)
    return response.data
  }

  async deleteMenu(id: number): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.delete(`/menus/${id}`)
    return response.data
  }

  async toggleMenuAvailability(id: number): Promise<ApiResponse<Menu>> {
    const response: AxiosResponse<ApiResponse<Menu>> = await this.api.patch(`/menus/${id}/toggle-availability`)
    return response.data
  }

  async getPopularMenus(kiosId?: number): Promise<ApiResponse<Menu[]>> {
    const endpoint = kiosId ? `/kios/${kiosId}/menus/popular` : '/menus/popular'
    const response: AxiosResponse<ApiResponse<Menu[]>> = await this.api.get(endpoint)
    return response.data
  }
}

export const menuService = new MenuService()
