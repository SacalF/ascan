"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, User, ArrowLeft, Microscope, Activity, Plus, Clipboard, Phone, Mail, Heart, Stethoscope, Eye, Pill, FileImage, Clock } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { notFound } from "next/navigation"
import { formatDateTimeForCard, formatDateLong } from "@/lib/date-utils-simple"
import { ConsultaInicialModal } from "@/components/modals/consulta-inicial-modal"
import { ValoracionModal } from "@/components/modals/valoracion-modal"
import { SeguimientoModal } from "@/components/modals/seguimiento-modal"
import { LaboratorioModal } from "@/components/modals/laboratorio-modal"
import { CitaModal } from "@/components/modals/cita-modal"

interface Paciente {
  id_paciente: string
  nombres: string
  apellidos: string
  telefono?: string
  correo_electronico?: string
  fecha_nacimiento?: string
  sexo?: string
  dpi?: string
}

interface ConsultaInicial {
  id: string
  paciente_id: string
  medico_id: string
  motivo_consulta: string
  diagnostico?: string
  plan_tratamiento?: string
  fecha_consulta: string
  medico_nombre: string
  medico_apellidos: string
  created_at: string
  antecedentes?: string
  sintomas?: string
  examen_fisico?: string
}

interface ConsultaSeguimiento {
  id: string
  paciente_id: string
  medico_id: string
  motivo_consulta?: string
  diagnostico?: string
  plan_tratamiento?: string
  fecha: string
  medico: string
  medico_nombre?: string
  medico_apellidos?: string
  created_at: string
  evolucion?: string
  notas?: string
  notas_medicas?: string
  medicamentos_recetados?: string
  tratamiento_actual?: string
  fecha_proxima_cita?: string
}

interface Cita {
  id_cita: string
  paciente_id: string
  medico_id: string
  fecha_hora: string
  motivo: string
  estado: string
  medico_nombre: string
  medico_apellidos: string
  created_at: string
}

interface ResultadoLab {
  id: string
  tipo_examen: string
  fecha_examen: string
  estado: string
  resultados?: string
}

const tipoConsultaColors = {
  inicial: "bg-blue-100 text-blue-800",
  seguimiento: "bg-green-100 text-green-800",
  urgencia: "bg-red-100 text-red-800",
}

