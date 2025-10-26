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
import { Calendar, ArrowLeft, Search } from "lucide-react"
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
  fecha_hora: string
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
  const [busquedaMedico, setBusquedaMedico] = useState("")

  const [formData, setFormData] = useState<CitaFormData>({
    fecha_hora: "",
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
        // Cargar pacientes usando fetch
        console.log('=== CARGANDO PACIENTES ===')
        const responsePacientes = await fetch('http://localhost:3001/api/pacientes', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        })
        
        console.log('Respuesta pacientes:', responsePacientes.status, responsePacientes.statusText)
        
        if (!responsePacientes.ok) {
          throw new Error(`Error ${responsePacientes.status}: ${responsePacientes.statusText}`)
        }
        
        const dataPacientes = await responsePacientes.json()
        console.log('Datos pacientes:', dataPacientes)
        setPacientes(dataPacientes)
        console.log('Pacientes cargados exitosamente:', dataPacientes.length, 'pacientes')

        // Cargar médicos usando fetch
        console.log('=== CARGANDO MÉDICOS ===')
        const responseMedicos = await fetch('http://localhost:3001/api/medicos', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        })
        
        console.log('Respuesta médicos:', responseMedicos.status, responseMedicos.statusText)
        
        if (!responseMedicos.ok) {
          throw new Error(`Error ${responseMedicos.status}: ${responseMedicos.statusText}`)
        }
        
        const dataMedicos = await responseMedicos.json()
        console.log('Datos médicos:', dataMedicos)
        setMedicos(dataMedicos)
        console.log('Médicos cargados exitosamente:', dataMedicos.length, 'médicos')
        
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

  // Filtrar médicos por búsqueda
  const medicosFiltrados = medicos.filter(
    (m) =>
      `${m.nombres} ${m.apellidos}`.toLowerCase().includes(busquedaMedico.toLowerCase()) ||
      m.especialidad?.toLowerCase().includes(busquedaMedico.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log("=== ENVIANDO CITA ===", formData)

      const response = await fetch('http://localhost:3001/api/citas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      console.log('Respuesta crear cita:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Cita creada exitosamente:', result)

      // Limpiar formulario
      setFormData({
        fecha_hora: "",
        paciente_id: "",
        medico_id: "",
        motivo: "",
        estado: "programada",
        paciente_nombre: "",
      })

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/citas">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Citas
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agendar Nueva Cita</h1>
            <p className="text-gray-600 mt-1">
              Usuario: {user?.nombres} {user?.apellidos} ({user?.rol})
            </p>
          </div>
        </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Selección de Paciente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Seleccionar Paciente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="busqueda-paciente">Buscar Paciente</Label>
                <Input
                  id="busqueda-paciente"
                  placeholder="Buscar por nombre o teléfono..."
                  value={busquedaPaciente}
                  onChange={(e) => setBusquedaPaciente(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="paciente">Paciente *</Label>
                <Select
                  value={formData.paciente_id}
                  onValueChange={(value) => handleInputChange('paciente_id', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {pacientesFiltrados.length > 0 ? (
                      pacientesFiltrados.map((paciente) => (
                        <SelectItem key={paciente.id_paciente} value={paciente.id_paciente}>
                          {paciente.nombres} {paciente.apellidos}
                          {paciente.telefono && ` - ${paciente.telefono}`}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-pacientes" disabled>
                        {pacientes.length === 0 ? "Cargando pacientes..." : "No se encontraron pacientes"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Pacientes disponibles: {pacientes.length}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Selección de Médico */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Seleccionar Médico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="busqueda-medico">Buscar Médico</Label>
                <Input
                  id="busqueda-medico"
                  placeholder="Buscar por nombre o especialidad..."
                  value={busquedaMedico}
                  onChange={(e) => setBusquedaMedico(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="medico">Médico *</Label>
                <Select
                  value={formData.medico_id}
                  onValueChange={(value) => handleInputChange('medico_id', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un médico" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicosFiltrados.length > 0 ? (
                      medicosFiltrados.map((medico) => (
                        <SelectItem key={medico.id_usuario} value={medico.id_usuario}>
                          {medico.nombres} {medico.apellidos}
                          {medico.especialidad && ` - ${medico.especialidad}`}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-medicos" disabled>
                        {medicos.length === 0 ? "Cargando médicos..." : "No se encontraron médicos"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Médicos disponibles: {medicos.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detalles de la Cita */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Detalles de la Cita
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fecha_hora">Fecha y Hora *</Label>
                <Input
                  id="fecha_hora"
                  type="datetime-local"
                  value={formData.fecha_hora}
                  onChange={(e) => handleInputChange('fecha_hora', e.target.value)}
                  required
                />
              </div>

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
            </div>

            <div>
              <Label htmlFor="motivo">Motivo de la Consulta *</Label>
              <Textarea
                id="motivo"
                placeholder="Describe el motivo de la consulta..."
                value={formData.motivo}
                onChange={(e) => handleInputChange('motivo', e.target.value)}
                required
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Mensaje de Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/citas">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Agendando..." : "Agendar Cita"}
          </Button>
        </div>
      </form>
      </div>
    </div>
  )
}
