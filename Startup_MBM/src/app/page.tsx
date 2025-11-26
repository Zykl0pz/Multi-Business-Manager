'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Building2, Plus, Trash2, Eye, DollarSign, Package, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface Business {
  id: string
  name: string
  address?: string
  website?: string
  createdAt: string
  _count?: {
    products: number
    incomes: number
    expenses: number
  }
}

export default function Home() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [newBusiness, setNewBusiness] = useState({ name: '', address: '', website: '' })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const fetchBusinesses = async () => {
    try {
      const response = await fetch('/api/businesses')
      if (response.ok) {
        const data = await response.json()
        setBusinesses(data)
      }
    } catch (error) {
      console.error('Error fetching businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddBusiness = async () => {
    if (!newBusiness.name.trim()) return

    try {
      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBusiness)
      })

      if (response.ok) {
        setNewBusiness({ name: '', address: '', website: '' })
        setIsAddDialogOpen(false)
        fetchBusinesses()
      }
    } catch (error) {
      console.error('Error adding business:', error)
    }
  }

  const handleDeleteBusiness = async (id: string) => {
    try {
      const response = await fetch(`/api/businesses/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchBusinesses()
      }
    } catch (error) {
      console.error('Error deleting business:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Gestión de Negocios</h1>
            <p className="text-muted-foreground mt-2">Administra múltiples negocios, inventario y finanzas</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Negocio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Negocio</DialogTitle>
                <DialogDescription>
                  Crea un nuevo negocio para empezar a gestionar su inventario y finanzas.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={newBusiness.name}
                    onChange={(e) => setNewBusiness({ ...newBusiness, name: e.target.value })}
                    placeholder="Nombre del negocio"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={newBusiness.address}
                    onChange={(e) => setNewBusiness({ ...newBusiness, address: e.target.value })}
                    placeholder="Dirección del negocio"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input
                    id="website"
                    value={newBusiness.website}
                    onChange={(e) => setNewBusiness({ ...newBusiness, website: e.target.value })}
                    placeholder="https://ejemplo.com"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddBusiness} disabled={!newBusiness.name.trim()}>
                  Crear Negocio
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {businesses.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No hay negocios registrados</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primer negocio para empezar a gestionar inventario y finanzas.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Negocio
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <Card key={business.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{business.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Link href={`/business/${business.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar Negocio?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará permanentemente el negocio "{business.name}" y todos sus datos asociados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteBusiness(business.id)}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  {business.address && (
                    <CardDescription className="text-sm">{business.address}</CardDescription>
                  )}
                  {business.website && (
                    <CardDescription className="text-sm text-blue-600">
                      <a href={business.website} target="_blank" rel="noopener noreferrer">
                        {business.website}
                      </a>
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-2xl font-bold">{business._count?.products || 0}</span>
                      <span className="text-xs text-muted-foreground">Productos</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-2xl font-bold">{business._count?.incomes || 0}</span>
                      <span className="text-xs text-muted-foreground">Ingresos</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-red-600" />
                      <span className="text-2xl font-bold">{business._count?.expenses || 0}</span>
                      <span className="text-xs text-muted-foreground">Gastos</span>
                    </div>
                  </div>
                  <Link href={`/business/${business.id}`}>
                    <Button className="w-full mt-4">
                      Gestionar Negocio
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}