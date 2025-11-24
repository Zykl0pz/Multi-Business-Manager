'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  Search,
  TrendingUp,
  TrendingDown,
  Settings
} from 'lucide-react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  description?: string
  _count?: {
    products: number
  }
}

interface Brand {
  id: string
  name: string
  description?: string
  website?: string
  _count?: {
    products: number
  }
}

interface Product {
  id: string
  name: string
  description?: string
  sku?: string
  price: number
  cost: number
  stock: number
  minStock: number
  businessId: string
  categoryId?: string
  brandId?: string
  category?: {
    id: string
    name: string
  }
  brand?: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

export default function InventoryManagement() {
  const params = useParams()
  const router = useRouter()
  const businessId = params.id as string

  const [ products, setProducts ] = useState<Product[]>([])
  const [ categories, setCategories ] = useState<Category[]>([])
  const [ brands, setBrands ] = useState<Brand[]>([])
  const [ loading, setLoading ] = useState(true)
  const [ searchTerm, setSearchTerm ] = useState('')
  const [ isAddDialogOpen, setIsAddDialogOpen ] = useState(false)
  const [ editingProduct, setEditingProduct ] = useState<Product | null>(null)
  const [ newProduct, setNewProduct ] = useState({
    name: '',
    description: '',
    sku: '',
    price: '',
    cost: '',
    stock: '',
    minStock: '',
    categoryId: 'uncategorized',
    brandId: 'unbranded'
  })

  useEffect(() => {
    if (businessId) {
      fetchProducts()
      fetchCategories()
      fetchBrands()
    }
  }, [ businessId ])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/products?businessId=${businessId}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands')
      if (response.ok) {
        const data = await response.json()
        setBrands(data)
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
    }
  }

  const handleAddProduct = async () => {
    if (!newProduct.name.trim() || !newProduct.price || !newProduct.cost) return

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProduct,
          businessId,
          price: parseFloat(newProduct.price),
          cost: parseFloat(newProduct.cost),
          stock: parseInt(newProduct.stock) || 0,
          minStock: parseInt(newProduct.minStock) || 0,
          categoryId: newProduct.categoryId === 'uncategorized' ? null : newProduct.categoryId,
          brandId: newProduct.brandId === 'unbranded' ? null : newProduct.brandId
        })
      })

      if (response.ok) {
        setNewProduct({
          name: '',
          description: '',
          sku: '',
          price: '',
          cost: '',
          stock: '',
          minStock: '',
          categoryId: 'uncategorized',
          brandId: 'unbranded'
        })
        setIsAddDialogOpen(false)
        fetchProducts()
      }
    } catch (error) {
      console.error('Error adding product:', error)
    }
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct) return

    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct)
      })

      if (response.ok) {
        setEditingProduct(null)
        fetchProducts()
      }
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchProducts()
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const lowStockProducts = products.filter(product => product.stock <= product.minStock)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push(`/business/${businessId}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Gestión de Inventario</h1>
              <p className="text-muted-foreground">
                {products.length} productos en total
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href="/categories">
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Gestionar Categorías
              </Button>
            </Link>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo Producto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Producto</DialogTitle>
                  <DialogDescription>
                    Añade un nuevo producto al inventario.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">Categoría</Label>
                      <Select value={newProduct.categoryId} onValueChange={(value) => setNewProduct({ ...newProduct, categoryId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="uncategorized">Sin categoría</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="brand">Marca</Label>
                      <Select value={newProduct.brandId} onValueChange={(value) => setNewProduct({ ...newProduct, brandId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar marca" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unbranded">Sin marca</SelectItem>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="Nombre del producto"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Input
                      id="description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      placeholder="Descripción del producto"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                      placeholder="SKU del producto"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="price">Precio Venta *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cost">Coste *</Label>
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        value={newProduct.cost}
                        onChange={(e) => setNewProduct({ ...newProduct, cost: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="stock">Stock Inicial</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="minStock">Stock Mínimo</Label>
                      <Input
                        id="minStock"
                        type="number"
                        value={newProduct.minStock}
                        onChange={(e) => setNewProduct({ ...newProduct, minStock: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddProduct} disabled={!newProduct.name.trim() || !newProduct.price || !newProduct.cost}>
                    Agregar Producto
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Low Stock Alert */}
          {lowStockProducts.length > 0 && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Alerta de Stock Bajo
                </CardTitle>
                <CardDescription>
                  {lowStockProducts.length} producto(s) necesitan reabastecimiento
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Search and Stats */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Card className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total: {products.length}</span>
                </div>
              </Card>
              <Card className="px-4 py-2">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Bajo Stock: {lowStockProducts.length}</span>
                </div>
              </Card>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {searchTerm ? 'No se encontraron productos' : 'No hay productos registrados'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'Intenta con otra búsqueda' : 'Agrega tu primer producto para empezar a gestionar el inventario.'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Primer Producto
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const isLowStock = product.stock <= product.minStock
                const profit = product.price - product.cost
                const profitMargin = (profit / product.price) * 100

                return (
                  <Card key={product.id} className={`hover:shadow-lg transition-shadow ${isLowStock ? 'border-red-200' : ''}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          {product.sku && (
                            <CardDescription>SKU: {product.sku}</CardDescription>
                          )}
                          {product.description && (
                            <CardDescription className="mt-1">{product.description}</CardDescription>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar Producto?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción eliminará permanentemente el producto "{product.name}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Stock:</span>
                          <Badge variant={isLowStock ? "destructive" : "secondary"}>
                            {product.stock} unidades
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Precio:</span>
                          <span className="font-semibold">{formatCurrency(product.price)}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Coste:</span>
                          <span className="font-semibold">{formatCurrency(product.cost)}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Beneficio:</span>
                          <div className="flex items-center gap-1">
                            {profit >= 0 ? (
                              <TrendingUp className="h-3 w-3 text-green-600" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-600" />
                            )}
                            <span className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(profit)} ({profitMargin.toFixed(1)}%)
                            </span>
                          </div>
                        </div>

                        {isLowStock && (
                          <div className="flex items-center gap-1 text-red-600 text-sm">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Stock por debajo del mínimo ({product.minStock})</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Edit Product Dialog */}
          <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Producto</DialogTitle>
                <DialogDescription>
                  Modifica la información del producto.
                </DialogDescription>
              </DialogHeader>
              {editingProduct && (
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">Nombre</Label>
                    <Input
                      id="edit-name"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-description">Descripción</Label>
                    <Input
                      id="edit-description"
                      value={editingProduct.description || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-sku">SKU</Label>
                    <Input
                      id="edit-sku"
                      value={editingProduct.sku || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-price">Precio Venta</Label>
                      <Input
                        id="edit-price"
                        type="number"
                        step="0.01"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-cost">Coste</Label>
                      <Input
                        id="edit-cost"
                        type="number"
                        step="0.01"
                        value={editingProduct.cost}
                        onChange={(e) => setEditingProduct({ ...editingProduct, cost: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-stock">Stock</Label>
                      <Input
                        id="edit-stock"
                        type="number"
                        value={editingProduct.stock}
                        onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-minStock">Stock Mínimo</Label>
                      <Input
                        id="edit-minStock"
                        type="number"
                        value={editingProduct.minStock}
                        onChange={(e) => setEditingProduct({ ...editingProduct, minStock: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={handleUpdateProduct}>
                  Guardar Cambios
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}