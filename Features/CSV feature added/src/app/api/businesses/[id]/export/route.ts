import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface ExportRequest {
  businessId: string
  dataType: 'products' | 'incomes' | 'expenses' | 'all'
  selectedFields: string[]
}

function escapeCSVField(field: string): string {
  if (field == null) return ''
  
  const stringField = String(field)
  
  // If field contains comma, newline or quotes, wrap in quotes and escape internal quotes
  if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
    return '"' + stringField.replace(/"/g, '""') + '"'
  }
  
  return stringField
}

function generateCSV(data: any[], headers: string[]): string {
  if (data.length === 0) return ''
  
  // Header row
  const headerRow = headers.map(header => escapeCSVField(header)).join(',')
  
  // Data rows
  const dataRows = data.map(row => {
    return headers.map(header => {
      const value = getNestedValue(row, header)
      return escapeCSVField(value)
    }).join(',')
  })
  
  return [headerRow, ...dataRows].join('\n')
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

async function getProductsData(businessId: string, selectedFields: string[]) {
  const products = await db.product.findMany({
    where: { businessId },
    include: {
      category: {
        select: { name: true }
      },
      brand: {
        select: { name: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return products.map(product => ({
    'ID': product.id,
    'Nombre': product.name,
    'Descripción': product.description || '',
    'SKU': product.sku || '',
    'Precio': product.price,
    'Coste': product.cost,
    'Stock': product.stock,
    'Stock Mínimo': product.minStock,
    'Categoría': product.category?.name || '',
    'Marca': product.brand?.name || '',
    'Beneficio Unitario': product.price - product.cost,
    'Margen Beneficio': ((product.price - product.cost) / product.price * 100).toFixed(2) + '%',
    'Valor Total Inventario': product.stock * product.cost,
    'Fecha Creación': new Date(product.createdAt).toLocaleDateString('es-ES'),
    'Última Actualización': new Date(product.updatedAt).toLocaleDateString('es-ES')
  }))
}

async function getIncomesData(businessId: string, selectedFields: string[]) {
  const incomes = await db.income.findMany({
    where: { businessId },
    orderBy: { date: 'desc' }
  })

  return incomes.map(income => ({
    'ID': income.id,
    'Descripción': income.description,
    'Cantidad': income.amount,
    'Fecha': new Date(income.date).toLocaleDateString('es-ES'),
    'Fecha Registro': new Date(income.createdAt).toLocaleDateString('es-ES')
  }))
}

async function getExpensesData(businessId: string, selectedFields: string[]) {
  const expenses = await db.expense.findMany({
    where: { businessId },
    orderBy: { date: 'desc' }
  })

  return expenses.map(expense => ({
    'ID': expense.id,
    'Descripción': expense.description,
    'Cantidad': expense.amount,
    'Fecha': new Date(expense.date).toLocaleDateString('es-ES'),
    'Fecha Registro': new Date(expense.createdAt).toLocaleDateString('es-ES')
  }))
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body: ExportRequest = await request.json()
    const { dataType, selectedFields } = body

    if (!selectedFields || selectedFields.length === 0) {
      return NextResponse.json(
        { error: 'Debes seleccionar al menos un campo para exportar' },
        { status: 400 }
      )
    }

    let data: any[] = []
    let filename = ''

    switch (dataType) {
      case 'products':
        data = await getProductsData(id, selectedFields)
        filename = `productos_${new Date().toISOString().split('T')[0]}.csv`
        break
      case 'incomes':
        data = await getIncomesData(id, selectedFields)
        filename = `ingresos_${new Date().toISOString().split('T')[0]}.csv`
        break
      case 'expenses':
        data = await getExpensesData(id, selectedFields)
        filename = `gastos_${new Date().toISOString().split('T')[0]}.csv`
        break
      default:
        return NextResponse.json(
          { error: 'Tipo de datos no válido' },
          { status: 400 }
        )
    }

    if (data.length === 0) {
      return NextResponse.json(
        { error: 'No hay datos para exportar' },
        { status: 404 }
      )
    }

    // Filter data by selected fields
    const filteredData = data.map(item => {
      const filteredItem: any = {}
      selectedFields.forEach(field => {
        if (item.hasOwnProperty(field)) {
          filteredItem[field] = item[field]
        }
      })
      return filteredItem
    })

    // Generate CSV
    const csv = generateCSV(filteredData, selectedFields)

    // Get business name for filename
    const business = await db.business.findUnique({
      where: { id },
      select: { name: true }
    })

    const businessName = business?.name || 'negocio'
    const finalFilename = `${businessName}_${filename}`

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${finalFilename}"`
      }
    })

  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      { error: 'Error al exportar datos' },
      { status: 500 }
    )
  }
}