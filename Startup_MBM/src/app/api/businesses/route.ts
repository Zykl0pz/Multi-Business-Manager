import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const businesses = await db.business.findMany({
      include: {
        _count: {
          select: {
            products: true,
            incomes: true,
            expenses: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(businesses)
  } catch (error) {
    console.error('Error fetching businesses:', error)
    return NextResponse.json(
      { error: 'Error fetching businesses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, address, website } = body

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      )
    }

    const business = await db.business.create({
      data: {
        name: name.trim(),
        address: address?.trim() || null,
        website: website?.trim() || null
      },
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

    return NextResponse.json(business, { status: 201 })
  } catch (error) {
    console.error('Error creating business:', error)
    return NextResponse.json(
      { error: 'Error creating business' },
      { status: 500 }
    )
  }
}