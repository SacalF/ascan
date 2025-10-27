"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Plus, Filter, Home, CalendarDays, Eye, FileText } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { formatTime12, formatDateLong } from "@/lib/date-utils-simple"
import { LoadingAscanFullScreen } from "@/components/ui/loading-ascan"

interface Cita {
  id_cita: string
  fecha_hora: string
  paciente_nombre: string
  paciente_id: string | null
  motivo: string
  estado: "programada" | "confirmada" | "en_curso" | "completada" | "cancelada" | "no_asistio"
  medico_nombre: string
  medico_id: string
  created_at: string
}

function CitasContent() {
  const { user } = useAuth()
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargarCitas = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiClient.getCitas()
        console.log("=== RESULTADO API CITAS ===")
        console.log("Result completo:", result)
        console.log("Datos de citas:", result.data)
        
        if (result.data && Array.isArray((result.data as any).citas)) {
          console.log("Cantidad de citas:", (result.data as any).citas.length)
          ;(result.data as any).citas.forEach((cita: any, index: number) => {
            console.log(`Cita ${index + 1}:`, {
              id: cita.id_cita,
              fecha_hora: cita.fecha_hora,
              paciente: cita.paciente_nombre,
              motivo: cita.motivo,
              estado: cita.estado
            })
          })
          setCitas((result.data as any).citas)
        } else {
          setError("No se pudieron cargar las citas")
        }
      } catch (error) {
        console.error("Error cargando citas:", error)
        setError("Error al cargar las citas")
      } finally {
        setLoading(false)
      }
    }

    cargarCitas()
  }, [])

  const formatearHora = (fechaHora: string) => {
    return formatTime12(fechaHora)
  }

  const formatearFecha = (fechaHora: string) => {
    console.log("=== FORMATEANDO FECHA EN CITAS ===")
    console.log("Fecha original:", fechaHora)
    console.log("Tipo de fecha:", typeof fechaHora)
    
    // Si solo tenemos fecha (YYYY-MM-DD), agregar hora local para evitar UTC
    let fechaParaParsear = fechaHora
    if (fechaHora.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Es solo fecha, agregar hora local (12:00 PM) para evitar problemas de UTC
      fechaParaParsear = fechaHora + 'T12:00:00'
    } else if (fechaHora.includes(' ')) {
      // Es fecha con hora, convertir espacio a T
      fechaParaParsear = fechaHora.replace(' ', 'T')
    }
    
    const date = new Date(fechaParaParsear)
    console.log("Fecha para parsear:", fechaParaParsear)
    console.log("Fecha parseada:", date)
    console.log("Fecha ISO:", date.toISOString())
    console.log("Fecha local:", date.toString())
    console.log("Zona horaria:", Intl.DateTimeFormat().resolvedOptions().timeZone)
    
    // Usar formateo local para evitar problemas de zona horaria
    const resultado = date.toLocaleDateString('es', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    console.log("Resultado formateado:", resultado)
    console.log("=== FIN FORMATEO FECHA ===")
    
    return resultado
  }

  // Agrupar citas por fecha (usando zona horaria local)
  const citasPorFecha = citas.reduce((acc, cita) => {
    // Parsear fecha como local para evitar problemas de zona horaria
    let fechaParaParsear = cita.fecha_hora
    if (cita.fecha_hora.includes(' ')) {
      fechaParaParsear = cita.fecha_hora.replace(' ', 'T')
    }
    
    const date = new Date(fechaParaParsear)
    const fecha = date.toLocaleDateString('en-CA') // Formato YYYY-MM-DD
    if (!acc[fecha]) {
      acc[fecha] = []
    }
    acc[fecha].push(cita)
    return acc
  }, {} as Record<string, Cita[]>)

  if (loading) {
    return (
      <LoadingAscanFullScreen text="Cargando citas..." />
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Sidebar />
        <div className="flex-1 overflow-auto flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2 text-red-600">Error cargando citas</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Intentar de nuevo
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Calendar className="h-6 w-6 text-gray-600" />
                <h1 className="text-xl font-semibold text-gray-900">Gestión de Citas</h1>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" asChild className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  <Link href="/citas/horario-diario">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Horario Diario
                  </Link>
                </Button>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href="/agendar-cita">
                    <Plus className="h-4 w-4 mr-2" />
                    Agendar Cita
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {Object.keys(citasPorFecha).length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay citas programadas
                </h3>
                <p className="text-gray-600 mb-4">
                  No se encontraron citas en el sistema.
                </p>
                <Button asChild>
                  <Link href="/agendar-cita">
                    <Plus className="h-4 w-4 mr-2" />
                    Agendar Primera Cita
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            Object.entries(citasPorFecha)
              .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
              .map(([fecha, citasDelDia]) => (
                <Card key={fecha} className="mb-6 border-blue-200 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-blue-50/30">
                  <CardHeader className="bg-blue-50 border-b border-blue-200">
                    <CardTitle className="flex items-center gap-3 text-blue-800">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="text-lg font-bold">{formatearFecha(fecha)}</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                        {citasDelDia.length} {citasDelDia.length === 1 ? 'cita' : 'citas'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {citasDelDia.map((cita) => (
                        <div
                          key={cita.id_cita}
                          className="flex items-center justify-between p-4 bg-white border border-blue-100 rounded-lg hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex items-center space-x-6 flex-1">
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="bg-green-100 p-2 rounded-lg">
                                <Clock className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">{formatearHora(cita.fecha_hora)}</span>
                                <p className="text-gray-500 text-xs">Hora</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="bg-blue-100 p-2 rounded-lg">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">
                                  {cita.paciente_nombre || 'Paciente no asignado'}
                                </span>
                                <p className="text-gray-500 text-xs">Paciente</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="bg-purple-100 p-2 rounded-lg">
                                <FileText className="h-4 w-4 text-purple-600" />
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">{cita.motivo}</span>
                                <p className="text-gray-500 text-xs">Motivo</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Badge
                              className={
                                cita.estado === 'confirmada'
                                  ? 'bg-green-100 text-green-700 border-green-200'
                                  : cita.estado === 'completada'
                                  ? 'bg-blue-100 text-blue-700 border-blue-200'
                                  : cita.estado === 'cancelada'
                                  ? 'bg-red-100 text-red-700 border-red-200'
                                  : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                              }
                            >
                              {cita.estado}
                            </Badge>
                            <Button variant="outline" size="sm" asChild className="border-blue-300 text-blue-600 hover:bg-blue-50">
                              <Link href={`/citas/${cita.id_cita}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </main>
      </div>
    </div>
  )
}

export default function CitasPage() {
  return (
    <ProtectedRoute>
      <CitasContent />
    </ProtectedRoute>
  )
}