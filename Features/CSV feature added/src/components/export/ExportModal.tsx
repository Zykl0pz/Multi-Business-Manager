'use client'

import { useState } from 'react'
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
      { key: 'ID', label: 'ID', description: 'Identificador único' },
      { key: 'Descripción', label: 'Descripción', description: 'Descripción del ingreso' },
      { key: 'Cantidad', label: 'Cantidad', description: 'Monto del ingreso' },
      { key: 'Fecha', label: 'Fecha', description: 'Fecha del ingreso' },
      { key: 'Fecha Registro', label: 'Fecha Registro', description: 'Fecha de registro' }
    ]
  },
  {
    key: 'expenses',
    label: 'Gastos',
    description: 'Exportar registro de gastos',
    fields: [
      { key: 'ID', label: 'ID', description: 'Identificador único' },
      { key: 'Descripción', label: 'Descripción', description: 'Descripción del gasto' },
      { key: 'Cantidad', label: 'Cantidad', description: 'Monto del gasto' },
      { key: 'Fecha', label: 'Fecha', description: 'Fecha del gasto' },
      { key: 'Fecha Registro', label: 'Fecha Registro', description: 'Fecha de registro' }
    ]
  }
]

export default function ExportModal({ isOpen, onClose, businessId, businessName }: ExportModalProps) {
  const [selectedDataType, setSelectedDataType] = useState<string>('products')
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)

  const currentDataType = dataTypesConfig.find(config => config.key === selectedDataType)

  const handleFieldToggle = (fieldKey: string, checked: boolean) => {
    if (checked) {
      setSelectedFields(prev => [...prev, fieldKey])
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

  const handleExport = async () => {
    if (selectedFields.length === 0) {
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
        // Create download link
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        
        // Get filename from response headers or create default
        const contentDisposition = response.headers.get('content-disposition')
        let filename = `${businessName}_${selectedDataType}_${new Date().toISOString().split('T')[0]}.csv`
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
          if (filenameMatch) {
            filename = filenameMatch[1]
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

  // Reset selected fields when data type changes
  const handleDataTypeChange = (dataType: string) => {
    setSelectedDataType(dataType)
    setSelectedFields([])
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Datos a CSV
          </DialogTitle>
          <DialogDescription>
            Selecciona el tipo de datos y los campos que deseas exportar del negocio "{businessName}".
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
          {/* Data Type Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold">Tipo de Datos</h3>
            <div className="space-y-2">
              {dataTypesConfig.map(config => (
                <div
                  key={config.key}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedDataType === config.key
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted'
                  }`}
                  onClick={() => handleDataTypeChange(config.key)}
                >
                  <div className="font-medium">{config.label}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {config.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Field Selection */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Campos a Exportar</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={!currentDataType}
                >
                  <CheckSquare className="h-4 w-4 mr-1" />
                  Seleccionar todos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  disabled={!currentDataType}
                >
                  <Square className="h-4 w-4 mr-1" />
                  Deseleccionar todos
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground mb-2">
              <Badge variant="secondary">
                {selectedFields.length} de {currentDataType?.fields.length || 0} campos seleccionados
              </Badge>
            </div>

            <ScrollArea className="h-64 border rounded-lg p-4">
              <div className="space-y-3">
                {currentDataType?.fields.map(field => (
                  <div key={field.key} className="flex items-start space-x-3">
                    <Checkbox
                      id={field.key}
                      checked={selectedFields.includes(field.key)}
                      onCheckedChange={(checked) => handleFieldToggle(field.key, checked as boolean)}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={field.key}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {field.label}
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {field.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <Separator />

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {selectedFields.length === 0 && (
                <span className="text-destructive">Debes seleccionar al menos un campo</span>
              )}
              {selectedFields.length > 0 && (
                <span>Se exportarán {selectedFields.length} campos</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={isExporting}>
                Cancelar
              </Button>
              <Button
                onClick={handleExport}
                disabled={selectedFields.length === 0 || isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}