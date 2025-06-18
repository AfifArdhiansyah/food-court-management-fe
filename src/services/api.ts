// Legacy API service for backward compatibility
// This file maintains the old interface while delegating to new services

import { authService, kiosService, menuService, orderService } from './index'

class ApiService {
  // Auth methods
  login = authService.login.bind(authService)
  getMe = authService.getMe.bind(authService)

  // Kios methods
  getKios = kiosService.getKios.bind(kiosService)
  getKiosById = kiosService.getKiosById.bind(kiosService)
  createKios = kiosService.createKios.bind(kiosService)
  updateKios = kiosService.updateKios.bind(kiosService)
  deleteKios = kiosService.deleteKios.bind(kiosService)

  // Menu methods
  getMenusByKios = menuService.getMenusByKios.bind(menuService)
  createMenu = menuService.createMenu.bind(menuService)
  updateMenu = menuService.updateMenu.bind(menuService)
  deleteMenu = menuService.deleteMenu.bind(menuService)

  // Order methods
  getAllOrders = orderService.getAllOrders.bind(orderService)
  getOrdersByKios = orderService.getOrdersByKios.bind(orderService)
  getOrderById = orderService.getOrderById.bind(orderService)
  createOrder = orderService.createOrder.bind(orderService)
  updateOrderStatus = orderService.updateOrderStatus.bind(orderService)
  getQueue = orderService.getQueue.bind(orderService)
}

export const apiService = new ApiService()
export default apiService
