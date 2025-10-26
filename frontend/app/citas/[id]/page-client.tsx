"use client"

import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, ArrowLeft, Edit, Trash2, Phone, Home, X, Clock, UserX, CheckCircle, CalendarDays, FileText, Plus, Clipboard } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { formatDateLong, formatTime12, formatDateTimeForCard } from "@/lib/date-utils-simple"

interface Cita {
  id_cita: string
  fecha_hora: string
  paciente_nombre: string
  paciente_id: string | null
  numero_clinica: string | null
  motivo: string
  estado: "programada" | "confirmada" | "completada" | "cancelada" | "no_asistio"
  notas: string | null
  telefono?: string | null
  email?: string | null
  created_at: string
  updated_at: string
}

interface Paciente {
  id: string
  nombres: string
  apellidos: string
  telefono: string | null
  email: string | null
}

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

export default function CitaDetallePage({
  params,
}: {
  params: { id: string }
}) {
  const [cita, setCita] = useState<Cita | null>(null)
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [showReagendarModal, setShowReagendarModal] = useState(false)
  const [nuevaFecha, setNuevaFecha] = useState("")
  const [nuevaHora, setNuevaHora] = useState("")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { id } = params

  const cargarCita = async () => {
    try {
      console.log("[DEBUG] Iniciando cargarCita con ID:", id)
      setLoading(true)
      setError(null)

      // Validaciones tempranas más robustas
      if (!id || typeof id !== "string") {
        console.log("[DEBUG] Invalid or missing ID parameter:", id)
        setError("ID de cita inválido")
        return
      }

      // Lista de IDs reservados que no son válidos
      const reservedIds = ["nueva", "agendar", "loading", "crear", "editar", "eliminar", "undefined", "null"]
      if (reservedIds.includes(id.toLowerCase())) {
        console.log("[DEBUG] Rejecting reserved route ID:", id)
        setError("ID de cita reservado")
        return
      }

      // Validación de formato UUID más estricta
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(id)) {
        console.log("[DEBUG] Invalid UUID format for ID:", id)
        setError("Formato de ID inválido")
        return
      }

      console.log("[DEBUG] Fetching cita with ID:", id)

      // Usar la API del backend
      const result = await apiClient.getCita(id)
      console.log("[DEBUG] API result:", result)
      
      if (result.error) {
        console.log("[DEBUG] API error:", result.error)
        setError(result.error)
        return
      }

      const citaData = result.data as Cita
      console.log("[DEBUG] Cita data recibida:", citaData)
      
      if (!citaData) {
        console.log("[DEBUG] No cita data received")
        setError("No se recibieron datos de la cita")
        return
      }
      
      setCita(citaData)
      console.log("[DEBUG] Cita state actualizado")

      // Obtener información del paciente si está registrado
      if (citaData.paciente_id) {
        const nombreCompleto = citaData.paciente_nombre || ''
        const partesNombre = nombreCompleto.split(' ')
        const pacienteData: Paciente = {
          id: citaData.paciente_id,
          nombres: partesNombre[0] || '',
          apellidos: partesNombre.slice(1).join(' ') || '',
          telefono: citaData.telefono || null,
          email: citaData.email || null,
        }
        setPaciente(pacienteData)
        console.log("[DEBUG] Paciente data actualizado:", pacienteData)
      }

    } catch (error) {
      console.error("[DEBUG] Error loading cita:", error)
      setError("Error al cargar la cita")
    } finally {
      setLoading(false)
      console.log("[DEBUG] cargarCita finalizado")
    }
  }

  useEffect(() => {
    cargarCita()
  }, [id])

  const actualizarEstadoCita = async (nuevoEstado: string, fechaHora?: string) => {
    if (!cita) {
      console.log("[DEBUG] No hay cita para actualizar")
      return
    }

    try {
      console.log("[DEBUG] Iniciando actualización de cita:", cita.id_cita, "nuevo estado:", nuevoEstado)
      setUpdating(true)
      setError(null)
      setSuccessMessage(null)
      
      const datosActualizacion = {
        ...cita,
        estado: nuevoEstado,
        ...(fechaHora && { fecha_hora: fechaHora })
      }

      console.log("[DEBUG] Datos de actualización:", datosActualizacion)

      const result = await apiClient.updateCita(cita.id_cita, datosActualizacion)
      console.log("[DEBUG] Resultado de actualización:", result)

      if (result.error) {
        console.error("[DEBUG] Error actualizando cita:", result.error)
        setError(`Error al actualizar la cita: ${result.error}`)
        return
      }

      console.log("[DEBUG] Cita actualizada exitosamente en backend")
      setError(null) // Limpiar errores previos
      
      // Mensaje de éxito específico según la acción
      let mensajeExito = ""
      switch (nuevoEstado) {
        case "confirmada":
          mensajeExito = "Cita confirmada exitosamente"
          break
        case "completada":
          mensajeExito = "Cita completada exitosamente"
          break
        case "cancelada":
          mensajeExito = "Cita cancelada exitosamente"
          break
        case "no_asistio":
          mensajeExito = "Cita marcada como 'No Asistió' exitosamente"
          break
        case "programada":
          mensajeExito = "Cita reagendada exitosamente"
          break
        default:
          mensajeExito = "Cita actualizada exitosamente"
      }
      
      setSuccessMessage(mensajeExito)
      
      // Recargar la cita para obtener los datos actualizados
      console.log("Recargando cita después de actualización...")
      try {
        await cargarCita()
        console.log("Cita recargada exitosamente")
      } catch (reloadError) {
        console.error("Error al recargar la cita:", reloadError)
        // No mostrar error al usuario, solo log
      }
      
      // Limpiar mensaje de éxito después de 4 segundos
      setTimeout(() => setSuccessMessage(null), 4000)

    } catch (error) {
      console.error("Error actualizando cita:", error)
      setError(`Error de conexión al actualizar la cita: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setUpdating(false)
    }
  }

  const cancelarCita = () => {
    if (confirm("¿Estás seguro de que quieres cancelar esta cita?\n\nEsta acción no se puede deshacer.")) {
      actualizarEstadoCita("cancelada")
    }
  }

  const marcarAusente = () => {
    if (confirm("¿Marcar esta cita como 'No Asistió'?\n\nEl paciente no se presentó a la cita.")) {
      actualizarEstadoCita("no_asistio")
    }
  }

  const completarCita = () => {
    if (confirm("¿Marcar esta cita como completada?\n\nLa consulta médica ha finalizado.")) {
      actualizarEstadoCita("completada")
    }
  }

  const confirmarCita = () => {
    if (confirm("¿Confirmar esta cita?\n\nEl paciente asistirá a la cita programada.")) {
      actualizarEstadoCita("confirmada")
    }
  }

  const abrirModalReagendar = () => {
    if (!cita) return
    
    // Establecer fecha y hora actuales como valores por defecto
    const fechaActual = new Date(cita.fecha_hora)
    const fecha = fechaActual.toISOString().split('T')[0]
    const hora = fechaActual.toTimeString().slice(0, 5)
    
    setNuevaFecha(fecha)
    setNuevaHora(hora)
    setShowReagendarModal(true)
  }

  const reagendarCita = async () => {
    if (!nuevaFecha || !nuevaHora) {
      setError("Por favor selecciona una fecha y hora")
      return
    }

    if (!cita) return

    const nuevaFechaHora = new Date(`${nuevaFecha}T${nuevaHora}`).toISOString()
    const fechaFormateada = new Date(nuevaFechaHora).toLocaleDateString('es-GT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    if (confirm(`¿Reagendar la cita para el ${fechaFormateada} a las ${nuevaHora}?\n\nLa cita actual será movida a la nueva fecha y hora.`)) {
      await actualizarEstadoCita("programada", nuevaFechaHora)
      setShowReagendarModal(false)
    }
  }

  const cancelarReagendar = () => {
    setShowReagendarModal(false)
    setNuevaFecha("")
    setNuevaHora("")
    setError(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalles de la cita...</p>
        </div>
      </div>
    )
  }

  if (error || !cita) {
    notFound()
  }

  const formatearFecha = (fechaHora: string) => {
    return formatDateLong(fechaHora)
  }

  const formatearHora = (fechaHora: string) => {
    return formatTime12(fechaHora)
  }

  const formatearFechaHora = (fechaHora: string) => {
    return formatDateTimeForCard(fechaHora)
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
              <div className="flex items-center gap-2">
                <Image
                  src="/ascan-logo.png"
                  alt="ASCAN Logo"
                  width={32}
                  height={32}
                  className="rounded"
                />
                <span className="text-lg font-semibold text-gray-900">Detalles de la Cita</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Detalles de la Cita</h1>
          <p className="text-gray-600 mt-1">Información completa de la cita médica</p>
        </div>

        {/* Información Principal */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Información de la Cita
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Fecha</label>
                <p className="text-lg font-semibold">{formatearFecha(cita.fecha_hora)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Hora</label>
                <p className="text-lg font-semibold">{formatearHora(cita.fecha_hora)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Estado</label>
                <div className="mt-1">
                  <Badge className={estadoColors[cita.estado]}>{estadoLabels[cita.estado]}</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Motivo</label>
                <p className="text-gray-800">{cita.motivo}</p>
              </div>
            </div>

            {cita.notas && (
              <div>
                <label className="text-sm font-medium text-gray-600">Notas</label>
                <p className="text-gray-800 mt-1">{cita.notas}</p>
              </div>
            )}

            <div className="pt-4 border-t">
              <div>
                <label className="font-medium text-gray-600">ID de Cita</label>
                <p className="text-gray-800 font-mono text-xs">{cita.id_cita}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones de Estado */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Acciones de la Cita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {cita.estado === "programada" && (
                <Button 
                  onClick={confirmarCita} 
                  disabled={updating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar
                </Button>
              )}
              
              {cita.estado === "confirmada" && (
                <Button 
                  onClick={completarCita} 
                  disabled={updating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completar
                </Button>
              )}

              {(cita.estado === "programada" || cita.estado === "confirmada") && (
                <>
                  <Button 
                    onClick={cancelarCita} 
                    disabled={updating}
                    variant="destructive"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  
                  <Button 
                    onClick={marcarAusente} 
                    disabled={updating}
                    variant="outline"
                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    No Asistió
                  </Button>
                </>
              )}

              {cita.estado === "cancelada" && (
                <Button 
                  onClick={confirmarCita} 
                  disabled={updating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Reactivar
                </Button>
              )}

              {cita.estado === "no_asistio" && (
                <Button 
                  onClick={abrirModalReagendar} 
                  disabled={updating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Reagendar
                </Button>
              )}

              {/* Botón de reagendar para cualquier estado */}
              {(cita.estado === "programada" || cita.estado === "confirmada") && (
                <Button 
                  onClick={abrirModalReagendar} 
                  disabled={updating}
                  variant="outline"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Reagendar
                </Button>
              )}
            </div>
            
            {updating && (
              <div className="mt-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Actualizando estado...</p>
              </div>
            )}

            {successMessage && (
              <div className="mt-4 text-center">
                <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">
                  ✅ {successMessage}
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 text-center">
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  ❌ {error}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información del Paciente */}
        {paciente ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información del Paciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nombre Completo</label>
                  <p className="text-gray-800 font-semibold">
                    {paciente.nombres} {paciente.apellidos}
                  </p>
                </div>
                {paciente.telefono && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Teléfono</label>
                    <p className="text-gray-800">{paciente.telefono}</p>
                  </div>
                )}
                {paciente.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-800">{paciente.email}</p>
                  </div>
                )}
              </div>

            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Paciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Paciente no registrado en el sistema</p>
              <p className="text-sm text-gray-500 mt-1">
                Nombre: {cita.paciente_nombre || "No especificado"}
              </p>
              <div className="mt-4">
                <Button size="sm" asChild>
                  <Link href="/pacientes">
                    Registrar Paciente
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      </div>

      {/* Modal de Reagendar */}
      {showReagendarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Reagendar Cita</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Fecha
                </label>
                <input
                  type="date"
                  value={nuevaFecha}
                  onChange={(e) => setNuevaFecha(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Hora
                </label>
                <input
                  type="time"
                  value={nuevaHora}
                  onChange={(e) => setNuevaHora(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={reagendarCita}
                disabled={updating || !nuevaFecha || !nuevaHora}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                Reagendar
              </Button>
              <Button
                onClick={cancelarReagendar}
                variant="outline"
                className="flex-1"
                disabled={updating}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
