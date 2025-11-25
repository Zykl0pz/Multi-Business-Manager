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

  return [ headerRow, ...dataRows ].join('\n')
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[ key ], obj)
}

function generateSectionWithMessage(sectionName: string, dataType: string): string {
  const message = `El apartado de ${sectionName} no contiene información`
  return escapeCSVField(message)
}

async function getAllData(businessId: string, selectedFields: string[]) {
  // Obtener todos los datos en paralelo
  const [ products, incomes, expenses ] = await Promise.all([
    getProductsData(businessId, selectedFields),
    getIncomesData(businessId, selectedFields),
    getExpensesData(businessId, selectedFields)
  ])

  // Generar CSV para cada sección con separación visual y mensajes cuando no hay datos
  const sections: string[] = []

  // Sección de productos
  if (products.length > 0) {
    const productHeaders = selectedFields.filter(field => 
      products[0] && Object.keys(products[0]).includes(field)
    )
    if (productHeaders.length > 0) {
      sections.push(generateCSV(products, productHeaders))
    } else if (products.length > 0) {
      // Si hay productos pero no campos seleccionados válidos
      sections.push(generateSectionWithMessage('productos', 'products'))
    }
  } else {
    sections.push(generateSectionWithMessage('productos', 'products'))
  }

  // Fila en blanco antes de la siguiente sección (si hay secciones anteriores)
  if (sections.length > 0) sections.push('')

  // Sección de ingresos
  if (incomes.length > 0) {
    const incomeHeaders = selectedFields.filter(field => 
      incomes[0] && Object.keys(incomes[0]).includes(field)
    )
    if (incomeHeaders.length > 0) {
      sections.push(generateCSV(incomes, incomeHeaders))
    } else if (incomes.length > 0) {
      // Si hay ingresos pero no campos seleccionados válidos
      sections.push(generateSectionWithMessage('ingresos', 'incomes'))
    }
  } else {
    sections.push(generateSectionWithMessage('ingresos', 'incomes'))
  }

  // Fila en blanco antes de la siguiente sección (si hay secciones anteriores)
  if (sections.length > 0) sections.push('')

  // Sección de gastos
  if (expenses.length > 0) {
    const expenseHeaders = selectedFields.filter(field => 
      expenses[0] && Object.keys(expenses[0]).includes(field)
    )
    if (expenseHeaders.length > 0) {
      sections.push(generateCSV(expenses, expenseHeaders))
    } else if (expenses.length > 0) {
      // Si hay gastos pero no campos seleccionados válidos
      sections.push(generateSectionWithMessage('gastos', 'expenses'))
    }
  } else {
    sections.push(generateSectionWithMessage('gastos', 'expenses'))
  }

  return sections.join('\n')
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

function generateIndividualCSVWithMessage(dataType: string): string {
  let sectionName = ''
  switch (dataType) {
    case 'products':
      sectionName = 'productos'
      break
    case 'incomes':
      sectionName = 'ingresos'
      break
    case 'expenses':
      sectionName = 'gastos'
      break
    default:
      sectionName = 'datos'
  }
  return generateSectionWithMessage(sectionName, dataType)
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

    let csv: string = ''
    let filename = ''

    switch (dataType) {
      case 'all':
        csv = await getAllData(id, selectedFields)
        filename = `todos_los_datos_${new Date().toISOString().split('T')[ 0 ]}.csv`
        break
      case 'products':
        const productsData = await getProductsData(id, selectedFields)
        if (productsData.length === 0) {
          csv = generateIndividualCSVWithMessage('products')
        } else {
          const productHeaders = selectedFields.filter(field => 
            Object.keys(productsData[0]).includes(field)
          )
          if (productHeaders.length === 0) {
            csv = generateIndividualCSVWithMessage('products')
          } else {
            csv = generateCSV(productsData, productHeaders)
          }
        }
        filename = `productos_${new Date().toISOString().split('T')[ 0 ]}.csv`
        break
      case 'incomes':
        const incomesData = await getIncomesData(id, selectedFields)
        if (incomesData.length === 0) {
          csv = generateIndividualCSVWithMessage('incomes')
        } else {
          const incomeHeaders = selectedFields.filter(field => 
            Object.keys(incomesData[0]).includes(field)
          )
          if (incomeHeaders.length === 0) {
            csv = generateIndividualCSVWithMessage('incomes')
          } else {
            csv = generateCSV(incomesData, incomeHeaders)
          }
        }
        filename = `ingresos_${new Date().toISOString().split('T')[ 0 ]}.csv`
        break
      case 'expenses':
        const expensesData = await getExpensesData(id, selectedFields)
        if (expensesData.length === 0) {
          csv = generateIndividualCSVWithMessage('expenses')
        } else {
          const expenseHeaders = selectedFields.filter(field => 
            Object.keys(expensesData[0]).includes(field)
          )
          if (expenseHeaders.length === 0) {
            csv = generateIndividualCSVWithMessage('expenses')
          } else {
            csv = generateCSV(expensesData, expenseHeaders)
          }
        }
        filename = `gastos_${new Date().toISOString().split('T')[ 0 ]}.csv`
        break
      default:
        return NextResponse.json(
          { error: 'Tipo de datos no válido' },
          { status: 400 }
        )
    }

    if (!csv || csv.trim() === '') {
      return NextResponse.json(
        { error: 'No hay datos para exportar' },
        { status: 404 }
      )
    }

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