"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  GraduationCap
} from "lucide-react"
import Link from "next/link"
import { apiRequest } from "@/lib/api-config"
import { useToast } from "@/hooks/use-toast"

interface Usuario {
  id: string
  nombres: string
  apellidos: string
  email: string
  telefono?: string
  direccion?: string
  estado: string
  cedula_profesional?: string
  especialidad?: string
  rol: string
  created_at: string
  ultimo_acceso?: string
}

export default function EditarUsuarioPageClient() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rolesDisponibles, setRolesDisponibles] = useState<Array<{value: string, label: string}>>([])

  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    correo_electronico: "",
    telefono: "",
    direccion: "",
    estado: "activo",
    cedula_profesional: "",
    especialidad: "",
    rol: "medico"
  })

  const estadosDisponibles = [
    { value: "activo", label: "Activo" },
    { value: "inactivo", label: "Inactivo" },
    { value: "suspendido", label: "Suspendido" }
  ]

  useEffect(() => {
    if (params.id) {
      cargarUsuario(params.id as string)
      cargarRoles()
    }
  }, [params.id])

  const cargarUsuario = async (id: string) => {
    try {
      setLoading(true)
      
      const response = await apiRequest(`/api/users/${id}`, {
        method: 'GET'
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login')
          return
        }
        if (response.status === 403) {
          setError("No tienes permisos para editar usuarios")
          return
        }
        if (response.status === 404) {
          setError("Usuario no encontrado")
          return
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const usuarioData = data.usuario
      
      setUsuario(usuarioData)
      setFormData({
        nombres: usuarioData.nombres || "",
        apellidos: usuarioData.apellidos || "",
        correo_electronico: usuarioData.email || "",
        telefono: usuarioData.telefono || "",
        direccion: usuarioData.direccion || "",
        estado: usuarioData.estado || "activo",
        cedula_profesional: usuarioData.cedula_profesional || "",
        especialidad: usuarioData.especialidad || "",
        rol: usuarioData.rol || "medico"
      })

    } catch (error: any) {
      console.error("Error cargando usuario:", error)
      setError(error.message || "Error al cargar usuario")
    } finally {
      setLoading(false)
    }
  }

  const cargarRoles = async () => {
    try {
      console.log("🔑 Cargando roles disponibles...")
      
      const response = await apiRequest('/api/roles', {
        method: 'GET'
      })

      if (!response.ok) {
        console.error("Error cargando roles:", response.status, response.statusText)
        // Si falla, usar roles básicos como fallback
        setRolesDisponibles([
          { value: "medico", label: "Médico" },
          { value: "enfermera", label: "Enfermera" },
          { value: "administrador", label: "Administrador" },
          { value: "recepcionista", label: "Recepcionista" }
        ])
        return
      }

      const data = await response.json()
      console.log("📊 Datos de roles recibidos:", data)
      
      // Usar los roles de la base de datos
      const rolesBD = Array.isArray(data.roles) ? data.roles : []
      console.log("🔑 Roles desde BD:", rolesBD)
      
      const rolesFormateados = rolesBD
        .filter((rol: any) => rol && rol.nombre_rol) // Filtrar roles válidos
        .map((rol: any) => ({
          value: rol.nombre_rol,
        label: rol.nombre_rol.charAt(0).toUpperCase() + rol.nombre_rol.slice(1)
      }))
      
      console.log("🎨 Roles formateados para el select:", rolesFormateados)
      setRolesDisponibles(rolesFormateados)

    } catch (error: any) {
      console.error("Error cargando roles:", error)
      // Fallback a roles básicos
      setRolesDisponibles([
        { value: "medico", label: "Médico" },
        { value: "enfermera", label: "Enfermera" },
        { value: "administrador", label: "Administrador" },
        { value: "recepcionista", label: "Recepcionista" }
      ])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!usuario) return

    setSaving(true)
    try {
      const response = await apiRequest(`/api/users/${usuario.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al actualizar usuario")
      }

      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario han sido actualizados exitosamente.",
      })

      router.push('/administracion/usuarios')

    } catch (error: any) {
      console.error("Error actualizando usuario:", error)
      toast({
        title: "Error",
        description: error.message || "Error al actualizar el usuario",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Cargando usuario...</span>
        </div>
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
            onClick={() => router.push('/administracion/usuarios')} 
            variant="outline" 
            className="mt-4"
          >
            Volver
          </Button>
        </div>
      </div>
    )
  }

  if (!usuario) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Usuario no encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Editar Usuario</h1>
          <p className="text-muted-foreground mt-1">
            Modificar datos de {usuario.nombres} {usuario.apellidos}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/administracion/usuarios">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
      </div>

      {/* Formulario */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <span>Información del Usuario</span>
          </CardTitle>
          <CardDescription>
            Actualiza los datos del usuario del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Personal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombres">Nombres *</Label>
                <Input
                  id="nombres"
                  value={formData.nombres}
                  onChange={(e) => handleInputChange("nombres", e.target.value)}
                  placeholder="Nombres del usuario"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos *</Label>
                <Input
                  id="apellidos"
                  value={formData.apellidos}
                  onChange={(e) => handleInputChange("apellidos", e.target.value)}
                  placeholder="Apellidos del usuario"
                  required
                />
              </div>
            </div>

            {/* Información de Acceso */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="correo_electronico">Correo Electrónico *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="correo_electronico"
                    type="email"
                    value={formData.correo_electronico}
                    onChange={(e) => handleInputChange("correo_electronico", e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange("telefono", e.target.value)}
                    placeholder="Número de teléfono"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => handleInputChange("direccion", e.target.value)}
                    placeholder="Dirección completa"
                    className="pl-10"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Información Profesional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cedula_profesional">Cédula Profesional</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cedula_profesional"
                    value={formData.cedula_profesional}
                    onChange={(e) => handleInputChange("cedula_profesional", e.target.value)}
                    placeholder="Número de cédula profesional"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="especialidad">Especialidad</Label>
                <Input
                  id="especialidad"
                  value={formData.especialidad}
                  onChange={(e) => handleInputChange("especialidad", e.target.value)}
                  placeholder="Especialidad médica"
                />
              </div>
            </div>

            {/* Configuración del Sistema */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="rol">Rol *</Label>
                <Select value={formData.rol} onValueChange={(value) => handleInputChange("rol", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {rolesDisponibles.map((rol) => (
                      <SelectItem key={rol.value} value={rol.value}>
                        {rol.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado *</Label>
                <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estadosDisponibles.map((estado) => (
                      <SelectItem key={estado.value} value={estado.value}>
                        {estado.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button asChild variant="outline">
                <Link href="/administracion/usuarios">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
