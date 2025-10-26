"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Phone, FileText, CheckCircle, XCircle, ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { LoadingAscanFullScreen } from "@/components/ui/loading-ascan"
// Removed date-fns imports - using native JavaScript instead

interface Cita {
  id_cita: string
  fecha_hora: string
  paciente_nombre: string
  paciente_id: string | null
  motivo: string
  estado: "programada" | "confirmada" | "completada" | "cancelada" | "no_asistio"
  telefono?: string
  email?: string
  medico_id: string
  numero_clinica?: string
}

interface Medico {
  id_usuario: string
  nombres: string
  apellidos: string
  cedula_profesional?: string
  especialidad?: string
}

// Horarios predefinidos como en el Excel
const HORARIOS_DISPONIBLES = [
  "08:40", "09:00", "09:20", "09:40", 
  "10:00", "10:20", "10:40", "11:00", 
  "11:20", "11:40", "12:00", "12:20",
  "14:00", "14:20", "14:40", "15:00",
  "15:20", "15:40", "16:00", "16:20"
]

const estadoColors = {
  programada: "bg-blue-100 text-blue-800",
  confirmada: "bg-green-100 text-green-800",
  completada: "bg-gray-100 text-gray-800",
  cancelada: "bg-red-100 text-red-800",
  no_asistio: "bg-orange-100 text-orange-800",
}

const estadoLabels = {
  programada: "Programada",
  confirmada: "Confirmada", 
  completada: "Completada",
  cancelada: "Cancelada",
  no_asistio: "No Asistió",
}

