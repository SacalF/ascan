"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, X, Clock, Phone, Mail } from "lucide-react"
import { formatDateLong, formatTime12 } from "@/lib/date-utils-simple"

interface Cita {
  id_cita: string
  fecha_hora: string
  paciente_nombre?: string
  nombres?: string
  apellidos?: string
  paciente_id: string | null
  motivo: string
  motivo_consulta?: string
  estado: "programada" | "confirmada" | "en_curso" | "completada" | "cancelada" | "no_asistio"
  medico_nombre: string
  medico_apellidos?: string
  medico_id: string
  created_at: string
  telefono?: string
  correo_electronico?: string
  email?: string
}

interface CitaModalProps {
  cita: Cita
  isOpen: boolean
  onClose: () => void
}

export function CitaModal({ cita, isOpen, onClose }: CitaModalProps) {
  if (!isOpen) return null

  const formatearFechaSegura = (fecha: string | null | undefined) => {
    if (!fecha) return "Sin fecha"
    try {
      return formatDateLong(fecha)
    } catch {
      return "Fecha inválida"
    }
  }

  const formatearHoraSegura = (fecha: string | null | undefined) => {
    if (!fecha) return "Sin hora"
    try {
      return formatTime12(fecha)
    } catch {
      return "Hora inválida"
    }
  }

  const obtenerNombreCompleto = () => {
    if (cita.paciente_nombre) return cita.paciente_nombre
    if (cita.nombres && cita.apellidos) return `${cita.nombres} ${cita.apellidos}`
    return "Paciente no especificado"
  }

  const obtenerTelefono = () => {
    return cita.telefono || "No especificado"
  }

  const obtenerEmail = () => {
    return cita.correo_electronico || cita.email || "No especificado"
  }

  const obtenerMotivo = () => {
    return cita.motivo_consulta || cita.motivo || "No especificado"
  }

  const obtenerNombreMedico = () => {
    if (cita.medico_apellidos) {
      return `${cita.medico_nombre} ${cita.medico_apellidos}`
    }
    return cita.medico_nombre
  }

  const obtenerColorEstado = () => {
    switch (cita.estado) {
      case 'confirmada':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'programada':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completada':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'cancelada':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'no_asistio':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'en_curso':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
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
            onClick={onClose}
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
                <p className="text-sm font-medium text-gray-600">Nombre Completo</p>
                <p className="font-medium text-gray-900">{obtenerNombreCompleto()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Teléfono</p>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <p className="font-medium text-gray-900">{obtenerTelefono()}</p>
                </div>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-600">Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p className="font-medium text-gray-900">{obtenerEmail()}</p>
                </div>
              </div>
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
                <p className="text-sm font-medium text-gray-600">Fecha y Hora</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <p className="font-medium text-gray-900">
                    {formatearFechaSegura(cita.fecha_hora)} a las {formatearHoraSegura(cita.fecha_hora)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Estado</p>
                <Badge className={obtenerColorEstado()}>
                  {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
                </Badge>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-600">Motivo de Consulta</p>
                <p className="font-medium text-gray-900 bg-white p-2 rounded border">
                  {obtenerMotivo()}
                </p>
              </div>
            </div>
          </div>

          {/* Información del Médico */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              Médico Asignado
            </h4>
            <div>
              <p className="text-sm font-medium text-gray-600">Nombre del Médico</p>
              <p className="font-medium text-gray-900">
                Dr. {obtenerNombreMedico()}
              </p>
            </div>
          </div>

          {/* Información Adicional */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              Información Adicional
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">ID de la Cita</p>
                <p className="font-medium text-gray-900 font-mono text-xs">
                  {cita.id_cita}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Fecha de Creación</p>
                <p className="font-medium text-gray-900">
                  {formatearFechaSegura(cita.created_at)}
                </p>
              </div>
              {cita.paciente_id && (
                <div className="md:col-span-2">
                  <p className="text-gray-600">ID del Paciente</p>
                  <p className="font-medium text-gray-900 font-mono text-xs">
                    {cita.paciente_id}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}
