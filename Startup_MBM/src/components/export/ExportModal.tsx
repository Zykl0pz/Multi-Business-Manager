'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Download, CheckSquare, Square, Loader2 } from 'lucide-react'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  businessId: string
  businessName: string
}

interface DataTypeConfig {
  key: string
  label: string
  description: string
  fields: { key: string; label: string; description: string }[]
}

const dataTypesConfig: DataTypeConfig[] = [
  {
    key: 'all',
    label: 'Todos los Datos',
    description: 'Exportar productos, ingresos y gastos en un solo archivo',
    fields: [
      { key: 'ID', label: 'ID', description: 'Identificador único del producto' },
      { key: 'Nombre', label: 'Nombre', description: 'Nombre del producto' },
      { key: 'Descripción', label: 'Descripción', description: 'Descripción detallada' },
      { key: 'SKU', label: 'SKU', description: 'Código de producto' },
      { key: 'Precio', label: 'Precio', description: 'Precio de venta' },
      { key: 'Coste', label: 'Coste', description: 'Coste del producto' },
      { key: 'Stock', label: 'Stock', description: 'Unidades disponibles' },
      { key: 'Stock Mínimo', label: 'Stock Mínimo', description: 'Nivel mínimo de stock' },
      { key: 'Categoría', label: 'Categoría', description: 'Categoría asignada' },
      { key: 'Marca', label: 'Marca', description: 'Marca del producto' },
      { key: 'Beneficio Unitario', label: 'Beneficio Unitario', description: 'Beneficio por unidad' },
      { key: 'Margen Beneficio', label: 'Margen Beneficio', description: 'Porcentaje de beneficio' },
      { key: 'Valor Total Inventario', label: 'Valor Total Inventario', description: 'Valor total del stock' },
      { key: 'Fecha Creación', label: 'Fecha Creación', description: 'Fecha de creación' },
      { key: 'Última Actualización', label: 'Última Actualización', description: 'Última modificación' },
      { key: 'ID_INGRESO', label: 'ID', description: 'Identificador único' },
      { key: 'Descripción_INGRESO', label: 'Descripción', description: 'Descripción del ingreso' },
      { key: 'Cantidad_INGRESO', label: 'Cantidad', description: 'Monto del ingreso' },
      { key: 'Fecha_INGRESO', label: 'Fecha', description: 'Fecha del ingreso' },
      { key: 'Fecha Registro_INGRESO', label: 'Fecha Registro', description: 'Fecha de registro' },
      { key: 'ID_GASTO', label: 'ID', description: 'Identificador único' },
      { key: 'Descripción_GASTO', label: 'Descripción', description: 'Descripción del gasto' },
      { key: 'Cantidad_GASTO', label: 'Cantidad', description: 'Monto del gasto' },
      { key: 'Fecha_GASTO', label: 'Fecha', description: 'Fecha del gasto' },
      { key: 'Fecha Registro_GASTO', label: 'Fecha Registro', description: 'Fecha de registro' }
    ]
  },
  {
    key: 'products',
    label: 'Productos',
    description: 'Exportar catálogo de productos con inventario',
    fields: [
      { key: 'ID', label: 'ID', description: 'Identificador único del producto' },
      { key: 'Nombre', label: 'Nombre', description: 'Nombre del producto' },
      { key: 'Descripción', label: 'Descripción', description: 'Descripción detallada' },
      { key: 'SKU', label: 'SKU', description: 'Código de producto' },
      { key: 'Precio', label: 'Precio', description: 'Precio de venta' },
      { key: 'Coste', label: 'Coste', description: 'Coste del producto' },
      { key: 'Stock', label: 'Stock', description: 'Unidades disponibles' },
      { key: 'Stock Mínimo', label: 'Stock Mínimo', description: 'Nivel mínimo de stock' },
      { key: 'Categoría', label: 'Categoría', description: 'Categoría asignada' },
      { key: 'Marca', label: 'Marca', description: 'Marca del producto' },
      { key: 'Beneficio Unitario', label: 'Beneficio Unitario', description: 'Beneficio por unidad' },
      { key: 'Margen Beneficio', label: 'Margen Beneficio', description: 'Porcentaje de beneficio' },
      { key: 'Valor Total Inventario', label: 'Valor Total Inventario', description: 'Valor total del stock' },
      { key: 'Fecha Creación', label: 'Fecha Creación', description: 'Fecha de creación' },
      { key: 'Última Actualización', label: 'Última Actualización', description: 'Última modificación' }
    ]
  },
  {
    key: 'incomes',
    label: 'Ingresos',
    description: 'Exportar registro de ingresos',
    fields: [
      { key: 'ID_INGRESO', label: 'ID', description: 'Identificador único' },
      { key: 'Descripción_INGRESO', label: 'Descripción', description: 'Descripción del ingreso' },
      { key: 'Cantidad_INGRESO', label: 'Cantidad', description: 'Monto del ingreso' },
      { key: 'Fecha_INGRESO', label: 'Fecha', description: 'Fecha del ingreso' },
      { key: 'Fecha Registro_INGRESO', label: 'Fecha Registro', description: 'Fecha de registro' }
    ]
  },
  {
    key: 'expenses',
    label: 'Gastos',
    description: 'Exportar registro de gastos',
    fields: [
      { key: 'ID_GASTO', label: 'ID', description: 'Identificador único' },
      { key: 'Descripción_GASTO', label: 'Descripción', description: 'Descripción del gasto' },
      { key: 'Cantidad_GASTO', label: 'Cantidad', description: 'Monto del gasto' },
      { key: 'Fecha_GASTO', label: 'Fecha', description: 'Fecha del gasto' },
      { key: 'Fecha Registro_GASTO', label: 'Fecha Registro', description: 'Fecha de registro' }
    ]
  }
]

