"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, User, Phone, FileText, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { LoadingAscanButton } from "@/components/ui/loading-ascan"

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

// Tipos de consulta como en el Excel
const TIPOS_CONSULTA = [
  "CONSULTA NUEVA",
  "R// DE PATOLOGIA", 
  "CONTROL",
  "SEGUIMIENTO",
  "URGENCIA",
  "REVISION",
  "CONSULTA DE SEGUIMIENTO",
  "CONTROL DE EMBARAZO",
  "PAPANICOLAOU",
  "ECOGRAFIA",
  "OTROS"
]

// Horarios predefinidos como en el Excel
const HORARIOS_DISPONIBLES = [
  "08:40", "09:00", "09:20", "09:40", 
  "10:00", "10:20", "10:40", "11:00", 
  "11:20", "11:40", "12:00", "12:20",
  "14:00", "14:20", "14:40", "15:00",
  "15:20", "15:40", "16:00", "16:20"
]

interface CitaFormData {
  fecha: string
  hora: string
  paciente_id: string
  medico_id: string
  motivo: string
  estado: "programada" | "confirmada" | "en_curso" | "completada" | "cancelada" | "no_asistio"
  paciente_nombre: string
  numero_clinica: string
  telefono: string
}

export default function FormularioMejorado() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [busquedaPaciente, setBusquedaPaciente] = useState("")
  const [mostrarResultados, setMostrarResultados] = useState(false)
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null)
  const [nuevoPaciente, setNuevoPaciente] = useState(false)
  const [buscandoPacientes, setBuscandoPacientes] = useState(false)
  const [pacientesBuscados, setPacientesBuscados] = useState<Paciente[]>([])

  const [formData, setFormData] = useState<CitaFormData>({
    fecha: searchParams.get('fecha') || "",
    hora: searchParams.get('hora') || "",
    paciente_id: searchParams.get('paciente_id') || "",
    medico_id: searchParams.get('medico') || "",
    motivo: "",
    estado: "programada" as const,
    paciente_nombre: "",
    numero_clinica: "1",
    telefono: ""
  })

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true)
        
        const [pacientesResult, medicosResult] = await Promise.all([
          apiClient.getPacientes(),
          apiClient.getMedicos()
        ])
        
        if (pacientesResult.data) {
          setPacientes(Array.isArray(pacientesResult.data) ? pacientesResult.data : [])
        }
        
        if (medicosResult.data) {
          setMedicos(Array.isArray(medicosResult.data) ? medicosResult.data : [])
        }
        
      } catch (error: any) {
        console.error("Error cargando datos:", error)
        setError("Error al cargar datos: " + (error.message || String(error)))
      } finally {
        setLoading(false)
      }
    }
    
    cargarDatos()
  }, [])

  // Cargar información del paciente si se proporciona paciente_id
  useEffect(() => {
    const cargarPacienteEspecifico = async () => {
      if (!formData.paciente_id) return

      try {
        const pacienteResult = await apiClient.getPaciente(formData.paciente_id)
        if (pacienteResult.data && (pacienteResult.data as any).paciente) {
          const paciente = (pacienteResult.data as any).paciente
          setPacienteSeleccionado(paciente)
          setFormData(prev => ({
            ...prev,
            paciente_nombre: `${paciente.nombres} ${paciente.apellidos}`,
            telefono: paciente.telefono || ""
          }))
        }
      } catch (error) {
        console.error("Error cargando paciente específico:", error)
      }
    }

    cargarPacienteEspecifico()
  }, [formData.paciente_id])

  // Búsqueda de pacientes con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (busquedaPaciente && busquedaPaciente.length >= 2) {
        buscarPacientes(busquedaPaciente)
      } else {
        setPacientesBuscados([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [busquedaPaciente])

  // Buscar pacientes dinámicamente
  const buscarPacientes = async (termino: string) => {
    if (termino.length < 2) {
      setPacientesBuscados([])
      return
    }

    try {
      setBuscandoPacientes(true)
      console.log("Buscando pacientes con término:", termino)
      
      const response = await fetch(`/api/pacientes?search=${encodeURIComponent(termino)}`)
      const data = await response.json()
      
      console.log("Respuesta de búsqueda de pacientes:", data)
      
      if (data.pacientes) {
        setPacientesBuscados(Array.isArray(data.pacientes) ? data.pacientes : [])
      } else {
        setPacientesBuscados([])
      }
    } catch (error) {
      console.error("Error buscando pacientes:", error)
      setPacientesBuscados([])
    } finally {
      setBuscandoPacientes(false)
    }
  }

  const handleInputChange = (field: keyof CitaFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const seleccionarPaciente = (paciente: Paciente) => {
    setPacienteSeleccionado(paciente)
    setFormData(prev => ({
      ...prev,
      paciente_id: paciente.id_paciente,
      paciente_nombre: `${paciente.nombres} ${paciente.apellidos}`,
      telefono: paciente.telefono || ""
    }))
    setBusquedaPaciente(`${paciente.nombres} ${paciente.apellidos}`)
    setMostrarResultados(false)
    setNuevoPaciente(false)
    setPacientesBuscados([])
  }

  const crearNuevoPaciente = () => {
    setPacienteSeleccionado(null)
    setFormData(prev => ({
      ...prev,
      paciente_id: "",
      paciente_nombre: "",
      telefono: ""
    }))
    setNuevoPaciente(true)
    setMostrarResultados(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.fecha || !formData.hora || !formData.medico_id || !formData.motivo) {
      setError("Por favor completa todos los campos obligatorios")
      return
    }

    if (!formData.paciente_id && !formData.paciente_nombre) {
      setError("Por favor selecciona un paciente o ingresa el nombre")
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Crear fecha y hora en zona horaria local
      const fechaHora = new Date(`${formData.fecha}T${formData.hora}:00`)
      console.log("=== CREANDO CITA ===")
      console.log("Fecha seleccionada:", formData.fecha)
      console.log("Hora seleccionada:", formData.hora)
      console.log("Fecha completa:", fechaHora)
      console.log("Fecha ISO:", fechaHora.toISOString())
      
      const citaData = {
        fecha_hora: fechaHora.toISOString(),
        paciente_id: formData.paciente_id || null,
        medico_id: formData.medico_id,
        motivo: formData.motivo,
        estado: formData.estado,
        paciente_nombre: formData.paciente_nombre,
        numero_clinica: formData.numero_clinica,
        telefono: formData.telefono
      }

      const result = await apiClient.createCita(citaData)
      
      if (result.error) {
        setError(result.error)
        return
      }

      setSuccess("Cita agendada exitosamente")
      
      // Limpiar formulario
      setFormData({
        fecha: "",
        hora: "",
        paciente_id: "",
        medico_id: "",
        motivo: "",
        estado: "programada" as const,
        paciente_nombre: "",
        numero_clinica: "1",
        telefono: ""
      })
      setPacienteSeleccionado(null)
      setNuevoPaciente(false)
      setBusquedaPaciente("")

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push("/citas")
      }, 2000)

    } catch (error: any) {
      console.error("Error creando cita:", error)
      setError("Error al crear la cita: " + (error.message || String(error)))
    } finally {
      setLoading(false)
    }
  }

  const medicoSeleccionado = medicos.find(m => m.id_usuario === formData.medico_id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/citas">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a Citas
                </Link>
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Agendar Nueva Cita</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Información de la Cita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información del Médico y Clínica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="medico">Médico *</Label>
                  <Select value={formData.medico_id} onValueChange={(value) => handleInputChange('medico_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar médico" />
                    </SelectTrigger>
                    <SelectContent>
                      {medicos.map(medico => (
                        <SelectItem key={medico.id_usuario} value={medico.id_usuario}>
                          {medico.nombres} {medico.apellidos}
                          {medico.especialidad && ` - ${medico.especialidad}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="clinica">Clínica *</Label>
                  <Select value={formData.numero_clinica} onValueChange={(value) => handleInputChange('numero_clinica', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar clínica" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Clínica 1</SelectItem>
                      <SelectItem value="2">Clínica 2</SelectItem>
                      <SelectItem value="3">Clínica 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Fecha y Hora */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fecha">Fecha *</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => handleInputChange('fecha', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="hora">Hora *</Label>
                  <Select value={formData.hora} onValueChange={(value) => handleInputChange('hora', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {HORARIOS_DISPONIBLES.map(horario => (
                        <SelectItem key={horario} value={horario}>
                          {horario}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Información del Paciente */}
              <div className="space-y-4">
                <div>
                  <Label>Paciente *</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Buscar paciente por nombre o teléfono..."
                        value={busquedaPaciente}
                        onChange={(e) => {
                          setBusquedaPaciente(e.target.value)
                          setMostrarResultados(e.target.value.length >= 2)
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={crearNuevoPaciente}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Nuevo
                      </Button>
                    </div>

                    {/* Resultados de búsqueda */}
                    {mostrarResultados && busquedaPaciente && (
                      <div className="border border-gray-300 rounded-md max-h-48 overflow-y-auto">
                        {buscandoPacientes ? (
                          <div className="p-3 text-gray-500 text-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            Buscando pacientes...
                          </div>
                        ) : pacientesBuscados.length > 0 ? (
                          pacientesBuscados.map(paciente => (
                            <div
                              key={paciente.id_paciente}
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onClick={() => seleccionarPaciente(paciente)}
                            >
                              <div className="font-medium">{paciente.nombres} {paciente.apellidos}</div>
                              {paciente.telefono && (
                                <div className="text-sm text-gray-600">{paciente.telefono}</div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-gray-500 text-center">
                            No se encontraron pacientes
                          </div>
                        )}
                      </div>
                    )}

                    {/* Paciente seleccionado */}
                    {pacienteSeleccionado && (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-800">
                            {pacienteSeleccionado.nombres} {pacienteSeleccionado.apellidos}
                          </span>
                        </div>
                        {pacienteSeleccionado.telefono && (
                          <div className="text-sm text-green-600 mt-1">
                            {pacienteSeleccionado.telefono}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Formulario para nuevo paciente */}
                    {nuevoPaciente && (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-800">Nuevo Paciente</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input
                            placeholder="Nombre completo"
                            value={formData.paciente_nombre}
                            onChange={(e) => handleInputChange('paciente_nombre', e.target.value)}
                          />
                          <Input
                            placeholder="Teléfono"
                            value={formData.telefono}
                            onChange={(e) => handleInputChange('telefono', e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Motivo de la consulta */}
              <div>
                <Label htmlFor="motivo">Motivo de la consulta *</Label>
                <Select value={formData.motivo} onValueChange={(value) => handleInputChange('motivo', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo de consulta" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_CONSULTA.map(tipo => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mensajes de error y éxito */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="text-red-800">{error}</div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="text-green-800">{success}</div>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <LoadingAscanButton size="sm" />
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Agendar Cita
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/citas")}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
