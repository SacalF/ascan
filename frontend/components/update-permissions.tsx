import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api-client'
import { RefreshCw, Save, Check } from 'lucide-react'

interface UpdatePermissionsProps {
  rolId: string
  rolNombre: string
  permisosActuales: string[]
  onPermissionsUpdated?: () => void
}

export function UpdatePermissions({ 
  rolId, 
  rolNombre, 
  permisosActuales, 
  onPermissionsUpdated 
}: UpdatePermissionsProps) {
  const [permisos, setPermisos] = useState<string[]>(permisosActuales)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const modulosDisponibles = [
    { id: 'dashboard', nombre: 'Dashboard', descripcion: 'Panel principal' },
    { id: 'pacientes', nombre: 'Pacientes', descripcion: 'Gestión de pacientes' },
    { id: 'citas', nombre: 'Citas', descripcion: 'Gestión de citas' },
    { id: 'consultas', nombre: 'Consultas', descripcion: 'Historial de consultas' },
    { id: 'laboratorio', nombre: 'Laboratorio', descripcion: 'Resultados de laboratorio' },
    { id: 'administracion', nombre: 'Administración', descripcion: 'Configuración del sistema' }
  ]

  const togglePermiso = (modulo: string) => {
    setPermisos(prev => 
      prev.includes(modulo) 
        ? prev.filter(p => p !== modulo)
        : [...prev, modulo]
    )
  }

  const guardarPermisos = async () => {
    try {
      setSaving(true)
      
      const result = await apiClient.makeRequest('/roles/update-permissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rolId: rolId,
          permisos: permisos
        })
      })

      if (result.data) {
        toast({
          title: "Permisos actualizados",
          description: `Los permisos del rol ${rolNombre} han sido actualizados exitosamente.`,
        })
        
        if (onPermissionsUpdated) {
          onPermissionsUpdated()
        }
      } else {
        throw new Error(result.error || 'Error al actualizar permisos')
      }
    } catch (error) {
      console.error('Error actualizando permisos:', error)
      toast({
        title: "Error",
        description: "No se pudieron actualizar los permisos. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = JSON.stringify(permisos.sort()) !== JSON.stringify(permisosActuales.sort())

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Actualizar Permisos - {rolNombre}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {modulosDisponibles.map((modulo) => (
            <div
              key={modulo.id}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                permisos.includes(modulo.id)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => togglePermiso(modulo.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{modulo.nombre}</h4>
                  <p className="text-sm text-gray-600">{modulo.descripcion}</p>
                </div>
                {permisos.includes(modulo.id) && (
                  <Check className="h-5 w-5 text-green-500" />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            {permisos.map((permiso) => (
              <Badge key={permiso} variant="secondary">
                {permiso}
              </Badge>
            ))}
          </div>
          
          <Button
            onClick={guardarPermisos}
            disabled={!hasChanges || saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
