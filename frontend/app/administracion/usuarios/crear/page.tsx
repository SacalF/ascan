"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiRequest } from "@/lib/api-config"
import { LoadingAscanButton } from "@/components/ui/loading-ascan"

export default function CrearUsuarioPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rolesDisponibles, setRolesDisponibles] = useState<Array<{value: string, label: string}>>([])

  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    correo_electronico: "",
    contrasena: "",
    confirmar_contrasena: "",
    telefono: "",
    direccion: "",
    cedula_profesional: "",
    especialidad: "",
    rol: "medico",
    estado: "activo"
  })

  useEffect(() => {
    cargarRoles()
  }, [])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const cargarRoles = async () => {
    try {
      console.log("🔑 Cargando roles disponibles para crear usuario...")
      
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
          { value: "recepcionista", label: "Recepcionista" },
          { value: "contador", label: "Contador" },
          { value: "secretario", label: "Secretario" }
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

      // Si hay roles disponibles, usar el primero como valor por defecto
      if (rolesFormateados.length > 0) {
        setFormData(prev => ({
          ...prev,
          rol: rolesFormateados[0].value
        }))
      }

    } catch (error: any) {
      console.error("Error cargando roles:", error)
      // Fallback a roles básicos
      setRolesDisponibles([
        { value: "medico", label: "Médico" },
        { value: "enfermera", label: "Enfermera" },
        { value: "administrador", label: "Administrador" },
        { value: "recepcionista", label: "Recepcionista" },
        { value: "contador", label: "Contador" },
        { value: "secretario", label: "Secretario" }
      ])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validaciones
    if (!formData.nombres || !formData.apellidos) {
      setError("Nombres y apellidos son requeridos")
      return
    }

    if (!formData.correo_electronico) {
      setError("Correo electrónico es requerido")
      return
    }

    if (!formData.contrasena) {
      setError("Contraseña es requerida")
      return
    }

    if (formData.contrasena !== formData.confirmar_contrasena) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (formData.contrasena.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.details || "Error al crear usuario")
      }

      const data = await response.json()

      toast({
        title: "Usuario creado",
        description: `${formData.nombres} ${formData.apellidos} ha sido creado exitosamente.`,
      })

      router.push('/administracion/usuarios')
    } catch (error: any) {
      console.error("Error creando usuario:", error)
      setError(error.message || "Error al crear usuario")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/administracion/usuarios">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Crear Nuevo Usuario</h1>
          <p className="text-muted-foreground mt-1">Complete la información del nuevo usuario</p>
        </div>
      </div>

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Usuario</CardTitle>
          <CardDescription>Los campos marcados con * son obligatorios</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información Personal</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombres">Nombres *</Label>
                  <Input
                    id="nombres"
                    value={formData.nombres}
                    onChange={(e) => handleChange("nombres", e.target.value)}
                    placeholder="Ej: Juan Carlos"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apellidos">Apellidos *</Label>
                  <Input
                    id="apellidos"
                    value={formData.apellidos}
                    onChange={(e) => handleChange("apellidos", e.target.value)}
                    placeholder="Ej: García López"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Información de Cuenta */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información de Cuenta</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="correo_electronico">Correo Electrónico *</Label>
                  <Input
                    id="correo_electronico"
                    type="email"
                    value={formData.correo_electronico}
                    onChange={(e) => handleChange("correo_electronico", e.target.value)}
                    placeholder="Ej: jgarcia@hospital.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contrasena">Contraseña *</Label>
                  <Input
                    id="contrasena"
                    type="password"
                    value={formData.contrasena}
                    onChange={(e) => handleChange("contrasena", e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmar_contrasena">Confirmar Contraseña *</Label>
                  <Input
                    id="confirmar_contrasena"
                    type="password"
                    value={formData.confirmar_contrasena}
                    onChange={(e) => handleChange("confirmar_contrasena", e.target.value)}
                    placeholder="Repita la contraseña"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información de Contacto</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => handleChange("telefono", e.target.value)}
                    placeholder="Ej: +502 1234-5678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => handleChange("direccion", e.target.value)}
                    placeholder="Ej: Ciudad de Guatemala"
                  />
                </div>
              </div>
            </div>

            {/* Información Profesional */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información Profesional</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cedula_profesional">Cédula Profesional</Label>
                  <Input
                    id="cedula_profesional"
                    value={formData.cedula_profesional}
                    onChange={(e) => handleChange("cedula_profesional", e.target.value)}
                    placeholder="Ej: MED-12345"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="especialidad">Especialidad</Label>
                  <Input
                    id="especialidad"
                    value={formData.especialidad}
                    onChange={(e) => handleChange("especialidad", e.target.value)}
                    placeholder="Ej: Oncología"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rol">Rol *</Label>
                  <Select value={formData.rol} onValueChange={(value) => handleChange("rol", value)}>
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
                  <Select value={formData.estado} onValueChange={(value) => handleChange("estado", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                      <SelectItem value="suspendido">Suspendido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <LoadingAscanButton size="sm" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Crear Usuario
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

