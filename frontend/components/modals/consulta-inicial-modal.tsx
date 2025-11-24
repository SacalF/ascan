"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, User, Calendar, X, Clipboard, Activity, Heart, Stethoscope, Thermometer, Gauge, Waves, Image as ImageIcon, ZoomIn } from "lucide-react"
import { formatDateLong } from "@/lib/date-utils-simple"
import { ConsultaCompleta } from "./consulta-inicial-helper"
import { useState } from "react"

interface ConsultaInicial {
  id: string
  paciente_id: string
  medico_id: string
  motivo_consulta?: string
  diagnostico?: string
  plan_tratamiento?: string
  tratamiento?: string
  fecha_consulta: string
  medico_nombre: string
  medico_apellidos?: string
  medico?: string
  created_at: string
  antecedentes?: string
  sintomas?: string
  examen_fisico?: string
  primer_sintoma?: string
  fecha_primer_sintoma?: string
  antecedentes_medicos?: string
  antecedentes_quirurgicos?: string
  revision_sistemas?: string
  menstruacion_menarca?: string
  menstruacion_ultima?: string
  gravidez?: number
  partos?: number
  abortos?: number
  habitos_tabaco?: number
  habitos_otros?: string
  historia_familiar?: string
  // Campos adicionales del examen físico
  cabeza?: string
  cuello?: string
  torax?: string
  abdomen?: string
  extremidades?: string
  ojos?: string
  dientes?: string
  tiroides?: string
  pulmones?: string
  corazon?: string
  higado?: string
  genitales?: string
  nariz?: string
  ganglios?: string
  recto?: string
  // Campos de valoración (pueden venir como string o number)
  peso?: number | string
  talla?: number | string
  pulso?: number | string
  respiracion?: number | string
  presion_arterial?: string
  temperatura?: number | string
  // Información del paciente
  paciente_nombre?: string
  paciente_telefono?: string
  paciente_email?: string
  numero_registro_medico?: string
  fecha_nacimiento?: string
  sexo?: string
  imagenes?: string | string[]
}

interface ConsultaInicialModalProps {
  consulta: ConsultaCompleta
  isOpen: boolean
  onClose: () => void
}