export default function HorarioDiarioPage() {
  const [citas, setCitas] = useState<Cita[]>([])
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [loading, setLoading] = useState(true)
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0])
  const [medicoSeleccionado, setMedicoSeleccionado] = useState<string>("")
  const [clinicaSeleccionada, setClinicaSeleccionada] = useState<string>("")

  useEffect(() => {
    cargarDatos()
  }, [fechaSeleccionada, medicoSeleccionado])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      console.log("=== CARGANDO HORARIO DIARIO ===")
      console.log("Fecha seleccionada:", fechaSeleccionada)
      
      // Cargar médicos
      const medicosResult = await apiClient.getMedicos()
      console.log("=== RESULTADO DE MÉDICOS ===")
      console.log("Resultado completo:", medicosResult)
      console.log("Datos de médicos:", medicosResult.data)
      
      if (medicosResult.data) {
        const medicosData = medicosResult.data as Medico[]
        console.log("Médicos encontrados:", medicosData.length)
        console.log("Lista de médicos:", medicosData)
        
        // Filtrar médicos únicos por ID para evitar duplicados
        const medicosUnicos = medicosData.filter((medico, index, self) => 
          index === self.findIndex(m => m.id_usuario === medico.id_usuario)
        )
        
        console.log("Médicos únicos después del filtro:", medicosUnicos.length)
        console.log("Lista de médicos únicos:", medicosUnicos)
        
        setMedicos(medicosUnicos)
        if (medicosUnicos.length > 0 && !medicoSeleccionado) {
          setMedicoSeleccionado(medicosUnicos[0].id_usuario)
        }
      }

      // Cargar citas del día específico
      const citasResult = await apiClient.getCitas(fechaSeleccionada)
      console.log("Resultado de citas:", citasResult)
      if (citasResult.data) {
        const citasData = citasResult.data as Cita[]
        console.log("Citas cargadas:", citasData)
        setCitas(citasData)
      }
    } catch (error) {
      console.error("Error cargando datos:", error)
    } finally {
      setLoading(false)
    }
  }

  const getCitaPorHorario = (horario: string) => {
    console.log("=== BUSCANDO CITA PARA HORARIO ===")
    console.log("Horario buscado:", horario)
    console.log("Citas disponibles:", citas)
    console.log("Médico seleccionado:", medicoSeleccionado)
    console.log("Clínica seleccionada:", clinicaSeleccionada)
    
    const citaEncontrada = citas.find(cita => {
      const horaCita = new Date(cita.fecha_hora).toTimeString().slice(0, 5)
      console.log(`Cita: ${cita.paciente_nombre}, Hora: ${horaCita}, Médico: ${cita.medico_id}`)
      
      const coincideHora = horaCita === horario
      const coincideMedico = !medicoSeleccionado || cita.medico_id === medicoSeleccionado
      const coincideClinica = clinicaSeleccionada === "" || cita.numero_clinica === clinicaSeleccionada
      
      console.log(`Coincide hora: ${coincideHora}, médico: ${coincideMedico}, clínica: ${coincideClinica}`)
      
      return coincideHora && coincideMedico && coincideClinica
    })
    
    console.log("Cita encontrada:", citaEncontrada)
    return citaEncontrada
  }

  const formatearFecha = (fecha: string) => {
    console.log("=== FORMATEANDO FECHA EN HORARIO DIARIO ===")
    console.log("Fecha original:", fecha)
    console.log("Tipo de fecha:", typeof fecha)
    
    const date = new Date(fecha + 'T00:00:00') // Agregar hora para evitar problemas de zona horaria
    console.log("Fecha parseada:", date)
    console.log("Fecha ISO:", date.toISOString())
    console.log("Fecha local:", date.toString())
    console.log("Zona horaria:", Intl.DateTimeFormat().resolvedOptions().timeZone)
    
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
    
    const diaSemana = diasSemana[date.getDay()]
    const dia = date.getDate()
    const mes = meses[date.getMonth()]
    
    const resultado = `${diaSemana}, ${dia} de ${mes}`
    console.log("Fecha formateada:", resultado)
    console.log("=== FIN FORMATEO FECHA HORARIO ===")
    return resultado
  }

  const medicoActual = medicos.find(m => m.id_usuario === medicoSeleccionado)

  if (loading) {
    return (
      <LoadingAscanFullScreen text="Cargando horario diario..." />
    )
  }

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
              <h1 className="text-xl font-semibold text-gray-900">Horario Diario</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Filtros del Horario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={fechaSeleccionada}
                  onChange={(e) => setFechaSeleccionada(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Médico
                </label>
                <select
                  value={medicoSeleccionado}
                  onChange={(e) => setMedicoSeleccionado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {medicos.map(medico => (
                    <option key={medico.id_usuario} value={medico.id_usuario}>
                      {medico.nombres} {medico.apellidos}
                      {medico.especialidad && ` - ${medico.especialidad}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clínica
                </label>
                <select
                  value={clinicaSeleccionada}
                  onChange={(e) => setClinicaSeleccionada(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas las clínicas</option>
                  <option value="1">Clínica 1</option>
                  <option value="2">Clínica 2</option>
                  <option value="3">Clínica 3</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button onClick={cargarDatos} className="w-full">
                  Actualizar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información del Horario */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horario - {formatearFecha(fechaSeleccionada)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Fecha</div>
                <div className="text-lg font-semibold text-green-800">
                  {formatearFecha(fechaSeleccionada)}
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Médico</div>
                <div className="text-lg font-semibold text-blue-800">
                  {medicoActual ? `${medicoActual.nombres} ${medicoActual.apellidos}` : "Seleccionar médico"}
                </div>
              </div>
              
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Hora</div>
                <div className="text-lg font-semibold text-purple-800">
                  9:00-12:00
                </div>
              </div>
              
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Clínica</div>
                <div className="text-lg font-semibold text-orange-800">
                  {clinicaSeleccionada || "Todas"}
                </div>
              </div>
            </div>

            {/* Estadísticas del día */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-800">{citas.length}</div>
                <div className="text-sm text-gray-600">Total Citas</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {citas.filter(c => c.estado === 'completada').length}
                </div>
                <div className="text-sm text-green-600">Completadas</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {citas.filter(c => c.estado === 'confirmada').length}
                </div>
                <div className="text-sm text-blue-600">Confirmadas</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {citas.filter(c => c.estado === 'programada').length}
                </div>
                <div className="text-sm text-yellow-600">Programadas</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {HORARIOS_DISPONIBLES.length - citas.length}
                </div>
                <div className="text-sm text-gray-600">Disponibles</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vista de Horarios Moderna */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Programación de Citas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {HORARIOS_DISPONIBLES.map((horario, index) => {
                const cita = getCitaPorHorario(horario)
                const esDisponible = !cita
                
                return (
                  <div
                    key={horario}
                    className={`relative rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-md ${
                      esDisponible
                        ? 'border-dashed border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                        : 'border-solid border-gray-200 bg-white shadow-sm'
                    }`}
                  >
                    {/* Header del horario */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          esDisponible ? 'bg-gray-300' : 
                          cita?.estado === 'completada' ? 'bg-green-500' :
                          cita?.estado === 'cancelada' ? 'bg-red-500' :
                          cita?.estado === 'no_asistio' ? 'bg-orange-500' :
                          cita?.estado === 'confirmada' ? 'bg-blue-500' :
                          'bg-yellow-500'
                        }`}></div>
                        <span className="font-semibold text-lg text-gray-800">{horario}</span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        #{index + 1}
                      </span>
                    </div>

                    {/* Contenido de la cita */}
                    {esDisponible ? (
                      <div className="text-center py-4">
                        <div className="text-gray-400 mb-3">
                          <Calendar className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm font-medium">Horario Disponible</p>
                        </div>
                        <Button size="sm" asChild className="w-full">
                          <Link href={`/agendar-cita?fecha=${fechaSeleccionada}&hora=${horario}&medico=${medicoSeleccionado}`}>
                            <Plus className="h-4 w-4 mr-2" />
                            Agendar Cita
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Información del paciente */}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {cita.paciente_nombre}
                            </p>
                            {cita.telefono && (
                              <div className="flex items-center gap-1 mt-1">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <span className="text-sm text-gray-600">{cita.telefono}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Motivo de consulta */}
                        <div className="bg-gray-50 rounded-md p-2">
                          <p className="text-xs text-gray-500 mb-1">Motivo:</p>
                          <p className="text-sm font-medium text-gray-800">{cita.motivo}</p>
                        </div>

                        {/* Estado */}
                        <div className="flex items-center justify-between">
                          <Badge className={`${estadoColors[cita.estado]} text-xs`}>
                            {estadoLabels[cita.estado]}
                          </Badge>
                          
                          {/* Indicador de asistencia */}
                          {cita.estado === "completada" && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                          {cita.estado === "no_asistio" && (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>

                        {/* Botón de acción */}
                        <Button size="sm" variant="outline" asChild className="w-full">
                          <Link href={`/citas/${cita.id_cita}`}>
                            Ver Detalles
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
