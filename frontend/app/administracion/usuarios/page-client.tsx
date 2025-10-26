"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, UserPlus, Search, Edit, Trash2, Mail, Phone, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { apiRequest } from "@/lib/api-config"
import { formatDateShort } from "@/lib/date-utils-simple"
import { LoadingAscanCard } from "@/components/ui/loading-ascan"
// Removed date-fns imports to fix module resolution error
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

interface Usuario {
  id: string
  email: string
  nombres: string
  apellidos: string
  nombre_completo: string
  telefono?: string
  cedula_profesional?: string
  especialidad?: string
  rol: string
  activo: string
  created_at: string
  ultimo_acceso?: string
}

export default function UsuariosPageClient() {
  const router = useRouter()
  const { toast } = useToast()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState("")
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<Usuario | null>(null)
  const [eliminando, setEliminando] = useState(false)

  useEffect(() => {
    cargarUsuarios()
  }, [])

  useEffect(() => {
    // Filtrar usuarios por búsqueda
    if (busqueda.trim() === "") {
      setUsuariosFiltrados(usuarios)
    } else {
      const busquedaLower = busqueda.toLowerCase()
      const filtrados = usuarios.filter(u => 
        u.nombres.toLowerCase().includes(busquedaLower) ||
        u.apellidos.toLowerCase().includes(busquedaLower) ||
        u.nombre_completo.toLowerCase().includes(busquedaLower) ||
        u.email.toLowerCase().includes(busquedaLower) ||
        u.especialidad?.toLowerCase().includes(busquedaLower) ||
        u.rol.toLowerCase().includes(busquedaLower)
      )
      setUsuariosFiltrados(filtrados)
    }
  }, [busqueda, usuarios])

  const cargarUsuarios = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiRequest('/api/users', {
        method: 'GET'
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login')
          return
        }
        
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Error ${response.status}: ${errorData.error || response.statusText}`)
      }

      const data = await response.json()
      console.log("Datos recibidos del API:", data)
      
      // El API devuelve { usuarios: [...] }
      const usuariosData = data.usuarios || data.users || data || []
      console.log("Usuarios procesados:", usuariosData)
      
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : [])
      setUsuariosFiltrados(Array.isArray(usuariosData) ? usuariosData : [])
    } catch (error: any) {
      console.error("Error cargando usuarios:", error)
      setError(error.message || "Error al cargar usuarios")
    } finally {
      setLoading(false)
    }
  }

  const confirmarEliminar = (usuario: Usuario) => {
    setUsuarioAEliminar(usuario)
  }

  const eliminarUsuario = async () => {
    if (!usuarioAEliminar) return

    setEliminando(true)
    try {
      const response = await apiRequest(`/api/users/${usuarioAEliminar.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al eliminar usuario")
      }

      toast({
        title: "Usuario eliminado",
        description: `${usuarioAEliminar.nombres} ${usuarioAEliminar.apellidos} ha sido eliminado exitosamente.`,
      })

      // Recargar usuarios
      cargarUsuarios()
      setUsuarioAEliminar(null)
    } catch (error: any) {
      console.error("Error eliminando usuario:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el usuario",
        variant: "destructive"
      })
    } finally {
      setEliminando(false)
    }
  }

  const getRoleBadgeColor = (rol: string) => {
    switch (rol) {
      case "administrador":
        return "bg-red-100 text-red-800 border-red-200"
      case "medico":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "enfermera":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case "activo":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactivo":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "suspendido":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <LoadingAscanCard text="Cargando usuarios..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold">Error al cargar usuarios</h3>
          </div>
          <p className="mb-3">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={cargarUsuarios}
            className="bg-white"
          >
            Reintentar
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
          <h1 className="text-3xl font-bold text-foreground">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-1">Administrar usuarios del sistema</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={cargarUsuarios}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Recargar"}
          </Button>
          <Button asChild variant="outline">
            <Link href="/administracion">Volver</Link>
          </Button>
          <Button asChild>
            <Link href="/administracion/usuarios/crear">
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Link>
          </Button>
        </div>
      </div>


      {/* Filtros y Búsqueda */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Buscar Usuarios</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input 
                placeholder="Buscar por nombre, email, rol o especialidad..." 
                className="w-full"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={cargarUsuarios}>
              Actualizar
            </Button>
          </div>
          {busqueda && (
            <p className="text-sm text-muted-foreground mt-2">
              Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tabla de Usuarios */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Lista de Usuarios ({usuariosFiltrados.length})</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usuariosFiltrados.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Especialidad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Registro</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuariosFiltrados.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{usuario.nombres} {usuario.apellidos}</p>
                            <p className="text-sm text-muted-foreground">@{usuario.nombre_completo}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail className="h-3 w-3" />
                            <span>{usuario.email}</span>
                          </div>
                          {usuario.telefono && (
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{usuario.telefono}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(usuario.rol)}>{usuario.rol}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{usuario.especialidad || "No especificada"}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getEstadoBadgeColor(usuario.activo ? 'activo' : 'inactivo')}>
                          {usuario.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDateShort(usuario.created_at)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/administracion/usuarios/${usuario.id}/editar`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => confirmarEliminar(usuario)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {busqueda ? "No se encontraron usuarios" : "No hay usuarios registrados"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {busqueda ? "Intenta con otros términos de búsqueda" : "Comienza creando el primer usuario del sistema"}
              </p>
              {!busqueda && (
                <Button asChild>
                  <Link href="/administracion/usuarios/crear">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Crear Primer Usuario
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={!!usuarioAEliminar} onOpenChange={() => setUsuarioAEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el usuario{" "}
              <strong>{usuarioAEliminar?.nombres} {usuarioAEliminar?.apellidos}</strong> del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={eliminando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={eliminarUsuario} disabled={eliminando} className="bg-red-600 hover:bg-red-700">
              {eliminando ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

