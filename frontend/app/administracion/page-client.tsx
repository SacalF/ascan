"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, Shield, BarChart3, Activity, AlertTriangle, Loader2 } from "lucide-react"
import Link from "next/link"
import { apiRequest } from "@/lib/api-config"
import { LoadingAscanCard } from "@/components/ui/loading-ascan"

interface Usuario {
  id: string
  email: string
  nombres: string
  apellidos: string
  rol: string
  estado: string
  ultimo_acceso?: string
}

interface Paciente {
  id_paciente: string
  nombres: string
  apellidos: string
}

interface Stats {
  total_pacientes: number
  total_usuarios: number
  total_laboratorios: number
  usuarios_inactivos: number
}

export default function AdministracionPage() {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [stats, setStats] = useState<Stats>({
    total_pacientes: 0,
    total_usuarios: 0,
    total_laboratorios: 0,
    usuarios_inactivos: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true)
        setError(null)

        // Cargar usuarios
        const responseUsuarios = await apiRequest("/api/users", {
          method: "GET",
        })

        if (!responseUsuarios.ok) {
          if (responseUsuarios.status === 403) {
            router.push("/dashboard")
            return
          }
          throw new Error(`Error ${responseUsuarios.status}: ${responseUsuarios.statusText}`)
        }

        const dataUsuarios = await responseUsuarios.json()
        const usuariosData = dataUsuarios.usuarios || []
        setUsuarios(usuariosData)

        // Cargar pacientes
        const responsePacientes = await apiRequest("/api/pacientes", {
          method: "GET",
        })

        let pacientesData = []
        if (responsePacientes.ok) {
          const dataPacientes = await responsePacientes.json()
          pacientesData = (dataPacientes as any)?.pacientes || []
          setPacientes(pacientesData)
        }

        // Cargar resultados de laboratorio
        const responseLaboratorio = await apiRequest("/api/laboratorio", {
          method: "GET",
        })

        let laboratorioData = []
        if (responseLaboratorio.ok) {
          const dataLaboratorio = await responseLaboratorio.json()
          console.log("🔬 Datos de laboratorio recibidos:", dataLaboratorio)
          // El endpoint devuelve { laboratorios: [...] }
          laboratorioData = Array.isArray(dataLaboratorio.laboratorios) ? dataLaboratorio.laboratorios : []
        } else {
          console.error("❌ Error cargando laboratorio:", responseLaboratorio.status, responseLaboratorio.statusText)
          // Fallback: usar citas si laboratorio falla
          const responseCitas = await apiRequest("/api/citas", { method: "GET" })
          if (responseCitas.ok) {
            const dataCitas = await responseCitas.json()
            laboratorioData = Array.isArray(dataCitas) ? dataCitas : []
            console.log("📅 Usando citas como fallback:", laboratorioData.length)
          }
        }

        // Calcular estadísticas con los datos cargados
        const usuariosInactivos = usuariosData.filter(u => u.estado !== 'activo').length

        setStats({
          total_pacientes: pacientesData.length,
          total_usuarios: usuariosData.length,
          total_laboratorios: laboratorioData.length,
          usuarios_inactivos: usuariosInactivos
        })

      } catch (error) {
        console.error("Error cargando datos:", error)
        setError(error instanceof Error ? error.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [router])

  const getRoleBadgeColor = (rol: string) => {
    switch (rol) {
      case "administrador":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      case "medico":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "enfermera":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const conteoRoles = usuarios.reduce(
    (acc, user) => {
      acc[user.rol] = (acc[user.rol] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <LoadingAscanCard text="Cargando datos de administración..." />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded">
              <h3 className="font-semibold">Error</h3>
              <p>{error}</p>
            </div>
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
                <Shield className="h-6 w-6 text-gray-600" />
                <h1 className="text-xl font-semibold text-gray-900">Panel de Administración</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <p className="text-gray-600">Gestión de usuarios, roles y reportes del sistema</p>
          </div>

          {/* Estadísticas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="border-blue-200 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-blue-50/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Total Pacientes</CardTitle>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.total_pacientes}</div>
                <p className="text-xs text-gray-600">
                  Pacientes registrados en el sistema
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-green-50/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Total Usuarios</CardTitle>
                <div className="bg-green-100 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.total_usuarios}</div>
                <p className="text-xs text-gray-600">
                  Usuarios en el sistema
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-800">Total de Laboratorios</CardTitle>
                <div className="bg-purple-100 p-2 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{stats.total_laboratorios || 0}</div>
                <p className="text-xs text-gray-600">
                  Resultados de laboratorio en el sistema
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Acciones de Administración */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-blue-200 bg-gradient-to-r from-white to-blue-50/30" onClick={() => router.push("/administracion/usuarios")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-blue-800">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  Gestión de Usuarios
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Administrar usuarios del sistema, crear, editar y asignar roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Gestionar Usuarios
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-green-200 bg-gradient-to-r from-white to-green-50/30" onClick={() => router.push("/administracion/roles")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-green-800">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  Gestión de Roles
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Configurar y asignar roles a los usuarios del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-green-300 text-green-600 hover:bg-green-50">
                  <Shield className="h-4 w-4 mr-2" />
                  Gestionar Roles
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-purple-200 bg-gradient-to-r from-white to-purple-50/30" onClick={() => router.push("/administracion/historial")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-purple-800">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                  </div>
                  Historial de Actividad
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Ver el historial de actividades y cambios en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-purple-300 text-purple-600 hover:bg-purple-50">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Ver Historial
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Distribución de Roles */}
          <Card className="border-orange-200 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-orange-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-orange-800">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                Distribución de Roles
              </CardTitle>
              <CardDescription className="text-gray-600">
                Resumen de usuarios por rol en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(conteoRoles).map(([rol, cantidad]) => (
                  <div key={rol} className="flex items-center justify-between p-4 bg-white border border-orange-100 rounded-lg hover:shadow-md transition-all duration-300">
                    <div className="flex items-center space-x-3">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <Shield className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="font-medium text-gray-800 capitalize">
                        {rol === 'administrador' ? 'Administradores' :
                         rol === 'medico' ? 'Médicos' :
                         rol === 'enfermera' ? 'Enfermeras' :
                         rol}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getRoleBadgeColor(rol)}>{cantidad}</Badge>
                      {rol === "sin_rol" && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}