"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  User, 
  Loader2,
  AlertCircle
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface Paciente {
  id_paciente: string
  numero_registro_medico: string
  nombres: string
  apellidos: string
  dpi?: string
  sexo?: string
  estado_civil?: string
  telefono?: string
  correo_electronico?: string
  direccion?: string
  fecha_nacimiento?: string
  lugar_nacimiento?: string
  ocupacion?: string
  raza?: string
  conyuge?: string
  padre_madre?: string
  lugar_trabajo?: string
  nombre_responsable?: string
  telefono_responsable?: string
}

interface EditarPacienteClientProps {
  pacienteId: string
}

export default function EditarPacienteClient({ pacienteId }: EditarPacienteClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    numero_registro_medico: "",
    nombres: "",
    apellidos: "",
    dpi: "",
    sexo: "",
    estado_civil: "",
    telefono: "",
    correo_electronico: "",
    direccion: "",
    fecha_nacimiento: "",
    lugar_nacimiento: "",
    ocupacion: "",
    raza: "",
    conyuge: "",
    padre_madre: "",
    lugar_trabajo: "",
    nombre_responsable: "",
    telefono_responsable: ""
  })

  useEffect(() => {
    cargarPaciente()
  }, [pacienteId])

  const cargarPaciente = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log("🔍 [EDITAR] Cargando paciente con ID:", pacienteId)
      const result = await apiClient.getPaciente(pacienteId)
      console.log("📥 [EDITAR] Respuesta completa del API:", result)
      
      if (result && !result.error && result.data) {
        const responseData = result.data as any
        console.log("📊 [EDITAR] Datos procesados:", responseData)
        console.log("👤 [EDITAR] Paciente encontrado:", responseData.paciente)
        
        if (responseData.paciente && Object.keys(responseData.paciente).length > 0) {
          const pacienteData = responseData.paciente
          console.log("✅ [EDITAR] Estableciendo paciente:", pacienteData)
          setPaciente(pacienteData)
        
          // Normalizar fecha_nacimiento para el input date (formato YYYY-MM-DD)
          let fechaNacimiento = ""
          if (pacienteData.fecha_nacimiento) {
            const fecha = new Date(pacienteData.fecha_nacimiento)
            if (!isNaN(fecha.getTime())) {
              fechaNacimiento = fecha.toISOString().split('T')[0]
            }
          }

          // Llenar el formulario con los datos del paciente
          setFormData({
            numero_registro_medico: pacienteData.numero_registro_medico || "",
            nombres: pacienteData.nombres || "",
            apellidos: pacienteData.apellidos || "",
            dpi: pacienteData.dpi || "",
            sexo: pacienteData.sexo || "",
            estado_civil: pacienteData.estado_civil || "",
            telefono: pacienteData.telefono || "",
            correo_electronico: pacienteData.correo_electronico || "",
            direccion: pacienteData.direccion || "",
            fecha_nacimiento: fechaNacimiento,
            lugar_nacimiento: pacienteData.lugar_nacimiento || "",
            ocupacion: pacienteData.ocupacion || "",
            raza: pacienteData.raza || "",
            conyuge: pacienteData.conyuge || "",
            padre_madre: pacienteData.padre_madre || "",
            lugar_trabajo: pacienteData.lugar_trabajo || "",
            nombre_responsable: pacienteData.nombre_responsable || "",
            telefono_responsable: pacienteData.telefono_responsable || ""
          })
        } else {
          console.log("❌ [EDITAR] Paciente vacío o no encontrado:", responseData.paciente)
          setError("Paciente no encontrado en la base de datos")
        }
      } else {
        setError(result?.error || "Paciente no encontrado")
      }
    } catch (error) {
      console.error("Error cargando paciente:", error)
      setError("Error al cargar la información del paciente")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombres.trim() || !formData.apellidos.trim() || !formData.numero_registro_medico.trim()) {
      toast({
        title: "Error",
        description: "Nombre, apellidos y registro médico son requeridos",
        variant: "destructive"
      })
      return
    }

    try {
      setSaving(true)
      
      const result = await apiClient.updatePaciente(pacienteId, formData)
      
      if (result && !result.error) {
        toast({
          title: "Éxito",
          description: "Paciente actualizado correctamente"
        })
        router.push(`/pacientes/${pacienteId}`)
      } else {
        throw new Error(result?.error || "Error al actualizar paciente")
      }
    } catch (error) {
      console.error("Error actualizando paciente:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar paciente",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-gray-600">Cargando información del paciente...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !paciente) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => router.push("/pacientes")} variant="outline">
                Volver a Pacientes
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
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
                <User className="h-6 w-6 text-gray-600" />
                <h1 className="text-xl font-semibold text-gray-900">Editar Paciente</h1>
              </div>
              <Button 
                variant="outline" 
                onClick={() => router.push(`/pacientes/${pacienteId}`)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <Card className="border-blue-200 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-blue-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-blue-800">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero_registro_medico" className="text-sm font-medium text-gray-700">
                      Número de Registro Médico *
                    </Label>
                    <Input
                      id="numero_registro_medico"
                      value={formData.numero_registro_medico}
                      onChange={(e) => handleInputChange("numero_registro_medico", e.target.value)}
                      placeholder="Ej: 001"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dpi" className="text-sm font-medium text-gray-700">
                      DPI
                    </Label>
                    <Input
                      id="dpi"
                      value={formData.dpi}
                      onChange={(e) => handleInputChange("dpi", e.target.value)}
                      placeholder="Ej: 1234567890123"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nombres" className="text-sm font-medium text-gray-700">
                      Nombres *
                    </Label>
                    <Input
                      id="nombres"
                      value={formData.nombres}
                      onChange={(e) => handleInputChange("nombres", e.target.value)}
                      placeholder="Ej: Juan Carlos"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellidos" className="text-sm font-medium text-gray-700">
                      Apellidos *
                    </Label>
                    <Input
                      id="apellidos"
                      value={formData.apellidos}
                      onChange={(e) => handleInputChange("apellidos", e.target.value)}
                      placeholder="Ej: Pérez García"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fecha_nacimiento" className="text-sm font-medium text-gray-700">
                      Fecha de Nacimiento
                    </Label>
                    <Input
                      id="fecha_nacimiento"
                      type="date"
                      value={formData.fecha_nacimiento}
                      onChange={(e) => handleInputChange("fecha_nacimiento", e.target.value)}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sexo" className="text-sm font-medium text-gray-700">
                      Sexo
                    </Label>
                    <Select value={formData.sexo} onValueChange={(value) => handleInputChange("sexo", value)}>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Seleccionar sexo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="femenino">Femenino</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado_civil" className="text-sm font-medium text-gray-700">
                      Estado Civil
                    </Label>
                    <Select value={formData.estado_civil} onValueChange={(value) => handleInputChange("estado_civil", value)}>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Seleccionar estado civil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="soltero">Soltero</SelectItem>
                        <SelectItem value="casado">Casado</SelectItem>
                        <SelectItem value="divorciado">Divorciado</SelectItem>
                        <SelectItem value="viudo">Viudo</SelectItem>
                        <SelectItem value="union_libre">Unión Libre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lugar_nacimiento" className="text-sm font-medium text-gray-700">
                      Lugar de Nacimiento
                    </Label>
                    <Input
                      id="lugar_nacimiento"
                      value={formData.lugar_nacimiento}
                      onChange={(e) => handleInputChange("lugar_nacimiento", e.target.value)}
                      placeholder="Ej: Ciudad de Guatemala"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información de Contacto */}
            <Card className="border-green-200 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-green-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-green-800">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  Información de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-sm font-medium text-gray-700">
                      Teléfono
                    </Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => handleInputChange("telefono", e.target.value)}
                      placeholder="Ej: 5555-1234"
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="correo_electronico" className="text-sm font-medium text-gray-700">
                      Correo Electrónico
                    </Label>
                    <Input
                      id="correo_electronico"
                      type="email"
                      value={formData.correo_electronico}
                      onChange={(e) => handleInputChange("correo_electronico", e.target.value)}
                      placeholder="Ej: paciente@email.com"
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="direccion" className="text-sm font-medium text-gray-700">
                      Dirección
                    </Label>
                    <Textarea
                      id="direccion"
                      value={formData.direccion}
                      onChange={(e) => handleInputChange("direccion", e.target.value)}
                      placeholder="Dirección completa del paciente"
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información Adicional */}
            <Card className="border-purple-200 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-purple-800">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  Información Adicional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ocupacion" className="text-sm font-medium text-gray-700">
                      Ocupación
                    </Label>
                    <Input
                      id="ocupacion"
                      value={formData.ocupacion}
                      onChange={(e) => handleInputChange("ocupacion", e.target.value)}
                      placeholder="Ej: Ingeniero"
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lugar_trabajo" className="text-sm font-medium text-gray-700">
                      Lugar de Trabajo
                    </Label>
                    <Input
                      id="lugar_trabajo"
                      value={formData.lugar_trabajo}
                      onChange={(e) => handleInputChange("lugar_trabajo", e.target.value)}
                      placeholder="Ej: Empresa ABC"
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="padre_madre" className="text-sm font-medium text-gray-700">
                      Padre/Madre
                    </Label>
                    <Input
                      id="padre_madre"
                      value={formData.padre_madre}
                      onChange={(e) => handleInputChange("padre_madre", e.target.value)}
                      placeholder="Ej: María García"
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conyuge" className="text-sm font-medium text-gray-700">
                      Cónyuge
                    </Label>
                    <Input
                      id="conyuge"
                      value={formData.conyuge}
                      onChange={(e) => handleInputChange("conyuge", e.target.value)}
                      placeholder="Ej: Ana López"
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nombre_responsable" className="text-sm font-medium text-gray-700">
                      Responsable
                    </Label>
                    <Input
                      id="nombre_responsable"
                      value={formData.nombre_responsable}
                      onChange={(e) => handleInputChange("nombre_responsable", e.target.value)}
                      placeholder="Ej: Pedro Martínez"
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono_responsable" className="text-sm font-medium text-gray-700">
                      Teléfono del Responsable
                    </Label>
                    <Input
                      id="telefono_responsable"
                      value={formData.telefono_responsable}
                      onChange={(e) => handleInputChange("telefono_responsable", e.target.value)}
                      placeholder="Ej: 5555-5678"
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botones de Acción */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/pacientes/${pacienteId}`)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
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
        </main>
      </div>
    </div>
  )
}
