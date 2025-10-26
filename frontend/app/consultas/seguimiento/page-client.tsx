"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Activity, User } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"

interface Paciente {
  id_paciente: string
  nombres: string
  apellidos: string
  numero_registro_medico?: string
  telefono?: string
  correo_electronico?: string
  fecha_nacimiento?: string
  sexo?: string
}

export default function SeguimientoPageClient() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const pacienteId = searchParams.get("paciente_id")
  
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Función para obtener la fecha local en formato YYYY-MM-DD
  const getLocalDateString = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Form data para consulta de seguimiento
  const [formData, setFormData] = useState({
    fecha: getLocalDateString(),
    medico: "",
    evolucion: "",
    notas: "",
    tratamiento_actual: ""
  })

  // Verificar que solo médicos y enfermeras puedan acceder
  const tieneAcceso = user?.rol === 'medico' || user?.rol === 'enfermera' || user?.rol === 'administrador'

  useEffect(() => {
    if (!tieneAcceso || !pacienteId) return

    const cargarPaciente = async () => {
      try {
        setLoading(true)
        
        // Cargar información del paciente
        const result = await apiClient.getPaciente(pacienteId)
        if (result.error) {
          setError(result.error)
          return
        }
        
        const expedienteData: any = result.data
        setPaciente(expedienteData.paciente)
        
        // Establecer el nombre del médico actual
        if (user) {
          setFormData(prev => ({
            ...prev,
            medico: `${user.nombres} ${user.apellidos}`
          }))
        }
      } catch (error) {
        console.error("Error cargando paciente:", error)
        setError("Error al cargar información del paciente")
      } finally {
        setLoading(false)
      }
    }

    cargarPaciente()
  }, [pacienteId, tieneAcceso])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pacienteId) return

    try {
      setSubmitting(true)
      setError(null)

      // Crear consulta de seguimiento
      const seguimientoData = {
        paciente_id: pacienteId,
        medico_id: user?.id_usuario,
        fecha: formData.fecha,
        medico: formData.medico,
        evolucion: formData.evolucion,
        notas: formData.notas,
        tratamiento_actual: formData.tratamiento_actual
      }

      console.log("Datos de seguimiento a enviar:", seguimientoData)
      console.log("FormData completo:", formData)

      const result = await apiClient.createConsultaSeguimiento(seguimientoData)
      console.log("Resultado de la API:", result)
      if (result.error) {
        setError(result.error)
        return
      }

      setSuccess(true)
      
      // Limpiar formulario
      setFormData({
        fecha: getLocalDateString(),
        medico: user ? `${user.nombres} ${user.apellidos}` : "",
        evolucion: "",
        notas: "",
        tratamiento_actual: ""
      })
    } catch (error) {
      console.error("Error creando seguimiento:", error)
      setError("Error al crear la consulta de seguimiento")
    } finally {
      setSubmitting(false)
    }
  }

  if (!tieneAcceso) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Acceso Restringido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Solo el personal médico y de enfermería pueden crear consultas de seguimiento.
            </p>
            <Button asChild>
              <Link href="/consultas">Volver a Consultas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del paciente...</p>
        </div>
      </div>
    )
  }

  if (error && !paciente) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button asChild>
              <Link href="/consultas">Volver a Consultas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/consultas/${pacienteId}`}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al Expediente
                  </Link>
                </Button>
                <h1 className="text-xl font-semibold text-gray-900">Consulta de Seguimiento</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Información del Paciente */}
          {paciente && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información del Paciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Nombre Completo</Label>
                    <p className="text-lg font-semibold text-gray-900">
                      {paciente.nombres} {paciente.apellidos}
                    </p>
                  </div>
                  {paciente.telefono && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Teléfono</Label>
                      <p className="text-gray-900">{paciente.telefono}</p>
                    </div>
                  )}
                  {paciente.correo_electronico && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Email</Label>
                      <p className="text-gray-900">{paciente.correo_electronico}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Formulario de Seguimiento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Consulta de Seguimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">¡Consulta de seguimiento creada exitosamente!</p>
                  <p className="text-green-600 text-sm mt-1">
                    La consulta ha sido registrada en el expediente del paciente.
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header del formulario */}
                <div className="text-center border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900">ASCAN - Consulta de Seguimiento</h3>
                  <p className="text-sm text-gray-600">Registro de evolución del paciente</p>
                </div>

                {/* Información del paciente */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Información del Paciente</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Nombre:</span> {paciente?.nombres} {paciente?.apellidos}
                    </div>
                    <div>
                      <span className="font-medium">Registro Médico:</span> {paciente?.numero_registro_medico}
                    </div>
                    <div>
                      <span className="font-medium">Fecha de Nacimiento:</span> {paciente?.fecha_nacimiento}
                    </div>
                  </div>
                </div>

                {/* Fecha de consulta y médico */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fecha">Fecha de Consulta</Label>
                    <Input
                      id="fecha"
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="medico">Médico</Label>
                    <Input
                      id="medico"
                      value={formData.medico}
                      onChange={(e) => setFormData(prev => ({ ...prev, medico: e.target.value }))}
                      placeholder="Nombre del médico"
                      required
                    />
                  </div>
                </div>

                {/* Evolución */}
                <div>
                  <Label htmlFor="evolucion">Evolución del Paciente</Label>
                  <Textarea
                    id="evolucion"
                    value={formData.evolucion}
                    onChange={(e) => setFormData(prev => ({ ...prev, evolucion: e.target.value }))}
                    placeholder="Describe la evolución del paciente desde la última consulta"
                    rows={4}
                    required
                  />
                </div>

                {/* Notas */}
                <div>
                  <Label htmlFor="notas">Notas Clínicas</Label>
                  <Textarea
                    id="notas"
                    value={formData.notas}
                    onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                    placeholder="Notas adicionales sobre el estado del paciente"
                    rows={3}
                  />
                </div>

                {/* Tratamiento Actual */}
                <div>
                  <Label htmlFor="tratamiento_actual">Tratamiento Actual</Label>
                  <Textarea
                    id="tratamiento_actual"
                    value={formData.tratamiento_actual}
                    onChange={(e) => setFormData(prev => ({ ...prev, tratamiento_actual: e.target.value }))}
                    placeholder="Describe el tratamiento actual y modificaciones"
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700">
                    {submitting ? "Guardando..." : "Guardar Seguimiento"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href={`/consultas/${pacienteId}`}>
                      Cancelar
                    </Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
