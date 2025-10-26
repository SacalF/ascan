"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, ArrowLeft, Search, User, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Paciente {
  id_paciente: string
  nombres: string
  apellidos: string
  telefono: string | null
}

interface Medico {
  id_usuario: string
  nombres: string
  apellidos: string
  cedula_profesional?: string
  especialidad?: string
}

interface CitaFormData {
  fecha: string
  hora: string
  paciente_id: string
  medico_id: string
  motivo: string
  estado: "programada" | "confirmada" | "en_curso" | "completada" | "cancelada" | "no_asistio"
  paciente_nombre: string
}

export default function AgendarCitaContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busquedaPaciente, setBusquedaPaciente] = useState("")

  const [formData, setFormData] = useState<CitaFormData>({
    fecha: "",
    hora: "",
    paciente_id: "",
    medico_id: "",
    motivo: "",
    estado: "programada" as const,
    paciente_nombre: "",
  })

  // Cargar pacientes y médicos existentes
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar pacientes
        console.log('=== CARGANDO PACIENTES ===')
        const responsePacientes = await fetch('http://localhost:3001/api/pacientes', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        if (!responsePacientes.ok) {
          throw new Error(`Error ${responsePacientes.status}: ${responsePacientes.statusText}`)
        }
        
        const dataPacientes = await responsePacientes.json()
        setPacientes(dataPacientes)
        console.log('Pacientes cargados:', dataPacientes.length)

        // Cargar médicos
        console.log('=== CARGANDO MÉDICOS ===')
        const responseMedicos = await fetch('http://localhost:3001/api/medicos', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        if (!responseMedicos.ok) {
          throw new Error(`Error ${responseMedicos.status}: ${responseMedicos.statusText}`)
        }
        
        const dataMedicos = await responseMedicos.json()
        setMedicos(dataMedicos)
        console.log('Médicos cargados:', dataMedicos.length)
        
      } catch (error) {
        console.error("Error cargando datos:", error)
        setError("Error al cargar datos: " + error.message)
      }
    }
    
    cargarDatos()
  }, [])

  // Filtrar pacientes por búsqueda
  const pacientesFiltrados = pacientes.filter(
    (p) =>
      `${p.nombres} ${p.apellidos}`.toLowerCase().includes(busquedaPaciente.toLowerCase()) ||
      p.telefono?.includes(busquedaPaciente)
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Combinar fecha y hora
      const fechaHora = `${formData.fecha}T${formData.hora}:00`
      
      const citaData = {
        fecha_hora: fechaHora,
        paciente_id: formData.paciente_id || null,
        medico_id: formData.medico_id,
        motivo: formData.motivo,
        estado: formData.estado,
        paciente_nombre: formData.paciente_nombre
      }

      console.log("=== ENVIANDO CITA ===", citaData)

      const response = await fetch('http://localhost:3001/api/citas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(citaData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Cita creada exitosamente:', result)

      // Redirigir a la lista de citas
      router.push('/citas')

    } catch (error) {
      console.error("Error al crear cita:", error)
      setError("Error al crear cita: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CitaFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const usarPacienteNoRegistrado = () => {
    if (formData.paciente_nombre.trim()) {
      setFormData(prev => ({
        ...prev,
        paciente_id: "",
        paciente_nombre: prev.paciente_nombre
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link href="/citas">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">SCAN</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nueva Cita Médica</h1>
              <p className="text-gray-600 text-sm">Agendar nueva cita en el sistema</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Información de la Cita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Fecha y Hora */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fecha">Fecha *</Label>
                  <div className="relative">
                    <Input
                      id="fecha"
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => handleInputChange('fecha', e.target.value)}
                      required
                      className="pr-10"
                    />
                    <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="hora">Hora *</Label>
                  <Select
                    value={formData.hora}
                    onValueChange={(value) => handleInputChange('hora', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar hora" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="08:00">08:00 AM</SelectItem>
                      <SelectItem value="08:30">08:30 AM</SelectItem>
                      <SelectItem value="09:00">09:00 AM</SelectItem>
                      <SelectItem value="09:30">09:30 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="10:30">10:30 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="11:30">11:30 AM</SelectItem>
                      <SelectItem value="12:00">12:00 PM</SelectItem>
                      <SelectItem value="12:30">12:30 PM</SelectItem>
                      <SelectItem value="13:00">01:00 PM</SelectItem>
                      <SelectItem value="13:30">01:30 PM</SelectItem>
                      <SelectItem value="14:00">02:00 PM</SelectItem>
                      <SelectItem value="14:30">02:30 PM</SelectItem>
                      <SelectItem value="15:00">03:00 PM</SelectItem>
                      <SelectItem value="15:30">03:30 PM</SelectItem>
                      <SelectItem value="16:00">04:00 PM</SelectItem>
                      <SelectItem value="16:30">04:30 PM</SelectItem>
                      <SelectItem value="17:00">05:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Paciente */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="busqueda-paciente">Paciente</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="busqueda-paciente"
                      placeholder="Buscar paciente existente por nombre o teléfono..."
                      value={busquedaPaciente}
                      onChange={(e) => setBusquedaPaciente(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Pacientes disponibles: {pacientes.length}
                  </p>
                </div>

                {pacientesFiltrados.length > 0 && (
                  <div className="space-y-2">
                    <Label>Seleccionar Paciente Registrado</Label>
                    <Select
                      value={formData.paciente_id}
                      onValueChange={(value) => {
                        handleInputChange('paciente_id', value)
                        setFormData(prev => ({ ...prev, paciente_nombre: "" }))
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        {pacientesFiltrados.map((paciente) => (
                          <SelectItem key={paciente.id_paciente} value={paciente.id_paciente}>
                            {paciente.nombres} {paciente.apellidos}
                            {paciente.telefono && ` - ${paciente.telefono}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>O ingresa el nombre de un paciente no registrado</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nombre completo del paciente"
                      value={formData.paciente_nombre}
                      onChange={(e) => {
                        handleInputChange('paciente_nombre', e.target.value)
                        setFormData(prev => ({ ...prev, paciente_id: "" }))
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={usarPacienteNoRegistrado}
                      disabled={!formData.paciente_nombre.trim()}
                    >
                      Usar
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Para pacientes que solo vienen a citas médicas y no siguen tratamiento
                  </p>
                </div>
              </div>

              {/* Médico */}
              <div>
                <Label htmlFor="medico">Médico a Cargo *</Label>
                <Select
                  value={formData.medico_id}
                  onValueChange={(value) => handleInputChange('medico_id', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar médico" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicos.map((medico) => (
                      <SelectItem key={medico.id_usuario} value={medico.id_usuario}>
                        {medico.nombres} {medico.apellidos}
                        {medico.especialidad && ` - ${medico.especialidad}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Médicos disponibles: {medicos.length}
                </p>
              </div>

              {/* Motivo */}
              <div>
                <Label htmlFor="motivo">Motivo de la Cita *</Label>
                <Select
                  value={formData.motivo}
                  onValueChange={(value) => handleInputChange('motivo', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consulta inicial">Consulta inicial</SelectItem>
                    <SelectItem value="Seguimiento">Seguimiento</SelectItem>
                    <SelectItem value="Revisión">Revisión</SelectItem>
                    <SelectItem value="Control">Control</SelectItem>
                    <SelectItem value="Emergencia">Emergencia</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Estado */}
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value: any) => handleInputChange('estado', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="programada">Programada</SelectItem>
                    <SelectItem value="confirmada">Confirmada</SelectItem>
                    <SelectItem value="en_curso">En Curso</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                    <SelectItem value="no_asistio">No Asistió</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mensaje de Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Agendando..." : "Agendar Cita"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/citas">Cancelar</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
