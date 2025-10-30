"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  FileText,
  Calendar,
  Activity,
  Plus,
  UserCheck,
  Stethoscope,
  BarChart3,
  FlaskConical,
  Clock,
  User,
  CalendarDays,
} from "lucide-react"
import Link from "next/link"
import AscanLogo from "@/components/ascan-logo"
import UMGLogo from "@/components/umg-logo"
// import { useAuth } from "@/hooks/use-auth"
import { formatDateLong } from "@/lib/date-utils-simple"
import { LoadingAscanFullScreen } from "@/components/ui/loading-ascan"

interface DashboardStats {
  totalPacientes: number
  totalCitas: number
  citasHoy: number
  totalLaboratorios: number
  pacientesRecientes: any[]
  citasRecientes: any[]
  citasPendientes: number
}

export default function DashboardPageClient() {
  // const { user } = useAuth()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalPacientes: 0,
    totalCitas: 0,
    citasHoy: 0,
    totalLaboratorios: 0,
    pacientesRecientes: [],
    citasRecientes: [],
    citasPendientes: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    cargarUsuario()
    cargarDatosDashboard()
  }, [])

  const cargarUsuario = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        throw new Error(`Error de autenticación: ${response.status}`)
      }
      
      const data = await response.json()
      if (data && data.user) {
        setUser(data.user)
        console.log('✅ Usuario cargado:', data.user.nombres)
      }
    } catch (error) {
      console.error("❌ Error cargando usuario:", error)
      // No establecer error aquí para no bloquear el dashboard
    }
  }

  const cargarDatosDashboard = async () => {
    try {
      setLoading(true)
      setError(null)

      // Determinar la URL base de la API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      console.log('🔗 Usando API URL:', apiUrl)

      // Cargar estadísticas generales con mejor manejo de errores
      const [pacientesResponse, citasResponse, laboratoriosResponse] = await Promise.all([
        fetch(`${apiUrl}/api/pacientes`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        }),
        fetch(`${apiUrl}/api/citas`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        }),
        fetch(`${apiUrl}/api/laboratorio`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        }),
      ])

      // Verificar si las respuestas son exitosas
      if (!pacientesResponse.ok) {
        throw new Error(`Error al cargar pacientes: ${pacientesResponse.status} ${pacientesResponse.statusText}`)
      }
      if (!citasResponse.ok) {
        throw new Error(`Error al cargar citas: ${citasResponse.status} ${citasResponse.statusText}`)
      }
      if (!laboratoriosResponse.ok) {
        throw new Error(`Error al cargar laboratorios: ${laboratoriosResponse.status} ${laboratoriosResponse.statusText}`)
      }

      const pacientesData = await pacientesResponse.json()
      const citasData = await citasResponse.json()
      const laboratoriosData = await laboratoriosResponse.json()

      console.log('📊 Respuestas de la API:', {
        pacientes: pacientesData,
        citas: citasData,
        laboratorios: laboratoriosData
      })

      // Procesar datos
      const pacientes = Array.isArray(pacientesData.pacientes) ? pacientesData.pacientes : []
      const citas = Array.isArray(citasData) ? citasData : []
      const laboratorios = Array.isArray(laboratoriosData.laboratorios) ? laboratoriosData.laboratorios : []
      
      console.log("📊 Datos del dashboard:", {
        pacientes: pacientes.length,
        citas: citas.length,
        laboratorios: laboratorios.length,
        estructuraCitas: citasData,
        estructuraPacientes: pacientesData
      })

      // Calcular estadísticas
      const hoy = new Date().toISOString().split('T')[0]
      const citasHoy = citas.filter((cita: any) => 
        cita.fecha_hora && cita.fecha_hora.split(' ')[0] === hoy
      ).length

      const citasPendientes = citas.filter((cita: any) => 
        cita.estado === 'programada' || cita.estado === 'confirmada'
      ).length

      // Obtener pacientes recientes (últimos 5)
      const pacientesRecientes = pacientes
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)

      // Obtener citas recientes (próximas 5 citas)
      const citasRecientes = citas
        .filter((cita: any) => cita.fecha_hora && new Date(cita.fecha_hora) >= new Date())
        .sort((a: any, b: any) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime())
        .slice(0, 5)
        
      console.log("📅 Citas recientes procesadas:", citasRecientes.length, citasRecientes)

      setStats({
        totalPacientes: pacientes.length,
        totalCitas: citas.length,
        citasHoy,
        totalLaboratorios: laboratorios.length,
        pacientesRecientes,
        citasRecientes,
        citasPendientes,
      })

    } catch (error) {
      console.error("❌ Error cargando datos del dashboard:", error)
      
      // Determinar el tipo de error y mostrar mensaje específico
      let errorMessage = "Error al cargar los datos del dashboard"
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = "Error de conexión: No se puede conectar con el servidor. Verifica que el backend esté ejecutándose."
      } else if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage = "Error de autenticación: Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
        } else if (error.message.includes('403')) {
          errorMessage = "Error de permisos: No tienes acceso a esta información."
        } else if (error.message.includes('404')) {
          errorMessage = "Error: El servicio no está disponible. Contacta al administrador."
        } else if (error.message.includes('500')) {
          errorMessage = "Error del servidor: Hay un problema con el backend. Contacta al administrador."
        } else {
          errorMessage = `Error: ${error.message}`
        }
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const formatearFecha = (fecha: string) => {
    if (!fecha) return "Fecha no disponible"
    
    try {
      const fechaObj = new Date(fecha)
      if (isNaN(fechaObj.getTime())) {
        return "Fecha inválida"
      }
      
      // Para fechas de citas, mostrar fecha y hora
      if (fecha.includes('T') || fecha.includes(' ')) {
        return fechaObj.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      
      // Para fechas de registro, solo fecha
      return fechaObj.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch (error) {
      console.error("Error formateando fecha:", error, "Fecha original:", fecha)
      return "Error en fecha"
    }
  }

  const calcularEdad = (fechaNacimiento: string) => {
    if (!fechaNacimiento) return "N/A"
    
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }
    return edad
  }

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'programada':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmada':
        return 'bg-blue-100 text-blue-800'
      case 'completada':
        return 'bg-green-100 text-green-800'
      case 'cancelada':
        return 'bg-red-100 text-red-800'
      case 'no_asistio':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <LoadingAscanFullScreen text="Cargando dashboard..." />
    )
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center max-w-md">
            <div className="bg-red-50 border border-red-200 p-6 rounded-lg mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error en el Dashboard</h3>
              <p className="text-red-700 mb-4">{error}</p>
              
              {/* Información adicional de diagnóstico */}
              <div className="bg-red-100 p-3 rounded text-sm text-red-600 mb-4">
                <p className="font-medium mb-1">Información de diagnóstico:</p>
                <p>• URL de API: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}</p>
                <p>• Timestamp: {new Date().toLocaleString()}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button onClick={cargarDatosDashboard} variant="outline" className="w-full">
                🔄 Reintentar
              </Button>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                >
                  🔄 Recargar página
                </Button>
                <Button 
                  onClick={() => window.location.href = '/auth/login'} 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                >
                  🔐 Ir a login
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Simplificado */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <AscanLogo size={50} />
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                Bienvenido, {user?.nombres} {user?.apellidos}
              </h1>
              <p className="text-gray-600">
                {new Date().toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {user?.rol === 'administrador' ? 'Administrador' : 
               user?.rol === 'medico' ? 'Médico' : 
               user?.rol === 'enfermera' ? 'Enfermera' : 'Usuario'}
            </Badge>
            <UMGLogo size={55} showCopyright={false} />
          </div>
        </div>
      </div>

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-blue-200 bg-gradient-to-r from-white to-blue-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalPacientes}</div>
            <p className="text-xs text-muted-foreground">Pacientes registrados</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-r from-white to-green-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas Programadas</CardTitle>
            <div className="bg-green-100 p-2 rounded-lg">
              <Calendar className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.citasPendientes}</div>
            <p className="text-xs text-muted-foreground">Citas pendientes</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-r from-white to-orange-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
            <div className="bg-orange-100 p-2 rounded-lg">
              <CalendarDays className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.citasHoy}</div>
            <p className="text-xs text-muted-foreground">Citas de hoy</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-r from-white to-purple-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resultados Lab</CardTitle>
            <div className="bg-purple-100 p-2 rounded-lg">
              <FlaskConical className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalLaboratorios}</div>
            <p className="text-xs text-muted-foreground">Resultados subidos</p>
          </CardContent>
        </Card>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pacientes Recientes */}
        <Card className="border-blue-200 bg-gradient-to-r from-white to-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Pacientes Recientes</span>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/pacientes">Ver todos</Link>
              </Button>
            </CardTitle>
            <CardDescription>Últimos pacientes registrados en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.pacientesRecientes.length > 0 ? (
              <div className="space-y-4">
                {stats.pacientesRecientes.map((paciente: any) => (
                  <div key={paciente.id_paciente} className="flex items-center justify-between p-3 bg-white border border-blue-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {paciente.nombres} {paciente.apellidos}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{calcularEdad(paciente.fecha_nacimiento)} años</span>
                          <span>•</span>
                          <span>#{paciente.numero_registro_medico}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {formatearFecha(paciente.created_at)}
                      </Badge>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/pacientes/${paciente.id_paciente}`}>Ver</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No hay pacientes registrados</p>
                <Button asChild variant="outline">
                  <Link href="/pacientes">
                    <Plus className="h-4 w-4 mr-2" />
                    Ver Pacientes
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Citas Recientes */}
        <Card className="border-green-200 bg-gradient-to-r from-white to-green-50/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <span>Citas Recientes</span>
            </CardTitle>
            <CardDescription>Próximas citas y actividades médicas</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.citasRecientes.length > 0 ? (
              <div className="space-y-4">
                {stats.citasRecientes.map((cita: any) => (
                  <div key={cita.id_cita} className="flex items-center justify-between p-3 bg-white border border-green-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {cita.paciente_nombre || `${cita.nombres || ''} ${cita.apellidos || ''}`.trim() || 'Paciente'}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {cita.motivo || "Consulta médica"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`text-xs ${getEstadoBadgeColor(cita.estado)}`}>
                        {cita.estado}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatearFecha(cita.fecha_hora)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No hay citas programadas</p>
                <Button asChild variant="outline">
                  <Link href="/citas">
                    <Plus className="h-4 w-4 mr-2" />
                    Ver Citas
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Indicadores de Rendimiento */}
      <Card className="border-purple-200 bg-gradient-to-r from-white to-purple-50/30">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <span>Indicadores del Sistema</span>
          </CardTitle>
          <CardDescription>Métricas de uso y rendimiento del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Citas Programadas</span>
                <span className="text-sm text-muted-foreground">
                  {stats.citasPendientes}/{stats.totalCitas || 1}
                </span>
              </div>
              <Progress 
                value={stats.totalCitas ? ((stats.citasPendientes || 0) / stats.totalCitas) * 100 : 0} 
                className="h-2" 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Actividad Hoy</span>
                <span className="text-sm text-muted-foreground">{stats.citasHoy}/10</span>
              </div>
              <Progress value={Math.min(((stats.citasHoy || 0) / 10) * 100, 100)} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Laboratorios</span>
                <span className="text-sm text-muted-foreground">{stats.totalLaboratorios}/50</span>
              </div>
              <Progress value={Math.min(((stats.totalLaboratorios || 0) / 50) * 100, 100)} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer con derechos de autor */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <AscanLogo size={35} />
            <div className="w-px h-6 bg-gray-300"></div>
            <UMGLogo size={35} showCopyright={false} />
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-600">
              © 2025 UNIVERSIDAD MARIANO GÁLVEZ DE GUATEMALA
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Frisly Wilfredo Sacalxot Velasquez - Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