export function ConsultaInicialModal({ consulta, isOpen, onClose }: ConsultaInicialModalProps) {
  if (!isOpen) return null

  const [imagenExpandida, setImagenExpandida] = useState<string | null>(null)

  const formatearFechaSegura = (fecha: string | null | undefined) => {
    if (!fecha) return "Sin fecha"
    try {
      return formatDateLong(fecha)
    } catch {
      return "Fecha inválida"
    }
  }

  const obtenerNombreMedico = () => {
    if (consulta.medico) return consulta.medico
    if (consulta.medico_apellidos) {
      return `${consulta.medico_nombre} ${consulta.medico_apellidos}`
    }
    return consulta.medico_nombre
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
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Consulta Inicial</h3>
              <p className="text-gray-600 text-sm">Información detallada de la consulta inicial</p>
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
          {(consulta.paciente_nombre || consulta.numero_registro_medico || consulta.fecha_nacimiento) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-blue-600" />
                  Información del Paciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Nombre:</span> {consulta.paciente_nombre || "No especificado"}
                    </div>
                    <div>
                      <span className="font-medium">Registro Médico:</span> {consulta.numero_registro_medico || "No especificado"}
                    </div>
                    <div>
                      <span className="font-medium">Fecha de Nacimiento:</span> {formatearFechaSegura(consulta.fecha_nacimiento)}
                    </div>
                    {consulta.paciente_telefono && (
                      <div>
                        <span className="font-medium">Teléfono:</span> {consulta.paciente_telefono}
                      </div>
                    )}
                    {consulta.paciente_email && (
                      <div>
                        <span className="font-medium">Email:</span> {consulta.paciente_email}
                      </div>
                    )}
                    {consulta.sexo && (
                      <div>
                        <span className="font-medium">Sexo:</span> {consulta.sexo}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                  <p className="text-sm font-medium text-gray-600">Fecha de Consulta</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatearFechaSegura(consulta.fecha_consulta)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Médico</p>
                  <p className="text-lg font-semibold text-gray-900">
                    Dr. {obtenerNombreMedico()}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-600">Motivo de Consulta</p>
                  <p className="text-gray-900 bg-blue-50 p-3 rounded-lg">
                    {consulta.motivo_consulta || "No especificado"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Síntomas y Antecedentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clipboard className="h-5 w-5 text-green-600" />
                Síntomas y Antecedentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consulta.primer_sintoma && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Primer Síntoma</p>
                    <p className="text-gray-900 bg-green-50 p-3 rounded-lg">
                      {consulta.primer_sintoma}
                    </p>
                  </div>
                )}
                
                {consulta.fecha_primer_sintoma && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Fecha del Primer Síntoma</p>
                    <p className="text-gray-900">
                      {formatearFechaSegura(consulta.fecha_primer_sintoma)}
                    </p>
                  </div>
                )}


                {consulta.antecedentes_medicos && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Antecedentes Médicos</p>
                    <p className="text-gray-900 bg-blue-50 p-3 rounded-lg">
                      {consulta.antecedentes_medicos}
                    </p>
                  </div>
                )}

                {consulta.antecedentes_quirurgicos && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Antecedentes Quirúrgicos</p>
                    <p className="text-gray-900 bg-purple-50 p-3 rounded-lg">
                      {consulta.antecedentes_quirurgicos}
                    </p>
                  </div>
                )}

                {consulta.historia_familiar && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Historia Familiar</p>
                    <p className="text-gray-900 bg-yellow-50 p-3 rounded-lg">
                      {consulta.historia_familiar}
                    </p>
                  </div>
                )}

                {consulta.habitos_otros && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Otros Hábitos</p>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {consulta.habitos_otros}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información Ginecológica (si aplica) */}
          {(consulta.menstruacion_menarca || consulta.menstruacion_ultima || consulta.gravidez || consulta.partos || consulta.abortos) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-pink-600" />
                  Información Ginecológica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {consulta.menstruacion_menarca && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Menarca</p>
                      <p className="text-gray-900">{formatearFechaSegura(consulta.menstruacion_menarca)}</p>
                    </div>
                  )}
                  {consulta.menstruacion_ultima && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Última Menstruación</p>
                      <p className="text-gray-900">{formatearFechaSegura(consulta.menstruacion_ultima)}</p>
                    </div>
                  )}
                  {consulta.gravidez !== undefined && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Gravidez</p>
                      <p className="text-gray-900">{consulta.gravidez}</p>
                    </div>
                  )}
                  {consulta.partos !== undefined && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Partos</p>
                      <p className="text-gray-900">{consulta.partos}</p>
                    </div>
                  )}
                  {consulta.abortos !== undefined && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Abortos</p>
                      <p className="text-gray-900">{consulta.abortos}</p>
                    </div>
                  )}
                  {consulta.habitos_tabaco !== undefined && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Fuma</p>
                      <Badge className={consulta.habitos_tabaco ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                        {consulta.habitos_tabaco ? "Sí" : "No"}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}


          {/* Revisión por Sistemas */}
          {consulta.revision_sistemas && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clipboard className="h-5 w-5 text-indigo-600" />
                  Revisión por Sistemas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 bg-indigo-50 p-3 rounded-lg">
                  {consulta.revision_sistemas}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Diagnóstico y Tratamiento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-orange-600" />
                Diagnóstico y Tratamiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consulta.diagnostico && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Diagnóstico Clínico Provisional</p>
                    <p className="text-gray-900 bg-orange-50 p-3 rounded-lg">
                      {consulta.diagnostico}
                    </p>
                  </div>
                )}
                
                {(consulta.plan_tratamiento || consulta.tratamiento) && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Indicaciones y Tratamiento</p>
                    <p className="text-gray-900 bg-green-50 p-3 rounded-lg">
                      {consulta.tratamiento || consulta.plan_tratamiento}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Valoración Médica */}
          {(consulta.peso || consulta.talla || consulta.pulso || consulta.respiracion || consulta.presion_arterial || consulta.temperatura) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5 text-purple-600" />
                  Valoración Médica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {consulta.peso && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700">Peso</span>
                      </div>
                      <p className="text-lg font-bold text-purple-800">{consulta.peso} lbs</p>
                    </div>
                  )}
                  
                  {consulta.talla && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Talla</span>
                      </div>
                      <p className="text-lg font-bold text-blue-800">{consulta.talla} cm</p>
                    </div>
                  )}
                  
                  {consulta.pulso && (
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Heart className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-700">Pulso</span>
                      </div>
                      <p className="text-lg font-bold text-red-800">{consulta.pulso} x min</p>
                    </div>
                  )}
                  
                  {consulta.respiracion && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Waves className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Respiración</span>
                      </div>
                      <p className="text-lg font-bold text-green-800">{consulta.respiracion} x min</p>
                    </div>
                  )}
                  
                  {consulta.presion_arterial && (
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Gauge className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-700">Presión Arterial</span>
                      </div>
                      <p className="text-lg font-bold text-orange-800">{consulta.presion_arterial}</p>
                    </div>
                  )}
                  
                  {consulta.temperatura && (
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Thermometer className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-700">Temperatura</span>
                      </div>
                      <p className="text-lg font-bold text-yellow-800">{consulta.temperatura}°C</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Exámenes Físicos Realizados */}
          {(consulta.cabeza || consulta.cuello || consulta.torax || consulta.abdomen || consulta.extremidades || consulta.ojos || consulta.dientes || consulta.tiroides || consulta.pulmones || consulta.corazon || consulta.higado || consulta.genitales || consulta.nariz || consulta.ganglios || consulta.recto) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Stethoscope className="h-5 w-5 text-indigo-600" />
                  Exámenes Físicos Realizados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Resumen de Exámenes Realizados */}
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Exámenes Físicos Realizados</h4>
                  <div className="flex flex-wrap gap-2">
                    {consulta.cabeza && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Examen de Cabeza
                      </Badge>
                    )}
                    {consulta.cuello && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Examen de Cuello
                      </Badge>
                    )}
                    {consulta.torax && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Examen de Tórax
                      </Badge>
                    )}
                    {consulta.abdomen && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Examen de Abdomen
                      </Badge>
                    )}
                    {consulta.extremidades && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Examen de Extremidades
                      </Badge>
                    )}
                    {consulta.ojos && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Examen de Ojos
                      </Badge>
                    )}
                    {consulta.dientes && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Examen de Dientes
                      </Badge>
                    )}
                    {consulta.tiroides && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Examen de Tiroides
                      </Badge>
                    )}
                    {consulta.pulmones && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Examen de Pulmones
                      </Badge>
                    )}
                    {consulta.corazon && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Examen de Corazón
                      </Badge>
                    )}
                    {consulta.higado && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Examen de Hígado
                      </Badge>
                    )}
                    {consulta.genitales && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Examen de Genitales
                      </Badge>
                    )}
                    {consulta.nariz && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Examen de Nariz
                      </Badge>
                    )}
                    {consulta.ganglios && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Examen de Ganglios
                      </Badge>
                    )}
                    {consulta.recto && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Examen de Recto
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Detalles del Examen Físico */}
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-indigo-900 mb-3">Resultados del Examen Físico</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {consulta.cabeza && (
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-200">
                        <span className="font-medium text-gray-700">Cabeza:</span>
                        <span className="text-gray-900 font-semibold">{consulta.cabeza}</span>
                      </div>
                    )}
                    {consulta.cuello && (
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-200">
                        <span className="font-medium text-gray-700">Cuello:</span>
                        <span className="text-gray-900 font-semibold">{consulta.cuello}</span>
                      </div>
                    )}
                    {consulta.torax && (
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-200">
                        <span className="font-medium text-gray-700">Tórax:</span>
                        <span className="text-gray-900 font-semibold">{consulta.torax}</span>
                      </div>
                    )}
                    {consulta.abdomen && (
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-200">
                        <span className="font-medium text-gray-700">Abdomen:</span>
                        <span className="text-gray-900 font-semibold">{consulta.abdomen}</span>
                      </div>
                    )}
                    {consulta.extremidades && (
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-200">
                        <span className="font-medium text-gray-700">Extremidades:</span>
                        <span className="text-gray-900 font-semibold">{consulta.extremidades}</span>
                      </div>
                    )}
                    {consulta.ojos && (
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-200">
                        <span className="font-medium text-gray-700">Ojos:</span>
                        <span className="text-gray-900 font-semibold">{consulta.ojos}</span>
                      </div>
                    )}
                    {consulta.dientes && (
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-200">
                        <span className="font-medium text-gray-700">Dientes:</span>
                        <span className="text-gray-900 font-semibold">{consulta.dientes}</span>
                      </div>
                    )}
                    {consulta.tiroides && (
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-200">
                        <span className="font-medium text-gray-700">Tiroides:</span>
                        <span className="text-gray-900 font-semibold">{consulta.tiroides}</span>
                      </div>
                    )}
                    {consulta.pulmones && (
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-200">
                        <span className="font-medium text-gray-700">Pulmones:</span>
                        <span className="text-gray-900 font-semibold">{consulta.pulmones}</span>
                      </div>
                    )}
                    {consulta.corazon && (
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-200">
                        <span className="font-medium text-gray-700">Corazón:</span>
                        <span className="text-gray-900 font-semibold">{consulta.corazon}</span>
                      </div>
                    )}
                    {consulta.higado && (
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-200">
                        <span className="font-medium text-gray-700">Hígado:</span>
                        <span className="text-gray-900 font-semibold">{consulta.higado}</span>
                      </div>
                    )}
                    {consulta.genitales && (
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-200">
                        <span className="font-medium text-gray-700">Genitales:</span>
                        <span className="text-gray-900 font-semibold">{consulta.genitales}</span>
                      </div>
                    )}
                    {consulta.nariz && (
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-200">
                        <span className="font-medium text-gray-700">Nariz:</span>
                        <span className="text-gray-900 font-semibold">{consulta.nariz}</span>
                      </div>
                    )}
                    {consulta.ganglios && (
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-200">
                        <span className="font-medium text-gray-700">Ganglios:</span>
                        <span className="text-gray-900 font-semibold">{consulta.ganglios}</span>
                      </div>
                    )}
                    {consulta.recto && (
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-200">
                        <span className="font-medium text-gray-700">Recto:</span>
                        <span className="text-gray-900 font-semibold">{consulta.recto}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                        alt={`Imagen ${index + 1} de la consulta`}
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
