import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const brands = await db.brand.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(brands)
  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json(
      { error: 'Error fetching brands' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, website } = body

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Brand name is required' },
        { status: 400 }
      )
    }

    const brand = await db.brand.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        website: website?.trim() || null
      },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    return NextResponse.json(brand, { status: 201 })
  } catch (error) {
    console.error('Error creating brand:', error)
    return NextResponse.json(
      { error: 'Error creating brand' },
      { status: 500 }
    )
  }
}