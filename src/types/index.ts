export type UserRole = 'cashier' | 'kios'

export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'ready' | 'completed' | 'cancelled'

export type PaymentMethod = 'cash' | 'card' | 'digital'

export type MenuCategory = 'food' | 'drink' | 'snack' | 'dessert'

export interface User {
  id: number
  username: string
  email: string
  full_name: string
  role: UserRole
  is_active: boolean
  kios_id?: number
  kios?: Kios
}

export interface Kios {
  id: number
  name: string
  description: string
  location: string
  is_active: boolean
  menu_count: number
  order_count: number
  created_at: string
  updated_at: string
  menus?: Menu[]
  orders?: Order[]
}

export interface Menu {
  id: number
  kios_id: number
  kios_name: string
  name: string
  description: string
  price: number
  category: MenuCategory
  image_url: string
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: number
  menu_id: number
  menu_name: string
  quantity: number
  price: number
  subtotal: number
  notes: string
}

export interface Order {
  id: number
  queue_number: string
  kios_id: number
  kios_name: string
  customer_name: string
  status: OrderStatus
  total_amount: number
  payment_method?: PaymentMethod
  paid_at?: string
  prepared_at?: string
  ready_at?: string
  completed_at?: string
  notes: string
  order_items: OrderItem[]
  created_by: number
  creator_name: string
  created_at: string
  updated_at: string
}

// API Request/Response types
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface CreateKiosRequest {
  name: string
  description: string
  location: string
  is_active?: boolean
}

export interface CreateMenuRequest {
  name: string
  description: string
  price: number
  category: 'food' | 'drink' | 'snack' | 'dessert'
  image_url?: string
  is_available?: boolean
}

export interface CreateOrderRequest {
  kios_id: number
  customer_name?: string
  notes?: string
  items: CreateOrderItemRequest[]
}

export interface CreateOrderItemRequest {
  menu_id: number
  quantity: number
  notes?: string
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus
  payment_method?: PaymentMethod
}

export interface ApiResponse<T> {
  data?: T
  message?: string
  error?: string
  details?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}
