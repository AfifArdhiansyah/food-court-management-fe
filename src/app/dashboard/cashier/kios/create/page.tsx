'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiService } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Store, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface MenuForm {
  name: string
  description: string
  price: number
  category: 'food' | 'drink' | 'snack' | 'dessert'
  image_url: string
  is_available: boolean
}

export default function CreateKiosPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Kios form data
  const [kiosForm, setKiosForm] = useState({
    name: '',
    description: '',
    location: '',
    is_active: true
  })

  // Menu form data
  const [menus, setMenus] = useState<MenuForm[]>([
    {
      name: '',
      description: '',
      price: 0,
      category: 'food',
      image_url: '',
      is_available: true
    }
  ])

  const handleKiosChange = (field: string, value: any) => {
    setKiosForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMenuChange = (index: number, field: string, value: any) => {
    setMenus(prev => prev.map((menu, i) => 
      i === index ? { ...menu, [field]: value } : menu
    ))
  }

  const addMenu = () => {
    setMenus(prev => [...prev, {
      name: '',
      description: '',
      price: 0,
      category: 'food',
      image_url: '',
      is_available: true
    }])
  }

  const removeMenu = (index: number) => {
    if (menus.length > 1) {
      setMenus(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!kiosForm.name.trim()) {
      setError('Nama kios harus diisi')
      return
    }

    if (!kiosForm.location.trim()) {
      setError('Lokasi kios harus diisi')
      return
    }

    // Validate menus
    const validMenus = menus.filter(menu => menu.name.trim() && menu.price > 0)
    if (validMenus.length === 0) {
      setError('Minimal harus ada 1 menu yang valid (nama dan harga harus diisi)')
      return
    }

    try {
      setLoading(true)
      setError('')

      // Create kios first
      const kiosResponse = await apiService.createKios({
        name: kiosForm.name.trim(),
        description: kiosForm.description.trim(),
        location: kiosForm.location.trim(),
        is_active: kiosForm.is_active
      })

      const newKiosId = kiosResponse.data?.id
      if (!newKiosId) {
        throw new Error('Failed to get new kios ID')
      }

      // Create menus for the kios
      for (const menu of validMenus) {
        await apiService.createMenu(newKiosId, {
          name: menu.name.trim(),
          description: menu.description.trim(),
          price: menu.price,
          category: menu.category,
          image_url: menu.image_url.trim(),
          is_available: menu.is_available
        })
      }

      // Redirect to kios management page
      router.push('/dashboard/cashier/kios')
    } catch (err: any) {
      console.error('Error creating kios:', err)
      setError(err.message || 'Gagal membuat kios')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/cashier/kios">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tambah Kios Baru</h1>
            <p className="text-gray-600 mt-2">Buat kios baru beserta menu-menu yang dijual</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Kios Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                Informasi Kios
              </CardTitle>
              <CardDescription>
                Masukkan informasi dasar tentang kios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nama Kios *</Label>
                  <Input
                    id="name"
                    value={kiosForm.name}
                    onChange={(e) => handleKiosChange('name', e.target.value)}
                    placeholder="Contoh: Warung Nasi Padang"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">Lokasi *</Label>
                  <Input
                    id="location"
                    value={kiosForm.location}
                    onChange={(e) => handleKiosChange('location', e.target.value)}
                    placeholder="Contoh: Lantai 1, Sektor A"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={kiosForm.description}
                  onChange={(e) => handleKiosChange('description', e.target.value)}
                  placeholder="Deskripsi singkat tentang kios..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={kiosForm.is_active}
                  onCheckedChange={(checked: boolean) => handleKiosChange('is_active', checked)}
                />
                <Label htmlFor="is_active">Kios aktif</Label>
              </div>
            </CardContent>
          </Card>

          {/* Menus */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Menu Kios</CardTitle>
                  <CardDescription>
                    Tambahkan menu-menu yang akan dijual di kios ini
                  </CardDescription>
                </div>
                <Button type="button" onClick={addMenu} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Menu
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {menus.map((menu, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Menu {index + 1}</h4>
                    {menus.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMenu(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nama Menu *</Label>
                      <Input
                        value={menu.name}
                        onChange={(e) => handleMenuChange(index, 'name', e.target.value)}
                        placeholder="Contoh: Nasi Rendang"
                      />
                    </div>
                    <div>
                      <Label>Kategori</Label>
                      <Select
                        value={menu.category}
                        onValueChange={(value) => handleMenuChange(index, 'category', value)}
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
                    <Label>Deskripsi</Label>
                    <Textarea
                      value={menu.description}
                      onChange={(e) => handleMenuChange(index, 'description', e.target.value)}
                      placeholder="Deskripsi menu..."
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Harga *</Label>
                      <Input
                        type="number"
                        value={menu.price}
                        onChange={(e) => handleMenuChange(index, 'price', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        min="0"
                        step="1000"
                      />
                    </div>
                    <div>
                      <Label>URL Gambar</Label>
                      <Input
                        value={menu.image_url}
                        onChange={(e) => handleMenuChange(index, 'image_url', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={menu.is_available}
                      onCheckedChange={(checked: boolean) => handleMenuChange(index, 'is_available', checked)}
                    />
                    <Label>Menu tersedia</Label>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link href="/dashboard/cashier/kios">
              <Button type="button" variant="outline" disabled={loading}>
                Batal
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Kios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
