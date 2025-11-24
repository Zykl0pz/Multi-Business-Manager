'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  DollarSign, 
  Calendar,
  Search,
  TrendingUp
} from 'lucide-react'

interface Income {
  id: string
  description: string
  amount: number
  date: string
  createdAt: string
  businessId: string
  business: {
    name: string
  }
}

export default function IncomeManagement() {
  const params = useParams()
  const router = useRouter()
  const businessId = params.id as string

  const [incomes, setIncomes] = useState<Income[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newIncome, setNewIncome] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (businessId) {
      fetchIncomes()
    }
  }, [businessId])

  const fetchIncomes = async () => {
    try {
      const response = await fetch(`/api/incomes?businessId=${businessId}`)
      if (response.ok) {
        const data = await response.json()
        setIncomes(data)
      }
    } catch (error) {
      console.error('Error fetching incomes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddIncome = async () => {
    if (!newIncome.description.trim() || !newIncome.amount) return

    try {
      const response = await fetch('/api/incomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newIncome,
          businessId,
          amount: parseFloat(newIncome.amount)
        })
      })

      if (response.ok) {
        setNewIncome({
          description: '',
          amount: '',
          date: new Date().toISOString().split('T')[0]
        })
        setIsAddDialogOpen(false)
        fetchIncomes()
      }
    } catch (error) {
      console.error('Error adding income:', error)
    }
  }

  const handleDeleteIncome = async (id: string) => {
    try {
      const response = await fetch(`/api/incomes/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchIncomes()
      }
    } catch (error) {
      console.error('Error deleting income:', error)
    }
  }

  const filteredIncomes = incomes.filter(income =>
    income.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalIncome = filteredIncomes.reduce((sum, income) => sum + income.amount, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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
              <h1 className="text-3xl font-bold">Gestión de Ingresos</h1>
              <p className="text-muted-foreground">
                {incomes.length} transacciones registradas
              </p>
            </div>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Ingreso
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Ingreso</DialogTitle>
                <DialogDescription>
                  Añade un nuevo ingreso al negocio.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="description">Descripción *</Label>
                  <Input
                    id="description"
                    value={newIncome.description}
                    onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
                    placeholder="Descripción del ingreso"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Cantidad *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newIncome.amount}
                    onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Fecha *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newIncome.date}
                    onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddIncome} disabled={!newIncome.description.trim() || !newIncome.amount}>
                  Registrar Ingreso
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <DollarSign className="h-5 w-5" />
              Total de Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-sm text-muted-foreground">
              Suma de todos los ingresos registrados
            </p>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ingresos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Incomes List */}
        {filteredIncomes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <DollarSign className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? 'No se encontraron ingresos' : 'No hay ingresos registrados'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Intenta con otra búsqueda' : 'Registra tu primer ingreso para empezar a gestionar las finanzas.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primer Ingreso
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredIncomes.map((income) => (
              <Card key={income.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{income.description}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(income.date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          Registrado el {formatDate(income.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          +{formatCurrency(income.amount)}
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar Ingreso?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará permanentemente el ingreso de "{income.description}" por {formatCurrency(income.amount)}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteIncome(income.id)}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}