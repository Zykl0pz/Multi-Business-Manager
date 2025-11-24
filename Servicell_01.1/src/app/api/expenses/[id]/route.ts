import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const expense = await db.expense.delete({
      where: { id }
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json(
      { error: 'Error deleting expense' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const expense = await db.expense.findUnique({
      where: { id },
      include: {
        business: {
          select: {
            name: true
          }
        }
      }
    })

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Error fetching expense:', error)
    return NextResponse.json(
      { error: 'Error fetching expense' },
      { status: 500 }
    )
  }
}