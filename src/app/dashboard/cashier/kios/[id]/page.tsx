'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiService } from '@/services/api'
import { Kios, Menu } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ArrowLeft, Plus, Edit, Trash2, Menu as MenuIcon, Store } from 'lucide-react'
import Link from 'next/link'

interface MenuForm {
  name: string
  description: string
  price: number
  category: 'food' | 'drink' | 'snack' | 'dessert'
  image_url: string
  is_available: boolean
}

export default function KiosDetailPage() {
  const params = useParams()
  const router = useRouter()
  const kiosId = parseInt(params.id as string)
  
  const [kios, setKios] = useState<Kios | null>(null)
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Dialog states
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [menuForm, setMenuForm] = useState<MenuForm>({
    name: '',
    description: '',
    price: 0,
    category: 'food',
    image_url: '',
    is_available: true
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (kiosId) {
      fetchKiosDetail()
    }
  }, [kiosId])

  const fetchKiosDetail = async () => {
    try {
      setLoading(true)
      const [kiosResponse, menusResponse] = await Promise.all([
        apiService.getKiosById(kiosId),
        apiService.getMenusByKios(kiosId)
      ])
      
      setKios(kiosResponse.data || null)
      setMenus(menusResponse.data || [])
    } catch (err: any) {
      console.error('Error fetching kios detail:', err)
      setError(err.message || 'Failed to fetch kios detail')
    } finally {
      setLoading(false)
    }
  }

  const resetMenuForm = () => {
    setMenuForm({
      name: '',
      description: '',
      price: 0,
      category: 'food',
      image_url: '',
      is_available: true
    })
    setEditingMenu(null)
  }

  const handleAddMenu = () => {
    resetMenuForm()
    setShowAddMenu(true)
  }

  const handleEditMenu = (menu: Menu) => {
    setMenuForm({
      name: menu.name,
      description: menu.description || '',
      price: menu.price,
      category: menu.category || '',
      image_url: menu.image_url || '',
      is_available: menu.is_available
    })
    setEditingMenu(menu)
    setShowAddMenu(true)
  }

  const handleMenuFormChange = (field: string, value: any) => {
    setMenuForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmitMenu = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!menuForm.name.trim()) {
      alert('Nama menu harus diisi')
      return
    }

    if (menuForm.price <= 0) {
      alert('Harga menu harus lebih dari 0')
      return
    }

    try {
      setSubmitting(true)
      
      if (editingMenu) {
        // Update existing menu
        await apiService.updateMenu(editingMenu.id, {
          name: menuForm.name.trim(),
          description: menuForm.description.trim(),
          price: menuForm.price,
          category: menuForm.category,
          image_url: menuForm.image_url.trim(),
          is_available: menuForm.is_available
        })
      } else {
        // Create new menu
        await apiService.createMenu(kiosId, {
          name: menuForm.name.trim(),
          description: menuForm.description.trim(),
          price: menuForm.price,
          category: menuForm.category,
          image_url: menuForm.image_url.trim(),
          is_available: menuForm.is_available
        })
      }

      setShowAddMenu(false)
      resetMenuForm()
      await fetchKiosDetail() // Refresh data
    } catch (err: any) {
      console.error('Error saving menu:', err)
      alert('Gagal menyimpan menu: ' + (err.message || 'Unknown error'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteMenu = async (menuId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus menu ini?')) {
      return
    }

    try {
      await apiService.deleteMenu(menuId)
      await fetchKiosDetail() // Refresh data
    } catch (err: any) {
      console.error('Error deleting menu:', err)
      alert('Gagal menghapus menu: ' + (err.message || 'Unknown error'))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading kios detail...</p>
        </div>
      </div>
    )
  }

  if (error || !kios) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error || 'Kios tidak ditemukan'}</p>
          <Link href="/dashboard/cashier/kios">
            <Button>Kembali ke Daftar Kios</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/cashier/kios">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{kios.name}</h1>
            <p className="text-gray-600 mt-2">{kios.location}</p>
          </div>
          <Badge variant={kios.is_active ? "default" : "secondary"}>
            {kios.is_active ? "Aktif" : "Nonaktif"}
          </Badge>
        </div>

        {/* Kios Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              Informasi Kios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Deskripsi</Label>
                <p className="mt-1">{kios.description || 'Tidak ada deskripsi'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Status</Label>
                <p className="mt-1">{kios.is_active ? 'Aktif' : 'Nonaktif'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MenuIcon className="w-5 h-5" />
                  Menu Kios ({menus.length})
                </CardTitle>
                <CardDescription>
                  Kelola menu yang tersedia di kios ini
                </CardDescription>
              </div>
              <Dialog open={showAddMenu} onOpenChange={setShowAddMenu}>
                <DialogTrigger asChild>
                  <Button onClick={handleAddMenu}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Menu
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingMenu ? 'Edit Menu' : 'Tambah Menu Baru'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingMenu ? 'Ubah informasi menu' : 'Tambahkan menu baru ke kios ini'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmitMenu} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="menu-name">Nama Menu *</Label>
                        <Input
                          id="menu-name"
                          value={menuForm.name}
                          onChange={(e) => handleMenuFormChange('name', e.target.value)}
                          placeholder="Contoh: Nasi Rendang"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="menu-category">Kategori</Label>
                        <Select
                          value={menuForm.category}
                          onValueChange={(value) => handleMenuFormChange('category', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="food">Makanan</SelectItem>
                            <SelectItem value="drink">Minuman</SelectItem>
                            <SelectItem value="snack">Camilan</SelectItem>
                            <SelectItem value="dessert">Dessert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="menu-description">Deskripsi</Label>
                      <Textarea
                        id="menu-description"
                        value={menuForm.description}
                        onChange={(e) => handleMenuFormChange('description', e.target.value)}
                        placeholder="Deskripsi menu..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="menu-price">Harga *</Label>
                        <Input
                          id="menu-price"
                          type="number"
                          value={menuForm.price}
                          onChange={(e) => handleMenuFormChange('price', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          min="0"
                          step="1000"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="menu-image">URL Gambar</Label>
                        <Input
                          id="menu-image"
                          value={menuForm.image_url}
                          onChange={(e) => handleMenuFormChange('image_url', e.target.value)}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="menu-available"
                        checked={menuForm.is_available}
                        onCheckedChange={(checked: boolean) => handleMenuFormChange('is_available', checked)}
                      />
                      <Label htmlFor="menu-available">Menu tersedia</Label>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowAddMenu(false)}
                        disabled={submitting}
                      >
                        Batal
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? 'Menyimpan...' : (editingMenu ? 'Update Menu' : 'Tambah Menu')}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {menus.length === 0 ? (
              <div className="text-center py-12">
                <MenuIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada menu</h3>
                <p className="text-gray-600 mb-6">Mulai dengan menambahkan menu pertama</p>
                <Button onClick={handleAddMenu}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Menu
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menus.map((menu) => (
                  <Card key={menu.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-lg">{menu.name}</h4>
                        <Badge variant={menu.is_available ? "default" : "secondary"}>
                          {menu.is_available ? "Tersedia" : "Habis"}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {menu.description || 'Tidak ada deskripsi'}
                      </p>
                      
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold text-green-600">
                          Rp {menu.price.toLocaleString('id-ID')}
                        </span>
                        <span className="text-sm text-gray-500">
                          {menu.category || 'Umum'}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditMenu(menu)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteMenu(menu.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
