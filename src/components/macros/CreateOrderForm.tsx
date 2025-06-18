'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useOrders } from '@/hooks/useOrders'
import { apiService } from '@/services/api'
import { formatCurrency } from '@/lib/utils'
import { Menu, CreateOrderItemRequest, MenuCategory } from '@/types'
import { Plus, Minus, ShoppingCart, Utensils, Coffee, Cookie, IceCream } from 'lucide-react'

interface CreateOrderFormProps {
  kiosId: number
  onClose: () => void
  onSuccess?: () => void
}

interface OrderItem extends CreateOrderItemRequest {
  menu?: Menu
  subtotal: number
}

// Category configuration
const categories: { key: MenuCategory; label: string; icon: any }[] = [
  { key: 'food', label: 'Makanan', icon: Utensils },
  { key: 'drink', label: 'Minuman', icon: Coffee },
  { key: 'snack', label: 'Snack', icon: Cookie },
  { key: 'dessert', label: 'Dessert', icon: IceCream },
]

export function CreateOrderForm({ kiosId, onClose, onSuccess }: CreateOrderFormProps) {
  const [customerName, setCustomerName] = useState('')
  const [notes, setNotes] = useState('')
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [activeCategory, setActiveCategory] = useState<MenuCategory>('food')
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const { createOrder, createOrderLoading } = useOrders(kiosId)

  // Fetch menus for this kios
  const { data: allMenus, isLoading: menusLoading } = useQuery({
    queryKey: ['menus', kiosId],
    queryFn: async () => {
      const response = await apiService.getMenusByKios(kiosId, { available: true })
      return response.data || []
    },
  })

  // Group menus by category
  const menusByCategory = allMenus?.reduce((acc, menu) => {
    if (!acc[menu.category]) {
      acc[menu.category] = []
    }
    acc[menu.category].push(menu)
    return acc
  }, {} as Record<MenuCategory, Menu[]>) || {} as Record<MenuCategory, Menu[]>

  // Get available categories that have menus
  const availableCategories = categories.filter(cat =>
    menusByCategory[cat.key] && menusByCategory[cat.key].length > 0
  )

  // Set default active category to first available category
  useEffect(() => {
    if (availableCategories.length > 0 && !availableCategories.find(cat => cat.key === activeCategory)) {
      setActiveCategory(availableCategories[0].key)
    }
  }, [availableCategories, activeCategory])

  // Get current category menus
  const currentMenus = menusByCategory[activeCategory] || []

  // Calculate total items in cart
  const totalCartItems = orderItems.reduce((sum, item) => sum + item.quantity, 0)

  const addMenuItem = (menu: Menu) => {
    const existingItem = orderItems.find(item => item.menu_id === menu.id)
    
    if (existingItem) {
      setOrderItems(items =>
        items.map(item =>
          item.menu_id === menu.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * menu.price }
            : item
        )
      )
    } else {
      setOrderItems(items => [
        ...items,
        {
          menu_id: menu.id,
          quantity: 1,
          notes: '',
          menu,
          subtotal: menu.price
        }
      ])
    }
  }

  const updateQuantity = (menuId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setOrderItems(items => items.filter(item => item.menu_id !== menuId))
    } else {
      setOrderItems(items =>
        items.map(item =>
          item.menu_id === menuId
            ? { ...item, quantity: newQuantity, subtotal: newQuantity * (item.menu?.price || 0) }
            : item
        )
      )
    }
  }

  const updateItemNotes = (menuId: number, itemNotes: string) => {
    setOrderItems(items =>
      items.map(item =>
        item.menu_id === menuId ? { ...item, notes: itemNotes } : item
      )
    )
  }

  const getItemQuantity = (menuId: number) => {
    const item = orderItems.find(item => item.menu_id === menuId)
    return item ? item.quantity : 0
  }

  const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0)

  const handleSubmit = () => {
    if (orderItems.length === 0) return

    const orderData = {
      kios_id: kiosId,
      customer_name: customerName.trim() || undefined,
      notes: notes.trim() || undefined,
      items: orderItems.map(item => ({
        menu_id: item.menu_id,
        quantity: item.quantity,
        notes: item.notes?.trim() || undefined
      }))
    }

    createOrder(orderData, {
      onSuccess: () => {
        onSuccess?.()
        onClose()
      }
    })
  }

  if (menusLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">Loading menu...</div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent
        className="max-h-[90vh] overflow-hidden"
        style={{
          width: '70vw',
          maxWidth: 'none',
          minWidth: '800px'
        }}
      >
        <DialogHeader>
          <DialogTitle>Buat Pesanan Baru</DialogTitle>
        </DialogHeader>

        <div className="flex h-[calc(85vh-120px)]" style={{ minHeight: '500px' }}>
          {/* Vertical Category Tabs */}
          <div className="w-40 border-r pr-4" style={{ width: '160px', flexShrink: 0 }}>
            <h3 className="font-semibold mb-4">Kategori</h3>
            <div className="space-y-2">
              {availableCategories.length > 0 ? (
                availableCategories.map((category) => {
                  const Icon = category.icon
                  return (
                    <Button
                      key={category.key}
                      variant={activeCategory === category.key ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveCategory(category.key)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {category.label}
                    </Button>
                  )
                })
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Tidak ada menu tersedia
                </div>
              )}
            </div>
          </div>

          {/* Menu Grid */}
          <div className="flex-1 pl-6" style={{ flex: 1, minWidth: 0 }}>
            <h3 className="font-semibold mb-4">
              {categories.find(cat => cat.key === activeCategory)?.label}
            </h3>
            <div
              className="grid grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto max-h-full"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '24px'
              }}
            >
              {currentMenus.length > 0 ? (
                currentMenus.map((menu: Menu) => {
                  const quantity = getItemQuantity(menu.id)
                  return (
                    <Card key={menu.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <h4 className="font-medium mb-2">{menu.name}</h4>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{menu.description}</p>
                          <div className="font-semibold text-blue-600 mb-3">
                            {formatCurrency(menu.price)}
                          </div>
                          {quantity === 0 ? (
                            <Button
                              size="sm"
                              onClick={() => addMenuItem(menu)}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Tambah
                            </Button>
                          ) : (
                            <div className="flex items-center justify-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(menu.id, quantity - 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">{quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(menu.id, quantity + 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Tidak ada menu tersedia untuk kategori ini
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Cart Button */}
        {orderItems.length > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              onClick={() => setShowCart(true)}
              className="h-14 w-14 rounded-full shadow-lg relative"
              size="lg"
            >
              <ShoppingCart className="h-6 w-6" />
              <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
              </Badge>
            </Button>
          </div>
        )}

        {/* Cart Modal */}
        <Dialog open={showCart} onOpenChange={setShowCart}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Keranjang Belanja</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {orderItems.length > 0 ? (
                orderItems.map((item) => (
                  <Card key={item.menu_id}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.menu?.name}</h4>
                          <p className="text-xs text-gray-600">
                            {formatCurrency(item.menu?.price || 0)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.menu_id, item.quantity - 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.menu_id, item.quantity + 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-sm">
                          {formatCurrency(item.subtotal)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Keranjang kosong
                </div>
              )}
            </div>

            {orderItems.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Total:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setShowCart(false)} className="flex-1">
                    Lanjut Belanja
                  </Button>
                  <Button
                    onClick={() => {
                      setShowCart(false)
                      setShowCheckout(true)
                    }}
                    className="flex-1"
                  >
                    Checkout
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Checkout Modal */}
        <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Checkout Pesanan</DialogTitle>
            </DialogHeader>

            {/* Customer Info */}
            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="customerName">Nama Pelanggan (Opsional)</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Masukkan nama pelanggan"
                />
              </div>
              <div>
                <Label htmlFor="notes">Catatan (Opsional)</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan khusus"
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="border rounded-lg p-4 mb-6">
              <h4 className="font-semibold mb-3">Ringkasan Pesanan</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {orderItems.map((item) => (
                  <div key={item.menu_id} className="flex justify-between items-center text-sm">
                    <div className="flex-1">
                      <span className="font-medium">{item.menu?.name}</span>
                      <span className="text-gray-600 ml-2">x{item.quantity}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateQuantity(item.menu_id, item.quantity - 1)}
                        className="h-6 w-6 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateQuantity(item.menu_id, item.quantity + 1)}
                        className="h-6 w-6 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <span className="font-semibold w-16 text-right">
                        {formatCurrency(item.subtotal)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowCheckout(false)} className="flex-1">
                Kembali
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createOrderLoading}
                className="flex-1"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {createOrderLoading ? 'Membuat...' : 'Buat Pesanan'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}
