import { type NextRequest, NextResponse } from "next/server"
import { pool, verifyToken } from "@/lib/mysql"

export async function GET(request: NextRequest) {
  try {
    console.log("=== API REPORTES GET - Iniciando ===")
    
    const token = request.cookies.get("session-token")?.value
    console.log("Token recibido:", token ? "Sí" : "No")

    if (!token) {
      console.log("ERROR: No hay token")
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    console.log("Verificando token...")
    const decoded = verifyToken(token)
    if (!decoded) {
      console.log("ERROR: Token inválido")
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }
    console.log("Token válido, usuario:", decoded)

    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get("tipo")
    const formato = searchParams.get("formato") || "json"
    const fechaInicio = searchParams.get("fecha_inicio")
    const fechaFin = searchParams.get("fecha_fin")

    console.log("Parámetros recibidos:", { tipo, formato, fechaInicio, fechaFin })

    console.log("Obteniendo conexión a la base de datos...")
    const connection = await pool.getConnection()
    console.log("Conexión obtenida")

    try {
      // Verificar que el usuario tenga permisos de administrador
      console.log("Verificando permisos de administrador...")
      const [adminCheck] = await connection.execute(
        `SELECT u.rol FROM usuarios u 
         WHERE u.id_usuario = ? AND u.estado = 'activo'`,
        [decoded.userId],
      )
      console.log("Resultado adminCheck:", adminCheck)

      if (!Array.isArray(adminCheck) || adminCheck.length === 0) {
        console.log("ERROR: Usuario no encontrado o inactivo")
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 })
      }

      const userRole = (adminCheck[0] as any).rol
      console.log("Rol del usuario:", userRole)
      if (userRole !== "administrador") {
        console.log("ERROR: Acceso denegado, rol:", userRole)
        return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
      }

      let reporte = {}

      switch (tipo) {
        case "usuarios":
          reporte = await generarReporteUsuarios(connection, fechaInicio, fechaFin)
          break
        case "pacientes":
          reporte = await generarReportePacientes(connection, fechaInicio, fechaFin)
          break
        case "citas":
          reporte = await generarReporteCitas(connection, fechaInicio, fechaFin)
          break
        case "consultas":
          reporte = await generarReporteConsultas(connection, fechaInicio, fechaFin)
          break
        case "laboratorio":
          reporte = await generarReporteLaboratorio(connection, fechaInicio, fechaFin)
          break
        case "actividad":
          reporte = await generarReporteActividad(connection, fechaInicio, fechaFin)
          break
        case "ejecutivo":
          reporte = await generarReporteEjecutivo(connection, fechaInicio, fechaFin)
          break
        default:
          return NextResponse.json({ error: `Tipo de reporte no válido: ${tipo}` }, { status: 400 })
      }

      // Manejar formato de respuesta
      if (formato === "csv") {
        const csvContent = convertirACSV(reporte)
        return new NextResponse(csvContent, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="reporte_${tipo}_${new Date().toISOString().split('T')[0]}.csv"`
          }
        })
      }

      console.log("=== API REPORTES GET - ÉXITO ===")
      return NextResponse.json(reporte)
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("=== ERROR EN API REPORTES ===")
    console.error("Error generando reporte:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

async function generarReporteUsuarios(connection: any, fechaInicio?: string | null, fechaFin?: string | null) {
  console.log("Generando reporte de usuarios...")
  
  let whereClause = ""
  let params: any[] = []

  if (fechaInicio && fechaFin) {
    whereClause = "WHERE DATE(fecha_registro) BETWEEN ? AND ?"
    params = [fechaInicio, fechaFin]
  }

  const [usuarios] = await connection.execute(
    `SELECT 
       COUNT(*) as total,
       SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) as activos,
       SUM(CASE WHEN estado = 'inactivo' THEN 1 ELSE 0 END) as inactivos,
       SUM(CASE WHEN rol = 'medico' THEN 1 ELSE 0 END) as medicos,
       SUM(CASE WHEN rol = 'enfermera' THEN 1 ELSE 0 END) as enfermeras,
       SUM(CASE WHEN rol = 'administrador' THEN 1 ELSE 0 END) as administradores
     FROM usuarios ${whereClause}`,
    params
  )

  const [registrosPorMes] = await connection.execute(
    `SELECT 
       DATE_FORMAT(fecha_registro, '%Y-%m') as mes,
       COUNT(*) as cantidad
     FROM usuarios 
     WHERE fecha_registro >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
     GROUP BY DATE_FORMAT(fecha_registro, '%Y-%m')
     ORDER BY mes`
  )

  return {
    tipo: "usuarios",
    resumen: usuarios[0],
    datos: registrosPorMes,
    fecha_generacion: new Date().toISOString()
  }
}

async function generarReportePacientes(connection: any, fechaInicio?: string | null, fechaFin?: string | null) {
  console.log("Generando reporte de pacientes...")
  
  // Verificar si existe la tabla pacientes
  const [tablaExiste] = await connection.execute(
    `SELECT COUNT(*) as count FROM information_schema.tables 
     WHERE table_schema = DATABASE() AND table_name = 'pacientes'`
  )

  if (!Array.isArray(tablaExiste) || (tablaExiste[0] as any).count === 0) {
    return {
      tipo: "pacientes",
      resumen: { total: 0, mensaje: "Tabla de pacientes no encontrada" },
      datos: [],
      fecha_generacion: new Date().toISOString()
    }
  }

  let whereClause = ""
  let params: any[] = []

  if (fechaInicio && fechaFin) {
    whereClause = "WHERE DATE(fecha_registro) BETWEEN ? AND ?"
    params = [fechaInicio, fechaFin]
  }

  const [pacientes] = await connection.execute(
    `SELECT COUNT(*) as total FROM pacientes ${whereClause}`,
    params
  )

  return {
    tipo: "pacientes",
    resumen: pacientes[0],
    datos: [],
    fecha_generacion: new Date().toISOString()
  }
}

async function generarReporteCitas(connection: any, fechaInicio?: string | null, fechaFin?: string | null) {
  console.log("Generando reporte de citas...")
  
  // Verificar si existe la tabla cita
  const [tablaExiste] = await connection.execute(
    `SELECT COUNT(*) as count FROM information_schema.tables 
     WHERE table_schema = DATABASE() AND table_name = 'cita'`
  )

  if (!Array.isArray(tablaExiste) || (tablaExiste[0] as any).count === 0) {
    return {
      tipo: "citas",
      resumen: { total: 0, mensaje: "Tabla de citas no encontrada" },
      datos: [],
      fecha_generacion: new Date().toISOString()
    }
  }

  let whereClause = ""
  let params: any[] = []

  if (fechaInicio && fechaFin) {
    whereClause = "WHERE DATE(fecha_hora) BETWEEN ? AND ?"
    params = [fechaInicio, fechaFin]
  }

  const [citas] = await connection.execute(
    `SELECT 
       COUNT(*) as total,
       SUM(CASE WHEN estado = 'programada' THEN 1 ELSE 0 END) as programadas,
       SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as completadas,
       SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas
     FROM cita ${whereClause}`,
    params
  )

  return {
    tipo: "citas",
    resumen: citas[0],
    datos: [],
    fecha_generacion: new Date().toISOString()
  }
}

async function generarReporteLaboratorio(connection: any, fechaInicio?: string | null, fechaFin?: string | null) {
  console.log("Generando reporte de laboratorio...")
  
  // Verificar si existe la tabla laboratorio
  const [tablaExiste] = await connection.execute(
    `SELECT COUNT(*) as count FROM information_schema.tables 
     WHERE table_schema = DATABASE() AND table_name = 'laboratorio'`
  )

  if (!Array.isArray(tablaExiste) || (tablaExiste[0] as any).count === 0) {
    return {
      tipo: "laboratorio",
      resumen: { total: 0, mensaje: "Tabla de laboratorio no encontrada" },
      datos: [],
      fecha_generacion: new Date().toISOString()
    }
  }

  let whereClause = ""
  let params: any[] = []

  if (fechaInicio && fechaFin) {
    whereClause = "WHERE DATE(fecha_registro) BETWEEN ? AND ?"
    params = [fechaInicio, fechaFin]
  }

  const [laboratorio] = await connection.execute(
    `SELECT COUNT(*) as total FROM laboratorio ${whereClause}`,
    params
  )

  return {
    tipo: "laboratorio",
    resumen: laboratorio[0],
    datos: [],
    fecha_generacion: new Date().toISOString()
  }
}

async function generarReporteActividad(connection: any, fechaInicio?: string | null, fechaFin?: string | null) {
  console.log("Generando reporte de actividad...")
  
  let whereClause = ""
  let params: any[] = []

  if (fechaInicio && fechaFin) {
    whereClause = "WHERE DATE(fecha_hora) BETWEEN ? AND ?"
    params = [fechaInicio, fechaFin]
  }

  const [actividad] = await connection.execute(
    `SELECT 
       COUNT(*) as total,
       COUNT(DISTINCT id_usuario) as usuarios_unicos,
       SUM(CASE WHEN tipo_accion = 'login' THEN 1 ELSE 0 END) as logins,
       SUM(CASE WHEN tipo_accion = 'create' THEN 1 ELSE 0 END) as creaciones,
       SUM(CASE WHEN tipo_accion = 'update' THEN 1 ELSE 0 END) as actualizaciones,
       SUM(CASE WHEN tipo_accion = 'delete' THEN 1 ELSE 0 END) as eliminaciones
     FROM historial_usuario ${whereClause}`,
    params
  )

  const [actividadPorDia] = await connection.execute(
    `SELECT 
       DATE(fecha_hora) as fecha,
       COUNT(*) as cantidad
     FROM historial_usuario 
     ${whereClause || "WHERE fecha_hora >= DATE_SUB(NOW(), INTERVAL 30 DAY)"}
     GROUP BY DATE(fecha_hora)
     ORDER BY fecha DESC
     LIMIT 30`,
    params
  )

  return {
    tipo: "actividad",
    resumen: actividad[0],
    datos: actividadPorDia,
    fecha_generacion: new Date().toISOString()
  }
}

async function generarReporteConsultas(connection: any, fechaInicio?: string | null, fechaFin?: string | null) {
  console.log("Generando reporte de consultas...")
  
  // Verificar si existe la tabla consultas
  const [tablaExiste] = await connection.execute(
    `SELECT COUNT(*) as count FROM information_schema.tables 
     WHERE table_schema = DATABASE() AND table_name = 'consultas'`
  )

  if (!Array.isArray(tablaExiste) || (tablaExiste[0] as any).count === 0) {
    return {
      tipo: "consultas",
      resumen: { total: 0, mensaje: "Tabla de consultas no encontrada" },
      datos: [],
      fecha_generacion: new Date().toISOString()
    }
  }

  let whereClause = ""
  let params: any[] = []

  if (fechaInicio && fechaFin) {
    whereClause = "WHERE DATE(fecha_consulta) BETWEEN ? AND ?"
    params = [fechaInicio, fechaFin]
  }

  const [consultas] = await connection.execute(
    `SELECT COUNT(*) as total FROM consultas ${whereClause}`,
    params
  )

  return {
    tipo: "consultas",
    resumen: consultas[0],
    datos: [],
    fecha_generacion: new Date().toISOString()
  }
}

async function generarReporteEjecutivo(connection: any, fechaInicio?: string | null, fechaFin?: string | null) {
  console.log("Generando reporte ejecutivo...")
  
  // Reporte ejecutivo con estadísticas generales del sistema
  const [usuarios] = await connection.execute(
    `SELECT COUNT(*) as total_usuarios, 
            SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) as usuarios_activos
     FROM usuarios`
  )

  const [actividad] = await connection.execute(
    `SELECT COUNT(*) as total_actividades,
            COUNT(DISTINCT id_usuario) as usuarios_activos,
            SUM(CASE WHEN tipo_accion = 'login' THEN 1 ELSE 0 END) as logins
     FROM historial_usuario 
     WHERE fecha_hora >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
  )

  return {
    tipo: "ejecutivo",
    resumen: {
      usuarios: usuarios[0],
      actividad: actividad[0],
      periodo: "Últimos 30 días"
    },
    datos: [],
    fecha_generacion: new Date().toISOString()
  }
}

function convertirACSV(reporte: any): string {
  const headers = ['Campo', 'Valor']
  const rows = [headers]
  
  // Agregar resumen
  if (reporte.resumen) {
    Object.entries(reporte.resumen).forEach(([key, value]) => {
      rows.push([key, String(value)])
    })
  }
  
  // Agregar datos si existen
  if (reporte.datos && Array.isArray(reporte.datos) && reporte.datos.length > 0) {
    rows.push(['', '']) // Línea en blanco
    rows.push(['Datos Detallados', ''])
    
    // Agregar headers de datos
    const dataHeaders = Object.keys(reporte.datos[0])
    rows.push(dataHeaders)
    
    // Agregar filas de datos
    reporte.datos.forEach((item: any) => {
      const row = dataHeaders.map(header => String(item[header] || ''))
      rows.push(row)
    })
  }
  
  return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
}
