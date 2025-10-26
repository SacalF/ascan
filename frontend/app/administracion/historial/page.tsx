"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  History, Search, Filter, Loader2, Eye, ArrowLeft, 
  LogIn, LogOut, Plus, Edit, Trash2, FileDown, Eye as EyeIcon 
} from "lucide-react"
import Link from "next/link"
import { apiRequest } from "@/lib/api-config"
import { formatDateTimeForLog } from "@/lib/date-utils-simple"
// Removed date-fns imports to fix module resolution error
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface HistorialItem {
  id_historial: string
  fecha_hora: string
  id_usuario: string
  tipo_accion: string
  modulo: string
  descripcion: string
  ip_address?: string
  user_agent?: string
  datos_anteriores?: any
  datos_nuevos?: any
  usuario_nombre: string
  nombre_usuario: string
  rol: string
}

export default function HistorialPage() {
  const router = useRouter()
  const [historial, setHistorial] = useState<HistorialItem[]>([])
  const [estadisticas, setEstadisticas] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filtros
  const [tipoAccion, setTipoAccion] = useState("")
  const [modulo, setModulo] = useState("")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [busqueda, setBusqueda] = useState("")
  
  // Detalle
  const [itemSeleccionado, setItemSeleccionado] = useState<HistorialItem | null>(null)

  useEffect(() => {
    cargarHistorial()
  }, [tipoAccion, modulo, fechaInicio, fechaFin])

  const cargarHistorial = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (tipoAccion) params.append("tipo_accion", tipoAccion)
      if (modulo) params.append("modulo", modulo)
      if (fechaInicio) params.append("fecha_inicio", fechaInicio)
      if (fechaFin) params.append("fecha_fin", fechaFin)

      const response = await apiRequest(`/api/historial?${params}`, {
        method: 'GET'
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login')
          return
        }
        throw new Error("Error al cargar historial")
      }

      const data = await response.json()
      setHistorial(data.historial || [])
      setEstadisticas(data.estadisticas)
    } catch (error: any) {
      console.error("Error cargando historial:", error)
      setError(error.message || "Error al cargar historial")
    } finally {
      setLoading(false)
    }
  }

  const historialFiltrado = historial.filter(item => {
    if (!busqueda) return true
    const busquedaLower = busqueda.toLowerCase()
    return (
      item.usuario_nombre?.toLowerCase().includes(busquedaLower) ||
      item.nombre_usuario?.toLowerCase().includes(busquedaLower) ||
      item.descripcion?.toLowerCase().includes(busquedaLower) ||
      item.modulo?.toLowerCase().includes(busquedaLower)
    )
  })

  const getAccionIcon = (tipo: string) => {
    switch (tipo) {
      case 'login': return <LogIn className="h-4 w-4" />
      case 'logout': return <LogOut className="h-4 w-4" />
      case 'create': return <Plus className="h-4 w-4" />
      case 'update': return <Edit className="h-4 w-4" />
      case 'delete': return <Trash2 className="h-4 w-4" />
      case 'export': return <FileDown className="h-4 w-4" />
      case 'read': return <EyeIcon className="h-4 w-4" />
      default: return <History className="h-4 w-4" />
    }
  }

  const getAccionColor = (tipo: string) => {
    switch (tipo) {
      case 'login': return "bg-blue-100 text-blue-800 border-blue-200"
      case 'logout': return "bg-gray-100 text-gray-800 border-gray-200"
      case 'create': return "bg-green-100 text-green-800 border-green-200"
      case 'update': return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case 'delete': return "bg-red-100 text-red-800 border-red-200"
      case 'export': return "bg-purple-100 text-purple-800 border-purple-200"
      case 'read': return "bg-cyan-100 text-cyan-800 border-cyan-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Historial de Auditoría</h1>
          <p className="text-muted-foreground mt-1">Registro de todas las acciones del sistema</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/administracion">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{estadisticas.total}</div>
              <p className="text-xs text-muted-foreground">Total Registros</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{estadisticas.logins}</div>
              <p className="text-xs text-muted-foreground">Inicios de Sesión</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{estadisticas.creaciones}</div>
              <p className="text-xs text-muted-foreground">Creaciones</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{estadisticas.actualizaciones}</div>
              <p className="text-xs text-muted-foreground">Actualizaciones</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{estadisticas.eliminaciones}</div>
              <p className="text-xs text-muted-foreground">Eliminaciones</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{estadisticas.usuarios_unicos}</div>
              <p className="text-xs text-muted-foreground">Usuarios Activos</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Tipo de Acción</Label>
              <Select value={tipoAccion || "all"} onValueChange={(value) => setTipoAccion(value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="create">Crear</SelectItem>
                  <SelectItem value="read">Leer</SelectItem>
                  <SelectItem value="update">Actualizar</SelectItem>
                  <SelectItem value="delete">Eliminar</SelectItem>
                  <SelectItem value="export">Exportar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Módulo</Label>
              <Select value={modulo || "all"} onValueChange={(value) => setModulo(value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="usuarios">Usuarios</SelectItem>
                  <SelectItem value="pacientes">Pacientes</SelectItem>
                  <SelectItem value="consultas">Consultas</SelectItem>
                  <SelectItem value="laboratorio">Laboratorio</SelectItem>
                  <SelectItem value="citas">Citas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha Inicio</Label>
              <Input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha Fin</Label>
              <Input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Buscar por usuario, descripción o módulo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={cargarHistorial}>
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Registros ({historialFiltrado.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : historialFiltrado.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Detalles</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historialFiltrado.map((item) => (
                    <TableRow key={item.id_historial}>
                      <TableCell className="font-mono text-sm">
                        {formatDateTimeForLog(item.fecha_hora)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.usuario_nombre}</p>
                          <p className="text-sm text-muted-foreground">@{item.nombre_usuario}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getAccionColor(item.tipo_accion)}>
                          <span className="flex items-center gap-1">
                            {getAccionIcon(item.tipo_accion)}
                            {item.tipo_accion}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.modulo || "N/A"}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {item.descripcion || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setItemSeleccionado(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <History className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay registros</h3>
              <p className="text-muted-foreground">
                {busqueda ? "Intenta con otros términos de búsqueda" : "No se encontraron registros de auditoría"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalles */}
      <Dialog open={!!itemSeleccionado} onOpenChange={() => setItemSeleccionado(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Registro</DialogTitle>
            <DialogDescription>
              Información completa de la acción realizada
            </DialogDescription>
          </DialogHeader>
          {itemSeleccionado && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Fecha y Hora</Label>
                  <p className="font-medium">
                    {new Date(itemSeleccionado.fecha_hora).toLocaleString('es-ES', {
                      day: '2-digit',
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Usuario</Label>
                  <p className="font-medium">{itemSeleccionado.usuario_nombre}</p>
                  <p className="text-sm text-muted-foreground">@{itemSeleccionado.nombre_usuario} ({itemSeleccionado.rol})</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Acción</Label>
                  <p>
                    <Badge className={getAccionColor(itemSeleccionado.tipo_accion)}>
                      {itemSeleccionado.tipo_accion}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Módulo</Label>
                  <p className="font-medium">{itemSeleccionado.modulo || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Dirección IP</Label>
                  <p className="font-mono text-sm">{itemSeleccionado.ip_address || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">ID Historial</Label>
                  <p className="font-mono text-xs">{itemSeleccionado.id_historial}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Descripción</Label>
                <p className="font-medium">{itemSeleccionado.descripcion || "-"}</p>
              </div>

              {itemSeleccionado.user_agent && (
                <div>
                  <Label className="text-muted-foreground">User Agent</Label>
                  <p className="text-sm font-mono bg-muted p-2 rounded">{itemSeleccionado.user_agent}</p>
                </div>
              )}

              {itemSeleccionado.datos_anteriores && (
                <div>
                  <Label className="text-muted-foreground">Datos Anteriores</Label>
                  <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
                    {JSON.stringify(itemSeleccionado.datos_anteriores, null, 2)}
                  </pre>
                </div>
              )}

              {itemSeleccionado.datos_nuevos && (
                <div>
                  <Label className="text-muted-foreground">Datos Nuevos</Label>
                  <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
                    {JSON.stringify(itemSeleccionado.datos_nuevos, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

