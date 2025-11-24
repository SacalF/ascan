"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, User, Calendar, X, FileText, Clipboard, Clock, Image as ImageIcon, ZoomIn } from "lucide-react"
import { formatDateLong } from "@/lib/date-utils-simple"
import { useState } from "react"

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
  notas_medicas?: string
  notas?: string
  medicamentos_recetados?: string
  tratamiento_actual?: string
  fecha_proxima_cita?: string
  proxima_cita?: string
  imagenes?: string | string[]
}

interface SeguimientoModalProps {
  consulta: ConsultaSeguimiento
  isOpen: boolean
  onClose: () => void
}

export function SeguimientoModal({ consulta, isOpen, onClose }: SeguimientoModalProps) {
  if (!isOpen) return null

  const [imagenExpandida, setImagenExpandida] = useState<string | null>(null)

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

  // Parsear imágenes desde JSON string o array
  const obtenerImagenes = (): string[] => {
    if (!consulta.imagenes) return []
    
    try {
      if (typeof consulta.imagenes === 'string') {
        // Intentar parsear como JSON
        const parsed = JSON.parse(consulta.imagenes)
        return Array.isArray(parsed) ? parsed : []
      }
      if (Array.isArray(consulta.imagenes)) {
        return consulta.imagenes
      }
    } catch (error) {
      console.error("Error parseando imágenes:", error)
    }
    
    return []
  }

  const imagenes = obtenerImagenes()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header del Modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Consulta de Seguimiento</h3>
              <p className="text-gray-600 text-sm">Información detallada del seguimiento médico</p>
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
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-green-600" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Fecha de Seguimiento</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatearFechaSegura(consulta.fecha)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Médico</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {consulta.medico || `Dr. ${consulta.medico_nombre} ${consulta.medico_apellidos}`}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-600">Motivo de Consulta</p>
                  <p className="text-gray-900 bg-green-50 p-3 rounded-lg">
                    {consulta.motivo_consulta || "Consulta de Seguimiento"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evolución del Paciente */}
          {consulta.evolucion && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Evolución del Paciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 bg-blue-50 p-3 rounded-lg">
                  {consulta.evolucion}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Notas Médicas */}
          {(consulta.notas_medicas || consulta.notas) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clipboard className="h-5 w-5 text-purple-600" />
                  Notas Médicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 bg-purple-50 p-3 rounded-lg">
                  {consulta.notas_medicas || consulta.notas}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Tratamiento Actual */}
          {consulta.tratamiento_actual && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-orange-600" />
                  Tratamiento Actual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 bg-orange-50 p-3 rounded-lg">
                  {consulta.tratamiento_actual}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Medicamentos Recetados */}
          {consulta.medicamentos_recetados && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clipboard className="h-5 w-5 text-red-600" />
                  Medicamentos Recetados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 bg-red-50 p-3 rounded-lg">
                  {consulta.medicamentos_recetados}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Diagnóstico */}
          {consulta.diagnostico && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  Diagnóstico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 bg-indigo-50 p-3 rounded-lg">
                  {consulta.diagnostico}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Plan de Tratamiento */}
          {consulta.plan_tratamiento && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clipboard className="h-5 w-5 text-green-600" />
                  Plan de Tratamiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 bg-green-50 p-3 rounded-lg">
                  {consulta.plan_tratamiento}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Próxima Cita */}
          {(consulta.fecha_proxima_cita || consulta.proxima_cita) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  Próxima Cita
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-lg font-semibold text-yellow-800">
                    {formatearFechaSegura(consulta.fecha_proxima_cita || consulta.proxima_cita)}
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Programada para seguimiento continuo
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resumen de Seguimiento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-gray-600" />
                Resumen del Seguimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha:</span>
                    <span className="font-medium">{formatearFechaSegura(consulta.fecha)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Médico:</span>
                    <span className="font-medium">{consulta.medico || `Dr. ${consulta.medico_nombre} ${consulta.medico_apellidos}`}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {consulta.fecha_proxima_cita && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Próxima cita:</span>
                      <span className="font-medium">{formatearFechaSegura(consulta.fecha_proxima_cita)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <Badge className="bg-green-100 text-green-800">Seguimiento Activo</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Imágenes de la Consulta */}
          {imagenes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ImageIcon className="h-5 w-5 text-purple-600" />
                  Imágenes de la Consulta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imagenes.map((imagenUrl, index) => (
                    <div
                      key={index}
                      className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                      onClick={() => setImagenExpandida(imagenUrl)}
                    >
                      <img
                        src={imagenUrl}
                        alt={`Imagen ${index + 1} del seguimiento`}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          console.error('Error cargando imagen:', imagenUrl)
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                        <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Modal de Imagen Expandida */}
        {imagenExpandida && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center p-4"
            onClick={() => setImagenExpandida(null)}
          >
            <div className="relative max-w-7xl max-h-full">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setImagenExpandida(null)}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="h-5 w-5" />
              </Button>
              <img
                src={imagenExpandida}
                alt="Imagen expandida"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            </div>
          </div>
        )}

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
