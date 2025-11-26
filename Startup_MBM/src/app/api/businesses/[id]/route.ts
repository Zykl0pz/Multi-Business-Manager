import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const business = await db.business.delete({
      where: { id }
    })

    return NextResponse.json(business)
  } catch (error) {
    console.error('Error deleting business:', error)
    return NextResponse.json(
      { error: 'Error deleting business' },
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

    return NextResponse.json(business)
  } catch (error) {
    console.error('Error fetching business:', error)
    return NextResponse.json(
      { error: 'Error fetching business' },
      { status: 500 }
    )
  }
}