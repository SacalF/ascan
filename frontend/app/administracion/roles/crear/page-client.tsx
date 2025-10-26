"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Plus, Save, Shield, Loader2 } from "lucide-react"
import { apiRequest } from "@/lib/api-config"
import { LoadingAscanButton } from "@/components/ui/loading-ascan"

const PERMISOS_DISPONIBLES = [
  { id: "usuarios_crear", label: "Crear Usuarios", description: "Permite crear nuevos usuarios" },
  { id: "usuarios_editar", label: "Editar Usuarios", description: "Permite modificar usuarios existentes" },
  { id: "usuarios_eliminar", label: "Eliminar Usuarios", description: "Permite eliminar usuarios" },
  { id: "usuarios_ver", label: "Ver Usuarios", description: "Permite ver lista de usuarios" },
  { id: "pacientes_crear", label: "Crear Pacientes", description: "Permite crear nuevos pacientes" },
  { id: "pacientes_editar", label: "Editar Pacientes", description: "Permite modificar pacientes existentes" },
  { id: "pacientes_eliminar", label: "Eliminar Pacientes", description: "Permite eliminar pacientes" },
  { id: "pacientes_ver", label: "Ver Pacientes", description: "Permite ver lista de pacientes" },
  { id: "citas_crear", label: "Crear Citas", description: "Permite crear nuevas citas" },
  { id: "citas_editar", label: "Editar Citas", description: "Permite modificar citas existentes" },
  { id: "citas_eliminar", label: "Eliminar Citas", description: "Permite eliminar citas" },
  { id: "citas_ver", label: "Ver Citas", description: "Permite ver lista de citas" },
  { id: "consultas_crear", label: "Crear Consultas", description: "Permite crear nuevas consultas" },
  { id: "consultas_editar", label: "Editar Consultas", description: "Permite modificar consultas existentes" },
  { id: "consultas_ver", label: "Ver Consultas", description: "Permite ver consultas médicas" },
  { id: "laboratorio_crear", label: "Crear Laboratorios", description: "Permite crear resultados de laboratorio" },
  { id: "laboratorio_ver", label: "Ver Laboratorios", description: "Permite ver resultados de laboratorio" },
  { id: "reportes_ver", label: "Ver Reportes", description: "Permite ver reportes del sistema" },
  { id: "historial_ver", label: "Ver Historial", description: "Permite ver historial de actividades" },
  { id: "roles_gestionar", label: "Gestionar Roles", description: "Permite crear y modificar roles" }
]

export default function CrearRolPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombre_rol: "",
    descripcion: "",
    permisos: [] as string[]
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null)
  }

  const handlePermisoChange = (permisoId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permisos: checked 
        ? [...prev.permisos, permisoId]
        : prev.permisos.filter(p => p !== permisoId)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre_rol.trim() || !formData.descripcion.trim()) {
      setError("Todos los campos son requeridos")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await apiRequest("/api/roles/create", {
        method: "POST",
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al crear el rol")
      }

      // Redirigir a la gestión de roles
      router.push("/administracion/roles")
    } catch (error) {
      console.error("Error creando rol:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-gray-600" />
                <h1 className="text-xl font-semibold text-gray-900">Crear Nuevo Rol</h1>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push("/administracion/roles")}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <p className="text-gray-600">Crea un nuevo rol con permisos específicos para el sistema</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <Card className="border-blue-200 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-blue-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-blue-800">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Plus className="h-5 w-5 text-blue-600" />
                  </div>
                  Información del Rol
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Define los datos básicos del nuevo rol
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre_rol" className="text-sm font-medium text-gray-700">
                      Nombre del Rol *
                    </Label>
                    <Input
                      id="nombre_rol"
                      value={formData.nombre_rol}
                      onChange={(e) => handleInputChange("nombre_rol", e.target.value)}
                      placeholder="Ej: Supervisor, Coordinador"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descripcion" className="text-sm font-medium text-gray-700">
                      Descripción *
                    </Label>
                    <Textarea
                      id="descripcion"
                      value={formData.descripcion}
                      onChange={(e) => handleInputChange("descripcion", e.target.value)}
                      placeholder="Describe las responsabilidades de este rol"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      rows={3}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Permisos */}
            <Card className="border-green-200 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-green-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-green-800">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  Permisos del Rol
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Selecciona los permisos que tendrá este rol
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PERMISOS_DISPONIBLES.map((permiso) => (
                    <div key={permiso.id} className="flex items-start space-x-3 p-3 bg-white border border-green-100 rounded-lg hover:shadow-md transition-all duration-300">
                      <Checkbox
                        id={permiso.id}
                        checked={formData.permisos.includes(permiso.id)}
                        onCheckedChange={(checked) => handlePermisoChange(permiso.id, !!checked)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor={permiso.id} className="text-sm font-medium text-gray-800 cursor-pointer">
                          {permiso.label}
                        </Label>
                        <p className="text-xs text-gray-600 mt-1">
                          {permiso.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <p className="text-red-600 text-sm">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/administracion/roles")}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <LoadingAscanButton size="sm" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Crear Rol
                  </>
                )}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}
