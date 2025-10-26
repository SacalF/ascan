"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Microscope, Upload, FileText, User, Search, X } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"

interface Paciente {
  id_paciente: string
  nombres: string
  apellidos: string
  numero_registro_medico?: string
  telefono?: string
  correo_electronico?: string
  fecha_nacimiento?: string
  sexo?: string
}

export default function NuevoLaboratorioPageClient() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pacienteId = searchParams.get("paciente_id")
  
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  // Estados para búsqueda de pacientes
  const [busquedaPaciente, setBusquedaPaciente] = useState("")
  const [pacientesBuscados, setPacientesBuscados] = useState<Paciente[]>([])
  const [mostrarResultados, setMostrarResultados] = useState(false)
  const [buscandoPacientes, setBuscandoPacientes] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    tipo_examen: "",
    fecha_examen: new Date().toLocaleDateString('en-CA'), // Formato YYYY-MM-DD
    resultados: "",
    observaciones: ""
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Verificar que solo personal médico pueda acceder
  const tieneAcceso = user?.rol === 'medico' || user?.rol === 'enfermera' || user?.rol === 'administrador'

  useEffect(() => {
    if (!tieneAcceso) return

    const cargarPaciente = async () => {
      if (!pacienteId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const result = await apiClient.getPaciente(pacienteId)
        if (result.error) {
          setError(result.error)
          return
        }
        setPaciente((result.data as any).paciente)
      } catch (error) {
        console.error("Error cargando paciente:", error)
        setError("Error al cargar información del paciente")
      } finally {
        setLoading(false)
      }
    }

    cargarPaciente()
  }, [tieneAcceso, pacienteId])

  const buscarPacientes = async (termino: string) => {
    if (termino.length < 2) {
      setPacientesBuscados([])
      setMostrarResultados(false)
      return
    }

    try {
      setBuscandoPacientes(true)
      const result = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/pacientes?search=${termino}`, {
        credentials: 'include'
      })
      const data = await result.json()
      
      if (result.ok && data.pacientes) {
        setPacientesBuscados(data.pacientes)
        setMostrarResultados(true)
      }
    } catch (error) {
      console.error("Error buscando pacientes:", error)
    } finally {
      setBuscandoPacientes(false)
    }
  }

  const seleccionarPaciente = (pacienteSeleccionado: Paciente) => {
    setPaciente(pacienteSeleccionado)
    setBusquedaPaciente(`${pacienteSeleccionado.nombres} ${pacienteSeleccionado.apellidos}`)
    setMostrarResultados(false)
    router.push(`/laboratorio/nuevo?paciente_id=${pacienteSeleccionado.id_paciente}`)
  }

  const limpiarSeleccion = () => {
    setPaciente(null)
    setBusquedaPaciente("")
    setPacientesBuscados([])
    router.push('/laboratorio/nuevo')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]

      if (!allowedTypes.includes(file.type)) {
        setError("Tipo de archivo no permitido. Solo se permiten PDF, imágenes y documentos de Word.")
        return
      }

      // Validar tamaño del archivo (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("El archivo es demasiado grande. Máximo 10MB.")
        return
      }

      setSelectedFile(file)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pacienteId) {
      setError("ID de paciente requerido")
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      setUploadProgress(0)

      const formDataToSend = new FormData()
      formDataToSend.append("paciente_id", pacienteId)
      formDataToSend.append("tipo_examen", formData.tipo_examen)
      formDataToSend.append("fecha_examen", formData.fecha_examen)
      formDataToSend.append("resultados", formData.resultados)
      formDataToSend.append("observaciones", formData.observaciones)

      if (selectedFile) {
        formDataToSend.append("archivo", selectedFile)
      }

      // Simular progreso de subida
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const result = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/laboratorio`, {
        method: "POST",
        body: formDataToSend,
        credentials: 'include'
      })
      
      const data = await result.json()

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!result.ok || data.error) {
        setError(data.error || "Error al crear el resultado")
        return
      }

      setSuccess(true)
      
      // Limpiar formulario
      setFormData({
        tipo_examen: "",
        fecha_examen: new Date().toLocaleDateString('en-CA'), // Formato YYYY-MM-DD
        resultados: "",
        observaciones: ""
      })
      setSelectedFile(null)
      
      // Redirigir al módulo de laboratorio después de 2 segundos
      setTimeout(() => {
        router.push(`/laboratorio${pacienteId ? `?paciente_id=${pacienteId}` : ''}`)
      }, 2000)
    } catch (error) {
      console.error("Error creando laboratorio:", error)
      setError("Error al crear el resultado de laboratorio")
    } finally {
      setSubmitting(false)
      setUploadProgress(0)
    }
  }

  if (!tieneAcceso) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Acceso Restringido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Solo el personal médico puede crear resultados de laboratorio.
            </p>
            <Button asChild>
              <Link href="/laboratorio">Volver a Laboratorio</Link>
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
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    )
  }

  if (error && !paciente && pacienteId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button asChild>
              <Link href="/laboratorio">Volver a Laboratorio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/laboratorio${pacienteId ? `?paciente_id=${pacienteId}` : ''}`}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver a Laboratorio
                  </Link>
                </Button>
                <h1 className="text-xl font-semibold text-gray-900">Nuevo Resultado de Laboratorio</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Información del Paciente */}
          {paciente && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información del Paciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Nombre Completo</Label>
                    <p className="text-lg font-semibold text-gray-900">
                      {paciente.nombres} {paciente.apellidos}
                    </p>
                  </div>
                  {paciente.telefono && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Teléfono</Label>
                      <p className="text-gray-900">{paciente.telefono}</p>
                    </div>
                  )}
                  {paciente.correo_electronico && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Email</Label>
                      <p className="text-gray-900">{paciente.correo_electronico}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Formulario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Microscope className="h-5 w-5" />
                Datos del Resultado de Laboratorio
              </CardTitle>
            </CardHeader>
            <CardContent>
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">¡Resultado de laboratorio creado exitosamente!</p>
                  <p className="text-green-600 text-sm mt-1">
                    El resultado ha sido registrado y el archivo subido correctamente.
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    Serás redirigido al módulo de laboratorio en unos segundos...
                  </p>
                  <div className="mt-3">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => router.push(`/laboratorio${pacienteId ? `?paciente_id=${pacienteId}` : ''}`)}
                      className="text-green-700 border-green-300 hover:bg-green-100"
                    >
                      Ir al Módulo de Laboratorio
                    </Button>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Búsqueda de paciente */}
                {!pacienteId && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-3">Seleccionar Paciente</h4>
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Buscar por nombre, apellido o DPI..."
                          value={busquedaPaciente}
                          onChange={(e) => {
                            setBusquedaPaciente(e.target.value)
                            buscarPacientes(e.target.value)
                          }}
                          className="pl-10 bg-white"
                        />
                      </div>
                      
                      {/* Resultados de búsqueda */}
                      {mostrarResultados && pacientesBuscados.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {pacientesBuscados.map((pac) => (
                            <button
                              key={pac.id_paciente}
                              type="button"
                              onClick={() => seleccionarPaciente(pac)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                            >
                              <div className="font-medium text-gray-900">
                                {pac.nombres} {pac.apellidos}
                              </div>
                              <div className="text-sm text-gray-600">
                                {pac.numero_registro_medico && `Registro: ${pac.numero_registro_medico}`}
                                {pac.telefono && ` • Tel: ${pac.telefono}`}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {buscandoPacientes && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center">
                          <p className="text-gray-600">Buscando pacientes...</p>
                        </div>
                      )}
                      
                      {mostrarResultados && pacientesBuscados.length === 0 && busquedaPaciente.length >= 2 && !buscandoPacientes && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center">
                          <p className="text-gray-600">No se encontraron pacientes</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Paciente seleccionado */}
                {paciente && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-green-900 mb-2">Paciente Seleccionado</h4>
                        <p className="text-green-800 font-medium">
                          {paciente.nombres} {paciente.apellidos}
                        </p>
                        {paciente.numero_registro_medico && (
                          <p className="text-sm text-green-700">
                            Registro: {paciente.numero_registro_medico}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={limpiarSeleccion}
                        className="text-green-700 hover:text-green-900"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Campos del formulario */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo_examen">Tipo de Examen *</Label>
                    <Input
                      id="tipo_examen"
                      value={formData.tipo_examen}
                      onChange={(e) => setFormData(prev => ({ ...prev, tipo_examen: e.target.value }))}
                      placeholder="Ej: Hemograma completo, Química sanguínea, etc."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="fecha_examen">Fecha del Examen *</Label>
                    <Input
                      id="fecha_examen"
                      type="date"
                      value={formData.fecha_examen}
                      onChange={(e) => setFormData(prev => ({ ...prev, fecha_examen: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="resultados">Resultados</Label>
                  <Textarea
                    id="resultados"
                    value={formData.resultados}
                    onChange={(e) => setFormData(prev => ({ ...prev, resultados: e.target.value }))}
                    placeholder="Describe los resultados del examen de laboratorio"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={formData.observaciones}
                    onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                    placeholder="Observaciones adicionales sobre el examen"
                    rows={3}
                  />
                </div>

                {/* Subida de archivo */}
                <div>
                  <Label htmlFor="archivo">Archivo del Resultado (Opcional)</Label>
                  <div className="mt-2">
                    <Input
                      id="archivo"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Formatos permitidos: PDF, JPG, PNG, GIF, DOC, DOCX (máximo 10MB)
                    </p>
                    {selectedFile && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-800">{selectedFile.name}</span>
                          <span className="text-xs text-green-600">
                            ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Barra de progreso */}
                {submitting && uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Subiendo archivo...</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    disabled={submitting || !pacienteId} 
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {submitting ? "Guardando..." : "Guardar Resultado"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href={`/laboratorio${pacienteId ? `?paciente_id=${pacienteId}` : ''}`}>
                      Cancelar
                    </Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
