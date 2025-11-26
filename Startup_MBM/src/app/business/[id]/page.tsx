'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertTriangle,
  Calendar,
  BarChart3,
  Plus,
  Receipt,
  Download
} from 'lucide-react'
import Link from 'next/link'
import ExportModal from '@/components/export/ExportModal'

interface BusinessMetrics {
  business: {
    id: string
    name: string
    createdAt: string
  }
  counts: {
    products: number
    incomes: number
    expenses: number
  }
  financial: {
    totalIncome: number
    totalExpense: number
    profit: number
    profitMargin: number
    last7DaysIncome: number
    costBenefitRatio: number
  }
  inventory: {
    totalProducts: number
    inventoryValue: number
    inventoryRetailValue: number
    potentialProfit: number
    lowStockProducts: number
  }
  last7DaysIncomes: Array<{
    id: string
    description: string
    amount: number
    date: string
  }>
}

export default function BusinessDashboard() {
  const params = useParams()
  const router = useRouter()
  const businessId = params.id as string

  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  useEffect(() => {
    if (businessId) {
      fetchMetrics()
    }
  }, [businessId])

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`/api/businesses/${businessId}/metrics`)
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Negocio no encontrado</h2>
          <Button onClick={() => router.push('/')}>
            Volver al inicio
          </Button>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{metrics.business.name}</h1>
              <p className="text-muted-foreground">
                Creado el {formatDate(metrics.business.createdAt)}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setIsExportModalOpen(true)}
            >
              <Download className="h-4 w-4" />
              Exportar a CSV
            </Button>
            <Link href={`/business/${businessId}/incomes`}>
              <Button variant="outline" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Gestionar Ingresos
              </Button>
            </Link>
            <Link href={`/business/${businessId}/expenses`}>
              <Button variant="outline" className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Gestionar Gastos
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(metrics.financial.totalIncome)}
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.counts.incomes} transacciones
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(metrics.financial.totalExpense)}
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.counts.expenses} transacciones
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Beneficio Neto</CardTitle>
              <TrendingUp className={`h-4 w-4 ${metrics.financial.profit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metrics.financial.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(metrics.financial.profit)}
              </div>
              <p className="text-xs text-muted-foreground">
                Margen: {metrics.financial.profitMargin.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos (7 días)</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(metrics.financial.last7DaysIncome)}
              </div>
              <p className="text-xs text-muted-foreground">
                Últimos 7 días
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="inventory">Inventario</TabsTrigger>
            <TabsTrigger value="financial">Finanzas</TabsTrigger>
            <TabsTrigger value="recent">Actividad Reciente</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Relación Coste/Beneficio
                  </CardTitle>
                  <CardDescription>
                    Ratio de ingresos vs gastos desde la creación del negocio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {metrics.financial.costBenefitRatio.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {metrics.financial.costBenefitRatio > 1 
                      ? 'El negocio es rentable' 
                      : 'El negocio necesita más ingresos para cubrir gastos'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Estado del Inventario
                  </CardTitle>
                  <CardDescription>
                    Resumen de productos y valores de inventario
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Productos:</span>
                      <span className="font-semibold">{metrics.inventory.totalProducts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valor Inventario:</span>
                      <span className="font-semibold">{formatCurrency(metrics.inventory.inventoryValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valor Retail:</span>
                      <span className="font-semibold">{formatCurrency(metrics.inventory.inventoryRetailValue)}</span>
                    </div>
                    {metrics.inventory.lowStockProducts > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          Stock bajo:
                        </span>
                        <span className="font-semibold">{metrics.inventory.lowStockProducts}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestión de Inventario</h2>
              <Link href={`/business/${businessId}/inventory`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Gestionar Productos
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Valor del Inventario</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(metrics.inventory.inventoryValue)}
                  </div>
                  <p className="text-sm text-muted-foreground">Coste total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Valor Retail Potencial</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(metrics.inventory.inventoryRetailValue)}
                  </div>
                  <p className="text-sm text-muted-foreground">Valor de venta total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Beneficio Potencial</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(metrics.inventory.potentialProfit)}
                  </div>
                  <p className="text-sm text-muted-foreground">Margen del inventario</p>
                </CardContent>
              </Card>
            </div>

            {metrics.inventory.lowStockProducts > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Alerta de Stock Bajo
                  </CardTitle>
                  <CardDescription>
                    Hay {metrics.inventory.lowStockProducts} productos con stock bajo o agotado
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Ingresos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {formatCurrency(metrics.financial.totalIncome)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total de ingresos desde la creación
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Gastos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {formatCurrency(metrics.financial.totalExpense)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total de gastos desde la creación
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className={metrics.financial.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                    Beneficio Neto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${metrics.financial.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(metrics.financial.profit)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Margen de beneficio: {metrics.financial.profitMargin.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ratio Coste/Beneficio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {metrics.financial.costBenefitRatio.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {metrics.financial.costBenefitRatio > 1 
                      ? 'Cada €1 gastado genera €' + metrics.financial.costBenefitRatio.toFixed(2)
                      : 'Necesita más ingresos para ser rentable'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ingresos de los Últimos 7 Días</CardTitle>
                <CardDescription>
                  Transacciones recientes de ingresos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {metrics.last7DaysIncomes.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No hay ingresos en los últimos 7 días
                  </p>
                ) : (
                  <div className="space-y-4">
                    {metrics.last7DaysIncomes.map((income) => (
                      <div key={income.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{income.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(income.date)}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-green-600">
                          +{formatCurrency(income.amount)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        businessId={businessId}
        businessName={metrics?.business.name || ''}
      />
    </div>
  )
}