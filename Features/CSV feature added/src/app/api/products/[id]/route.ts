import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, description, sku, price, cost, stock, minStock, categoryId, brandId } = body

    const product = await db.product.update({
      where: { id },
      data: {
        name: name?.trim(),
        description: description?.trim() || null,
        sku: sku?.trim() || null,
        price: parseFloat(price),
        cost: parseFloat(cost),
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 0,
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

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Error updating product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const product = await db.product.delete({
      where: { id }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Error deleting product' },
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

    const product = await db.product.findUnique({
      where: { id },
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

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Error fetching product' },
      { status: 500 }
    )
  }
}