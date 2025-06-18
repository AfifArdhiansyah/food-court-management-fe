import { AxiosResponse } from 'axios'
import { BaseService } from './base.service'
import { Order, CreateOrderRequest, UpdateOrderStatusRequest, ApiResponse, Kios } from '@/types'

class OrderService extends BaseService {
  async getAllOrders(params?: {
    status?: string
    date?: string
    kios_id?: number
  }): Promise<ApiResponse<Order[]>> {
    // Get all kios first, then get orders from each
    const kiosResponse = await this.api.get('/kios/')
    const allKios = kiosResponse.data?.data || []

    const orderPromises = allKios.map((kios: Kios) =>
      this.getOrdersByKios(kios.id, params).then(response => response.data || [])
    )

    const allOrdersArrays = await Promise.all(orderPromises)
    const allOrders = allOrdersArrays.flat().sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return { data: allOrders, message: 'Success' }
  }

  async getOrdersByKios(kiosId: number, params?: { 
    status?: string
    date?: string
    limit?: number
    offset?: number
  }): Promise<ApiResponse<Order[]>> {
    const response: AxiosResponse<ApiResponse<Order[]>> = await this.api.get(`/kios/${kiosId}/orders`, { params })
    return response.data
  }

  async getOrderById(id: number): Promise<ApiResponse<Order>> {
    const response: AxiosResponse<ApiResponse<Order>> = await this.api.get(`/orders/${id}`)
    return response.data
  }

  async createOrder(data: CreateOrderRequest): Promise<ApiResponse<Order>> {
    const response: AxiosResponse<ApiResponse<Order>> = await this.api.post(`/kios/${data.kios_id}/orders`, data)
    return response.data
  }

  async updateOrderStatus(id: number, data: UpdateOrderStatusRequest): Promise<ApiResponse<Order>> {
    const response: AxiosResponse<ApiResponse<Order>> = await this.api.put(`/orders/${id}/status`, data)
    return response.data
  }

  async getQueue(kiosId: number): Promise<ApiResponse<Order[]>> {
    const response: AxiosResponse<ApiResponse<Order[]>> = await this.api.get(`/kios/${kiosId}/queue`)
    return response.data
  }

  async cancelOrder(id: number): Promise<ApiResponse<Order>> {
    const response: AxiosResponse<ApiResponse<Order>> = await this.api.put(`/orders/${id}/cancel`)
    return response.data
  }

  async getOrderHistory(params?: {
    start_date?: string
    end_date?: string
    kios_id?: number
    status?: string
  }): Promise<ApiResponse<Order[]>> {
    const response: AxiosResponse<ApiResponse<Order[]>> = await this.api.get('/orders/history', { params })
    return response.data
  }

  async getOrderStats(kiosId?: number): Promise<ApiResponse<{
    total_orders: number
    total_revenue: number
    average_order_value: number
    orders_by_status: Record<string, number>
  }>> {
    const endpoint = kiosId ? `/kios/${kiosId}/orders/stats` : '/orders/stats'
    const response = await this.api.get(endpoint)
    return response.data
  }
}

export const orderService = new OrderService()
