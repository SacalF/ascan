"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, ArrowLeft, Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AscanLogo from "@/components/ascan-logo"
import { apiClient } from "@/lib/api-client"

interface Paciente {
  id_paciente: string
  nombres: string
  apellidos: string
  telefono: string | null
  dpi?: string
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
  const router = useRouter()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busquedaPaciente, setBusquedaPaciente] = useState("")
  const [mostrarResultados, setMostrarResultados] = useState(false)

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
        console.log('=== INICIANDO CARGA DE DATOS ===')
        
        // Cargar pacientes usando apiClient
        console.log('Cargando pacientes...')
        const resultPacientes = await apiClient.getPacientes()
        
        if (resultPacientes.data) {
          console.log('Pacientes cargados:', resultPacientes.data.length || 0)
          setPacientes(Array.isArray(resultPacientes.data) ? resultPacientes.data : [])
        } else {
          throw new Error(resultPacientes.error || 'Error al cargar pacientes')
        }
  
        // Cargar médicos usando apiClient
        console.log('Cargando médicos...')
        const resultMedicos = await apiClient.getMedicos()
        
        if (resultMedicos.data) {
          console.log('Médicos cargados:', resultMedicos.data.length || 0)
          setMedicos(Array.isArray(resultMedicos.data) ? resultMedicos.data : [])
        } else {
          throw new Error(resultMedicos.error || 'Error al cargar médicos')
        }
        
      } catch (error: any) {
        console.error("Error cargando datos:", error)
        setError("Error al cargar datos: " + (error.message || String(error)))
      }
    }
    
    cargarDatos()
  }, [])

  // Filtrar pacientes por búsqueda
  const pacientesFiltrados = pacientes.filter(
    (p) =>
      `${p.nombres} ${p.apellidos}`.toLowerCase().includes(busquedaPaciente.toLowerCase()) ||
      p.telefono?.includes(busquedaPaciente) ||
      p.dpi?.includes(busquedaPaciente)
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
  
      const result = await apiClient.createCita(citaData)
  
      if (result.data) {
        console.log('Cita creada exitosamente:', result.data)
        router.push('/citas')
      } else {
        throw new Error(result.error || 'Error al crear la cita')
      }
  
    } catch (error) {
      console.error("Error al crear cita:", error)
      setError("Error al crear cita: " + (error.message || String(error)))
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

  const seleccionarPaciente = (paciente: Paciente) => {
    setFormData(prev => ({
      ...prev,
      paciente_id: paciente.id_paciente,
      paciente_nombre: ""
    }))
    setBusquedaPaciente(`${paciente.nombres} ${paciente.apellidos}`)
    setMostrarResultados(false)
  }

  const usarPacienteNoRegistrado = () => {
    if (formData.paciente_nombre.trim()) {
      setFormData(prev => ({
        ...prev,
        paciente_id: "",
        paciente_nombre: prev.paciente_nombre
      }))
      setBusquedaPaciente("")
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
              <AscanLogo size={40} />
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
                  <Label htmlFor="busqueda-paciente">Paciente *</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="busqueda-paciente"
                      placeholder="Buscar paciente existente por nombre o teléfono..."
                      value={busquedaPaciente}
                      onChange={(e) => {
                        setBusquedaPaciente(e.target.value)
                        setMostrarResultados(e.target.value.length > 0)
                        if (e.target.value.length === 0) {
                          setFormData(prev => ({ ...prev, paciente_id: "" }))
                        }
                      }}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Pacientes disponibles: {pacientes.length}
                  </p>
                </div>

                {/* Paciente seleccionado */}
                {formData.paciente_id && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-green-800">
                          Paciente seleccionado: {pacientes.find(p => p.id_paciente === formData.paciente_id)?.nombres} {pacientes.find(p => p.id_paciente === formData.paciente_id)?.apellidos}
                        </div>
                        <div className="text-sm text-green-600">
                          {pacientes.find(p => p.id_paciente === formData.paciente_id)?.dpi || pacientes.find(p => p.id_paciente === formData.paciente_id)?.telefono}
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, paciente_id: "" }))
                          setBusquedaPaciente("")
                          setMostrarResultados(false)
                        }}
                        className="text-green-700 border-green-300 hover:bg-green-100"
                      >
                        Cambiar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Resultados de búsqueda */}
                {mostrarResultados && pacientesFiltrados.length > 0 && (
                  <div className="border rounded-lg bg-white shadow-sm max-h-48 overflow-y-auto">
                    {pacientesFiltrados.map((paciente) => (
                      <div
                        key={paciente.id_paciente}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => seleccionarPaciente(paciente)}
                      >
                        <div className="font-medium text-gray-900">
                          {paciente.nombres} {paciente.apellidos}
                        </div>
                        {paciente.dpi && (
                          <div className="text-sm text-gray-500">ID: {paciente.dpi}</div>
                        )}
                      </div>
                    ))}
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
                        setBusquedaPaciente("")
                        setMostrarResultados(false)
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
