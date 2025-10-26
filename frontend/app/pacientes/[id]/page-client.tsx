"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Activity, 
  Microscope,
  Loader2,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { formatDateLong } from "@/lib/date-utils-simple"

interface Paciente {
  id_paciente: string
  numero_registro_medico: string
  nombres: string
  apellidos: string
  dpi?: string
  edad?: number
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
  created_at: string
}

interface VerPacienteClientProps {
  pacienteId: string
}

export default function VerPacienteClient({ pacienteId }: VerPacienteClientProps) {
  const router = useRouter()
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    cargarPaciente()
  }, [pacienteId])

  const cargarPaciente = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log("🔍 Cargando paciente con ID:", pacienteId)
      
      // Prueba directa con fetch
      const response = await fetch(`/api/pacientes/${pacienteId}`)
      const data = await response.json()
      
      console.log("📥 Respuesta directa del fetch:", data)
      
      if (data && data.paciente && Object.keys(data.paciente).length > 0) {
        console.log("✅ Estableciendo paciente:", data.paciente)
        setPaciente(data.paciente)
      } else {
        console.log("❌ Paciente no encontrado:", data)
        setError(`Paciente con ID ${pacienteId} no existe en la base de datos`)
      }
    } catch (error) {
      console.error("💥 Error cargando paciente:", error)
      setError("Error al cargar la información del paciente")
    } finally {
      setLoading(false)
    }
  }

  const calcularEdad = (fechaNacimiento: string | null | undefined) => {
    if (!fechaNacimiento) return "N/A"
    
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    
    if (isNaN(nacimiento.getTime())) return "N/A"
    
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }
    
    return edad
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
                <h1 className="text-xl font-semibold text-gray-900">Información del Paciente</h1>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => router.push(`/pacientes/${pacienteId}/editar`)}
                  className="border-green-300 text-green-600 hover:bg-green-50"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/pacientes")}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Información Personal */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-blue-200 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-blue-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-blue-800">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nombres</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {paciente.nombres || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Apellidos</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {paciente.apellidos || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Registro Médico</label>
                      <p className="text-lg font-semibold text-blue-600">
                        {paciente.numero_registro_medico || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">DPI</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {paciente.dpi || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fecha de Nacimiento</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {paciente.fecha_nacimiento ? formatDateLong(paciente.fecha_nacimiento) : "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Edad</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {calcularEdad(paciente.fecha_nacimiento)} años
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Sexo</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {paciente.sexo ? (paciente.sexo === "masculino" ? "Masculino" : paciente.sexo === "femenino" ? "Femenino" : paciente.sexo) : "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Estado Civil</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {paciente.estado_civil || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información de Contacto */}
              <Card className="border-green-200 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-green-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-green-800">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    Información de Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Teléfono</label>
                      <p className="text-lg font-semibold text-gray-900">{paciente.telefono || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Correo Electrónico</label>
                      <p className="text-lg font-semibold text-gray-900">{paciente.correo_electronico || "N/A"}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-600">Dirección</label>
                      <p className="text-lg font-semibold text-gray-900">{paciente.direccion || "N/A"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información Adicional */}
              <Card className="border-purple-200 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-purple-800">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    Información Adicional
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Lugar de Nacimiento</label>
                      <p className="text-lg font-semibold text-gray-900">{paciente.lugar_nacimiento || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Ocupación</label>
                      <p className="text-lg font-semibold text-gray-900">{paciente.ocupacion || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Lugar de Trabajo</label>
                      <p className="text-lg font-semibold text-gray-900">{paciente.lugar_trabajo || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Raza/Etnia</label>
                      <p className="text-lg font-semibold text-gray-900">{paciente.raza || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Cónyuge</label>
                      <p className="text-lg font-semibold text-gray-900">{paciente.conyuge || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Padre/Madre</label>
                      <p className="text-lg font-semibold text-gray-900">{paciente.padre_madre || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nombre del Responsable</label>
                      <p className="text-lg font-semibold text-gray-900">{paciente.nombre_responsable || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Teléfono del Responsable</label>
                      <p className="text-lg font-semibold text-gray-900">{paciente.telefono_responsable || "N/A"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Panel Lateral */}
            <div className="space-y-6">
              {/* Acciones Rápidas */}
              <Card className="border-orange-200 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-orange-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-orange-800">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Activity className="h-5 w-5 text-orange-600" />
                    </div>
                    Acciones Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => router.push(`/consultas/${pacienteId}`)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Ver Expediente
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full border-green-300 text-green-600 hover:bg-green-50"
                    onClick={() => router.push(`/agendar-cita?paciente_id=${pacienteId}`)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar Cita
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                    onClick={() => router.push(`/laboratorio?paciente_id=${pacienteId}`)}
                  >
                    <Microscope className="h-4 w-4 mr-2" />
                    Ver Laboratorios
                  </Button>
                </CardContent>
              </Card>

              {/* Información del Registro */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Información del Registro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-gray-600">Fecha de Registro:</span>
                    <p className="text-gray-900">{formatDateLong(paciente.created_at)}</p>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-gray-600">ID del Paciente:</span>
                    <p className="text-gray-900 font-mono text-xs">{paciente.id_paciente}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
