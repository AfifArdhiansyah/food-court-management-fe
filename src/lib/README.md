# Cookie-Based Authentication

Implementasi authentication menggunakan cookies untuk kompatibilitas SSR dan keamanan yang lebih baik.

## 🍪 Mengapa Cookies?

### Masalah dengan localStorage:
- ❌ Tidak tersedia di server-side (SSR)
- ❌ Menyebabkan hydration mismatch
- ❌ Tidak aman untuk data sensitif
- ❌ Tidak otomatis dikirim ke server

### Keuntungan Cookies:
- ✅ Tersedia di server-side dan client-side
- ✅ Kompatibel dengan SSR/SSG
- ✅ Otomatis dikirim ke server
- ✅ Dapat dikonfigurasi untuk keamanan (httpOnly, secure, sameSite)
- ✅ Mendukung expiration otomatis

## 📁 Struktur File

```
src/lib/
├── cookies.ts          # Cookie utilities
└── README.md          # Dokumentasi ini

src/middleware.ts      # Route protection middleware
```

## 🔧 Cookie Configuration

```typescript
const COOKIE_CONFIG = {
  TOKEN_EXPIRES: 7,     // Token expires in 7 days
  USER_EXPIRES: 7,      // User data expires in 7 days
  SECURE_OPTIONS: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax',    // CSRF protection
    httpOnly: false,    // Allow JS access (needed for client-side)
  }
}
```

## 🛠️ API Reference

### Token Management

```typescript
import { tokenUtils } from '@/lib/cookies'

// Set token
tokenUtils.set('your-jwt-token')

// Get token (works in SSR and client)
const token = tokenUtils.get()

// Remove token
tokenUtils.remove()
```

### User Data Management

```typescript
import { userUtils } from '@/lib/cookies'

// Set user data
userUtils.set(userObject)

// Get user data
const user = userUtils.get()

// Remove user data
userUtils.remove()
```

### Utility Functions

```typescript
import { isAuthenticated, getCurrentUser, clearAuthData } from '@/lib/cookies'

// Check if user is authenticated
if (isAuthenticated()) {
  // User has valid token
}

// Get current user (returns null if not authenticated)
const user = getCurrentUser()

// Clear all auth data
clearAuthData()
```

## 🔒 Security Features

### 1. **Secure Cookies in Production**
```typescript
secure: process.env.NODE_ENV === 'production'
```
- Cookies hanya dikirim melalui HTTPS di production
- Mencegah man-in-the-middle attacks

### 2. **SameSite Protection**
```typescript
sameSite: 'lax'
```
- Melindungi dari CSRF attacks
- Mengizinkan cookies dikirim pada navigasi normal

### 3. **Automatic Expiration**
```typescript
expires: 7 // days
```
- Token otomatis expired setelah 7 hari
- Mengurangi risiko jika token dicuri

### 4. **Error Handling**
```typescript
try {
  return JSON.parse(userData) as User
} catch (error) {
  console.error('Error parsing user data from cookie:', error)
  userUtils.remove() // Remove corrupted cookie
  return null
}
```
- Otomatis membersihkan cookie yang rusak
- Graceful error handling

## 🛡️ Middleware Protection

File `middleware.ts` melindungi routes secara otomatis:

### Protected Routes
```typescript
const protectedRoutes = [
  '/dashboard',
  '/monitor',
]
```

### Auth Routes (redirect if already logged in)
```typescript
const authRoutes = [
  '/login',
]
```

### Automatic Redirects
- **Not authenticated + protected route** → `/login?redirect=original-path`
- **Authenticated + auth route** → `/dashboard/cashier` or `/dashboard/kios`

## 🔄 Migration dari localStorage

### Before (localStorage):
```typescript
// Set
localStorage.setItem('token', token)
localStorage.setItem('user', JSON.stringify(user))

// Get
const token = localStorage.getItem('token')
const user = JSON.parse(localStorage.getItem('user') || 'null')

// Remove
localStorage.removeItem('token')
localStorage.removeItem('user')
```

### After (Cookies):
```typescript
// Set
tokenUtils.set(token)
userUtils.set(user)

// Get
const token = tokenUtils.get()
const user = userUtils.get()

// Remove
clearAuthData()
```

## 🚀 Usage Examples

### In Components
```typescript
import { isAuthenticated, getCurrentUser } from '@/lib/cookies'

export default function MyComponent() {
  const isLoggedIn = isAuthenticated()
  const user = getCurrentUser()
  
  if (!isLoggedIn) {
    return <div>Please login</div>
  }
  
  return <div>Welcome, {user?.full_name}</div>
}
```

### In API Calls
```typescript
// BaseService automatically includes token from cookies
// No manual token handling needed!
```

### In Server Components
```typescript
import { cookies } from 'next/headers'
import { COOKIE_KEYS } from '@/lib/cookies'

export default function ServerComponent() {
  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE_KEYS.TOKEN)?.value
  
  if (!token) {
    return <div>Not authenticated</div>
  }
  
  // Fetch data with token...
}
```

## ✅ Benefits Achieved

1. **SSR Compatibility** ✅
   - No more hydration mismatches
   - Consistent auth state between server and client

2. **Security** ✅
   - Secure cookies in production
   - CSRF protection with sameSite
   - Automatic expiration

3. **Developer Experience** ✅
   - Simple API
   - Automatic route protection
   - Error handling

4. **Performance** ✅
   - No client-side auth checks needed
   - Middleware handles routing efficiently

5. **Reliability** ✅
   - Works in all environments
   - Graceful error handling
   - Automatic cleanup
