"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FileText, User, Calendar, Search, Plus, Home, Microscope, Eye, Phone, Filter, X, Clock } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { LoadingAscanFullScreen } from "@/components/ui/loading-ascan"
import { formatDateLong, formatTime12 } from "@/lib/date-utils-simple"
import { ConsultaInicialModal } from "@/components/modals/consulta-inicial-modal"
import { ValoracionModal } from "@/components/modals/valoracion-modal"
import { SeguimientoModal } from "@/components/modals/seguimiento-modal"
import { LaboratorioModal } from "@/components/modals/laboratorio-modal"

interface Cita {
  id: string
  fecha_hora: string
  nombres: string
  apellidos: string
  telefono?: string
  correo_electronico?: string
  motivo_consulta?: string
  estado: string
  medico_nombre?: string
  medico_apellidos?: string
  paciente_id?: string
}

function ConsultasContent() {
  const { user } = useAuth()
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState("")
  const [modalAbierto, setModalAbierto] = useState(false)
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null)
  
  // Estados para los modales de información médica
  const [modalConsultaInicial, setModalConsultaInicial] = useState(false)
  const [modalValoracion, setModalValoracion] = useState(false)
  const [modalSeguimiento, setModalSeguimiento] = useState(false)
  const [modalLaboratorio, setModalLaboratorio] = useState(false)
  const [consultaInicialSeleccionada, setConsultaInicialSeleccionada] = useState<any>(null)
  const [valoracionSeleccionada, setValoracionSeleccionada] = useState<any>(null)
  const [seguimientoSeleccionado, setSeguimientoSeleccionado] = useState<any>(null)
  const [laboratorioSeleccionado, setLaboratorioSeleccionado] = useState<any>(null)

  // Verificar si el usuario tiene acceso (médico, enfermera o administrador)
  const tieneAcceso = user?.rol === 'medico' || user?.rol === 'enfermera' || user?.rol === 'administrador'

  useEffect(() => {
    if (!tieneAcceso) return

    const cargarCitas = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiClient.getConsultas()
        console.log("=== RESULTADO DE CONSULTAS ===")
        console.log("Result:", result)
        const citasData: any = result.data
        console.log("Citas data:", citasData)
        const citasFinales = Array.isArray(citasData) ? citasData : citasData.consultas || []
        console.log("Citas finales:", citasFinales)
        setCitas(citasFinales)
      } catch (error) {
        console.error("Error cargando citas:", error)
        setError("Error al cargar las citas programadas")
      } finally {
        setLoading(false)
      }
    }

    cargarCitas()
  }, [tieneAcceso])

  const abrirModalCita = (cita: Cita) => {
    setCitaSeleccionada(cita)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setCitaSeleccionada(null)
  }

  // Funciones para abrir modales de información médica
  const abrirModalConsultaInicial = (consulta: any) => {
    setConsultaInicialSeleccionada(consulta)
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

  // Si no tiene acceso, mostrar mensaje
  if (!tieneAcceso) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Sidebar />
        <div className="flex-1 overflow-auto flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Acceso Restringido</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Solo el personal médico y de enfermería tienen acceso a las consultas médicas.
              </p>
              <Button asChild>
                <Link href="/dashboard">Volver al Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const citasFiltradas = citas.filter(cita =>
    `${cita.nombres} ${cita.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()) ||
    cita.motivo_consulta?.toLowerCase().includes(busqueda.toLowerCase()) ||
    cita.estado?.toLowerCase().includes(busqueda.toLowerCase()) ||
    `${cita.medico_nombre} ${cita.medico_apellidos}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  const formatearFecha = (fecha: string) => {
    console.log("Formateando fecha:", fecha)
    
    if (!fecha) {
      return "Sin fecha"
    }
    
    try {
      // Intentar parsear la fecha
      const date = new Date(fecha)
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        console.log("Fecha inválida:", fecha)
        return "Fecha inválida"
      }
      
      // Formatear la fecha
      const fechaFormateada = date.toLocaleDateString("es", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      
      console.log("Fecha formateada:", fechaFormateada)
      return fechaFormateada
    } catch (error) {
      console.error("Error formateando fecha:", error, "Fecha original:", fecha)
      return "Error en fecha"
    }
  }

  if (loading) {
    return (
      <LoadingAscanFullScreen text="Cargando consultas..." />
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-gray-600" />
                  <h1 className="text-xl font-semibold text-gray-900">Consultas Programadas</h1>
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Search Section */}
            <div className="mb-8">
              <Card className="bg-gradient-to-r from-white to-blue-50 border-blue-200 shadow-md">
                <CardContent className="p-6">
                  <div className="flex gap-4 items-center">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                      <Input 
                        placeholder="Buscar por paciente, motivo, estado o médico..." 
                        className="pl-12 h-12 text-lg border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" onClick={() => setBusqueda("")} className="h-12 px-6 border-blue-300 text-blue-600 hover:bg-blue-50">
                      <Filter className="h-4 w-4 mr-2" />
                      Limpiar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de citas */}
            {citasFiltradas.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {busqueda ? "No se encontraron resultados" : "No hay citas programadas"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {busqueda 
                      ? "Intenta con otros términos de búsqueda"
                      : "No hay citas programadas para hoy"
                    }
                  </p>
                  {!busqueda && (
                    <Button asChild>
                      <Link href="/agendar-cita">
                        <Plus className="h-4 w-4 mr-2" />
                        Agendar Cita
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {citasFiltradas.map((cita) => (
                  <Card key={cita.id} className="border-blue-200 hover:shadow-lg transition-all duration-300 hover:border-blue-300 bg-gradient-to-r from-white to-blue-50/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                              <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <span className="font-semibold text-xl text-gray-800">
                                {cita.nombres} {cita.apellidos}
                              </span>
                              <Badge 
                                className={
                                  cita.estado === 'confirmada'
                                    ? 'bg-green-100 text-green-700 border-green-200 ml-3'
                                    : cita.estado === 'programada'
                                    ? 'bg-blue-100 text-blue-700 border-blue-200 ml-3'
                                    : 'bg-yellow-100 text-yellow-700 border-yellow-200 ml-3'
                                }
                              >
                                {cita.estado}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="bg-green-100 p-2 rounded-lg">
                                <Calendar className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">{formatearFecha(cita.fecha_hora)}</span>
                                <p className="text-gray-500 text-xs">Fecha y Hora</p>
                              </div>
                            </div>
                            
                            {cita.telefono && (
                              <div className="flex items-center space-x-2 text-sm">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                  <Phone className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">{cita.telefono}</span>
                                  <p className="text-gray-500 text-xs">Teléfono</p>
                                </div>
                              </div>
                            )}
                            
                            {cita.motivo_consulta && (
                              <div className="flex items-center space-x-2 text-sm">
                                <div className="bg-purple-100 p-2 rounded-lg">
                                  <FileText className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">{cita.motivo_consulta}</span>
                                  <p className="text-gray-500 text-xs">Motivo</p>
                                </div>
                              </div>
                            )}
                            
                            {cita.medico_nombre && (
                              <div className="flex items-center space-x-2 text-sm">
                                <div className="bg-orange-100 p-2 rounded-lg">
                                  <User className="h-4 w-4 text-orange-600" />
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">{cita.medico_nombre} {cita.medico_apellidos}</span>
                                  <p className="text-gray-500 text-xs">Médico</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2 ml-6">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => abrirModalCita(cita)}
                            className="border-blue-300 text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Cita
                          </Button>
                          
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal de Detalles de Cita */}
      {modalAbierto && citaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Detalles de la Cita</h3>
                  <p className="text-gray-600 text-sm">Información completa de la consulta</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={cerrarModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 space-y-6">
              {/* Información del Paciente */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Información del Paciente
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nombre Completo</p>
                    <p className="font-medium text-gray-900">{citaSeleccionada.nombres} {citaSeleccionada.apellidos}</p>
                  </div>
                  {citaSeleccionada.telefono && (
                    <div>
                      <p className="text-sm text-gray-600">Teléfono</p>
                      <p className="font-medium text-gray-900">{citaSeleccionada.telefono}</p>
                    </div>
                  )}
                  {citaSeleccionada.correo_electronico && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{citaSeleccionada.correo_electronico}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Información de la Cita */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Información de la Cita
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Fecha y Hora</p>
                    <p className="font-medium text-gray-900">
                      {formatDateLong(citaSeleccionada.fecha_hora)} a las {formatTime12(citaSeleccionada.fecha_hora)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <Badge className={`${
                      citaSeleccionada.estado === 'confirmada' ? 'bg-green-100 text-green-800' :
                      citaSeleccionada.estado === 'programada' ? 'bg-blue-100 text-blue-800' :
                      citaSeleccionada.estado === 'completada' ? 'bg-gray-100 text-gray-800' :
                      citaSeleccionada.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {citaSeleccionada.estado.charAt(0).toUpperCase() + citaSeleccionada.estado.slice(1)}
                    </Badge>
                  </div>
                  {citaSeleccionada.motivo_consulta && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">Motivo de Consulta</p>
                      <p className="font-medium text-gray-900">{citaSeleccionada.motivo_consulta}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Información del Médico */}
              {citaSeleccionada.medico_nombre && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="h-5 w-5 text-green-600" />
                    Médico Asignado
                  </h4>
                  <div>
                    <p className="text-sm text-gray-600">Nombre del Médico</p>
                    <p className="font-medium text-gray-900">
                      {citaSeleccionada.medico_nombre} {citaSeleccionada.medico_apellidos}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <Button variant="outline" onClick={cerrarModal}>
                Cerrar
              </Button>
              {citaSeleccionada.paciente_id && (
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <Link href={`/consultas/${citaSeleccionada.paciente_id}`}>
                    <Microscope className="h-4 w-4 mr-2" />
                    Ver Expediente
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

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
    </ProtectedRoute>
  )
}

export default function ConsultasPage() {
  return (
    <ProtectedRoute>
      <ConsultasContent />
    </ProtectedRoute>
  )
}