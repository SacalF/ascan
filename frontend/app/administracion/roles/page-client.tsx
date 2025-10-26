"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Loader2, 
  Check,
  X,
  AlertCircle,
  Shield,
  Settings,
  Save,
  FlaskConical,
  UserCheck,
  Stethoscope,
  UserCog,
  Crown,
  Users,
  Calendar,
  FileText,
  RefreshCw
} from "lucide-react"
import Link from "next/link"
import { apiRequest } from "@/lib/api-config"
import { useToast } from "@/hooks/use-toast"
import { LoadingAscanCard } from "@/components/ui/loading-ascan"

interface Permiso {
  id: string
  nombre: string
  descripcion: string
  categoria: string
}

interface RolPermisos {
  id_rol: string
  nombre_rol: string
  descripcion: string
  permisos: string[]
  activo: boolean
}

export default function RolesPageClient() {
  const router = useRouter()
  const { toast } = useToast()
  const [roles, setRoles] = useState<RolPermisos[]>([])
  const [permisosDisponibles, setPermisosDisponibles] = useState<Permiso[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [rolActivo, setRolActivo] = useState<string>("")
  const [cambiosPendientes, setCambiosPendientes] = useState<{[key: string]: boolean}>({})

  // Módulos del sistema - basados en la estructura de tu aplicación
  const modulosSistema: Permiso[] = [
    { id: 'dashboard', nombre: 'Dashboard', descripcion: 'Panel principal del sistema', categoria: 'Sistema' },
    { id: 'pacientes', nombre: 'Pacientes', descripcion: 'Gestión de pacientes', categoria: 'Sistema' },
    { id: 'citas', nombre: 'Citas', descripcion: 'Gestión de citas médicas', categoria: 'Sistema' },
    { id: 'consultas', nombre: 'Consultas', descripcion: 'Historial de consultas médicas', categoria: 'Sistema' },
    { id: 'laboratorio', nombre: 'Laboratorio', descripcion: 'Resultados de laboratorio', categoria: 'Sistema' },
    { id: 'administracion', nombre: 'Administración', descripcion: 'Configuración del sistema', categoria: 'Sistema' }
  ]

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      setError(null)

      // Cargar todos los roles
      const response = await apiRequest('/api/roles')
      if (!response.ok) {
        throw new Error('Error al cargar roles')
      }
      
      const data = await response.json()
      console.log("📋 Datos recibidos:", data)
      
      // Cargar todos los roles disponibles
      const todosLosRoles = (data.roles || [])
        .map((rol: any) => ({
          id_rol: rol.id_rol,
          nombre_rol: rol.nombre_rol,
          descripcion: rol.descripcion || '',
          permisos: rol.permisos || [],
          activo: rol.activo
        }))
      
      console.log("🎯 Todos los roles:", todosLosRoles)
      setRoles(todosLosRoles)
      setPermisosDisponibles(modulosSistema)
      
      // Establecer el primer rol como activo por defecto
      if (todosLosRoles.length > 0) {
        setRolActivo(todosLosRoles[0].id_rol)
      }

    } catch (error: any) {
      console.error("Error cargando datos:", error)
      setError(error.message || "Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }

  const actualizarPermisos = async (idRol: string, nuevosPermisos: string[]) => {
    try {
      setSaving(idRol)

      // Usar el nuevo endpoint específico para permisos
      const response = await apiRequest('/api/roles/update-permissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rolId: idRol,
          permisos: nuevosPermisos
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al actualizar permisos")
      }

      // Actualizar el estado local
      setRoles(prev => prev.map(rol => 
        rol.id_rol === idRol 
          ? { ...rol, permisos: nuevosPermisos }
          : rol
      ))

      toast({
        title: "Permisos actualizados",
        description: "Los permisos del rol han sido actualizados exitosamente.",
      })

      // Limpiar cambios pendientes
      setCambiosPendientes(prev => ({
        ...prev,
        [idRol]: false
      }))

      // Recargar datos para asegurar sincronización
      await cargarDatos()

    } catch (error: any) {
      console.error("Error actualizando permisos:", error)
      toast({
        title: "Error",
        description: error.message || "Error al actualizar los permisos",
        variant: "destructive"
      })
    } finally {
      setSaving(null)
    }
  }

  const togglePermiso = (idRol: string, permisoId: string) => {
    const rol = roles.find(r => r.id_rol === idRol)
    if (!rol) return

    const nuevosPermisos = rol.permisos.includes(permisoId)
      ? rol.permisos.filter(p => p !== permisoId)
      : [...rol.permisos, permisoId]

    // Marcar que hay cambios pendientes
    setCambiosPendientes(prev => ({
      ...prev,
      [idRol]: true
    }))

    actualizarPermisos(idRol, nuevosPermisos)
  }

  const getIconForRole = (nombreRol: string) => {
    const rol = nombreRol.toLowerCase()
    if (rol === 'laboratorio') return <FlaskConical className="h-5 w-5" />
    if (rol === 'recepcionista') return <UserCheck className="h-5 w-5" />
    if (rol === 'medico') return <Stethoscope className="h-5 w-5" />
    if (rol === 'ultrasonido') return <UserCog className="h-5 w-5" />
    if (rol === 'administrador') return <Crown className="h-5 w-5" />
    return <Shield className="h-5 w-5" />
  }

  const getColorForRole = (nombreRol: string) => {
    const rol = nombreRol.toLowerCase()
    if (rol === 'laboratorio') return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400"
    if (rol === 'recepcionista') return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
    if (rol === 'medico') return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
    if (rol === 'ultrasonido') return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400"
    if (rol === 'administrador') return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
    return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
  }

  const getPermisosPorCategoria = (categoria: string) => {
    return permisosDisponibles.filter(permiso => permiso.categoria === categoria)
  }

  const categorias = ['Sistema'] // Solo una categoría para módulos
  const rolSeleccionado = roles.find(r => r.id_rol === rolActivo)

  if (loading) {
    return (
      <div className="p-6">
        <LoadingAscanCard text="Cargando permisos..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold">Error</h3>
          </div>
          <p className="mt-2">{error}</p>
          <Button 
            onClick={() => router.push('/administracion')} 
            variant="outline" 
            className="mt-4"
          >
            Volver
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Permisos</h1>
          <p className="text-muted-foreground mt-1">Configura los permisos de los roles del sistema</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/administracion">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
        </div>
      </div>

      {/* Lista de Roles - Vista Compacta */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {roles.map((rol) => (
          <Card 
            key={rol.id_rol} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              rolActivo === rol.id_rol 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setRolActivo(rol.id_rol)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getColorForRole(rol.nombre_rol)}`}>
                    {getIconForRole(rol.nombre_rol)}
                  </div>
                  <div>
                    <CardTitle className="text-lg capitalize">{rol.nombre_rol}</CardTitle>
                    <CardDescription className="text-sm">{rol.descripcion}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {cambiosPendientes[rol.id_rol] && (
                    <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                      Cambios pendientes
                    </Badge>
                  )}
                  <Badge variant={rol.activo ? "default" : "secondary"} className="text-xs">
                    {rol.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Permisos del Rol Seleccionado */}
      {rolSeleccionado && (
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${getColorForRole(rolSeleccionado.nombre_rol)}`}>
                  {getIconForRole(rolSeleccionado.nombre_rol)}
                </div>
                <div>
                  <CardTitle className="text-xl capitalize">{rolSeleccionado.nombre_rol}</CardTitle>
                  <CardDescription>{rolSeleccionado.descripcion}</CardDescription>
                </div>
              </div>
              <Badge variant={rolSeleccionado.activo ? "default" : "secondary"}>
                {rolSeleccionado.activo ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="Sistema" className="w-full">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="Sistema" className="text-sm">
                  Módulos del Sistema
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="Sistema" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Settings className="h-5 w-5 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      Módulos del Sistema
                    </h4>
                  </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getPermisosPorCategoria('Sistema').map((permiso) => (
                        <div key={permiso.id} className="group relative">
                          <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-300 hover:bg-gradient-to-r hover:from-white hover:to-blue-50/30">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-1">
                                <Checkbox
                                  id={`${rolSeleccionado.id_rol}-${permiso.id}`}
                                  checked={rolSeleccionado.permisos.includes(permiso.id)}
                                  onCheckedChange={() => togglePermiso(rolSeleccionado.id_rol, permiso.id)}
                                  disabled={saving === rolSeleccionado.id_rol}
                                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <label 
                                  htmlFor={`${rolSeleccionado.id_rol}-${permiso.id}`}
                                  className="block text-sm font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                                >
                                  {permiso.nombre}
                                </label>
                                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                  {permiso.descripcion}
                                </p>
                              </div>
                              {saving === rolSeleccionado.id_rol && (
                                <div className="flex-shrink-0">
                                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                </div>
                              )}
                            </div>
                            
                            {/* Indicador visual de estado */}
                            {rolSeleccionado.permisos.includes(permiso.id) && (
                              <div className="absolute top-3 right-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
            </Tabs>
            
            {/* Botón para guardar todos los cambios */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Cambios pendientes para {rolSeleccionado.nombre_rol}</p>
                  <p className="text-xs">Los cambios se aplican automáticamente al marcar/desmarcar permisos</p>
                </div>
                <Button
                  onClick={() => {
                    // Limpiar cambios pendientes
                    setCambiosPendientes(prev => ({
                      ...prev,
                      [rolSeleccionado.id_rol]: false
                    }))
                    
                    // Forzar recarga de permisos
                    cargarDatos()
                    toast({
                      title: "Permisos sincronizados",
                      description: `Los permisos del rol ${rolSeleccionado.nombre_rol} han sido sincronizados.`,
                    })
                  }}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4" />
                  Sincronizar Permisos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {roles.length === 0 && (
        <Card className="border-border/50">
          <CardContent className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay roles configurados</h3>
            <p className="text-muted-foreground">
              No se encontraron roles disponibles para gestión de permisos.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}