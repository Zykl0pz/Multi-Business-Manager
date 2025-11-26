import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    const products = await db.product.findMany({
      where: businessId ? { businessId } : undefined,
      include: {
        business: {
          select: {
            name: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        brand: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Error fetching products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, sku, price, cost, stock, minStock, businessId, categoryId, brandId } = body

    if (!name || !businessId || price === undefined || cost === undefined) {
      return NextResponse.json(
        { error: 'Name, businessId, price, and cost are required' },
        { status: 400 }
      )
    }

    const product = await db.product.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        sku: sku?.trim() || null,
        price: parseFloat(price),
        cost: parseFloat(cost),
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 0,
        businessId,
        categoryId: categoryId || null,
        brandId: brandId || null
      },
      include: {
        business: {
          select: {
            name: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        brand: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Error creating product' },
      { status: 500 }
    )
  }
}