// Configuración para exportación completa
const allDataTypesConfig = {
  key: 'all',
  label: 'Todos los Datos',
  description: 'Exportar productos, ingresos y gastos en un solo archivo',
  fields: [
    { key: 'ID', label: 'ID', description: 'Identificador único del producto' },
    { key: 'Nombre', label: 'Nombre', description: 'Nombre del producto' },
    { key: 'Descripción', label: 'Descripción', description: 'Descripción detallada' },
    { key: 'SKU', label: 'SKU', description: 'Código de producto' },
    { key: 'Precio', label: 'Precio', description: 'Precio de venta' },
    { key: 'Coste', label: 'Coste', description: 'Coste del producto' },
    { key: 'Stock', label: 'Stock', description: 'Unidades disponibles' },
    { key: 'Stock Mínimo', label: 'Stock Mínimo', description: 'Nivel mínimo de stock' },
    { key: 'Categoría', label: 'Categoría', description: 'Categoría asignada' },
    { key: 'Marca', label: 'Marca', description: 'Marca del producto' },
    { key: 'Beneficio Unitario', label: 'Beneficio Unitario', description: 'Beneficio por unidad' },
    { key: 'Margen Beneficio', label: 'Margen Beneficio', description: 'Porcentaje de beneficio' },
    { key: 'Valor Total Inventario', label: 'Valor Total Inventario', description: 'Valor total del stock' },
    { key: 'Fecha Creación', label: 'Fecha Creación', description: 'Fecha de creación' },
    { key: 'Última Actualización', label: 'Última Actualización', description: 'Última modificación' },
    { key: 'ID_INGRESO', label: 'ID', description: 'Identificador único' },
    { key: 'Descripción_INGRESO', label: 'Descripción', description: 'Descripción del ingreso' },
    { key: 'Cantidad_INGRESO', label: 'Cantidad', description: 'Monto del ingreso' },
    { key: 'Fecha_INGRESO', label: 'Fecha', description: 'Fecha del ingreso' },
    { key: 'Fecha Registro_INGRESO', label: 'Fecha Registro', description: 'Fecha de registro' },
    { key: 'ID_GASTO', label: 'ID', description: 'Identificador único' },
    { key: 'Descripción_GASTO', label: 'Descripción', description: 'Descripción del gasto' },
    { key: 'Cantidad_GASTO', label: 'Cantidad', description: 'Monto del gasto' },
    { key: 'Fecha_GASTO', label: 'Fecha', description: 'Fecha del gasto' },
    { key: 'Fecha Registro_GASTO', label: 'Fecha Registro', description: 'Fecha de registro' }
  ]
}

