"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Download, FileText, Loader2, Calendar, Users, Activity, TestTube } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiRequest } from "@/lib/api-config"

export default function ReportesPageClient() {
  const { toast } = useToast()
  const [tipoReporte, setTipoReporte] = useState("pacientes")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [loading, setLoading] = useState(false)
  const [reporte, setReporte] = useState<any>(null)

  const generarReporte = async () => {
    if (!tipoReporte) {
      toast({
        title: "Error",
        description: "Selecciona un tipo de reporte",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({
        tipo: tipoReporte,
        ...(fechaInicio && { fecha_inicio: fechaInicio }),
        ...(fechaFin && { fecha_fin: fechaFin })
      })

      const response = await apiRequest(`/api/reportes?${params}`, {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error("Error al generar reporte")
      }

      const data = await response.json()
      setReporte(data)

      toast({
        title: "Reporte generado",
        description: "El reporte se ha generado exitosamente",
      })
    } catch (error: any) {
      console.error("Error generando reporte:", error)
      toast({
        title: "Error",
        description: error.message || "Error al generar reporte",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const exportarCSV = async () => {
    if (!tipoReporte) {
      toast({
        title: "Error",
        description: "Selecciona un tipo de reporte",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({
        tipo: tipoReporte,
        formato: 'csv',
        ...(fechaInicio && { fecha_inicio: fechaInicio }),
        ...(fechaFin && { fecha_fin: fechaFin })
      })

      const response = await apiRequest(`/api/reportes?${params}`, {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error("Error al exportar reporte")
      }

      // Descargar el archivo CSV
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte_${tipoReporte}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Reporte exportado",
        description: "El archivo CSV se ha descargado exitosamente",
      })
    } catch (error: any) {
      console.error("Error exportando reporte:", error)
      toast({
        title: "Error",
        description: error.message || "Error al exportar reporte",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const tiposReporte = [
    { value: "usuarios", label: "Reporte de Usuarios", icon: Users, color: "text-orange-600" },
    { value: "pacientes", label: "Reporte de Pacientes", icon: Users, color: "text-blue-600" },
    { value: "consultas", label: "Reporte de Consultas", icon: Calendar, color: "text-green-600" },
    { value: "citas", label: "Reporte de Citas", icon: Calendar, color: "text-cyan-600" },
    { value: "laboratorio", label: "Reporte de Laboratorio", icon: TestTube, color: "text-purple-600" },
    { value: "actividad", label: "Reporte de Actividad", icon: Activity, color: "text-indigo-600" },
    { value: "ejecutivo", label: "Reporte Ejecutivo", icon: BarChart3, color: "text-red-600" },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reportes y Estadísticas</h1>
          <p className="text-muted-foreground mt-1">Genera y exporta reportes del sistema</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/administracion">Volver</Link>
        </Button>
      </div>

      {/* Tipos de Reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {tiposReporte.map((tipo) => {
          const Icon = tipo.icon
          return (
            <Card
              key={tipo.value}
              className={`cursor-pointer transition-all ${
                tipoReporte === tipo.value
                  ? "border-primary shadow-md"
                  : "hover:shadow-md"
              }`}
              onClick={() => setTipoReporte(tipo.value)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-2">
                  <Icon className={`h-8 w-8 ${tipo.color}`} />
                  <p className="text-sm font-medium">{tipo.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Parámetros</CardTitle>
          <CardDescription>Configura los filtros para generar el reporte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
              <Input
                id="fecha_inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_fin">Fecha de Fin</Label>
              <Input
                id="fecha_fin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={exportarCSV} disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button onClick={generarReporte} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generar Reporte
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {reporte && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados del Reporte</CardTitle>
            <CardDescription>
              Generado el {new Date(reporte.fecha_generacion).toLocaleString('es-ES')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Estadísticas */}
            {reporte.estadisticas && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Estadísticas Generales</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {Object.entries(reporte.estadisticas).map(([key, value]) => (
                    <Card key={key}>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-primary">{String(value)}</div>
                        <p className="text-sm text-muted-foreground capitalize">
                          {key.replace(/_/g, ' ')}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Resumen Ejecutivo */}
            {reporte.resumen && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Resumen Ejecutivo</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(reporte.resumen).map(([key, value]) => (
                    <Card key={key}>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-primary">{String(value)}</div>
                        <p className="text-sm text-muted-foreground capitalize">
                          {key.replace(/_/g, ' ')}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Datos */}
            {reporte.datos && reporte.datos.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Datos Detallados ({reporte.datos.length} registros)
                </h3>
                <div className="bg-muted p-4 rounded-lg max-h-96 overflow-auto">
                  <pre className="text-xs">
                    {JSON.stringify(reporte.datos.slice(0, 10), null, 2)}
                  </pre>
                  {reporte.datos.length > 10 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      ... y {reporte.datos.length - 10} registros más. Exporta a CSV para ver todos los datos.
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

