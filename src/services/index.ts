// Export all services
export { authService } from './auth.service'
export { kiosService } from './kios.service'
export { menuService } from './menu.service'
export { orderService } from './order.service'
export { cashierService } from './cashier.service'

// Export base service for extending
export { BaseService } from './base.service'

// Legacy API service for backward compatibility
export { default as apiService } from './api'
