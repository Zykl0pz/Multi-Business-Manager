import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const income = await db.income.delete({
      where: { id }
    })

    return NextResponse.json(income)
  } catch (error) {
    console.error('Error deleting income:', error)
    return NextResponse.json(
      { error: 'Error deleting income' },
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

    const income = await db.income.findUnique({
      where: { id },
      include: {
        business: {
          select: {
            name: true
          }
        }
      }
    })

    if (!income) {
      return NextResponse.json(
        { error: 'Income not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(income)
  } catch (error) {
    console.error('Error fetching income:', error)
    return NextResponse.json(
      { error: 'Error fetching income' },
      { status: 500 }
    )
  }
}