"use client"

import type React from "react"
import type { ReactElement } from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ClipboardList, Save, ArrowLeft, Heart, User, Activity, Calendar } from "lucide-react"
import Link from "next/link"

interface ValoracionForm {
  fecha_valoracion: string
  peso: string
  talla: string
  pulso: string
  respiracion: string
  presion_arterial: string
  temperatura: string
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function NuevaValoracionPage({ params }: PageProps): ReactElement {
  const router = useRouter()
  const [pacienteId, setPacienteId] = useState<string>("")
  const [paciente, setPaciente] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paramsLoaded, setParamsLoaded] = useState(false)

  useEffect(() => {
    params
      .then((resolvedParams) => {
        setPacienteId(resolvedParams.id)
        setParamsLoaded(true)
      })
      .catch((error) => {
        console.error("Error resolving params:", error)
        setError("Error al cargar la página")
        setParamsLoaded(true)
      })
  }, [params])

  useEffect(() => {
    if (pacienteId) {
      cargarPaciente()
    }
  }, [pacienteId])

  const cargarPaciente = async () => {
    try {
      const result = await apiClient.getPaciente(pacienteId)
      if (result && !result.error && result.data) {
        const responseData = result.data as any
        if (responseData.paciente) {
          setPaciente(responseData.paciente)
        }
      }
    } catch (error) {
      console.error("Error cargando paciente:", error)
    }
  }

  // Función para obtener la fecha local en formato YYYY-MM-DD
  const getLocalDateString = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [formData, setFormData] = useState<ValoracionForm>({
    fecha_valoracion: getLocalDateString(),
    peso: "",
    talla: "",
    pulso: "",
    respiracion: "",
    presion_arterial: "",
    temperatura: "",
  })

  const handleInputChange = (field: keyof ValoracionForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pacienteId) return

    setIsLoading(true)
    setError(null)

    try {
      const valoracionData = {
        paciente_id: pacienteId,
        fecha_valoracion: formData.fecha_valoracion || null,
        peso: formData.peso ? parseFloat(formData.peso) : null,
        talla: formData.talla ? parseFloat(formData.talla) : null,
        pulso: formData.pulso ? parseInt(formData.pulso) : null,
        respiracion: formData.respiracion ? parseInt(formData.respiracion) : null,
        presion_arterial: formData.presion_arterial || null,
        temperatura: formData.temperatura ? parseFloat(formData.temperatura) : null
      }

      const result = await apiClient.createValoracion(valoracionData)
      
      if (result.error) {
        throw new Error(result.error)
      }

      // Limpiar formulario
      setFormData({
        fecha_valoracion: getLocalDateString(),
        peso: "",
        talla: "",
        pulso: "",
        respiracion: "",
        presion_arterial: "",
        temperatura: "",
      })

      router.push(`/pacientes/${pacienteId}`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al guardar la valoración")
    } finally {
      setIsLoading(false)
    }
  }

  if (!paramsLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando valoración...</p>
        </div>
      </div>
    )
  }

  if (!pacienteId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Error: ID de paciente no válido</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="bg-card border-b border-border/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost">
                <Link href={`/pacientes/${pacienteId}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Paciente
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Nueva Valoración</h1>
                  <p className="text-sm text-muted-foreground">Registro de signos vitales</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Paciente */}
          {paciente && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-primary" />
                  <span>Información del Paciente</span>
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
                  {paciente.numero_registro_medico && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Número de Registro</Label>
                      <p className="text-gray-900">{paciente.numero_registro_medico}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Signos Vitales */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-primary" />
                <span>Signos Vitales</span>
              </CardTitle>
              <CardDescription>Registro de signos vitales por enfermería</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2 mb-6">
                <Label htmlFor="fecha_valoracion">Fecha de Valoración *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fecha_valoracion"
                    type="date"
                    required
                    className="pl-10"
                    value={formData.fecha_valoracion}
                    onChange={(e) => handleInputChange("fecha_valoracion", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="peso">Peso (lbs) *</Label>
                  <Input
                    id="peso"
                    type="number"
                    step="0.1"
                    placeholder="162"
                    value={formData.peso}
                    onChange={(e) => handleInputChange("peso", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="talla">Talla (cm) *</Label>
                  <Input
                    id="talla"
                    type="number"
                    step="0.1"
                    placeholder="165"
                    value={formData.talla}
                    onChange={(e) => handleInputChange("talla", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pulso">Pulso x 1'</Label>
                  <Input
                    id="pulso"
                    type="number"
                    placeholder="86"
                    value={formData.pulso}
                    onChange={(e) => handleInputChange("pulso", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="respiracion">Respiración x 1'</Label>
                  <Input
                    id="respiracion"
                    type="number"
                    placeholder="18"
                    value={formData.respiracion}
                    onChange={(e) => handleInputChange("respiracion", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="presion_arterial">Presión Arterial</Label>
                  <Input
                    id="presion_arterial"
                    placeholder="115/70"
                    value={formData.presion_arterial}
                    onChange={(e) => handleInputChange("presion_arterial", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperatura">Temperatura (°C)</Label>
                  <Input
                    id="temperatura"
                    type="number"
                    step="0.1"
                    placeholder="36.2"
                    value={formData.temperatura}
                    onChange={(e) => handleInputChange("temperatura", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button type="button" variant="outline" asChild>
              <Link href={`/pacientes/${pacienteId}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                "Guardando..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Valoración
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
