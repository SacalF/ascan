"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { UserPlus, Calendar, Phone, MapPin, Briefcase, Users, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"

interface PacienteForm {
  nombres: string
  apellidos: string
  dpi: string
  numeroExpediente: string
  fechaNacimiento: string
  sexo: string
  telefono: string
  correoElectronico: string
  direccion: string
  lugarNacimiento: string
  estadoCivil: string
  ocupacion: string
  raza: string
  conyuge: string
  padreMadre: string
  lugarTrabajo: string
  nombreResponsable: string
  telefonoResponsable: string
}

export default function RegistrarPacientePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<PacienteForm>({
    nombres: "",
    apellidos: "",
    dpi: "",
    numeroExpediente: "",
    fechaNacimiento: "",
    sexo: "",
    telefono: "",
    correoElectronico: "",
    direccion: "",
    lugarNacimiento: "",
    estadoCivil: "",
    ocupacion: "",
    raza: "",
    conyuge: "",
    padreMadre: "",
    lugarTrabajo: "",
    nombreResponsable: "",
    telefonoResponsable: "",
  })

  const handleInputChange = (field: keyof PacienteForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const calcularEdad = (fechaNacimiento: string) => {
    if (!fechaNacimiento) return 0
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }
    return edad
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await apiClient.createPaciente(formData)

      if (result.data) {
        console.log("Paciente registrado:", result.data)
        router.push("/pacientes")
      } else {
        throw new Error(result.error || "Error al registrar paciente")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al registrar paciente")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="bg-card border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/pacientes" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span>Volver a Pacientes</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold">Registrar Nuevo Paciente</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información Personal */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Información Personal</span>
              </CardTitle>
              <CardDescription>Datos básicos del paciente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nombres">Nombres *</Label>
                  <Input
                    id="nombres"
                    required
                    value={formData.nombres}
                    onChange={(e) => handleInputChange("nombres", e.target.value)}
                    placeholder="Nombres del paciente"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidos">Apellidos *</Label>
                  <Input
                    id="apellidos"
                    required
                    value={formData.apellidos}
                    onChange={(e) => handleInputChange("apellidos", e.target.value)}
                    placeholder="Apellidos del paciente"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="numeroExpediente">Número de Expediente *</Label>
                  <Input
                    id="numeroExpediente"
                    required
                    value={formData.numeroExpediente}
                    onChange={(e) => handleInputChange("numeroExpediente", e.target.value)}
                    placeholder="Ej: 001, 002, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dpi">DPI</Label>
                  <Input
                    id="dpi"
                    value={formData.dpi}
                    onChange={(e) => handleInputChange("dpi", e.target.value)}
                    placeholder="Número de DPI"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fechaNacimiento"
                      type="date"
                      required
                      className="pl-10"
                      value={formData.fechaNacimiento}
                      onChange={(e) => handleInputChange("fechaNacimiento", e.target.value)}
                    />
                  </div>
                  {formData.fechaNacimiento && (
                    <p className="text-sm text-muted-foreground">
                      Edad: {calcularEdad(formData.fechaNacimiento)} años
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sexo">Sexo *</Label>
                  <Select value={formData.sexo} onValueChange={(value) => handleInputChange("sexo", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar sexo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="femenino">Femenino</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="lugarNacimiento">Lugar de Nacimiento</Label>
                  <Input
                    id="lugarNacimiento"
                    value={formData.lugarNacimiento}
                    onChange={(e) => handleInputChange("lugarNacimiento", e.target.value)}
                    placeholder="Ciudad, País"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estadoCivil">Estado Civil</Label>
                  <Select value={formData.estadoCivil} onValueChange={(value) => handleInputChange("estadoCivil", value)}>
                    <SelectTrigger>
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
              </div>
            </CardContent>
          </Card>

          {/* Información de Contacto */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-primary" />
                <span>Información de Contacto</span>
              </CardTitle>
              <CardDescription>Datos de contacto del paciente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange("telefono", e.target.value)}
                    placeholder="Número de teléfono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correoElectronico">Correo Electrónico</Label>
                  <Input
                    id="correoElectronico"
                    type="email"
                    value={formData.correoElectronico}
                    onChange={(e) => handleInputChange("correoElectronico", e.target.value)}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Textarea
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => handleInputChange("direccion", e.target.value)}
                  placeholder="Dirección completa"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Información Laboral */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <span>Información Laboral</span>
              </CardTitle>
              <CardDescription>Datos profesionales del paciente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ocupacion">Ocupación</Label>
                  <Input
                    id="ocupacion"
                    value={formData.ocupacion}
                    onChange={(e) => handleInputChange("ocupacion", e.target.value)}
                    placeholder="Profesión u ocupación"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lugarTrabajo">Lugar de Trabajo</Label>
                  <Input
                    id="lugarTrabajo"
                    value={formData.lugarTrabajo}
                    onChange={(e) => handleInputChange("lugarTrabajo", e.target.value)}
                    placeholder="Empresa o institución"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Familiar */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Información Familiar</span>
              </CardTitle>
              <CardDescription>Datos familiares del paciente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="conyuge">Cónyuge</Label>
                  <Input
                    id="conyuge"
                    value={formData.conyuge}
                    onChange={(e) => handleInputChange("conyuge", e.target.value)}
                    placeholder="Nombre del cónyuge"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="padreMadre">Padre/Madre</Label>
                  <Input
                    id="padreMadre"
                    value={formData.padreMadre}
                    onChange={(e) => handleInputChange("padreMadre", e.target.value)}
                    placeholder="Nombre del padre o madre"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="raza">Raza/Etnia</Label>
                <Input
                  id="raza"
                  value={formData.raza}
                  onChange={(e) => handleInputChange("raza", e.target.value)}
                  placeholder="Raza o etnia"
                />
              </div>
            </CardContent>
          </Card>

          {/* Persona Responsable */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-primary" />
                <span>Persona Responsable</span>
              </CardTitle>
              <CardDescription>Contacto de emergencia o responsable</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nombreResponsable">Nombre del Responsable</Label>
                  <Input
                    id="nombreResponsable"
                    value={formData.nombreResponsable}
                    onChange={(e) => handleInputChange("nombreResponsable", e.target.value)}
                    placeholder="Nombre completo del responsable"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefonoResponsable">Teléfono del Responsable</Label>
                  <Input
                    id="telefonoResponsable"
                    value={formData.telefonoResponsable}
                    onChange={(e) => handleInputChange("telefonoResponsable", e.target.value)}
                    placeholder="Número de teléfono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/pacientes")}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Registrando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Registrar Paciente
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}