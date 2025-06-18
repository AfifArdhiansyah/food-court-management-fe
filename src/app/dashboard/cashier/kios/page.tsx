'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { apiService } from '@/services/api'
import { Kios } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Store, Menu as MenuIcon, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function KiosManagementPage() {
  const { } = useAuth()
  const [kiosList, setKiosList] = useState<Kios[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchKios()
  }, [])

  const fetchKios = async () => {
    try {
      setLoading(true)
      const response = await apiService.getKios()
      setKiosList(response.data || [])
    } catch (err: unknown) {
      console.error('Error fetching kios:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch kios')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteKios = async (kiosId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kios ini?')) {
      return
    }

    try {
      await apiService.deleteKios(kiosId)
      await fetchKios() // Refresh list
    } catch (err: unknown) {
      console.error('Error deleting kios:', err)
      alert('Gagal menghapus kios: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading kios...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchKios}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Kios</h1>
            <p className="text-gray-600 mt-2">Kelola kios dan menu yang tersedia di food court</p>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard/cashier">
              <Button variant="outline">
                Kembali ke Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/cashier/kios/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Kios Baru
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Kios</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kiosList.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kios Aktif</CardTitle>
              <Store className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {kiosList.filter(k => k.is_active).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Menu</CardTitle>
              <MenuIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {kiosList.reduce((total, kios) => total + (kios.menus?.length || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kios List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kiosList.map((kios) => (
            <Card key={kios.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{kios.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {kios.location}
                    </CardDescription>
                  </div>
                  <Badge variant={kios.is_active ? "default" : "secondary"}>
                    {kios.is_active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {kios.description || 'Tidak ada deskripsi'}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Menu: {kios.menus?.length || 0} item</span>
                  <span>Pesanan: {kios.orders?.length || 0}</span>
                </div>

                <div className="flex gap-2">
                  <Link href={`/dashboard/cashier/kios/${kios.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <MenuIcon className="w-4 h-4 mr-2" />
                      Kelola Menu
                    </Button>
                  </Link>
                  <Link href={`/dashboard/cashier/kios/${kios.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteKios(kios.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {kiosList.length === 0 && (
          <div className="text-center py-12">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada kios</h3>
            <p className="text-gray-600 mb-6">Mulai dengan menambahkan kios pertama Anda</p>
            <Link href="/dashboard/cashier/kios/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Kios Baru
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