export default function ExpedientePacientePage({
  params,
}: {
  params: { pacienteId: string }
}) {
  const { user } = useAuth()
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [citas, setCitas] = useState<Cita[]>([])
  const [consultasIniciales, setConsultasIniciales] = useState<ConsultaInicial[]>([])
  const [consultasSeguimiento, setConsultasSeguimiento] = useState<ConsultaSeguimiento[]>([])
  const [valoraciones, setValoraciones] = useState<any[]>([])
  const [examenesFisicos, setExamenesFisicos] = useState<any[]>([])
  const [resultadosLab, setResultadosLab] = useState<ResultadoLab[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para los modales
  const [modalConsultaInicial, setModalConsultaInicial] = useState(false)
  const [modalValoracion, setModalValoracion] = useState(false)
  const [modalSeguimiento, setModalSeguimiento] = useState(false)
  const [modalLaboratorio, setModalLaboratorio] = useState(false)
  const [modalCita, setModalCita] = useState(false)
  const [consultaInicialSeleccionada, setConsultaInicialSeleccionada] = useState<any>(null)
  const [valoracionSeleccionada, setValoracionSeleccionada] = useState<any>(null)
  const [seguimientoSeleccionado, setSeguimientoSeleccionado] = useState<any>(null)
  const [laboratorioSeleccionado, setLaboratorioSeleccionado] = useState<any>(null)
  const [citaSeleccionada, setCitaSeleccionada] = useState<any>(null)
  const [tabActiva, setTabActiva] = useState("consulta-inicial")

  const { pacienteId } = params

  // Verificar que solo médicos y enfermeras puedan acceder
  const tieneAcceso = user?.rol === 'medico' || user?.rol === 'enfermera' || user?.rol === 'administrador'

  useEffect(() => {
    if (!tieneAcceso) return

    const cargarExpediente = async () => {
      try {
        setLoading(true)
        setError(null)

        // Cargar información completa del paciente
        const pacienteResult = await apiClient.getPaciente(pacienteId)
        if (pacienteResult.error) {
          setError(pacienteResult.error)
          notFound()
          return
        }
        
        const expedienteData: any = pacienteResult.data
        setPaciente(expedienteData.paciente)
        setCitas(expedienteData.citas || [])
        setConsultasIniciales(expedienteData.consultasIniciales || [])
        setConsultasSeguimiento(expedienteData.consultasSeguimiento || [])
        setValoraciones(expedienteData.valoraciones || [])
        setExamenesFisicos(expedienteData.examenesFisicos || [])
        setResultadosLab(expedienteData.laboratorios || [])

        // Debug: Verificar datos cargados
        console.log("Datos cargados del expediente:")
        console.log("Consultas iniciales:", expedienteData.consultasIniciales)
        console.log("Exámenes físicos:", expedienteData.examenesFisicos)

      } catch (error) {
        console.error("Error cargando expediente:", error)
        setError("Error al cargar el expediente")
      } finally {
        setLoading(false)
      }
    }

    cargarExpediente()
  }, [pacienteId, tieneAcceso])

  if (!tieneAcceso) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Acceso Restringido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Solo el personal médico y de enfermería tienen acceso a los expedientes.
            </p>
            <Button asChild>
              <Link href="/dashboard">Volver al Dashboard</Link>
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
          <p className="text-gray-600">Cargando expediente...</p>
        </div>
      </div>
    )
  }

  if (error || !paciente) {
    notFound()
  }

  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }
    return edad
  }

  const formatearFechaSegura = (fecha: string | null | undefined) => {
    if (!fecha) return "Sin fecha"
    try {
      // Si es solo fecha (YYYY-MM-DD), agregar hora local para evitar problemas de UTC
      let fechaParaParsear = fecha
      if (fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Es solo fecha, agregar hora local (12:00 PM) para evitar problemas de UTC
        fechaParaParsear = fecha + 'T12:00:00'
      }
      
      const fechaObj = new Date(fechaParaParsear)
      if (isNaN(fechaObj.getTime())) return "Fecha inválida"
      
      // Usar formateo local para evitar problemas de zona horaria
      return fechaObj.toLocaleDateString('es', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return "Fecha inválida"
    }
  }

  // Funciones para manejar modales
  const abrirModalConsultaInicial = (consulta: any) => {
    // Buscar el examen físico correspondiente a esta consulta
    const examenFisicoCorrespondiente = examenesFisicos.find(
      examen => examen.consulta_id === consulta.id || examen.consulta_id === consulta.id_consulta
    )
    
    // Combinar los datos de consulta con el examen físico
    const consultaCompleta = {
      ...consulta,
      ...examenFisicoCorrespondiente
    }
    
    console.log("Consulta seleccionada:", consulta)
    console.log("Examen físico encontrado:", examenFisicoCorrespondiente)
    console.log("Consulta completa:", consultaCompleta)
    
    setConsultaInicialSeleccionada(consultaCompleta)
    setModalConsultaInicial(true)
  }

  const cerrarModalConsultaInicial = () => {
    setModalConsultaInicial(false)
    setConsultaInicialSeleccionada(null)
  }

  const abrirModalValoracion = (valoracion: any) => {
    setValoracionSeleccionada(valoracion)
    setModalValoracion(true)
  }

  const cerrarModalValoracion = () => {
    setModalValoracion(false)
    setValoracionSeleccionada(null)
  }

  const abrirModalSeguimiento = (seguimiento: any) => {
    setSeguimientoSeleccionado(seguimiento)
    setModalSeguimiento(true)
  }

  const cerrarModalSeguimiento = () => {
    setModalSeguimiento(false)
    setSeguimientoSeleccionado(null)
  }

  const abrirModalLaboratorio = (laboratorio: any) => {
    setLaboratorioSeleccionado(laboratorio)
    setModalLaboratorio(true)
  }

  const cerrarModalLaboratorio = () => {
    setModalLaboratorio(false)
    setLaboratorioSeleccionado(null)
  }

  const abrirModalCita = (cita: any) => {
    setCitaSeleccionada(cita)
    setModalCita(true)
  }

  const cerrarModalCita = () => {
    setModalCita(false)
    setCitaSeleccionada(null)
  }


  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/consultas">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver a Consultas
                  </Link>
                </Button>
                <h1 className="text-xl font-semibold text-gray-900">Expediente del Paciente</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Header con Info del Paciente y Acciones */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Información del Paciente */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {paciente.nombres} {paciente.apellidos}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                {paciente.fecha_nacimiento && (
                      <span>{calcularEdad(paciente.fecha_nacimiento)} años</span>
                )}
                {paciente.sexo && (
                      <span>{paciente.sexo}</span>
                )}
                {paciente.telefono && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{paciente.telefono}</span>
                  </div>
                )}
                {paciente.correo_electronico && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span>{paciente.correo_electronico}</span>
                  </div>
                )}
                {paciente.dpi && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">DPI:</span>
                        <span>{paciente.dpi}</span>
                  </div>
                )}
              </div>
                </div>
              </div>
            </div>

              {/* Acciones Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button asChild className="h-10 bg-purple-600 hover:bg-purple-700">
                  <Link href={`/consultas/nueva-consulta?paciente_id=${pacienteId}`}>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">Consulta Inicial</span>
                    </div>
                  </Link>
                </Button>

              <Button asChild className="h-10 bg-blue-600 hover:bg-blue-700">
                  <Link href={`/consultas/valoracion?paciente_id=${pacienteId}`}>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm">Valoración</span>
                    </div>
                  </Link>
                </Button>

              <Button asChild className="h-10 bg-green-600 hover:bg-green-700">
                  <Link href={`/consultas/seguimiento?paciente_id=${pacienteId}`}>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm">Seguimiento</span>
                    </div>
                  </Link>
                </Button>
                      </div>
                    </div>
              </div>

        {/* Main Content con Pestañas */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Navegación por Pestañas */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="bg-white border-b border-gray-200 rounded-t-lg shadow-sm">
              <div className="flex space-x-1 p-1">
                {[
                  { id: "consulta-inicial", label: "Consulta Inicial", icon: FileText },
                  { id: "valoracion", label: "Valoración", icon: Heart },
                  { id: "seguimiento", label: "Seguimiento", icon: Activity },
                  { id: "laboratorio", label: "Laboratorio", icon: Microscope },
                  { id: "citas", label: "Citas", icon: Clock }
                ].map((tab) => {
                  // Función para obtener las clases de color específicas
                  const getActiveClasses = (tabId: string) => {
                    switch (tabId) {
                      case "consulta-inicial":
                        return "bg-purple-500 text-white shadow-md transform scale-105"
                      case "valoracion":
                        return "bg-blue-500 text-white shadow-md transform scale-105"
                      case "seguimiento":
                        return "bg-green-500 text-white shadow-md transform scale-105"
                      case "laboratorio":
                        return "bg-orange-500 text-white shadow-md transform scale-105"
                      case "citas":
                        return "bg-indigo-500 text-white shadow-md transform scale-105"
                      default:
                        return "bg-gray-500 text-white shadow-md transform scale-105"
                    }
                  }

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setTabActiva(tab.id)}
                      className={`flex items-center gap-2 py-3 px-4 rounded-md font-medium text-sm transition-all duration-200 ${
                        tabActiva === tab.id
                          ? getActiveClasses(tab.id)
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent hover:border-gray-200"
                      }`}
                    >
                      <tab.icon className={`h-4 w-4 ${tabActiva === tab.id ? 'text-white' : 'text-gray-500'}`} />
                      {tab.label}
                    </button>
                  )
                })}
                        </div>
            </nav>
                      </div>

          {/* Contenido de las Pestañas */}
          {tabActiva === "consulta-inicial" && (
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Consultas Iniciales ({consultasIniciales.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {consultasIniciales.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No hay consultas iniciales registradas</p>
                </div>
              ) : (
                  <div className="space-y-6">
                  {consultasIniciales.map((consulta, index) => (
                      <div key={`consulta-inicial-${consulta.id || index}`} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 bg-gradient-to-r from-white to-purple-50/30">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                              <Badge className="bg-purple-100 text-purple-800 px-3 py-1">
                              Consulta Inicial
                            </Badge>
                            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              {formatearFechaSegura(consulta.fecha_consulta)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                                {consulta.motivo_consulta || "Consulta Inicial"}
                              </h4>
                              
                              {consulta.diagnostico && (
                                <div className="mb-3">
                                  <span className="font-medium text-gray-700">Diagnóstico:</span>
                                  <p className="text-sm text-gray-600 mt-1 bg-purple-50 p-2 rounded">
                                    {consulta.diagnostico}
                                  </p>
                                </div>
                              )}
                              
                              {consulta.plan_tratamiento && (
                                <div className="mb-3">
                                  <span className="font-medium text-gray-700">Plan de Tratamiento:</span>
                                  <p className="text-sm text-gray-600 mt-1 bg-yellow-50 p-2 rounded">
                                    {consulta.plan_tratamiento}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            <div>
                              {consulta.antecedentes && (
                                <div className="mb-3">
                                  <span className="font-medium text-gray-700">Antecedentes:</span>
                                  <p className="text-sm text-gray-600 mt-1 bg-green-50 p-2 rounded">
                                    {consulta.antecedentes}
                                  </p>
                                </div>
                              )}
                              
                              {consulta.sintomas && (
                                <div className="mb-3">
                                  <span className="font-medium text-gray-700">Síntomas:</span>
                                  <p className="text-sm text-gray-600 mt-1 bg-red-50 p-2 rounded">
                                    {consulta.sintomas}
                                  </p>
                                </div>
                              )}
                              
                              {consulta.examen_fisico && (
                                <div className="mb-3">
                                  <span className="font-medium text-gray-700">Examen Físico:</span>
                                  <p className="text-sm text-gray-600 mt-1 bg-purple-50 p-2 rounded">
                                    {consulta.examen_fisico}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Médico:</span> Dr. {consulta.medico_nombre} {consulta.medico_apellidos}
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => abrirModalConsultaInicial(consulta)}
                                className="border-purple-300 text-purple-600 hover:bg-purple-50"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalles
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          )}

          {tabActiva === "valoracion" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Valoraciones Médicas ({valoraciones.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {valoraciones.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No hay valoraciones registradas</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {valoraciones.map((valoracion, index) => (
                      <div key={`valoracion-${valoracion.id_valoracion || index}`} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge className="bg-blue-100 text-blue-800">
                                Valoración
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {formatDateLong(valoracion.fecha_registro)}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                              {valoracion.peso && (
                                <div className="bg-gray-50 p-3 rounded">
                                  <span className="font-medium">Peso:</span> {valoracion.peso} lbs
                                </div>
                              )}
                              {valoracion.talla && (
                                <div className="bg-gray-50 p-3 rounded">
                                  <span className="font-medium">Talla:</span> {valoracion.talla} cm
                                </div>
                              )}
                              {valoracion.pulso && (
                                <div className="bg-gray-50 p-3 rounded">
                                  <span className="font-medium">Pulso:</span> {valoracion.pulso} x min
                                </div>
                              )}
                              {valoracion.respiracion && (
                                <div className="bg-gray-50 p-3 rounded">
                                  <span className="font-medium">Respiración:</span> {valoracion.respiracion} x min
                                </div>
                              )}
                              {valoracion.presion_arterial && (
                                <div className="bg-gray-50 p-3 rounded">
                                  <span className="font-medium">PA:</span> {valoracion.presion_arterial}
                                </div>
                              )}
                              {valoracion.temperatura && (
                                <div className="bg-gray-50 p-3 rounded">
                                  <span className="font-medium">Temp:</span> {valoracion.temperatura}°C
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Enfermera:</span> {valoracion.enfermera_nombre} {valoracion.enfermera_apellidos}
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => abrirModalValoracion(valoracion)}
                                className="border-blue-300 text-blue-600 hover:bg-blue-50"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalles
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {tabActiva === "seguimiento" && (
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Consultas de Seguimiento ({consultasSeguimiento.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {consultasSeguimiento.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No hay consultas de seguimiento registradas</p>
                </div>
              ) : (
                  <div className="space-y-6">
                  {consultasSeguimiento.map((consulta, index) => (
                      <div key={`seguimiento-${consulta.id || index}`} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 bg-gradient-to-r from-white to-green-50/30">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge className="bg-green-100 text-green-800 px-3 py-1">
                              Consulta de Seguimiento
                            </Badge>
                            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                {formatearFechaSegura(consulta.fecha)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                                {consulta.motivo_consulta || "Consulta de Seguimiento"}
                              </h4>
                              
                              {consulta.diagnostico && (
                                <div className="mb-3">
                                  <span className="font-medium text-gray-700">Diagnóstico:</span>
                                  <p className="text-sm text-gray-600 mt-1 bg-purple-50 p-2 rounded">
                                    {consulta.diagnostico}
                                  </p>
                                </div>
                              )}
                              
                              {consulta.plan_tratamiento && (
                                <div className="mb-3">
                                  <span className="font-medium text-gray-700">Plan de Tratamiento:</span>
                                  <p className="text-sm text-gray-600 mt-1 bg-yellow-50 p-2 rounded">
                                    {consulta.plan_tratamiento}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            <div>
                              {consulta.evolucion && (
                                <div className="mb-3">
                                  <span className="font-medium text-gray-700">Evolución:</span>
                                  <p className="text-sm text-gray-600 mt-1 bg-green-50 p-2 rounded">
                                    {consulta.evolucion}
                                  </p>
                                </div>
                              )}
                              
                              {consulta.notas_medicas && (
                                <div className="mb-3">
                                  <span className="font-medium text-gray-700">Notas Médicas:</span>
                                  <p className="text-sm text-gray-600 mt-1 bg-purple-50 p-2 rounded">
                                    {consulta.notas_medicas}
                                  </p>
                                </div>
                              )}
                              
                              {consulta.medicamentos_recetados && (
                                <div className="mb-3">
                                  <span className="font-medium text-gray-700">Medicamentos:</span>
                                  <p className="text-sm text-gray-600 mt-1 bg-red-50 p-2 rounded">
                                    {consulta.medicamentos_recetados}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Médico:</span> Dr. {consulta.medico_nombre} {consulta.medico_apellidos}
                                </p>
                                {consulta.fecha_proxima_cita && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-medium">Próxima cita:</span> {formatearFechaSegura(consulta.fecha_proxima_cita)}
                                  </p>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => abrirModalSeguimiento(consulta)}
                                className="border-green-300 text-green-600 hover:bg-green-50"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalles
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          )}

          {tabActiva === "laboratorio" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Microscope className="h-5 w-5" />
                Resultados de Laboratorio ({resultadosLab.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {resultadosLab.length === 0 ? (
                  <div className="text-center py-12">
                    <Microscope className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No hay resultados de laboratorio</p>
                </div>
              ) : (
                  <div className="space-y-4">
                  {resultadosLab.map((resultado, index) => (
                      <div key={`laboratorio-${resultado.id || index}`} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                      <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h4 className="text-lg font-semibold text-gray-900">{resultado.tipo_examen}</h4>
                        <Badge className={
                          resultado.estado === 'completado' ? 'bg-green-100 text-green-800' :
                          resultado.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {resultado.estado}
                        </Badge>
                            </div>
                            <p className="text-gray-600 mb-2">
                              <span className="font-medium">Fecha del examen:</span> {formatDateLong(resultado.fecha_examen)}
                            </p>
                            {resultado.resultados && (
                              <div className="bg-gray-50 p-3 rounded">
                                <span className="font-medium text-gray-700">Resultados:</span>
                                <p className="text-gray-600 mt-1">{resultado.resultados}</p>
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => abrirModalLaboratorio(resultado)}
                            className="border-orange-300 text-orange-600 hover:bg-orange-50"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalles
                          </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          )}

          {tabActiva === "citas" && (
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Citas del Paciente ({citas.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
                {citas.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No hay citas registradas</p>
                </div>
              ) : (
                <div className="space-y-4">
                    {citas.map((cita, index) => (
                      <div key={`cita-${cita.id_cita || index}`} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <Badge className={
                                cita.estado === 'programada' ? 'bg-blue-100 text-blue-800' :
                                cita.estado === 'confirmada' ? 'bg-green-100 text-green-800' :
                                cita.estado === 'completada' ? 'bg-gray-100 text-gray-800' :
                                cita.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }>
                                {cita.estado}
                            </Badge>
                              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                {formatDateTimeForCard(cita.fecha_hora)}
                            </span>
                          </div>
                            
                            <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                              {cita.motivo}
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600 mb-1">
                                  <span className="font-medium">Médico:</span> Dr. {cita.medico_nombre} {cita.medico_apellidos}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Fecha y hora:</span> {formatDateTimeForCard(cita.fecha_hora)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Estado:</span> {cita.estado}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Creado:</span> {formatDateLong(cita.created_at)}
                                </p>
                              </div>
                              </div>
                              </div>
                            <Button
                              size="sm"
                              variant="outline"
                            onClick={() => abrirModalCita(cita)}
                              className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalles
                            </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          )}
        </div>
      </div>

      {/* Modales de Información Médica */}
      {modalConsultaInicial && consultaInicialSeleccionada && (
        <ConsultaInicialModal
          consulta={consultaInicialSeleccionada}
          isOpen={modalConsultaInicial}
          onClose={cerrarModalConsultaInicial}
        />
      )}

      {modalValoracion && valoracionSeleccionada && (
        <ValoracionModal
          valoracion={valoracionSeleccionada}
          isOpen={modalValoracion}
          onClose={cerrarModalValoracion}
        />
      )}

      {modalSeguimiento && seguimientoSeleccionado && (
        <SeguimientoModal
          consulta={seguimientoSeleccionado}
          isOpen={modalSeguimiento}
          onClose={cerrarModalSeguimiento}
        />
      )}

      {modalLaboratorio && laboratorioSeleccionado && (
        <LaboratorioModal
          resultado={laboratorioSeleccionado}
          isOpen={modalLaboratorio}
          onClose={cerrarModalLaboratorio}
        />
      )}

      {modalCita && citaSeleccionada && (
        <CitaModal
          cita={citaSeleccionada}
          isOpen={modalCita}
          onClose={cerrarModalCita}
        />
      )}
    </ProtectedRoute>
  )
}

