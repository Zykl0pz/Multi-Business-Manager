import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    const last7Days = searchParams.get('last7Days')

    let whereClause: any = businessId ? { businessId } : undefined

    if (last7Days === 'true') {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      whereClause = {
        ...whereClause,
        date: {
          gte: sevenDaysAgo
        }
      }
    }

    const incomes = await db.income.findMany({
      where: whereClause,
      include: {
        business: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(incomes)
  } catch (error) {
    console.error('Error fetching incomes:', error)
    return NextResponse.json(
      { error: 'Error fetching incomes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { description, amount, date, businessId } = body

    if (!description || !amount || !businessId) {
      return NextResponse.json(
        { error: 'Description, amount, and businessId are required' },
        { status: 400 }
      )
    }

    const income = await db.income.create({
      data: {
        description: description.trim(),
        amount: parseFloat(amount),
        date: new Date(date),
        businessId
      },
      include: {
        business: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json(income, { status: 201 })
  } catch (error) {
    console.error('Error creating income:', error)
    return NextResponse.json(
      { error: 'Error creating income' },
      { status: 500 }
    )
  }
}