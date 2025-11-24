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
  TrendingDown, 
  Calendar,
  Search,
  Receipt
} from 'lucide-react'

interface Expense {
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

export default function ExpenseManagement() {
  const params = useParams()
  const router = useRouter()
  const businessId = params.id as string

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (businessId) {
      fetchExpenses()
    }
  }, [businessId])

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`/api/expenses?businessId=${businessId}`)
      if (response.ok) {
        const data = await response.json()
        setExpenses(data)
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddExpense = async () => {
    if (!newExpense.description.trim() || !newExpense.amount) return

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newExpense,
          businessId,
          amount: parseFloat(newExpense.amount)
        })
      })

      if (response.ok) {
        setNewExpense({
          description: '',
          amount: '',
          date: new Date().toISOString().split('T')[0]
        })
        setIsAddDialogOpen(false)
        fetchExpenses()
      }
    } catch (error) {
      console.error('Error adding expense:', error)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchExpenses()
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  }

  const filteredExpenses = expenses.filter(expense =>
    expense.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

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
              <h1 className="text-3xl font-bold">Gestión de Gastos</h1>
              <p className="text-muted-foreground">
                {expenses.length} transacciones registradas
              </p>
            </div>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Gasto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Gasto</DialogTitle>
                <DialogDescription>
                  Añade un nuevo gasto al negocio.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="description">Descripción *</Label>
                  <Input
                    id="description"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    placeholder="Descripción del gasto"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Cantidad *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Fecha *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddExpense} disabled={!newExpense.description.trim() || !newExpense.amount}>
                  Registrar Gasto
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Receipt className="h-5 w-5" />
              Total de Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-sm text-muted-foreground">
              Suma de todos los gastos registrados
            </p>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar gastos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Expenses List */}
        {filteredExpenses.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Receipt className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? 'No se encontraron gastos' : 'No hay gastos registrados'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Intenta con otra búsqueda' : 'Registra tu primer gasto para empezar a gestionar las finanzas.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primer Gasto
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredExpenses.map((expense) => (
              <Card key={expense.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{expense.description}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(expense.date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingDown className="h-4 w-4" />
                          Registrado el {formatDate(expense.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-600">
                          -{formatCurrency(expense.amount)}
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
                            <AlertDialogTitle>¿Eliminar Gasto?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará permanentemente el gasto de "{expense.description}" por {formatCurrency(expense.amount)}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteExpense(expense.id)}>
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