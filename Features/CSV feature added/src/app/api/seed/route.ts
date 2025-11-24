import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Categories for electronics and mobile parts
    const categories = [
      { name: 'Pantallas', description: 'Pantallas para móviles y tablets' },
      { name: 'Baterías', description: 'Baterías para dispositivos móviles' },
      { name: 'Cargadores', description: 'Cargadores y adaptadores' },
      { name: 'Fundas', description: 'Fundas y protectores' },
      { name: 'Auriculares', description: 'Auriculares y audífonos' },
      { name: 'Cables', description: 'Cables y conectores' },
      { name: 'Memorias', description: 'Tarjetas de memoria y USB' },
      { name: 'Accesorios', description: 'Otros accesorios móviles' }
    ]

    // Popular mobile and electronics brands
    const brands = [
      { name: 'Samsung', description: 'Electrónica y móviles Samsung', website: 'https://www.samsung.com' },
      { name: 'Xiaomi', description: 'Dispositivos móviles Xiaomi', website: 'https://www.mi.com' },
      { name: 'Huawei', description: 'Tecnología Huawei', website: 'https://www.huawei.com' },
      { name: 'Apple', description: 'Productos Apple', website: 'https://www.apple.com' },
      { name: 'OPPO', description: 'Móviles OPPO', website: 'https://www.oppo.com' },
      { name: 'Vivo', description: 'Dispositivos Vivo', website: 'https://www.vivo.com' },
      { name: 'Realme', description: 'Móviles Realme', website: 'https://www.realme.com' },
      { name: 'OnePlus', description: 'Móviles OnePlus', website: 'https://www.oneplus.com' },
      { name: 'Motorola', description: 'Dispositivos Motorola', website: 'https://www.motorola.com' },
      { name: 'LG', description: 'Electrónica LG', website: 'https://www.lg.com' },
      { name: 'Sony', description: 'Electrónica Sony', website: 'https://www.sony.com' },
      { name: 'Nokia', description: 'Móviles Nokia', website: 'https://www.nokia.com' },
      { name: 'Lenovo', description: 'Tecnología Lenovo', website: 'https://www.lenovo.com' },
      { name: 'ASUS', description: 'Electrónica ASUS', website: 'https://www.asus.com' },
      { name: 'Generic', description: 'Productos genéricos sin marca' }
    ]

    // Insert categories
    const insertedCategories = await Promise.all(
      categories.map(async (category) => {
        const existing = await db.category.findUnique({
          where: { name: category.name }
        })
        
        if (!existing) {
          return await db.category.create({
            data: category
          })
        }
        return existing
      })
    )

    // Insert brands
    const insertedBrands = await Promise.all(
      brands.map(async (brand) => {
        const existing = await db.brand.findUnique({
          where: { name: brand.name }
        })
        
        if (!existing) {
          return await db.brand.create({
            data: brand
          })
        }
        return existing
      })
    )

    return NextResponse.json({
      success: true,
      message: 'Datos iniciales cargados exitosamente',
      categories: insertedCategories.length,
      brands: insertedBrands.length
    })

  } catch (error) {
    console.error('Error seeding data:', error)
    return NextResponse.json(
      { error: 'Error seeding data' },
      { status: 500 }
    )
  }
}