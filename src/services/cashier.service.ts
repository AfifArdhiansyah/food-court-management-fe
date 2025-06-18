import { AxiosResponse } from 'axios'
import { BaseService } from './base.service'
import { Order, ApiResponse } from '@/types'

class CashierService extends BaseService {
  async getTodayOrders(kiosId?: number): Promise<ApiResponse<Order[]>> {
    const today = new Date().toISOString().split('T')[0]
    const endpoint = kiosId ? `/kios/${kiosId}/orders` : '/orders'
    const response: AxiosResponse<ApiResponse<Order[]>> = await this.api.get(endpoint, {
      params: { date: today }
    })
    return response.data
  }

  async getPendingOrders(kiosId?: number): Promise<ApiResponse<Order[]>> {
    const endpoint = kiosId ? `/kios/${kiosId}/orders` : '/orders'
    const response: AxiosResponse<ApiResponse<Order[]>> = await this.api.get(endpoint, {
      params: { status: 'pending' }
    })
    return response.data
  }

  async getActiveQueue(kiosId: number): Promise<ApiResponse<Order[]>> {
    const response: AxiosResponse<ApiResponse<Order[]>> = await this.api.get(`/kios/${kiosId}/queue`)
    return response.data
  }

  async markOrderReady(orderId: number): Promise<ApiResponse<Order>> {
    const response: AxiosResponse<ApiResponse<Order>> = await this.api.put(`/orders/${orderId}/status`, {
      status: 'ready'
    })
    return response.data
  }

  async markOrderCompleted(orderId: number): Promise<ApiResponse<Order>> {
    const response: AxiosResponse<ApiResponse<Order>> = await this.api.put(`/orders/${orderId}/status`, {
      status: 'completed'
    })
    return response.data
  }

  async getDailySummary(kiosId?: number, date?: string): Promise<ApiResponse<{
    total_orders: number
    total_revenue: number
    orders_by_status: Record<string, number>
    popular_items: Array<{
      menu_name: string
      quantity: number
      revenue: number
    }>
  }>> {
    const targetDate = date || new Date().toISOString().split('T')[0]
    const endpoint = kiosId ? `/kios/${kiosId}/summary` : '/summary'
    const response = await this.api.get(endpoint, {
      params: { date: targetDate }
    })
    return response.data
  }

  async processPayment(orderId: number, paymentMethod: string): Promise<ApiResponse<Order>> {
    const response: AxiosResponse<ApiResponse<Order>> = await this.api.put(`/orders/${orderId}/payment`, {
      payment_method: paymentMethod
    })
    return response.data
  }
}

export const cashierService = new CashierService()
