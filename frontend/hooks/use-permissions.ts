import { useState, useEffect } from 'react'
import { useAuth } from './use-auth'
import { apiClient } from '@/lib/api-client'

interface PermissionsData {
  user: {
    id: string
    nombres: string
    apellidos: string
    rol: string
  }
  permissions: string[]
  availableModules: string[]
}

export function usePermissions() {
  const { user, authenticated } = useAuth()
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authenticated && user) {
      fetchPermissions()
    } else {
      setPermissions([])
      setLoading(false)
    }
  }, [authenticated, user])

  const fetchPermissions = async () => {
    try {
      setLoading(true)
      const result = await apiClient.makeRequest('/roles/permissions')
      
      if (result.data) {
        const data = result.data as PermissionsData
        setPermissions(data.permissions || [])
        console.log('🔍 Permisos cargados:', data.permissions)
        console.log('🔍 Usuario:', data.user?.nombres, data.user?.apellidos, 'Rol:', data.user?.rol)
        console.log('🔍 Módulos disponibles:', data.availableModules)
      } else {
        setPermissions([])
        console.log('⚠️ No se recibieron permisos del servidor')
      }
    } catch (error) {
      console.error('Error obteniendo permisos:', error)
      setPermissions([])
    } finally {
      setLoading(false)
    }
  }

  // Función para refrescar permisos manualmente
  const refreshPermissions = () => {
    fetchPermissions()
  }

  const hasPermission = (module: string): boolean => {
    if (!authenticated || !user || loading) return false
    return permissions.includes(module)
  }

  const canAccess = (module: string): boolean => {
    return hasPermission(module)
  }

  const getAvailableModules = (): string[] => {
    if (!authenticated || !user) return []
    return permissions
  }

  return {
    hasPermission,
    canAccess,
    getAvailableModules,
    userRole: user?.rol,
    loading,
    permissions,
    refreshPermissions
  }
}
