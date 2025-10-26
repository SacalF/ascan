"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, User, Calendar, X, Activity, Thermometer, Gauge, Waves } from "lucide-react"
import { formatDateLong } from "@/lib/date-utils-simple"

interface Valoracion {
  id_valoracion?: string
  id?: string
  paciente_id: string
  enfermera_id?: string
  peso?: number
  altura?: number
  talla?: number
  presion_arterial?: string
  frecuencia_cardiaca?: number
  pulso?: number
  frecuencia_respiratoria?: number
  respiracion?: number
  temperatura?: number
  saturacion_oxigeno?: number
  dolor_escala?: number
  observaciones?: string
  fecha_valoracion?: string
  fecha_registro?: string
  created_at?: string
  enfermera_nombre?: string
  enfermera_apellidos?: string
  estado_general?: string
}

interface ValoracionModalProps {
  valoracion: Valoracion
  isOpen: boolean
  onClose: () => void
}

export function ValoracionModal({ valoracion, isOpen, onClose }: ValoracionModalProps) {
  if (!isOpen) return null

  const formatearFechaSegura = (fecha: string | null | undefined) => {
    if (!fecha) return "Sin fecha"
    try {
      return formatDateLong(fecha)
    } catch {
      return "Fecha inválida"
    }
  }

  const obtenerFecha = () => {
    return valoracion.fecha_valoracion || valoracion.fecha_registro || valoracion.created_at
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header del Modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Heart className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Valoración Médica</h3>
              <p className="text-gray-600 text-sm">Signos vitales y valoración del paciente</p>
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
                <Calendar className="h-5 w-5 text-blue-600" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Fecha de Valoración</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatearFechaSegura(obtenerFecha())}
                  </p>
                </div>
                {valoracion.enfermera_nombre && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Enfermera</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {valoracion.enfermera_nombre} {valoracion.enfermera_apellidos}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Signos Vitales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-green-600" />
                Signos Vitales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Peso */}
                {(valoracion.peso || valoracion.peso === 0) && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Activity className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-700">Peso</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-800">
                      {valoracion.peso} {valoracion.peso < 100 ? 'kg' : 'lbs'}
                    </p>
                  </div>
                )}

                {/* Talla/Altura */}
                {(valoracion.talla || valoracion.altura || valoracion.talla === 0 || valoracion.altura === 0) && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Activity className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="font-medium text-gray-700">Talla</span>
                    </div>
                    <p className="text-2xl font-bold text-green-800">
                      {valoracion.talla || valoracion.altura} cm
                    </p>
                  </div>
                )}

                {/* Temperatura */}
                {(valoracion.temperatura || valoracion.temperatura === 0) && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-red-100 p-2 rounded-full">
                        <Thermometer className="h-4 w-4 text-red-600" />
                      </div>
                      <span className="font-medium text-gray-700">Temperatura</span>
                    </div>
                    <p className="text-2xl font-bold text-red-800">
                      {valoracion.temperatura}°C
                    </p>
                  </div>
                )}

                {/* Presión Arterial */}
                {valoracion.presion_arterial && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <Gauge className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="font-medium text-gray-700">Presión Arterial</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-800">
                      {valoracion.presion_arterial}
                    </p>
                  </div>
                )}

                {/* Pulso/Frecuencia Cardiaca */}
                {(valoracion.pulso || valoracion.frecuencia_cardiaca || valoracion.pulso === 0 || valoracion.frecuencia_cardiaca === 0) && (
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-orange-100 p-2 rounded-full">
                        <Heart className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="font-medium text-gray-700">Pulso</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-800">
                      {valoracion.pulso || valoracion.frecuencia_cardiaca} lpm
                    </p>
                  </div>
                )}

                {/* Respiración/Frecuencia Respiratoria */}
                {(valoracion.respiracion || valoracion.frecuencia_respiratoria || valoracion.respiracion === 0 || valoracion.frecuencia_respiratoria === 0) && (
                  <div className="bg-cyan-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-cyan-100 p-2 rounded-full">
                        <Waves className="h-4 w-4 text-cyan-600" />
                      </div>
                      <span className="font-medium text-gray-700">Respiración</span>
                    </div>
                    <p className="text-2xl font-bold text-cyan-800">
                      {valoracion.respiracion || valoracion.frecuencia_respiratoria} rpm
                    </p>
                  </div>
                )}

                {/* Saturación de Oxígeno */}
                {(valoracion.saturacion_oxigeno || valoracion.saturacion_oxigeno === 0) && (
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-teal-100 p-2 rounded-full">
                        <Activity className="h-4 w-4 text-teal-600" />
                      </div>
                      <span className="font-medium text-gray-700">Sat. O₂</span>
                    </div>
                    <p className="text-2xl font-bold text-teal-800">
                      {valoracion.saturacion_oxigeno}%
                    </p>
                  </div>
                )}

                {/* Escala de Dolor */}
                {(valoracion.dolor_escala || valoracion.dolor_escala === 0) && (
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-pink-100 p-2 rounded-full">
                        <Activity className="h-4 w-4 text-pink-600" />
                      </div>
                      <span className="font-medium text-gray-700">Escala de Dolor</span>
                    </div>
                    <p className="text-2xl font-bold text-pink-800">
                      {valoracion.dolor_escala}/10
                    </p>
                  </div>
                )}

                {/* Estado General */}
                {valoracion.estado_general && (
                  <div className="bg-gray-50 p-4 rounded-lg md:col-span-2 lg:col-span-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <span className="font-medium text-gray-700">Estado General</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-800">
                      {valoracion.estado_general}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Observaciones */}
          {valoracion.observaciones && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-indigo-600" />
                  Observaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 bg-indigo-50 p-3 rounded-lg">
                  {valoracion.observaciones}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Resumen de Signos Vitales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="h-5 w-5 text-green-600" />
                Resumen de Valoración
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  {valoracion.peso && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Peso:</span>
                      <span className="font-medium">{valoracion.peso} {valoracion.peso < 100 ? 'kg' : 'lbs'}</span>
                    </div>
                  )}
                  {valoracion.talla && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Talla:</span>
                      <span className="font-medium">{valoracion.talla} cm</span>
                    </div>
                  )}
                  {valoracion.temperatura && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temperatura:</span>
                      <span className="font-medium">{valoracion.temperatura}°C</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {valoracion.presion_arterial && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Presión Arterial:</span>
                      <span className="font-medium">{valoracion.presion_arterial}</span>
                    </div>
                  )}
                  {valoracion.pulso && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pulso:</span>
                      <span className="font-medium">{valoracion.pulso} lpm</span>
                    </div>
                  )}
                  {valoracion.respiracion && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Respiración:</span>
                      <span className="font-medium">{valoracion.respiracion} rpm</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer del Modal */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray widened">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}
