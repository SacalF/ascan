"use client"

import type { ReactElement } from "react"
import React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  Activity,
  Stethoscope,
  Save,
  ArrowLeft,
  Calendar,
  User,
  Heart,
  Brain,
  Eye,
  Ear,
  Smile,
  Shield,
} from "lucide-react"

interface ConsultaFormData {
  fecha: string
  motivo_consulta: string
  diagnostico_provisional: string
  indicaciones: string
  observaciones: string
  peso: string
  talla: string
  pulso: string
  presion_arterial: string
  temperatura: string
  cabeza_ojos: string
  nariz_oidos: string
  boca_garganta: string
  cuello: string
  torax: string
  abdomen: string
  extremidades: string
  neurologico: string
  piel_anexos: string
}

export default function ConsultaPage(): ReactElement {
  const router = useRouter()
  const [formData, setFormData] = useState<ConsultaFormData>({
    fecha: new Date().toISOString().split('T')[0],
    motivo_consulta: "",
    diagnostico_provisional: "",
    indicaciones: "",
    observaciones: "",
    peso: "",
    talla: "",
    pulso: "",
    presion_arterial: "",
    temperatura: "",
    cabeza_ojos: "",
    nariz_oidos: "",
    boca_garganta: "",
    cuello: "",
    torax: "",
    abdomen: "",
    extremidades: "",
    neurologico: "",
    piel_anexos: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleInputChange = (field: keyof ConsultaFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Crear consulta usando tu API personalizada
      const response = await fetch('/api/consultas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paciente_id: window.location.pathname.split('/')[2], // Obtener ID del paciente de la URL
          ...formData
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear la consulta')
      }

      setSuccess(true)
      setTimeout(() => {
        router.back()
      }, 2000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al crear la consulta")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <div className="text-green-600 mb-4">
              <Save className="h-12 w-12 mx-auto" />
        </div>
            <h2 className="text-xl font-semibold mb-2">Consulta creada exitosamente</h2>
            <p className="text-muted-foreground">Redirigiendo...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
                  <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
              </Button>
          <h1 className="text-3xl font-bold text-gray-900">Nueva Consulta Médica</h1>
          <p className="text-gray-600 mt-2">Registre los detalles de la consulta del paciente</p>
                </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="consulta" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="consulta" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Consulta
              </TabsTrigger>
              <TabsTrigger value="vitales" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Signos Vitales
              </TabsTrigger>
              <TabsTrigger value="fisico" className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Examen Físico
              </TabsTrigger>
              <TabsTrigger value="diagnostico" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Diagnóstico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="consulta" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Información de la Consulta
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fecha">Fecha de Consulta</Label>
                        <Input
                          id="fecha"
                          type="date"
                          value={formData.fecha}
                          onChange={(e) => handleInputChange("fecha", e.target.value)}
                        required
                        />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="motivo_consulta">Motivo de Consulta</Label>
                    <Textarea
                      id="motivo_consulta"
                      value={formData.motivo_consulta}
                      onChange={(e) => handleInputChange("motivo_consulta", e.target.value)}
                      placeholder="Describa el motivo de la consulta..."
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="observaciones">Observaciones Generales</Label>
                    <Textarea
                      id="observaciones"
                      value={formData.observaciones}
                      onChange={(e) => handleInputChange("observaciones", e.target.value)}
                      placeholder="Observaciones adicionales..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vitales" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Signos Vitales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="peso">Peso (kg)</Label>
                        <Input
                          id="peso"
                          type="number"
                          step="0.1"
                          value={formData.peso}
                          onChange={(e) => handleInputChange("peso", e.target.value)}
                        placeholder="70.5"
                        />
                      </div>
                    <div>
                      <Label htmlFor="talla">Talla (cm)</Label>
                        <Input
                          id="talla"
                          type="number"
                          value={formData.talla}
                          onChange={(e) => handleInputChange("talla", e.target.value)}
                        placeholder="170"
                        />
                      </div>
                    <div>
                      <Label htmlFor="pulso">Pulso (bpm)</Label>
                        <Input
                          id="pulso"
                          type="number"
                          value={formData.pulso}
                          onChange={(e) => handleInputChange("pulso", e.target.value)}
                        placeholder="72"
                        />
                      </div>
                    <div>
                        <Label htmlFor="presion_arterial">Presión Arterial</Label>
                        <Input
                          id="presion_arterial"
                          value={formData.presion_arterial}
                          onChange={(e) => handleInputChange("presion_arterial", e.target.value)}
                        placeholder="120/80"
                        />
                      </div>
                  </div>
                  <div>
                    <Label htmlFor="temperatura">Temperatura (°C)</Label>
                        <Input
                          id="temperatura"
                          type="number"
                          step="0.1"
                          value={formData.temperatura}
                          onChange={(e) => handleInputChange("temperatura", e.target.value)}
                      placeholder="36.5"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fisico" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Examen Físico por Regiones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cabeza_ojos" className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Cabeza y Ojos
                      </Label>
                        <Textarea
                          id="cabeza_ojos"
                          value={formData.cabeza_ojos}
                          onChange={(e) => handleInputChange("cabeza_ojos", e.target.value)}
                        placeholder="Estado de la cabeza y ojos..."
                        rows={2}
                        />
                      </div>
                    <div>
                      <Label htmlFor="nariz_oidos" className="flex items-center gap-2">
                        <Ear className="h-4 w-4" />
                        Nariz y Oídos
                      </Label>
                        <Textarea
                        id="nariz_oidos"
                        value={formData.nariz_oidos}
                        onChange={(e) => handleInputChange("nariz_oidos", e.target.value)}
                        placeholder="Estado de nariz y oídos..."
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="boca_garganta" className="flex items-center gap-2">
                        <Smile className="h-4 w-4" />
                        Boca y Garganta
                      </Label>
                        <Textarea
                        id="boca_garganta"
                        value={formData.boca_garganta}
                        onChange={(e) => handleInputChange("boca_garganta", e.target.value)}
                        placeholder="Estado de boca y garganta..."
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cuello">Cuello</Label>
                      <Textarea
                        id="cuello"
                        value={formData.cuello}
                        onChange={(e) => handleInputChange("cuello", e.target.value)}
                        placeholder="Estado del cuello..."
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="torax">Tórax</Label>
                        <Textarea
                        id="torax"
                        value={formData.torax}
                        onChange={(e) => handleInputChange("torax", e.target.value)}
                        placeholder="Estado del tórax..."
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="abdomen">Abdomen</Label>
                        <Textarea
                        id="abdomen"
                        value={formData.abdomen}
                        onChange={(e) => handleInputChange("abdomen", e.target.value)}
                        placeholder="Estado del abdomen..."
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="extremidades">Extremidades</Label>
                      <Textarea
                        id="extremidades"
                        value={formData.extremidades}
                        onChange={(e) => handleInputChange("extremidades", e.target.value)}
                        placeholder="Estado de las extremidades..."
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="neurologico" className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Neurológico
                      </Label>
                      <Textarea
                        id="neurologico"
                        value={formData.neurologico}
                        onChange={(e) => handleInputChange("neurologico", e.target.value)}
                        placeholder="Estado neurológico..."
                        rows={2}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="piel_anexos" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Piel y Anexos
                    </Label>
                    <Textarea
                      id="piel_anexos"
                      value={formData.piel_anexos}
                      onChange={(e) => handleInputChange("piel_anexos", e.target.value)}
                      placeholder="Estado de la piel y anexos..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="diagnostico" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Diagnóstico e Indicaciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="diagnostico_provisional">Diagnóstico Provisional</Label>
                    <Textarea
                      id="diagnostico_provisional"
                      value={formData.diagnostico_provisional}
                      onChange={(e) => handleInputChange("diagnostico_provisional", e.target.value)}
                      placeholder="Diagnóstico provisional..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="indicaciones">Indicaciones y Tratamiento</Label>
                    <Textarea
                      id="indicaciones"
                      value={formData.indicaciones}
                      onChange={(e) => handleInputChange("indicaciones", e.target.value)}
                      placeholder="Indicaciones y tratamiento prescrito..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar Consulta"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}