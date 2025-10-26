"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, ImageIcon, X, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Paciente {
  id_paciente: string
  nombres: string
  apellidos: string
  numero_registro_medico: string
}

interface SubirResultadoFormProps {
  pacientes: Paciente[]
}

export function SubirResultadoForm({ pacientes }: SubirResultadoFormProps) {
  const [formData, setFormData] = useState({
    paciente_id: "",
    tipo_examen: "",
    fecha_solicitud: "",
    fecha_resultado: "",
    resultados: "",
    valores_referencia: "",
    observaciones: "",
  })

  const [archivo, setArchivo] = useState<File | null>(null)
  const [archivoPreview, setArchivoPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if (!allowedTypes.includes(file.type)) {
      setError("Solo se permiten archivos PDF, JPG, JPEG y PNG")
      return
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("El archivo no puede ser mayor a 10MB")
      return
    }

    setArchivo(file)
    setError(null)

    // Crear preview para imágenes
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setArchivoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setArchivoPreview(null)
    }
  }

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      console.log("=== Enviando resultado de laboratorio ===")
      
      let archivoBase64 = null
      let archivoNombre = null
      let archivoTipo = null

      // Convertir archivo a base64 si existe
      if (archivo) {
        console.log("Convirtiendo archivo a base64...")
        archivoBase64 = await convertFileToBase64(archivo)
        archivoNombre = archivo.name
        archivoTipo = archivo.type
        console.log("Archivo convertido:", { archivoNombre, archivoTipo, tamaño: archivoBase64.length })
      }

      const payload = {
        ...formData,
        archivo_base64: archivoBase64,
        archivo_nombre: archivoNombre,
        archivo_tipo: archivoTipo,
        fecha_examen: formData.fecha_solicitud, // Usar fecha_solicitud como fecha_examen
        estado: formData.fecha_resultado ? 'completado' : 'pendiente'
      }

      console.log("Enviando payload:", { ...payload, archivo_base64: archivoBase64 ? `[${archivoBase64.length} caracteres]` : null })

      // Enviar a la API
      const response = await fetch('/api/laboratorio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      console.log("Respuesta recibida:", response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error en respuesta:", errorData)
        throw new Error(errorData.error || errorData.details || "Error al guardar el resultado")
      }

      const data = await response.json()
      console.log("Resultado creado exitosamente:", data)

      // Redirigir a la página de detalles
      router.push(`/laboratorio/${data.id}`)
    } catch (error: any) {
      console.error("Error al enviar:", error)
      setError(error.message || "Error al guardar el resultado")
    } finally {
      setIsLoading(false)
    }
  }

  const removeFile = () => {
    setArchivo(null)
    setArchivoPreview(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nuevo Resultado de Laboratorio</CardTitle>
        <CardDescription>Completa la información y adjunta el archivo del resultado</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="paciente">Paciente *</Label>
              <Select
                value={formData.paciente_id}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, paciente_id: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar paciente" />
                </SelectTrigger>
                <SelectContent>
                  {pacientes.map((paciente) => (
                    <SelectItem key={paciente.id_paciente} value={paciente.id_paciente}>
                      {paciente.nombres} {paciente.apellidos} - {paciente.numero_registro_medico}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_examen">Tipo de Examen *</Label>
              <Input
                id="tipo_examen"
                value={formData.tipo_examen}
                onChange={(e) => setFormData((prev) => ({ ...prev, tipo_examen: e.target.value }))}
                placeholder="Ej: Hemograma completo, Química sanguínea"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_solicitud">Fecha de Solicitud *</Label>
              <Input
                id="fecha_solicitud"
                type="date"
                value={formData.fecha_solicitud}
                onChange={(e) => setFormData((prev) => ({ ...prev, fecha_solicitud: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_resultado">Fecha de Resultado</Label>
              <Input
                id="fecha_resultado"
                type="date"
                value={formData.fecha_resultado}
                onChange={(e) => setFormData((prev) => ({ ...prev, fecha_resultado: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resultados">Resultados</Label>
            <Textarea
              id="resultados"
              value={formData.resultados}
              onChange={(e) => setFormData((prev) => ({ ...prev, resultados: e.target.value }))}
              placeholder="Descripción de los resultados obtenidos"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valores_referencia">Valores de Referencia</Label>
            <Textarea
              id="valores_referencia"
              value={formData.valores_referencia}
              onChange={(e) => setFormData((prev) => ({ ...prev, valores_referencia: e.target.value }))}
              placeholder="Valores normales de referencia para este examen"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => setFormData((prev) => ({ ...prev, observaciones: e.target.value }))}
              placeholder="Observaciones adicionales o comentarios médicos"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <Label>Archivo del Resultado</Label>

            {!archivo ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Label htmlFor="archivo" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">Subir archivo</span>
                    <span className="mt-1 block text-sm text-gray-500">PDF, JPG, JPEG, PNG hasta 10MB</span>
                  </Label>
                  <Input
                    id="archivo"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            ) : (
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {archivo.type.startsWith("image/") ? (
                      <ImageIcon className="h-8 w-8 text-blue-500" />
                    ) : (
                      <FileText className="h-8 w-8 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">{archivo.name}</p>
                      <p className="text-sm text-gray-500">{(archivo.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={removeFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {archivoPreview && (
                  <div className="mt-4">
                    <img
                      src={archivoPreview || "/placeholder.svg"}
                      alt="Preview"
                      className="max-w-full h-48 object-contain border rounded"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar Resultado"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
