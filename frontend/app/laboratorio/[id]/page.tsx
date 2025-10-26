"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, FileText, ImageIcon, Loader2, Trash2 } from "lucide-react"
import Link from "next/link"
// Removed date-fns imports to avoid module resolution issues
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Resultado {
  id: string
  paciente_id: string
  tipo_examen: string
  fecha_examen: string
  resultados?: string
  valores_referencia?: string
  observaciones?: string
  archivo_nombre?: string
  archivo_contenido?: string
  archivo_tipo?: string
  estado: string
  laboratorio?: string
  paciente_nombre?: string
  numero_registro_medico?: string
  fecha_nacimiento?: string
  sexo?: string
  created_at: string
}

export default function ResultadoDetalladoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const cargarResultado = async () => {
      try {
        console.log("Cargando resultado:", id)
        const response = await fetch(`/api/laboratorio/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        })

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/auth/login')
            return
          }
          if (response.status === 404) {
            setError("Resultado no encontrado")
            return
          }
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        console.log("Resultado cargado:", data)
        setResultado(data)
      } catch (error: any) {
        console.error("Error cargando resultado:", error)
        setError(error.message || "Error al cargar resultado")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      cargarResultado()
    }
  }, [id, router])

  const descargarArchivo = () => {
    if (!resultado?.archivo_contenido || !resultado.archivo_nombre) return

    // Crear un enlace temporal para descargar
    const link = document.createElement('a')
    link.href = resultado.archivo_contenido
    link.download = resultado.archivo_nombre
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const eliminarResultado = async () => {
    if (!id) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/laboratorio/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error("Error al eliminar resultado")
      }

      router.push('/laboratorio')
    } catch (error: any) {
      console.error("Error eliminando resultado:", error)
      alert("Error al eliminar resultado: " + error.message)
    } finally {
      setDeleting(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    const colores = {
      pendiente: "bg-yellow-100 text-yellow-800 border-yellow-200",
      completado: "bg-green-100 text-green-800 border-green-200",
      revisado: "bg-blue-100 text-blue-800 border-blue-200"
    }
    return colores[estado as keyof typeof colores] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Cargando resultado...</span>
        </div>
      </div>
    )
  }

  if (error || !resultado) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Link href="/laboratorio">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded">
          <h3 className="font-semibold">Error</h3>
          <p>{error || "Resultado no encontrado"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header con acciones */}
      <div className="flex justify-between items-center">
        <Link href="/laboratorio">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div className="flex gap-2">
          {resultado.archivo_contenido && (
            <Button variant="outline" size="sm" onClick={descargarArchivo}>
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={deleting}>
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? "Eliminando..." : "Eliminar"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente este resultado de laboratorio.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={eliminarResultado}>Eliminar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Información del paciente */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Resultado de Laboratorio</CardTitle>
              <CardDescription className="mt-2">
                <span className="font-medium">{resultado.paciente_nombre || "Paciente sin nombre"}</span>
                <br />
                Registro Médico: {resultado.numero_registro_medico || "N/A"}
              </CardDescription>
            </div>
            <Badge className={getEstadoBadge(resultado.estado)}>
              {resultado.estado.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tipo de Examen</p>
              <p className="text-base">{resultado.tipo_examen}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha de Examen</p>
              <p className="text-base">
                {resultado.fecha_examen ? new Date(resultado.fecha_examen).toLocaleDateString("es-GT", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                }) : "N/A"}
              </p>
            </div>
            {resultado.laboratorio && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Laboratorio</p>
                <p className="text-base">{resultado.laboratorio}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha de Registro</p>
              <p className="text-base">
                {new Date(resultado.created_at).toLocaleString("es-GT", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </p>
            </div>
          </div>

          {resultado.resultados && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Resultados</p>
                <p className="text-base whitespace-pre-wrap">{resultado.resultados}</p>
              </div>
            </>
          )}

          {resultado.valores_referencia && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Valores de Referencia</p>
                <p className="text-base whitespace-pre-wrap">{resultado.valores_referencia}</p>
              </div>
            </>
          )}

          {resultado.observaciones && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Observaciones</p>
                <p className="text-base whitespace-pre-wrap">{resultado.observaciones}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Visor de archivo */}
      {resultado.archivo_contenido && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {resultado.archivo_tipo?.startsWith('image/') ? (
                <ImageIcon className="h-5 w-5" />
              ) : (
                <FileText className="h-5 w-5" />
              )}
              Archivo Adjunto
            </CardTitle>
            <CardDescription>{resultado.archivo_nombre}</CardDescription>
          </CardHeader>
          <CardContent>
            {resultado.archivo_tipo?.startsWith('image/') ? (
              <div className="flex justify-center">
                <img
                  src={resultado.archivo_contenido}
                  alt={resultado.archivo_nombre}
                  className="max-w-full h-auto rounded-lg border shadow-lg"
                  style={{ maxHeight: '800px' }}
                />
              </div>
            ) : resultado.archivo_tipo === 'application/pdf' ? (
              <div className="w-full" style={{ height: '800px' }}>
                <iframe
                  src={resultado.archivo_contenido}
                  className="w-full h-full border rounded-lg"
                  title={resultado.archivo_nombre}
                />
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <p>Tipo de archivo no soportado para visualización</p>
                <Button variant="outline" className="mt-4" onClick={descargarArchivo}>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Archivo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
