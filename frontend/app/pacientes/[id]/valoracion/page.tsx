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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClipboardList, Save, ArrowLeft, Calendar, TrendingUp, FileText, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

interface ValoracionForm {
  fecha: string
  tipo_valoracion: string
  evolucion_paciente: string
  sintomas_actuales: string
  examen_fisico_actual: string
  diagnostico_actual: string
  plan_tratamiento: string
  medicamentos: string
  recomendaciones: string
  observaciones_medicas: string
  seguimiento: string
  estado_general: string
  respuesta_tratamiento: string
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function NuevaValoracionPage({ params }: PageProps): ReactElement {
  const router = useRouter()
  const [pacienteId, setPacienteId] = useState<string>("")
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

  const [formData, setFormData] = useState<ValoracionForm>({
    fecha: new Date().toISOString().split("T")[0],
    tipo_valoracion: "seguimiento",
    evolucion_paciente: "",
    sintomas_actuales: "",
    examen_fisico_actual: "",
    diagnostico_actual: "",
    plan_tratamiento: "",
    medicamentos: "",
    recomendaciones: "",
    observaciones_medicas: "",
    seguimiento: "",
    estado_general: "estable",
    respuesta_tratamiento: "",
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
        fecha: formData.fecha,
        tipo_valoracion: formData.tipo_valoracion,
        descripcion: `
EVOLUCIÓN DEL PACIENTE:
${formData.evolucion_paciente}

SÍNTOMAS ACTUALES:
${formData.sintomas_actuales}

EXAMEN FÍSICO ACTUAL:
${formData.examen_fisico_actual}

DIAGNÓSTICO ACTUAL:
${formData.diagnostico_actual}

RESPUESTA AL TRATAMIENTO:
${formData.respuesta_tratamiento}

MEDICAMENTOS:
${formData.medicamentos}

OBSERVACIONES MÉDICAS:
${formData.observaciones_medicas}
        `.trim(),
        recomendaciones: `
PLAN DE TRATAMIENTO:
${formData.plan_tratamiento}

RECOMENDACIONES:
${formData.recomendaciones}
        `.trim(),
        seguimiento: formData.seguimiento || null,
      }

      const result = await apiClient.createValoracion(valoracionData)
      
      if (result.error) {
        throw new Error(result.error)
      }

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
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Nueva Valoración</h1>
                  <p className="text-sm text-muted-foreground">Consulta de seguimiento y evolución</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información General */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Información de la Valoración</span>
              </CardTitle>
              <CardDescription>Datos generales de la consulta de seguimiento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha de Valoración *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fecha"
                      type="date"
                      required
                      className="pl-10"
                      value={formData.fecha}
                      onChange={(e) => handleInputChange("fecha", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo_valoracion">Tipo de Valoración</Label>
                  <Select
                    value={formData.tipo_valoracion}
                    onValueChange={(value) => handleInputChange("tipo_valoracion", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seguimiento">Seguimiento</SelectItem>
                      <SelectItem value="control">Control</SelectItem>
                      <SelectItem value="revision">Revisión</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado_general">Estado General</Label>
                  <Select
                    value={formData.estado_general}
                    onValueChange={(value) => handleInputChange("estado_general", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mejorado">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Mejorado</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="estable">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-blue-500" />
                          <span>Estable</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="deteriorado">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span>Deteriorado</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evolución del Paciente */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Evolución del Paciente</span>
              </CardTitle>
              <CardDescription>Progreso y cambios desde la última consulta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="evolucion_paciente">Evolución General *</Label>
                <Textarea
                  id="evolucion_paciente"
                  placeholder="Describe cómo ha evolucionado el paciente desde la última consulta..."
                  className="min-h-[120px]"
                  required
                  value={formData.evolucion_paciente}
                  onChange={(e) => handleInputChange("evolucion_paciente", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sintomas_actuales">Síntomas Actuales</Label>
                <Textarea
                  id="sintomas_actuales"
                  placeholder="Síntomas que presenta actualmente el paciente..."
                  className="min-h-[100px]"
                  value={formData.sintomas_actuales}
                  onChange={(e) => handleInputChange("sintomas_actuales", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="respuesta_tratamiento">Respuesta al Tratamiento</Label>
                <Textarea
                  id="respuesta_tratamiento"
                  placeholder="Cómo ha respondido el paciente al tratamiento actual..."
                  className="min-h-[100px]"
                  value={formData.respuesta_tratamiento}
                  onChange={(e) => handleInputChange("respuesta_tratamiento", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Evaluación Clínica */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Evaluación Clínica Actual</span>
              </CardTitle>
              <CardDescription>Hallazgos del examen físico y diagnóstico</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="examen_fisico_actual">Examen Físico Actual</Label>
                <Textarea
                  id="examen_fisico_actual"
                  placeholder="Hallazgos relevantes del examen físico actual..."
                  className="min-h-[100px]"
                  value={formData.examen_fisico_actual}
                  onChange={(e) => handleInputChange("examen_fisico_actual", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnostico_actual">Diagnóstico Actual</Label>
                <Textarea
                  id="diagnostico_actual"
                  placeholder="Diagnóstico basado en la evaluación actual..."
                  className="min-h-[100px]"
                  value={formData.diagnostico_actual}
                  onChange={(e) => handleInputChange("diagnostico_actual", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Plan de Tratamiento */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                <span>Plan de Tratamiento</span>
              </CardTitle>
              <CardDescription>Tratamiento y recomendaciones médicas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="plan_tratamiento">Plan de Tratamiento *</Label>
                <Textarea
                  id="plan_tratamiento"
                  placeholder="Plan de tratamiento a seguir..."
                  className="min-h-[120px]"
                  required
                  value={formData.plan_tratamiento}
                  onChange={(e) => handleInputChange("plan_tratamiento", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicamentos">Medicamentos</Label>
                <Textarea
                  id="medicamentos"
                  placeholder="Medicamentos prescritos, dosis, frecuencia..."
                  className="min-h-[100px]"
                  value={formData.medicamentos}
                  onChange={(e) => handleInputChange("medicamentos", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recomendaciones">Recomendaciones</Label>
                <Textarea
                  id="recomendaciones"
                  placeholder="Recomendaciones generales para el paciente..."
                  className="min-h-[100px]"
                  value={formData.recomendaciones}
                  onChange={(e) => handleInputChange("recomendaciones", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="seguimiento">Próxima Cita de Seguimiento</Label>
                  <Input
                    id="seguimiento"
                    type="date"
                    value={formData.seguimiento}
                    onChange={(e) => handleInputChange("seguimiento", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notas Médicas */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Notas Médicas Adicionales</CardTitle>
              <CardDescription>Observaciones y notas importantes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="observaciones_medicas">Observaciones Médicas</Label>
                <Textarea
                  id="observaciones_medicas"
                  placeholder="Notas adicionales, observaciones importantes, consideraciones especiales..."
                  className="min-h-[120px]"
                  value={formData.observaciones_medicas}
                  onChange={(e) => handleInputChange("observaciones_medicas", e.target.value)}
                />
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
