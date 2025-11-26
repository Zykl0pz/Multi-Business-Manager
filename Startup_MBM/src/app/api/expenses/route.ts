import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    const expenses = await db.expense.findMany({
      where: businessId ? { businessId } : undefined,
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

    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { error: 'Error fetching expenses' },
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

    const expense = await db.expense.create({
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

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { error: 'Error creating expense' },
      { status: 500 }
    )
  }
}