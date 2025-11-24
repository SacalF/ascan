"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Heart, User } from "lucide-react"
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

export default function ValoracionPageClient() {
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

  // Form data para valoración
  const [valoracionData, setValoracionData] = useState({
    fecha_valoracion: getLocalDateString(),
    peso: "",
    talla: "",
    pulso: "",
    respiracion: "",
    presion_arterial: "",
    temperatura: ""
  })

  // Verificar que solo enfermeras y médicos puedan acceder
  const tieneAcceso = user?.rol === 'medico' || user?.rol === 'enfermera' || user?.rol === 'administrador'

  useEffect(() => {
    if (!tieneAcceso || !pacienteId) return

    const cargarPaciente = async () => {
      try {
        setLoading(true)
        const result = await apiClient.getPaciente(pacienteId)
        if (result.error) {
          setError(result.error)
          return
        }
        setPaciente((result.data as any).paciente)
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

      // Crear valoración
      const valoracionResult = await apiClient.createValoracion({
        paciente_id: pacienteId,
        enfermera_id: user?.id_usuario,
        fecha_valoracion: valoracionData.fecha_valoracion || null,
        peso: valoracionData.peso ? parseFloat(valoracionData.peso) : null,
        talla: valoracionData.talla ? parseFloat(valoracionData.talla) : null,
        pulso: valoracionData.pulso ? parseInt(valoracionData.pulso) : null,
        respiracion: valoracionData.respiracion ? parseInt(valoracionData.respiracion) : null,
        presion_arterial: valoracionData.presion_arterial,
        temperatura: valoracionData.temperatura ? parseFloat(valoracionData.temperatura) : null
      })

      if (valoracionResult.error) {
        setError(valoracionResult.error)
        return
      }

      setSuccess(true)
      
      // Limpiar formulario
      setValoracionData({
        fecha_valoracion: getLocalDateString(),
        peso: "",
        talla: "",
        pulso: "",
        respiracion: "",
        presion_arterial: "",
        temperatura: ""
      })
    } catch (error) {
      console.error("Error creando valoración:", error)
      setError("Error al crear la valoración")
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
              Solo el personal médico y de enfermería pueden realizar valoraciones.
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
                <h1 className="text-xl font-semibold text-gray-900">Valoración Médica</h1>
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

          {/* Formulario de Valoración */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Valoración de Signos Vitales
              </CardTitle>
            </CardHeader>
            <CardContent>
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">¡Valoración registrada exitosamente!</p>
                  <p className="text-green-600 text-sm mt-1">
                    Los signos vitales han sido registrados en el expediente del paciente.
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
                  <h3 className="text-lg font-semibold text-gray-900">ASCAN - Valoración Médica</h3>
                  <p className="text-sm text-gray-600">Registro de signos vitales por enfermería</p>
                </div>

                {/* Información del paciente */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Información del Paciente</h4>
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

                {/* Valoración Médica */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">EXAMEN - Valoración</h4>
                  <div className="mb-4">
                    <Label htmlFor="fecha_valoracion">Fecha de Valoración *</Label>
                    <Input
                      id="fecha_valoracion"
                      type="date"
                      required
                      value={valoracionData.fecha_valoracion}
                      onChange={(e) => setValoracionData(prev => ({ ...prev, fecha_valoracion: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="peso">Peso (lbs)</Label>
                      <Input
                        id="peso"
                        type="number"
                        step="0.1"
                        value={valoracionData.peso}
                        onChange={(e) => setValoracionData(prev => ({ ...prev, peso: e.target.value }))}
                        placeholder="162"
                      />
                    </div>
                    <div>
                      <Label htmlFor="talla">Talla (cm)</Label>
                      <Input
                        id="talla"
                        type="number"
                        step="0.1"
                        value={valoracionData.talla}
                        onChange={(e) => setValoracionData(prev => ({ ...prev, talla: e.target.value }))}
                        placeholder="165"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pulso">Pulso x 1'</Label>
                      <Input
                        id="pulso"
                        type="number"
                        value={valoracionData.pulso}
                        onChange={(e) => setValoracionData(prev => ({ ...prev, pulso: e.target.value }))}
                        placeholder="86"
                      />
                    </div>
                    <div>
                      <Label htmlFor="respiracion">Respiración x 1'</Label>
                      <Input
                        id="respiracion"
                        type="number"
                        value={valoracionData.respiracion}
                        onChange={(e) => setValoracionData(prev => ({ ...prev, respiracion: e.target.value }))}
                        placeholder="18"
                      />
                    </div>
                    <div>
                      <Label htmlFor="presion_arterial">PA</Label>
                      <Input
                        id="presion_arterial"
                        value={valoracionData.presion_arterial}
                        onChange={(e) => setValoracionData(prev => ({ ...prev, presion_arterial: e.target.value }))}
                        placeholder="115/70"
                      />
                    </div>
                    <div>
                      <Label htmlFor="temperatura">Temp. (°C)</Label>
                      <Input
                        id="temperatura"
                        type="number"
                        step="0.1"
                        value={valoracionData.temperatura}
                        onChange={(e) => setValoracionData(prev => ({ ...prev, temperatura: e.target.value }))}
                        placeholder="36.2"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                    {submitting ? "Guardando..." : "Guardar Valoración"}
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