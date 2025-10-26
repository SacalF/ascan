"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Microscope, User, Calendar, X, FileText, ImageIcon } from "lucide-react"
import { formatDateLong } from "@/lib/date-utils-simple"

interface ResultadoLaboratorio {
  id: string
  paciente_id: string
  tipo_examen: string
  fecha_examen: string
  estado: string
  resultados?: string
  valores_referencia?: string
  observaciones?: string
  archivo_nombre?: string
  archivo_contenido?: string
  archivo_tipo?: string
  laboratorio?: string
  paciente_nombre?: string
  numero_registro_medico?: string
  fecha_nacimiento?: string
  sexo?: string
  created_at: string
}

interface LaboratorioModalProps {
  resultado: ResultadoLaboratorio
  isOpen: boolean
  onClose: () => void
}

export function LaboratorioModal({ resultado, isOpen, onClose }: LaboratorioModalProps) {
  if (!isOpen) return null

  const formatearFechaSegura = (fecha: string | null | undefined) => {
    if (!fecha) return "Sin fecha"
    try {
      return formatDateLong(fecha)
    } catch {
      return "Fecha inválida"
    }
  }

  const esBase64Valido = (str: string) => {
    try {
      // Verificar si es una cadena base64 válida
      return btoa(atob(str)) === str
    } catch (err) {
      return false
    }
  }

  const esURL = (str: string) => {
    try {
      new URL(str)
      return true
    } catch {
      return false
    }
  }

  const esHex = (str: string) => {
    // Verificar si es una cadena hexadecimal
    return /^[0-9a-fA-F]+$/.test(str)
  }


  const abrirArchivo = () => {
    if (resultado.archivo_contenido) {
      try {
        if (esURL(resultado.archivo_contenido)) {
          // Es una URL (DigitalOcean Spaces, S3, etc.) - abrir directamente
          window.open(resultado.archivo_contenido, '_blank')
        } else if (esBase64Valido(resultado.archivo_contenido)) {
          // Es base64 válido
          if (esImagen) {
            // Para imágenes, crear una nueva ventana con la imagen
            const imageWindow = window.open('', '_blank')
            if (imageWindow) {
              imageWindow.document.write(`
                <html>
                  <head><title>Imagen del Resultado</title></head>
                  <body style="margin:0; padding:20px; text-align:center; background:#f5f5f5;">
                    <img src="data:${resultado.archivo_tipo};base64,${resultado.archivo_contenido}" 
                         style="max-width:100%; max-height:90vh; object-fit:contain; border:1px solid #ddd; border-radius:8px; box-shadow:0 4px 8px rgba(0,0,0,0.1);" 
                         alt="Resultado del laboratorio" />
                  </body>
                </html>
              `)
              imageWindow.document.close()
            }
          } else {
            // Para PDFs y otros archivos - usar el contenido base64 directamente
            const dataUrl = `data:${resultado.archivo_tipo || 'application/pdf'};base64,${resultado.archivo_contenido}`
            window.open(dataUrl, '_blank')
          }
        } else {
          // Intentar como URL directa
          window.open(resultado.archivo_contenido, '_blank')
        }
      } catch (error) {
        console.error('Error al abrir archivo:', error)
        alert('Error al abrir el archivo. Por favor, inténtalo de nuevo.')
      }
    }
  }

  const esImagen = resultado.archivo_tipo?.startsWith('image/')
  const esPDF = resultado.archivo_tipo === 'application/pdf'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header del Modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Microscope className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Resultado de Laboratorio</h3>
              <p className="text-gray-600 text-sm">Información detallada del examen de laboratorio</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tipo de Examen</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {resultado.tipo_examen}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Fecha del Examen</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatearFechaSegura(resultado.fecha_examen)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Estado</p>
                  <Badge className={
                    resultado.estado === 'completado' ? 'bg-green-100 text-green-800' :
                    resultado.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                    resultado.estado === 'normal' ? 'bg-blue-100 text-blue-800' :
                    resultado.estado === 'anormal' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {resultado.estado}
                  </Badge>
                </div>
                {resultado.laboratorio && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Laboratorio</p>
                    <p className="text-gray-900">{resultado.laboratorio}</p>
                  </div>
                )}
                {resultado.numero_registro_medico && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Número de Registro</p>
                    <p className="text-gray-900">{resultado.numero_registro_medico}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información del Paciente */}
          {resultado.paciente_nombre && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-green-600" />
                  Información del Paciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Paciente</p>
                    <p className="text-gray-900">{resultado.paciente_nombre}</p>
                  </div>
                  {resultado.fecha_nacimiento && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Fecha de Nacimiento</p>
                      <p className="text-gray-900">{formatearFechaSegura(resultado.fecha_nacimiento)}</p>
                    </div>
                  )}
                  {resultado.sexo && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Sexo</p>
                      <p className="text-gray-900">{resultado.sexo}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resultados */}
          {resultado.resultados && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Resultados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-gray-900 font-mono text-sm">
                    {resultado.resultados}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Valores de Referencia */}
          {resultado.valores_referencia && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Microscope className="h-5 w-5 text-orange-600" />
                  Valores de Referencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-gray-900 font-mono text-sm">
                    {resultado.valores_referencia}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Observaciones */}
          {resultado.observaciones && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  Observaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {resultado.observaciones}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Archivo Adjunto */}
          {resultado.archivo_nombre && resultado.archivo_contenido && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Archivo Adjunto del Resultado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg">
                  {/* Información del archivo */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {esImagen ? (
                        <ImageIcon className="h-8 w-8 text-blue-600" />
                      ) : esPDF ? (
                        <FileText className="h-8 w-8 text-red-600" />
                      ) : (
                        <FileText className="h-8 w-8 text-blue-600" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{resultado.archivo_nombre}</p>
                        <p className="text-sm text-gray-600">{resultado.archivo_tipo}</p>
                        <p className="text-xs text-gray-500">
                          {esImagen ? 'Archivo de imagen' : esPDF ? 'Documento PDF' : 'Archivo adjunto'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={abrirArchivo}
                        className="flex items-center gap-2 bg-white hover:bg-gray-50"
                      >
                        <FileText className="h-4 w-4" />
                        {esImagen ? 'Ver Imagen' : esPDF ? 'Ver PDF' : 'Ver Archivo'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Vista previa para imágenes */}
                  {esImagen && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700 mb-2">Vista Previa:</h4>
                      <div className="relative bg-white p-2 rounded-lg border border-gray-200">
                        <img
                          src={
                            esURL(resultado.archivo_contenido || '') 
                              ? resultado.archivo_contenido 
                              : `data:${resultado.archivo_tipo};base64,${resultado.archivo_contenido}`
                          }
                          alt="Vista previa del resultado"
                          className="max-w-full h-auto max-h-96 rounded-lg mx-auto block"
                          style={{ objectFit: 'contain' }}
                          onError={(e) => {
                            console.error('Error cargando imagen:', e)
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <div className="absolute top-4 right-4">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={abrirArchivo}
                            className="bg-white/90 hover:bg-white shadow-md"
                          >
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Haz clic en el botón de imagen para ver en pantalla completa
                      </p>
                    </div>
                  )}

                  {/* Información adicional para PDFs */}
                  {esPDF && (
                    <div className="mt-4 bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-red-600" />
                        <span className="font-medium text-gray-700">Documento PDF</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Este es un documento PDF con los resultados del laboratorio.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={abrirArchivo}
                          className="flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          Abrir PDF
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Información para otros tipos de archivo */}
                  {!esImagen && !esPDF && (
                    <div className="mt-4 bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-700">Archivo Adjunto</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Archivo adjunto con los resultados del laboratorio.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={abrirArchivo}
                          className="flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          Ver Archivo
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información de Registro */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-gray-600" />
                Información de Registro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Fecha de Registro</p>
                  <p className="font-medium text-gray-900">
                    {formatearFechaSegura(resultado.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">ID del Resultado</p>
                  <p className="font-medium text-gray-900 font-mono text-xs">
                    {resultado.id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
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
