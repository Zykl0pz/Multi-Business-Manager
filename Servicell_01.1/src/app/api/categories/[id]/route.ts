import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const category = await db.category.delete({
      where: { id }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Error deleting category' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, description } = body

    const category = await db.category.update({
      where: { id },
      data: {
        name: name?.trim(),
        description: description?.trim() || null
      },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Error updating category' },
      { status: 500 }
    )
  }
}