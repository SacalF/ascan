"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, FileText, User, Image as ImageIcon, X } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
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

export default function NuevaConsultaPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const pacienteId = searchParams.get("paciente_id")
  
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  // Función para obtener la fecha local en formato YYYY-MM-DD
  const getLocalDateString = () => {
    const now = new Date()
    // Usar métodos locales para evitar problemas de zona horaria
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`
    
    console.log("Fecha actual completa:", now.toString())
    console.log("Fecha local generada:", dateString)
    console.log("Zona horaria:", Intl.DateTimeFormat().resolvedOptions().timeZone)
    
    return dateString
  }

  // Form data para consulta inicial
  const [formData, setFormData] = useState({
    fecha_consulta: getLocalDateString(),
    medico: "",
    primer_sintoma: "",
    fecha_primer_sintoma: "",
    antecedentes_medicos: "",
    antecedentes_quirurgicos: "",
    revision_sistemas: "",
    menstruacion_menarca: "",
    menstruacion_ultima: "",
    gravidez: 0,
    partos: 0,
    abortos: 0,
    habitos_tabaco: 0,
    habitos_otros: "",
    historia_familiar: "",
    diagnostico: "",
    tratamiento: ""
  })


  // Form data para examen físico
  const [examenData, setExamenData] = useState({
    cabeza: "",
    cuello: "",
    torax: "",
    abdomen: "",
    extremidades: "",
    ojos: "",
    dientes: "",
    tiroides: "",
    pulmones: "",
    corazon: "",
    higado: "",
    genitales: "",
    nariz: "",
    ganglios: "",
    recto: ""
  })

  // Verificar que solo médicos y enfermeras puedan acceder
  const tieneAcceso = user?.rol === 'medico' || user?.rol === 'enfermera' || user?.rol === 'administrador'

  useEffect(() => {
    if (!tieneAcceso || !pacienteId) return

    const cargarPaciente = async () => {
      try {
        setLoading(true)
        const result = await apiClient.getPaciente(pacienteId)
        if (result.error) {
          setError(result.error)
          return
        }
        setPaciente((result.data as any).paciente)
        
        // Establecer el nombre del médico actual
        if (user) {
          setFormData(prev => ({
            ...prev,
            medico: `${user.nombres} ${user.apellidos}`
          }))
        }
      } catch (error) {
        console.error("Error cargando paciente:", error)
        setError("Error al cargar información del paciente")
      } finally {
        setLoading(false)
      }
    }

    cargarPaciente()
  }, [pacienteId, tieneAcceso])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Validar tipos de archivo (solo imágenes)
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"]
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type))
    
    if (invalidFiles.length > 0) {
      setError("Solo se permiten archivos de imagen (JPG, PNG, GIF, WEBP)")
      return
    }

    // Validar tamaño (máximo 5MB por imagen)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      setError("Cada imagen no puede ser mayor a 5MB")
      return
    }

    // Limitar a 10 imágenes máximo
    if (selectedImages.length + files.length > 10) {
      setError("Máximo 10 imágenes permitidas")
      return
    }

    setError(null)

    // Agregar nuevas imágenes
    const newImages = [...selectedImages, ...files]
    setSelectedImages(newImages)

    // Crear previews para las nuevas imágenes
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pacienteId) return

    try {
      setSubmitting(true)
      setError(null)

      // Crear FormData para enviar datos y archivos
      const formDataToSend = new FormData()
      
      // Agregar datos de la consulta
      formDataToSend.append("paciente_id", pacienteId)
      formDataToSend.append("medico_id", user?.id_usuario || "")
      formDataToSend.append("fecha_consulta", formData.fecha_consulta)
      formDataToSend.append("medico", formData.medico)
      formDataToSend.append("primer_sintoma", formData.primer_sintoma || "")
      formDataToSend.append("fecha_primer_sintoma", formData.fecha_primer_sintoma || "")
      formDataToSend.append("antecedentes_medicos", formData.antecedentes_medicos || "")
      formDataToSend.append("antecedentes_quirurgicos", formData.antecedentes_quirurgicos || "")
      formDataToSend.append("revision_sistemas", formData.revision_sistemas || "")
      formDataToSend.append("menstruacion_menarca", formData.menstruacion_menarca || "")
      formDataToSend.append("menstruacion_ultima", formData.menstruacion_ultima || "")
      formDataToSend.append("gravidez", String(formData.gravidez))
      formDataToSend.append("partos", String(formData.partos))
      formDataToSend.append("abortos", String(formData.abortos))
      formDataToSend.append("habitos_tabaco", String(formData.habitos_tabaco))
      formDataToSend.append("habitos_otros", formData.habitos_otros || "")
      formDataToSend.append("historia_familiar", formData.historia_familiar || "")
      formDataToSend.append("diagnostico", formData.diagnostico || "")
      formDataToSend.append("tratamiento", formData.tratamiento || "")

      // Agregar imágenes
      selectedImages.forEach((image, index) => {
        formDataToSend.append(`imagen_${index}`, image)
      })
      formDataToSend.append("imagenes_count", String(selectedImages.length))

      // 1. Crear consulta inicial usando fetch directamente para FormData
      console.log("Enviando fecha de consulta:", formData.fecha_consulta)
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${baseUrl}/api/consultas/inicial`, {
        method: "POST",
        body: formDataToSend,
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Error al crear la consulta inicial")
        return
      }

      const consultaResult = await response.json()

      if (consultaResult.error) {
        setError(consultaResult.error)
        return
      }

      // Debug: Verificar la estructura de la respuesta
      console.log("Respuesta de consulta inicial:", consultaResult)
      
      // Obtener el ID de la consulta creada
      const consultaResponseData = consultaResult.data || consultaResult
      const consultaId = consultaResponseData?.id || consultaResponseData?.id_consulta || consultaResponseData?.consulta_id
      
      if (!consultaId) {
        console.error("No se pudo obtener el ID de la consulta creada:", consultaResult.data)
        setError(`Error: No se pudo obtener el ID de la consulta creada. Respuesta: ${JSON.stringify(consultaResult.data)}`)
        return
      }

      // 2. Crear examen físico
      const examenResult = await apiClient.createExamenFisico({
        paciente_id: pacienteId,
        consulta_id: consultaId,
        tipo_consulta: 'inicial',
        ...examenData
      })

      if (examenResult.error) {
        console.error("Error creando examen físico:", examenResult.error)
        setError(`Error al crear examen físico: ${examenResult.error}`)
        return
      }

      console.log("Examen físico creado exitosamente:", examenResult.data)

      setSuccess(true)
    } catch (error) {
      console.error("Error creando consulta:", error)
      setError("Error al crear la consulta")
    } finally {
      setSubmitting(false)
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
              Solo el personal médico y de enfermería pueden crear consultas.
            </p>
            <Button asChild>
              <Link href="/consultas">Volver a Consultas</Link>
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
          <p className="text-gray-600">Cargando información del paciente...</p>
        </div>
      </div>
    )
  }

  if (error && !paciente) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button asChild>
              <Link href="/consultas">Volver a Consultas</Link>
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
                  <Link href={`/consultas/${pacienteId}`}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al Expediente
                  </Link>
                </Button>
                <h1 className="text-xl font-semibold text-gray-900">Nueva Consulta</h1>
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

          {/* Formulario de Consulta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Datos de la Consulta
              </CardTitle>
            </CardHeader>
            <CardContent>
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">¡Consulta creada exitosamente!</p>
                  <p className="text-green-600 text-sm mt-1">
                    La consulta ha sido registrada en el expediente del paciente.
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Header del formulario */}
                <div className="text-center border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900">ASCAN - Consulta Inicial</h3>
                  <p className="text-sm text-gray-600">Registro de consulta médica inicial</p>
                </div>

                {/* Información del paciente */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Información del Paciente</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Nombre:</span> {paciente?.nombres} {paciente?.apellidos}
                    </div>
                    <div>
                      <span className="font-medium">Registro Médico:</span> {paciente?.numero_registro_medico}
                    </div>
                    <div>
                      <span className="font-medium">Fecha de Nacimiento:</span> {paciente?.fecha_nacimiento}
                    </div>
                  </div>
                </div>

                {/* Fecha de consulta y médico */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="fecha_consulta">Fecha de Consulta</Label>
                    <Input
                      id="fecha_consulta"
                      type="date"
                      value={formData.fecha_consulta}
                      onChange={(e) => setFormData(prev => ({ ...prev, fecha_consulta: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="medico">Médico</Label>
                    <Input
                      id="medico"
                      value={formData.medico}
                      onChange={(e) => setFormData(prev => ({ ...prev, medico: e.target.value }))}
                      placeholder="Nombre del médico"
                      required
                    />
                  </div>
                </div>

                {/* Historia - Primer síntoma */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">HISTORIA</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primer_sintoma">Primer Síntoma o Signo</Label>
                      <Textarea
                        id="primer_sintoma"
                        value={formData.primer_sintoma}
                        onChange={(e) => setFormData(prev => ({ ...prev, primer_sintoma: e.target.value }))}
                        placeholder="Describe el primer síntoma o signo"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fecha_primer_sintoma">Fecha del Primer Síntoma</Label>
                      <Input
                        id="fecha_primer_sintoma"
                        type="date"
                        value={formData.fecha_primer_sintoma}
                        onChange={(e) => setFormData(prev => ({ ...prev, fecha_primer_sintoma: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Historia Personal - Antecedentes */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">HISTORIA PERSONAL: Antecedentes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="antecedentes_medicos">Médico</Label>
                      <Textarea
                        id="antecedentes_medicos"
                        value={formData.antecedentes_medicos}
                        onChange={(e) => setFormData(prev => ({ ...prev, antecedentes_medicos: e.target.value }))}
                        placeholder="Antecedentes médicos"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="antecedentes_quirurgicos">Quirúrgico</Label>
                      <Textarea
                        id="antecedentes_quirurgicos"
                        value={formData.antecedentes_quirurgicos}
                        onChange={(e) => setFormData(prev => ({ ...prev, antecedentes_quirurgicos: e.target.value }))}
                        placeholder="Antecedentes quirúrgicos"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="revision_sistemas">Revisión de Sistemas</Label>
                    <Textarea
                      id="revision_sistemas"
                      value={formData.revision_sistemas}
                      onChange={(e) => setFormData(prev => ({ ...prev, revision_sistemas: e.target.value }))}
                      placeholder="Revisión de sistemas (cardiovascular, genitourinario, gastrointestinal, etc.)"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Menstruación */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">Menstruación</h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <Label htmlFor="menstruacion_menarca">Menarquía</Label>
                      <Input
                        id="menstruacion_menarca"
                        type="date"
                        value={formData.menstruacion_menarca}
                        onChange={(e) => setFormData(prev => ({ ...prev, menstruacion_menarca: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="menstruacion_ultima">Última</Label>
                      <Input
                        id="menstruacion_ultima"
                        type="date"
                        value={formData.menstruacion_ultima}
                        onChange={(e) => setFormData(prev => ({ ...prev, menstruacion_ultima: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="gravidez">Gravi</Label>
                      <Input
                        id="gravidez"
                        type="number"
                        min="0"
                        value={formData.gravidez}
                        onChange={(e) => setFormData(prev => ({ ...prev, gravidez: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="partos">Para</Label>
                      <Input
                        id="partos"
                        type="number"
                        min="0"
                        value={formData.partos}
                        onChange={(e) => setFormData(prev => ({ ...prev, partos: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="abortos">Abortos</Label>
                      <Input
                        id="abortos"
                        type="number"
                        min="0"
                        value={formData.abortos}
                        onChange={(e) => setFormData(prev => ({ ...prev, abortos: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Hábitos */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">Hábitos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="habitos_tabaco">Tabaco</Label>
                      <Input
                        id="habitos_tabaco"
                        type="number"
                        min="0"
                        value={formData.habitos_tabaco}
                        onChange={(e) => setFormData(prev => ({ ...prev, habitos_tabaco: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="habitos_otros">Otros</Label>
                      <Textarea
                        id="habitos_otros"
                        value={formData.habitos_otros}
                        onChange={(e) => setFormData(prev => ({ ...prev, habitos_otros: e.target.value }))}
                        placeholder="Otros hábitos"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Historia Familiar */}
                <div>
                  <Label htmlFor="historia_familiar">Historia Familiar</Label>
                  <Textarea
                    id="historia_familiar"
                    value={formData.historia_familiar}
                    onChange={(e) => setFormData(prev => ({ ...prev, historia_familiar: e.target.value }))}
                    placeholder="Historia familiar de enfermedades"
                    rows={3}
                  />
                </div>


                {/* Examen Físico */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">EXAMEN FÍSICO</h4>
                  
                  {/* Sección 1: Cabeza y Cuello */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-800 mb-3">Cabeza y Cuello</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="cabeza">Cabeza</Label>
                        <Input
                          id="cabeza"
                          value={examenData.cabeza}
                          onChange={(e) => setExamenData(prev => ({ ...prev, cabeza: e.target.value }))}
                          placeholder="Normal, sin lesiones"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cuello">Cuello</Label>
                        <Input
                          id="cuello"
                          value={examenData.cuello}
                          onChange={(e) => setExamenData(prev => ({ ...prev, cuello: e.target.value }))}
                          placeholder="Normal, sin adenopatías"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ojos">Ojos</Label>
                        <Input
                          id="ojos"
                          value={examenData.ojos}
                          onChange={(e) => setExamenData(prev => ({ ...prev, ojos: e.target.value }))}
                          placeholder="Normal, pupilas isocóricas"
                        />
                      </div>
                      <div>
                        <Label htmlFor="nariz">Nariz</Label>
                        <Input
                          id="nariz"
                          value={examenData.nariz}
                          onChange={(e) => setExamenData(prev => ({ ...prev, nariz: e.target.value }))}
                          placeholder="Normal, permeables"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dientes">Dientes</Label>
                        <Input
                          id="dientes"
                          value={examenData.dientes}
                          onChange={(e) => setExamenData(prev => ({ ...prev, dientes: e.target.value }))}
                          placeholder="Normal, buena higiene"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tiroides">Tiroides</Label>
                        <Input
                          id="tiroides"
                          value={examenData.tiroides}
                          onChange={(e) => setExamenData(prev => ({ ...prev, tiroides: e.target.value }))}
                          placeholder="Normal, no palpable"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ganglios">Ganglios</Label>
                        <Input
                          id="ganglios"
                          value={examenData.ganglios}
                          onChange={(e) => setExamenData(prev => ({ ...prev, ganglios: e.target.value }))}
                          placeholder="No palpables"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sección 2: Tórax */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-800 mb-3">Tórax</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="torax">Tórax</Label>
                        <Input
                          id="torax"
                          value={examenData.torax}
                          onChange={(e) => setExamenData(prev => ({ ...prev, torax: e.target.value }))}
                          placeholder="Normal, simétrico"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pulmones">Pulmones</Label>
                        <Input
                          id="pulmones"
                          value={examenData.pulmones}
                          onChange={(e) => setExamenData(prev => ({ ...prev, pulmones: e.target.value }))}
                          placeholder="Normal, sin ruidos agregados"
                        />
                      </div>
                      <div>
                        <Label htmlFor="corazon">Corazón</Label>
                        <Input
                          id="corazon"
                          value={examenData.corazon}
                          onChange={(e) => setExamenData(prev => ({ ...prev, corazon: e.target.value }))}
                          placeholder="Normal, sin soplos"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sección 3: Abdomen */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-800 mb-3">Abdomen</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="abdomen">Abdomen</Label>
                        <Input
                          id="abdomen"
                          value={examenData.abdomen}
                          onChange={(e) => setExamenData(prev => ({ ...prev, abdomen: e.target.value }))}
                          placeholder="Normal, blando, depresible"
                        />
                      </div>
                      <div>
                        <Label htmlFor="higado">Hígado</Label>
                        <Input
                          id="higado"
                          value={examenData.higado}
                          onChange={(e) => setExamenData(prev => ({ ...prev, higado: e.target.value }))}
                          placeholder="Normal, no palpable"
                        />
                      </div>
                      <div>
                        <Label htmlFor="genitales">Genitales</Label>
                        <Input
                          id="genitales"
                          value={examenData.genitales}
                          onChange={(e) => setExamenData(prev => ({ ...prev, genitales: e.target.value }))}
                          placeholder="Normal"
                        />
                      </div>
                      <div>
                        <Label htmlFor="recto">Recto</Label>
                        <Input
                          id="recto"
                          value={examenData.recto}
                          onChange={(e) => setExamenData(prev => ({ ...prev, recto: e.target.value }))}
                          placeholder="Normal"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sección 4: Extremidades */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-800 mb-3">Extremidades</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="extremidades">Extremidades</Label>
                        <Input
                          id="extremidades"
                          value={examenData.extremidades}
                          onChange={(e) => setExamenData(prev => ({ ...prev, extremidades: e.target.value }))}
                          placeholder="Normal, sin edema, buena perfusión"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diagnóstico y Tratamiento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="diagnostico">Diagnóstico Clínico Provisional</Label>
                    <Textarea
                      id="diagnostico"
                      value={formData.diagnostico}
                      onChange={(e) => setFormData(prev => ({ ...prev, diagnostico: e.target.value }))}
                      placeholder="Diagnóstico médico"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tratamiento">Indicaciones</Label>
                    <Textarea
                      id="tratamiento"
                      value={formData.tratamiento}
                      onChange={(e) => setFormData(prev => ({ ...prev, tratamiento: e.target.value }))}
                      placeholder="Tratamiento e indicaciones"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Subida de Imágenes */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="imagenes" className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Imágenes de la Consulta
                    </Label>
                    <p className="text-sm text-gray-600 mb-2">
                      Puedes agregar hasta 10 imágenes (JPG, PNG, GIF, WEBP - máximo 5MB cada una)
                    </p>
                    <Input
                      id="imagenes"
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                      multiple
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                  </div>

                  {/* Vista previa de imágenes */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={submitting} className="bg-purple-600 hover:bg-purple-700">
                    {submitting ? "Guardando..." : "Guardar Consulta"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href={`/consultas/${pacienteId}`}>
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
