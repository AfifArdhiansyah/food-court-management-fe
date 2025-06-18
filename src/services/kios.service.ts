import { AxiosResponse } from 'axios'
import { BaseService } from './base.service'
import { Kios, CreateKiosRequest, ApiResponse } from '@/types'

class KiosService extends BaseService {
  async getKios(): Promise<ApiResponse<Kios[]>> {
    const response: AxiosResponse<ApiResponse<Kios[]>> = await this.api.get('/kios/')
    return response.data
  }

  async getKiosById(id: number): Promise<ApiResponse<Kios>> {
    const response: AxiosResponse<ApiResponse<Kios>> = await this.api.get(`/kios/${id}`)
    return response.data
  }

  async createKios(data: CreateKiosRequest): Promise<ApiResponse<Kios>> {
    const response: AxiosResponse<ApiResponse<Kios>> = await this.api.post('/kios/', data)
    return response.data
  }

  async updateKios(id: number, data: Partial<CreateKiosRequest>): Promise<ApiResponse<Kios>> {
    const response: AxiosResponse<ApiResponse<Kios>> = await this.api.put(`/kios/${id}`, data)
    return response.data
  }

  async deleteKios(id: number): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.delete(`/kios/${id}`)
    return response.data
  }

  async getKiosStats(id: number): Promise<ApiResponse<{
    total_orders: number
    total_revenue: number
    pending_orders: number
    completed_orders: number
  }>> {
    const response = await this.api.get(`/kios/${id}/stats`)
    return response.data
  }
}

export const kiosService = new KiosService()
