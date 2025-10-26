"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Search, Plus, Eye, Edit, Calendar, Phone, MapPin, Filter, Home } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { Sidebar } from "@/components/dashboard/sidebar"
import { LoadingAscanFullScreen } from "@/components/ui/loading-ascan"

interface Paciente {
  id_paciente: string
  nombres: string
  apellidos: string
  telefono?: string
  correo_electronico?: string
  direccion?: string
  fecha_nacimiento: string
  sexo: string
  estado_civil?: string
  numero_registro_medico: string
  ocupacion?: string
  dpi?: string
  lugar_nacimiento?: string
  raza?: string
  conyuge?: string
  padre_madre?: string
  lugar_trabajo?: string
  nombre_responsable?: string
  telefono_responsable?: string
}

function PacientesPageContent() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [pacientesFiltrados, setPacientesFiltrados] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadPacientes()
  }, [])

  useEffect(() => {
    // Filtrar pacientes basado en el término de búsqueda
    if (!searchTerm.trim()) {
      setPacientesFiltrados(pacientes)
    } else {
      const filtered = pacientes.filter(paciente =>
        `${paciente.nombres} ${paciente.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paciente.numero_registro_medico.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (paciente.telefono && paciente.telefono.includes(searchTerm)) ||
        (paciente.dpi && paciente.dpi.includes(searchTerm))
      )
      setPacientesFiltrados(filtered)
    }
  }, [pacientes, searchTerm])

  const loadPacientes = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getPacientes()
      const data = (response.data as any)?.pacientes || []
      setPacientes(data)
      setPacientesFiltrados(data)
    } catch (error) {
      console.error("Error cargando pacientes:", error)
      setError("Error al cargar los pacientes")
    } finally {
      setLoading(false)
    }
  }

  const calcularEdad = (fechaNacimiento: string | null | undefined) => {
    if (!fechaNacimiento) return "N/A"
    
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    
    if (isNaN(nacimiento.getTime())) return "N/A"
    
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }
    
    return edad
  }


  if (loading) {
    return (
      <LoadingAscanFullScreen text="Cargando pacientes..." />
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-destructive">Error: {error}</p>
                <Button onClick={loadPacientes} className="mt-4">
                  Reintentar
                </Button>
              </CardContent>
            </Card>
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
                <Users className="h-6 w-6 text-gray-600" />
                <h1 className="text-xl font-semibold text-gray-900">Gestión de Pacientes</h1>
              </div>
              <div className="flex items-center space-x-3">
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href="/pacientes/registrar">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Paciente
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Section */}
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-white to-blue-50 border-blue-200 shadow-md">
              <CardContent className="p-6">
                <div className="flex gap-4 items-center">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                    <Input 
                      placeholder="Buscar por nombre, registro médico o teléfono..." 
                      className="pl-12 h-12 text-lg border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" onClick={() => setSearchTerm("")} className="h-12 px-6 border-blue-300 text-blue-600 hover:bg-blue-50">
                    <Filter className="h-4 w-4 mr-2" />
                    Limpiar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patients List */}
          {pacientes && pacientes.length > 0 ? (
            <div className="space-y-4">
              {/* Información de resultados */}
              {(searchTerm) && (
                <div className="text-sm text-muted-foreground">
                  Mostrando {pacientesFiltrados.length} de {pacientes.length} pacientes
                </div>
              )}
              
              <div className="grid gap-6">
                {pacientesFiltrados.map((paciente) => (
                  <Card key={paciente.id_paciente} className="border-blue-200 hover:shadow-lg transition-all duration-300 hover:border-blue-300 bg-gradient-to-r from-white to-blue-50/30">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-4 flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                              <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <CardTitle className="text-xl text-gray-800 mb-1">
                                {paciente.nombres} {paciente.apellidos}
                              </CardTitle>
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                                {paciente.numero_registro_medico}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="bg-green-100 p-2 rounded-lg">
                                <Calendar className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">{calcularEdad(paciente.fecha_nacimiento)} años</span>
                                <p className="text-gray-500 text-xs">Edad</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-sm">
                              <div className={`p-2 rounded-lg ${
                                paciente.sexo === "masculino" 
                                  ? "bg-blue-100" 
                                  : paciente.sexo === "femenino"
                                  ? "bg-pink-100"
                                  : "bg-purple-100"
                              }`}>
                                <span className={`font-bold text-lg ${
                                  paciente.sexo === "masculino" 
                                    ? "text-blue-600" 
                                    : paciente.sexo === "femenino"
                                    ? "text-pink-600"
                                    : "text-purple-600"
                                }`}>
                                  {paciente.sexo === "masculino" ? "♂" : paciente.sexo === "femenino" ? "♀" : "⚧"}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">
                                  {paciente.sexo === "masculino" ? "Masculino" : paciente.sexo === "femenino" ? "Femenino" : "Otro"}
                                </span>
                                <p className="text-gray-500 text-xs">Sexo</p>
                              </div>
                            </div>
                            
                            {paciente.telefono && (
                              <div className="flex items-center space-x-2 text-sm">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                  <Phone className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">{paciente.telefono}</span>
                                  <p className="text-gray-500 text-xs">Teléfono</p>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {paciente.estado_civil && (
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="bg-purple-100 p-2 rounded-lg">
                                <span className="text-purple-600 font-bold">💍</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">{paciente.estado_civil}</span>
                                <p className="text-gray-500 text-xs">Estado Civil</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col space-y-2 ml-6">
                          <Button asChild variant="outline" size="sm" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                            <Link href={`/pacientes/${paciente.id_paciente}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? "No se encontraron pacientes" : "No hay pacientes registrados"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? "Intenta con otros términos de búsqueda"
                    : "Comienza registrando tu primer paciente"
                  }
                </p>
                {!searchTerm && (
                  <Button asChild>
                    <Link href="/pacientes/registrar">
                      <Plus className="h-4 w-4 mr-2" />
                      Registrar Primer Paciente
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}

export default function PacientesPage() {
  return (
    <ProtectedRoute requiredRoles={['administrador', 'medico', 'enfermera', 'recepcionista', 'laboratorio', 'ultrasonido']}>
      <PacientesPageContent />
    </ProtectedRoute>
  )
}