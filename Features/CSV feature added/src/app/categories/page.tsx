'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  Settings,
  Search,
  Tag,
  Building
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

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchCategory, setSearchCategory] = useState('')
  const [searchBrand, setSearchBrand] = useState('')
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [newCategory, setNewCategory] = useState({ name: '', description: '' })
  const [newBrand, setNewBrand] = useState({ name: '', description: '', website: '' })

  useEffect(() => {
    fetchCategories()
    fetchBrands()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
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

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) return

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      })

      if (response.ok) {
        setNewCategory({ name: '', description: '' })
        setIsAddCategoryOpen(false)
        fetchCategories()
      }
    } catch (error) {
      console.error('Error adding category:', error)
    }
  }

  const handleAddBrand = async () => {
    if (!newBrand.name.trim()) return

    try {
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBrand)
      })

      if (response.ok) {
        setNewBrand({ name: '', description: '', website: '' })
        setIsAddBrandOpen(false)
        fetchBrands()
      }
    } catch (error) {
      console.error('Error adding brand:', error)
    }
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory) return

    try {
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory)
      })

      if (response.ok) {
        setEditingCategory(null)
        fetchCategories()
      }
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  const handleUpdateBrand = async () => {
    if (!editingBrand) return

    try {
      const response = await fetch(`/api/brands/${editingBrand.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBrand)
      })

      if (response.ok) {
        setEditingBrand(null)
        fetchBrands()
      }
    } catch (error) {
      console.error('Error updating brand:', error)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchCategories()
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const handleDeleteBrand = async (id: string) => {
    try {
      const response = await fetch(`/api/brands/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchBrands()
      }
    } catch (error) {
      console.error('Error deleting brand:', error)
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchCategory.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchCategory.toLowerCase())
  )

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchBrand.toLowerCase()) ||
    brand.description?.toLowerCase().includes(searchBrand.toLowerCase())
  )

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
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Gestión de Categorías y Marcas</h1>
              <p className="text-muted-foreground">
                Administra las categorías y marcas para organizar tus productos
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories">Categorías</TabsTrigger>
            <TabsTrigger value="brands">Marcas</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar categorías..."
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                <DialogTrigger asChild>
                  <Button className="ml-4 flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Nueva Categoría
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar Nueva Categoría</DialogTitle>
                    <DialogDescription>
                      Crea una nueva categoría para organizar tus productos.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category-name">Nombre *</Label>
                      <Input
                        id="category-name"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        placeholder="Nombre de la categoría"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category-description">Descripción</Label>
                      <Input
                        id="category-description"
                        value={newCategory.description}
                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                        placeholder="Descripción de la categoría"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddCategory} disabled={!newCategory.name.trim()}>
                      Agregar Categoría
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {filteredCategories.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Tag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {searchCategory ? 'No se encontraron categorías' : 'No hay categorías registradas'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchCategory ? 'Intenta con otra búsqueda' : 'Crea tu primera categoría para empezar a organizar los productos.'}
                  </p>
                  {!searchCategory && (
                    <Button onClick={() => setIsAddCategoryOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primera Categoría
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category) => (
                  <Card key={category.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Tag className="h-5 w-5 text-primary" />
                            {category.name}
                          </CardTitle>
                          {category.description && (
                            <CardDescription className="mt-1">{category.description}</CardDescription>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingCategory(category)}
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
                                <AlertDialogTitle>¿Eliminar Categoría?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción eliminará permanentemente la categoría "{category.name}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCategory(category.id)}>
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {category._count?.products || 0} productos
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="brands" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar marcas..."
                    value={searchBrand}
                    onChange={(e) => setSearchBrand(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Dialog open={isAddBrandOpen} onOpenChange={setIsAddBrandOpen}>
                <DialogTrigger asChild>
                  <Button className="ml-4 flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Nueva Marca
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar Nueva Marca</DialogTitle>
                    <DialogDescription>
                      Crea una nueva marca para organizar tus productos.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="brand-name">Nombre *</Label>
                      <Input
                        id="brand-name"
                        value={newBrand.name}
                        onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                        placeholder="Nombre de la marca"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="brand-description">Descripción</Label>
                      <Input
                        id="brand-description"
                        value={newBrand.description}
                        onChange={(e) => setNewBrand({ ...newBrand, description: e.target.value })}
                        placeholder="Descripción de la marca"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="brand-website">Sitio Web</Label>
                      <Input
                        id="brand-website"
                        value={newBrand.website}
                        onChange={(e) => setNewBrand({ ...newBrand, website: e.target.value })}
                        placeholder="https://ejemplo.com"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddBrand} disabled={!newBrand.name.trim()}>
                      Agregar Marca
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {filteredBrands.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {searchBrand ? 'No se encontraron marcas' : 'No hay marcas registradas'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchBrand ? 'Intenta con otra búsqueda' : 'Crea tu primera marca para empezar a organizar los productos.'}
                  </p>
                  {!searchBrand && (
                    <Button onClick={() => setIsAddBrandOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primera Marca
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBrands.map((brand) => (
                  <Card key={brand.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Building className="h-5 w-5 text-primary" />
                            {brand.name}
                          </CardTitle>
                          {brand.description && (
                            <CardDescription className="mt-1">{brand.description}</CardDescription>
                          )}
                          {brand.website && (
                            <CardDescription className="text-blue-600">
                              <a href={brand.website} target="_blank" rel="noopener noreferrer">
                                {brand.website}
                              </a>
                            </CardDescription>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingBrand(brand)}
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
                                <AlertDialogTitle>¿Eliminar Marca?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción eliminará permanentemente la marca "{brand.name}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteBrand(brand.id)}>
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {brand._count?.products || 0} productos
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Category Dialog */}
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Categoría</DialogTitle>
              <DialogDescription>
                Modifica la información de la categoría.
              </DialogDescription>
            </DialogHeader>
            {editingCategory && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-category-name">Nombre</Label>
                  <Input
                    id="edit-category-name"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-category-description">Descripción</Label>
                  <Input
                    id="edit-category-description"
                    value={editingCategory.description || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleUpdateCategory}>
                Guardar Cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Brand Dialog */}
        <Dialog open={!!editingBrand} onOpenChange={() => setEditingBrand(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Marca</DialogTitle>
              <DialogDescription>
                Modifica la información de la marca.
              </DialogDescription>
            </DialogHeader>
            {editingBrand && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-brand-name">Nombre</Label>
                  <Input
                    id="edit-brand-name"
                    value={editingBrand.name}
                    onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-brand-description">Descripción</Label>
                  <Input
                    id="edit-brand-description"
                    value={editingBrand.description || ''}
                    onChange={(e) => setEditingBrand({ ...editingBrand, description: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-brand-website">Sitio Web</Label>
                  <Input
                    id="edit-brand-website"
                    value={editingBrand.website || ''}
                    onChange={(e) => setEditingBrand({ ...editingBrand, website: e.target.value })}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleUpdateBrand}>
                Guardar Cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}