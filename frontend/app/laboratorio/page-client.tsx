"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Microscope, 
  Plus, 
  Search, 
  FileText, 
  Download, 
  Calendar,
  User,
  Filter
} from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { LoadingAscanFullScreen } from "@/components/ui/loading-ascan"

interface Laboratorio {
  id: string
  paciente_id: string
  tipo_examen: string
  fecha_examen: string
  resultados: string
  observaciones: string
  archivo_nombre: string | null
  archivo_contenido: string | null
  archivo_tipo: string | null
  nombres: string
  apellidos: string
  telefono: string
  correo_electronico: string
  estado: string
  created_at: string
}

export default function LaboratorioPageClient() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const pacienteId = searchParams.get("paciente_id")
  
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTipo, setFilterTipo] = useState("")

  // Verificar que solo personal médico pueda acceder
  const tieneAcceso = user?.rol === 'medico' || user?.rol === 'enfermera' || user?.rol === 'administrador'

  useEffect(() => {
    if (!tieneAcceso) return

    const cargarLaboratorios = async () => {
      try {
        setLoading(true)
        const params = pacienteId ? `?paciente_id=${pacienteId}` : ""
        const result = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/laboratorio${params}`, {
          credentials: 'include'
        })
        const data = await result.json()
        
        if (!result.ok) {
          setError(`Error del servidor: ${result.status} ${result.statusText}`)
          return
        }
        
        if (data.error) {
          setError(data.error)
          return
        }
        
        setLaboratorios(Array.isArray(data.laboratorios) ? data.laboratorios : [])
      } catch (error) {
        console.error("Error cargando laboratorios:", error)
        setError("Error al cargar los resultados de laboratorio")
      } finally {
        setLoading(false)
      }
    }

    cargarLaboratorios()
  }, [tieneAcceso, pacienteId])

  // Filtrar laboratorios
  const laboratoriosFiltrados = laboratorios.filter(lab => {
    const matchesSearch = searchTerm === "" || 
      lab.tipo_examen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${lab.nombres} ${lab.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterTipo === "" || lab.tipo_examen === filterTipo
    
    return matchesSearch && matchesFilter
  })

  // Obtener tipos únicos de exámenes
  const tiposExamen = Array.from(new Set(laboratorios.map(lab => lab.tipo_examen)))

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-GT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
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
              Solo el personal médico puede acceder a los resultados de laboratorio.
            </p>
            <Button asChild>
              <Link href="/dashboard">Volver al Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <LoadingAscanFullScreen text="Cargando resultados de laboratorio..." />
    )
  }

  if (error && laboratorios.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar laboratorios</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <Button 
              onClick={() => {
                setError(null)
                setLoading(true)
                // Recargar la página
                window.location.reload()
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Reintentar
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Volver al Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Sidebar />
        <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Microscope className="h-6 w-6" />
                  Resultados de Laboratorio
                </h1>
                {pacienteId && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Filtrado por paciente
                  </Badge>
                )}
              </div>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href={`/laboratorio/nuevo${pacienteId ? `?paciente_id=${pacienteId}` : ''}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Resultado
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filtros */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="search">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Buscar por tipo de examen o paciente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="filter-tipo">Tipo de Examen</Label>
                  <select
                    id="filter-tipo"
                    value={filterTipo}
                    onChange={(e) => setFilterTipo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos los tipos</option>
                    {tiposExamen.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Laboratorios */}
          <div className="space-y-4">
            {laboratoriosFiltrados.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Microscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || filterTipo ? "No se encontraron resultados" : "No hay resultados de laboratorio"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || filterTipo 
                      ? "Intenta ajustar los filtros de búsqueda"
                      : "Comienza agregando el primer resultado de laboratorio"
                    }
                  </p>
                  <Button asChild>
                    <Link href={`/laboratorio/nuevo${pacienteId ? `?paciente_id=${pacienteId}` : ''}`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Resultado
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              laboratoriosFiltrados.map((laboratorio) => (
                <Card key={laboratorio.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {laboratorio.tipo_examen}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className={
                              laboratorio.estado === 'completado' 
                                ? "bg-green-50 text-green-700 border-green-200"
                                : laboratorio.estado === 'pendiente'
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }
                          >
                            {laboratorio.estado === 'completado' ? 'Completado' : 
                             laboratorio.estado === 'pendiente' ? 'Pendiente' : 
                             laboratorio.estado === 'revisado' ? 'Revisado' : 'Completado'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="h-4 w-4" />
                            <span>{laboratorio.nombres} {laboratorio.apellidos}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>{formatearFecha(laboratorio.fecha_examen)}</span>
                          </div>
                        </div>

                        {laboratorio.resultados && (
                          <div className="mb-3">
                            <Label className="text-sm font-medium text-gray-700">Resultados:</Label>
                            <p className="text-sm text-gray-600 mt-1">{laboratorio.resultados}</p>
                          </div>
                        )}

                        {laboratorio.observaciones && (
                          <div className="mb-3">
                            <Label className="text-sm font-medium text-gray-700">Observaciones:</Label>
                            <p className="text-sm text-gray-600 mt-1">{laboratorio.observaciones}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {laboratorio.archivo_nombre && laboratorio.archivo_contenido && (
                          <div className="flex flex-col gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                              className="flex items-center gap-2"
                            >
                              <a 
                                href={laboratorio.archivo_contenido} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <Download className="h-4 w-4" />
                                Ver Archivo
                              </a>
                            </Button>
                            <span className="text-xs text-gray-500 text-center">
                              {laboratorio.archivo_nombre}
                            </span>
                          </div>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <Link href={`/laboratorio/${laboratorio.id}`}>
                            <FileText className="h-4 w-4 mr-2" />
                            Ver Detalles
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

        </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}