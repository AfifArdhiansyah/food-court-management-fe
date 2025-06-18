# Services Architecture

Struktur services telah dipisahkan berdasarkan konteks untuk memudahkan maintenance dan pengembangan.

## Struktur File

```
src/services/
├── base.service.ts      # Base service dengan konfigurasi axios
├── auth.service.ts      # Authentication & authorization
├── kios.service.ts      # Kios management
├── menu.service.ts      # Menu management
├── order.service.ts     # Order management
├── cashier.service.ts   # Cashier-specific features
├── index.ts            # Export semua services
├── api.ts              # Legacy compatibility layer
└── README.md           # Dokumentasi ini
```

## Penggunaan

### Import Individual Services (Recommended)

```typescript
import { authService, kiosService, menuService } from '@/services'

// Auth
const user = await authService.getMe()
await authService.login({ username, password })

// Kios
const kiosList = await kiosService.getKios()
const kios = await kiosService.getKiosById(1)

// Menu
const menus = await menuService.getMenusByKios(1)
await menuService.createMenu(1, menuData)
```

### Legacy API Service (Backward Compatibility)

```typescript
import { apiService } from '@/services/api'

// Masih bisa digunakan seperti sebelumnya
const user = await apiService.getMe()
const kiosList = await apiService.getKios()
```

## Services Detail

### BaseService
- Konfigurasi axios dasar
- Request/response interceptors
- Token management
- Error handling

### AuthService
- `login(credentials)` - Login user
- `getMe()` - Get current user info
- `register(data)` - Register new user
- `refreshToken()` - Refresh JWT token
- `logout()` - Logout user

### KiosService
- `getKios()` - Get all kios
- `getKiosById(id)` - Get kios by ID
- `createKios(data)` - Create new kios
- `updateKios(id, data)` - Update kios
- `deleteKios(id)` - Delete kios
- `getKiosStats(id)` - Get kios statistics

### MenuService
- `getMenusByKios(kiosId, params?)` - Get menus by kios
- `getMenuById(id)` - Get menu by ID
- `createMenu(kiosId, data)` - Create new menu
- `updateMenu(id, data)` - Update menu
- `deleteMenu(id)` - Delete menu
- `toggleMenuAvailability(id)` - Toggle menu availability
- `getPopularMenus(kiosId?)` - Get popular menus

### OrderService
- `getAllOrders(params?)` - Get all orders
- `getOrdersByKios(kiosId, params?)` - Get orders by kios
- `getOrderById(id)` - Get order by ID
- `createOrder(data)` - Create new order
- `updateOrderStatus(id, data)` - Update order status
- `getQueue(kiosId)` - Get order queue
- `cancelOrder(id)` - Cancel order
- `getOrderHistory(params?)` - Get order history
- `getOrderStats(kiosId?)` - Get order statistics

### CashierService
- `getTodayOrders(kiosId?)` - Get today's orders
- `getPendingOrders(kiosId?)` - Get pending orders
- `getActiveQueue(kiosId)` - Get active queue
- `markOrderReady(orderId)` - Mark order as ready
- `markOrderCompleted(orderId)` - Mark order as completed
- `getDailySummary(kiosId?, date?)` - Get daily summary
- `processPayment(orderId, paymentMethod)` - Process payment

## Migration Guide

Untuk menggunakan services yang baru:

1. **Ganti import lama:**
   ```typescript
   // Lama
   import { apiService } from '@/services/api'
   
   // Baru
   import { authService, kiosService } from '@/services'
   ```

2. **Update method calls:**
   ```typescript
   // Lama
   await apiService.login(credentials)
   await apiService.getKios()
   
   // Baru
   await authService.login(credentials)
   await kiosService.getKios()
   ```

3. **Manfaatkan fitur baru:**
   ```typescript
   // Fitur cashier khusus
   import { cashierService } from '@/services'
   
   const todayOrders = await cashierService.getTodayOrders(kiosId)
   const summary = await cashierService.getDailySummary(kiosId)
   ```

## Keuntungan

1. **Separation of Concerns** - Setiap service fokus pada domain tertentu
2. **Better Maintainability** - Mudah mencari dan mengubah kode
3. **Type Safety** - TypeScript support yang lebih baik
4. **Extensibility** - Mudah menambah fitur baru
5. **Backward Compatibility** - Kode lama tetap berfungsi
6. **Tree Shaking** - Bundle size lebih kecil dengan import selektif
