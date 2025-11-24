"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, Activity, TestTube, Stethoscope, ClipboardList, Download, Plus, Eye } from "lucide-react"
import Link from "next/link"

interface Paciente {
  id_paciente: string
  nombres: string
  apellidos: string
  fecha_nacimiento: string
  sexo: string
  telefono: string
  correo_electronico: string
  dpi: string
  numero_registro_medico: string
}

interface Consulta {
  id: string
  fecha: string
  motivo_consulta?: string
  sintoma_principal?: string
}

interface Examen {
  id: string
  fecha: string
  peso: number
  talla: number
  pulso: number
  temperatura: number
}

interface Laboratorio {
  id: string
  fecha: string
  tipo_examen: string
  resultados?: string
  estado: string
}

interface Valoracion {
  id: string
  fecha: string
  diagnostico?: string
  plan_tratamiento?: string
}

export default function ExpedientePage() {
  const params = useParams()
  const id = params?.id as string

  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [examenes, setExamenes] = useState<Examen[]>([])
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([])
  const [valoraciones, setValoraciones] = useState<Valoracion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar datos del paciente
        const pacienteData = await apiClient.getPaciente(id)
        if (pacienteData.error) {
          console.error("Error al cargar paciente:", pacienteData.error)
          return
        }
        
        // La API devuelve { paciente, citas, consultasIniciales, etc. }
        const data = pacienteData.data as any
        if (data && data.paciente) {
          setPaciente(data.paciente as Paciente)
          setConsultas(data.consultasIniciales || [])
          setExamenes(data.examenesFisicos || [])
          setLaboratorios(data.laboratorios || [])
          setValoraciones(data.valoraciones || [])
        }


      } catch (error) {
        console.error("Error al cargar datos:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      cargarDatos()
    }
  }, [id])

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatearFechaCorta = (fecha: string) => {
    if (!fecha) return "Sin fecha"
    
    // Si viene en formato MySQL: YYYY-MM-DD HH:mm:ss, tratar como hora local
    const mysqlPattern = /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?$/
    const match = fecha.match(mysqlPattern)
    
    let date: Date
    if (match) {
      const [, year, month, day] = match
      // Crear fecha en zona horaria local (solo fecha, sin hora)
      date = new Date(
        parseInt(year),
        parseInt(month) - 1, // Los meses son 0-indexados
        parseInt(day)
      )
    } else {
      date = new Date(fecha)
    }
    
    if (isNaN(date.getTime())) {
      return "Fecha inválida"
    }
    
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando expediente...</p>
        </div>
      </div>
    )
  }

  if (!paciente) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Paciente no encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="bg-card border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost">
                <Link href={`/pacientes/${id}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Paciente
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-lg font-semibold text-foreground">Expediente Médico</h1>
                <p className="text-sm text-muted-foreground">
                  {paciente.nombres} {paciente.apellidos} - {paciente.numero_registro_medico}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
              <Button asChild>
                <Link href={`/pacientes/${id}/consulta`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Consulta
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Layout de 2 columnas para mejor aprovechamiento del espacio */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Columna izquierda - Timeline compacto */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span>Timeline Médico Reciente</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Mostrar solo los 5 eventos más recientes */}
                  {[
                    ...(consultas?.map((c) => ({ ...c, tipo: "consulta", fecha: c.fecha })) || []),
                    ...(examenes?.map((e) => ({ ...e, tipo: "examen", fecha: e.fecha })) || []),
                    ...(laboratorios?.map((l) => ({ ...l, tipo: "laboratorio", fecha: l.fecha })) || []),
                    ...(valoraciones?.map((v) => ({ ...v, tipo: "valoracion", fecha: v.fecha_valoracion || v.fecha_registro || v.created_at })) || []),
                  ]
                    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                    .slice(0, 5)
                    .map((evento) => (
                      <div key={`${evento.tipo}-${evento.id}`} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div
                          className={`p-2 rounded-full ${
                            evento.tipo === "consulta"
                              ? "bg-blue-100 text-blue-600"
                              : evento.tipo === "examen"
                                ? "bg-green-100 text-green-600"
                                : evento.tipo === "laboratorio"
                                  ? "bg-purple-100 text-purple-600"
                                  : "bg-orange-100 text-orange-600"
                          }`}
                        >
                          {evento.tipo === "consulta" && <Stethoscope className="h-4 w-4" />}
                          {evento.tipo === "examen" && <Activity className="h-4 w-4" />}
                          {evento.tipo === "laboratorio" && <TestTube className="h-4 w-4" />}
                          {evento.tipo === "valoracion" && <ClipboardList className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm capitalize truncate">
                              {evento.tipo === "consulta"
                                ? "Consulta Clínica"
                                : evento.tipo === "examen"
                                  ? "Examen Físico"
                                  : evento.tipo === "laboratorio"
                                    ? "Resultado de Laboratorio"
                                    : "Valoración Médica"}
                            </h4>
                            <Badge variant="outline" className="text-xs capitalize">
                              {evento.tipo}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{formatearFechaCorta(evento.fecha)}</p>
                          <p className="text-xs text-gray-600 truncate">
                            {evento.tipo === "consulta" && (evento as any).motivo_consulta && (evento as any).motivo_consulta}
                            {evento.tipo === "examen" && `Peso: ${(evento as any).peso}kg, Talla: ${(evento as any).talla}cm`}
                            {evento.tipo === "laboratorio" && (evento as any).tipo_examen && (evento as any).tipo_examen}
                            {evento.tipo === "valoracion" && (evento as any).diagnostico && (evento as any).diagnostico}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Tabs compactos para navegación rápida */}
            <Tabs defaultValue="consultas" className="mt-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="consultas">Consultas</TabsTrigger>
                <TabsTrigger value="examenes">Exámenes</TabsTrigger>
                <TabsTrigger value="laboratorio">Laboratorio</TabsTrigger>
                <TabsTrigger value="valoraciones">Valoraciones</TabsTrigger>
              </TabsList>

              {/* Consultas Clínicas - Compactas */}
              <TabsContent value="consultas" className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Consultas Clínicas</h3>
                  <Button asChild size="sm">
                    <Link href={`/pacientes/${id}/consulta`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva
                    </Link>
                  </Button>
                </div>
                <div className="space-y-2">
                  {consultas?.slice(0, 3).map((consulta) => (
                    <div key={consulta.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{formatearFechaCorta(consulta.fecha)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {consulta.motivo_consulta || consulta.sintoma_principal || "Sin descripción"}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {consultas && consultas.length > 3 && (
                    <div className="text-center">
                      <Button variant="ghost" size="sm" className="text-xs">
                        Ver {consultas.length - 3} más...
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Exámenes Físicos - Compactos */}
              <TabsContent value="examenes" className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Exámenes Físicos</h3>
                </div>
                <div className="space-y-2">
                  {examenes?.slice(0, 3).map((examen) => (
                    <div key={examen.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{formatearFechaCorta(examen.fecha)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-1">
                          <span>Peso: {examen.peso}kg</span>
                          <span>Talla: {examen.talla}cm</span>
                          <span>Pulso: {examen.pulso}bpm</span>
                          <span>Temp: {examen.temperatura}°C</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {examenes && examenes.length > 3 && (
                    <div className="text-center">
                      <Button variant="ghost" size="sm" className="text-xs">
                        Ver {examenes.length - 3} más...
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Resultados de Laboratorio - Compactos */}
              <TabsContent value="laboratorio" className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Resultados de Laboratorio</h3>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo
                  </Button>
                </div>
                <div className="space-y-2">
                  {laboratorios?.slice(0, 3).map((lab) => (
                    <div key={lab.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{formatearFechaCorta(lab.fecha)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {lab.tipo_examen}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={lab.estado === "normal" ? "default" : "destructive"} className="text-xs">
                          {lab.estado}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {laboratorios && laboratorios.length > 3 && (
                    <div className="text-center">
                      <Button variant="ghost" size="sm" className="text-xs">
                        Ver {laboratorios.length - 3} más...
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Valoraciones - Compactas */}
              <TabsContent value="valoraciones" className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Valoraciones Médicas</h3>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva
                  </Button>
                </div>
                <div className="space-y-2">
                  {valoraciones?.slice(0, 3).map((valoracion) => (
                    <div key={valoracion.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{formatearFechaCorta(valoracion.fecha)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {valoracion.diagnostico || valoracion.plan_tratamiento || "Sin descripción"}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {valoraciones && valoraciones.length > 3 && (
                    <div className="text-center">
                      <Button variant="ghost" size="sm" className="text-xs">
                        Ver {valoraciones.length - 3} más...
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Columna derecha - Información del paciente y acciones rápidas */}
          <div className="lg:col-span-1">
            {/* Información del paciente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  <span>Información del Paciente</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Nombre Completo</p>
                      <p className="font-medium">{paciente.nombres} {paciente.apellidos}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Edad</p>
                      <p className="font-medium">{new Date().getFullYear() - new Date(paciente.fecha_nacimiento).getFullYear()} años</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Sexo</p>
                      <p className="font-medium capitalize">{paciente.sexo}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                      <p className="font-medium">{paciente.telefono}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="font-medium text-sm">{paciente.correo_electronico}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">DPI</p>
                      <p className="font-medium">{paciente.dpi}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Acciones rápidas */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>Acciones Rápidas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button asChild className="w-full" variant="default">
                    <Link href={`/pacientes/${id}/consulta`}>
                      <Stethoscope className="h-4 w-4 mr-2" />
                      Consulta Inicial
                    </Link>
                  </Button>
                  <Button asChild className="w-full" variant="outline">
                    <Link href={`/pacientes/${id}/valoracion`}>
                      <Activity className="h-4 w-4 mr-2" />
                      Valoración
                    </Link>
                  </Button>
                  <Button asChild className="w-full" variant="outline">
                    <Link href={`/pacientes/${id}/consulta`}>
                      <TestTube className="h-4 w-4 mr-2" />
                      Seguimiento
                    </Link>
                  </Button>
                  <Button asChild className="w-full" variant="outline">
                    <Link href={`/pacientes/${id}`}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Agendar Cita
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas rápidas */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  <span>Estadísticas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Consultas:</span>
                    <span className="font-medium">{consultas?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Exámenes:</span>
                    <span className="font-medium">{examenes?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Laboratorios:</span>
                    <span className="font-medium">{laboratorios?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Valoraciones:</span>
                    <span className="font-medium">{valoraciones?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