export default function ExportModal({ isOpen, onClose, businessId, businessName }: ExportModalProps) {
  const [ selectedDataType, setSelectedDataType ] = useState<string>('products')
  const [ selectedFields, setSelectedFields ] = useState<string[]>([])
  const [ isExporting, setIsExporting ] = useState(false)
  const [ exportAllData, setExportAllData ] = useState(false)

  const currentDataType = dataTypesConfig.find(config => config.key === selectedDataType)

  // Efecto para manejar la selección automática de campos
  useEffect(() => {
    if (currentDataType && !exportAllData) {
      setSelectedFields(currentDataType.fields.map(field => field.key))
    }
  }, [ currentDataType, exportAllData ])

  const handleFieldToggle = (fieldKey: string, checked: boolean) => {
    if (checked) {
      setSelectedFields(prev => [ ...prev, fieldKey ])
    } else {
      setSelectedFields(prev => prev.filter(field => field !== fieldKey))
    }
  }

  const handleSelectAll = () => {
    if (currentDataType) {
      setSelectedFields(currentDataType.fields.map(field => field.key))
    }
  }

  const handleDeselectAll = () => {
    setSelectedFields([])
  }

  // Función para manejar el cambio entre exportación individual y completa
  const handleExportTypeChange = (exportAll: boolean, dataType?: string) => {
    setExportAllData(exportAll)
    if (dataType && !exportAll) {
      setSelectedDataType(dataType)
    }

    if (exportAll) {
      setSelectedFields([])
    } else if (dataType) {
      const selectedConfig = dataTypesConfig.find(config => config.key === dataType)
      if (selectedConfig) {
        setSelectedFields(selectedConfig.fields.map(field => field.key))
      }
    }
  }

  // Función para exportar todos los datos
  const handleExportAll = async () => {
    setIsExporting(true)

    try {
      const response = await fetch(`/api/businesses/${businessId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          dataTypes: dataTypesConfig.map(config => config.key),
          exportAll: true
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url

        const contentDisposition = response.headers.get('content-disposition')
        let filename = `${businessName}_todos_los_datos_${new Date().toISOString().split('T')[ 0 ]}.csv`

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
          if (filenameMatch) {
            filename = filenameMatch[ 1 ]
          }
        }

        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        onClose()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al exportar todos los datos')
      }
    } catch (error) {
      console.error('Export all error:', error)
      alert('Error al exportar todos los datos. Por favor, inténtalo de nuevo.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExport = async () => {
    if (exportAllData) {
      await handleExportAll()
      return
    }

    if (selectedFields.length === 0) {
      alert('Debes seleccionar al menos un campo para exportar')
      return
    }

    setIsExporting(true)

    try {
      const response = await fetch(`/api/businesses/${businessId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          dataType: selectedDataType,
          selectedFields
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url

        const contentDisposition = response.headers.get('content-disposition')
        let filename = `${businessName}_${selectedDataType}_${new Date().toISOString().split('T')[ 0 ]}.csv`

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
          if (filenameMatch) {
            filename = filenameMatch[ 1 ]
          }
        }

        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        onClose()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al exportar datos')
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Error al exportar datos. Por favor, inténtalo de nuevo.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="
        w-[95vw]
        max-w-[95vw]
        sm:max-w-md
        md:max-w-2xl
        lg:max-w-4xl
        max-h-[90vh]
        mx-auto
        my-4
        overflow-x-hidden
      ">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Download className="h-5 w-5" />
            Exportar Datos a CSV
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Selecciona el tipo de datos y los campos que deseas exportar del negocio "{businessName}".
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 py-4">
          
          {/* Selección de Tipo de Datos */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-base sm:text-lg">Tipo de Exportación</h3>
            <div className="space-y-2">
              
              {/* Tipos de datos individuales - CORREGIDO */}
              <div className={`space-y-2 ${exportAllData ? 'opacity-50' : ''}`}>
                {dataTypesConfig.map(config => (
                  <div
                    key={config.key}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedDataType === config.key && !exportAllData
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted'
                      }`}
                    onClick={() => handleExportTypeChange(false, config.key)}
                  >
                    <div className="font-medium text-sm sm:text-base">{config.label}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {config.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selección de Campos */}
          <div className="md:col-span-2 space-y-3 sm:space-y-4">
            {exportAllData ? (
              // Vista para exportación completa
              <div className="space-y-4">
                <h3 className="font-semibold text-base sm:text-lg">Exportación Completa</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-3">
                    Se exportarán <strong>todos los datos</strong> en un único archivo CSV organizado en este orden:
                  </p>
                  <ul className="text-sm space-y-2 ml-4">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span><strong>Productos</strong> - Catálogo completo con inventario</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span><strong>Ingresos</strong> - Registro completo de ingresos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span><strong>Gastos</strong> - Registro completo de gastos</span>
                    </li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-3">
                    Cada sección incluirá todos sus campos disponibles separados por líneas en blanco.
                  </p>
                </div>

                <div className="text-sm text-muted-foreground">
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    Exportación completa de todos los datos
                  </Badge>
                </div>
              </div>
            ) : (
              // Vista existente para exportación individual
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="font-semibold text-base sm:text-lg">Campos a Exportar</h3>
                  <div className="flex flex-col xs:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                      disabled={!currentDataType}
                      className="flex-1 xs:flex-none"
                    >
                      <CheckSquare className="h-4 w-4 mr-1" />
                      Seleccionar todos
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeselectAll}
                      disabled={!currentDataType}
                      className="flex-1 xs:flex-none"
                    >
                      <Square className="h-4 w-4 mr-1" />
                      Deseleccionar todos
                    </Button>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    {selectedFields.length} de {currentDataType?.fields.length || 0} campos seleccionados
                  </Badge>
                </div>

                <ScrollArea className="h-[40vh] sm:h-64 border rounded-lg p-3 sm:p-4">
                  <div className="space-y-3">
                    {currentDataType?.fields.map(field => (
                      <div key={field.key} className="flex items-start space-x-3">
                        <Checkbox
                          id={field.key}
                          checked={selectedFields.includes(field.key)}
                          onCheckedChange={(checked) => handleFieldToggle(field.key, checked as boolean)}
                        />
                        <div className="flex-1 min-w-0">
                          <label
                            htmlFor={field.key}
                            className="text-sm font-medium cursor-pointer break-words"
                          >
                            {field.label}
                          </label>
                          <p className="text-xs text-muted-foreground mt-1 break-words">
                            {field.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>
        </div>

        <Separator />

        <DialogFooter>
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between w-full gap-3">
            <div className="text-sm text-muted-foreground text-center sm:text-left mt-2 sm:mt-0">
              {exportAllData ? (
                <span>Se exportarán todos los datos en un único archivo CSV</span>
              ) : selectedFields.length === 0 ? (
                <span className="text-destructive">Debes seleccionar al menos un campo</span>
              ) : (
                <span>Se exportarán {selectedFields.length} campos de {currentDataType?.label}</span>
              )}
            </div>

            <div className="flex flex-col xs:flex-row gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isExporting}
                className="flex-1 xs:flex-none"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleExport}
                disabled={(!exportAllData && selectedFields.length === 0) || isExporting}
                className="flex-1 xs:flex-none"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    {exportAllData ? 'Exportar Todo CSV' : 'Exportar CSV'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  )
}