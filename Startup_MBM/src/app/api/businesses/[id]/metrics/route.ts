import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get business info
    const business = await db.business.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            incomes: true,
            expenses: true
          }
        }
      }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Get last 7 days incomes
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const last7DaysIncomes = await db.income.findMany({
      where: {
        businessId: id,
        date: {
          gte: sevenDaysAgo
        }
      }
    })

    // Get total incomes and expenses
    const totalIncomes = await db.income.aggregate({
      where: { businessId: id },
      _sum: {
        amount: true
      }
    })

    const totalExpenses = await db.expense.aggregate({
      where: { businessId: id },
      _sum: {
        amount: true
      }
    })

    // Get inventory value
    const products = await db.product.findMany({
      where: { businessId: id }
    })

    const inventoryValue = products.reduce((total, product) => {
      return total + (product.stock * product.cost)
    }, 0)

    const inventoryRetailValue = products.reduce((total, product) => {
      return total + (product.stock * product.price)
    }, 0)

    // Calculate metrics
    const totalIncome = totalIncomes._sum.amount || 0
    const totalExpense = totalExpenses._sum.amount || 0
    const profit = totalIncome - totalExpense
    const profitMargin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0
    const last7DaysIncome = last7DaysIncomes.reduce((sum, income) => sum + income.amount, 0)

    // Get low stock products
    const lowStockProducts = products.filter(product => product.stock <= product.minStock)

    const metrics = {
      business: {
        id: business.id,
        name: business.name,
        createdAt: business.createdAt
      },
      counts: business._count,
      financial: {
        totalIncome,
        totalExpense,
        profit,
        profitMargin,
        last7DaysIncome,
        costBenefitRatio: totalExpense > 0 ? totalIncome / totalExpense : 0
      },
      inventory: {
        totalProducts: products.length,
        inventoryValue,
        inventoryRetailValue,
        potentialProfit: inventoryRetailValue - inventoryValue,
        lowStockProducts: lowStockProducts.length
      },
      last7DaysIncomes: last7DaysIncomes.map(income => ({
        id: income.id,
        description: income.description,
        amount: income.amount,
        date: income.date
      }))
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching business metrics:', error)
    return NextResponse.json(
      { error: 'Error fetching business metrics' },
      { status: 500 }
    )
  }
}