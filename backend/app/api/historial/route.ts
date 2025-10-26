import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"
import { authenticateRequest } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    console.log("=== API HISTORIAL GET - Iniciando ===")
    
    const authResult = await authenticateRequest(request)
    if (!authResult) {
      console.log("ERROR: No autenticado")
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    console.log("Usuario autenticado:", authResult)

    // Verificar que el usuario tenga permisos de administrador
    if (authResult.rol !== "administrador") {
      console.log("ERROR: Acceso denegado, rol:", authResult.rol)
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Obtener parámetros de filtro
    const { searchParams } = new URL(request.url)
    const tipoAccion = searchParams.get("tipo_accion")
    const modulo = searchParams.get("modulo")
    const fechaInicio = searchParams.get("fecha_inicio")
    const fechaFin = searchParams.get("fecha_fin")

    console.log("Filtros recibidos:", { tipoAccion, modulo, fechaInicio, fechaFin })

    // Construir consulta con filtros
    let whereConditions = []
    let queryParams = []

    if (tipoAccion) {
      whereConditions.push("h.tipo_accion = ?")
      queryParams.push(tipoAccion)
    }

    if (modulo) {
      whereConditions.push("h.modulo = ?")
      queryParams.push(modulo)
    }

    if (fechaInicio) {
      whereConditions.push("DATE(h.fecha_hora) >= ?")
      queryParams.push(fechaInicio)
    }

    if (fechaFin) {
      whereConditions.push("DATE(h.fecha_hora) <= ?")
      queryParams.push(fechaFin)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

    // Obtener historial con información del usuario
    console.log("Ejecutando consulta de historial...")
    const historial = await executeQuery(
      `SELECT h.id_historial,
              CONVERT_TZ(h.fecha_hora, '+00:00', '-06:00') as fecha_hora,
              h.id_usuario,
              h.tipo_accion,
              h.modulo,
              h.descripcion,
              h.datos_anteriores,
              h.datos_nuevos,
              CONCAT(u.nombres, ' ', u.apellidos) as usuario_nombre,
              u.rol
       FROM historial_usuario h
       LEFT JOIN usuarios u ON h.id_usuario = u.id_usuario
       ${whereClause}
       ORDER BY h.fecha_hora DESC
       LIMIT 1000`,
      queryParams
    )
    console.log("Historial obtenido:", Array.isArray(historial) ? historial.length : "No es array")

    // Obtener estadísticas
    console.log("Calculando estadísticas...")
    const estadisticas = await executeQuery(
      `SELECT 
         COUNT(*) as total,
         SUM(CASE WHEN tipo_accion = 'login' THEN 1 ELSE 0 END) as logins,
         SUM(CASE WHEN tipo_accion = 'create' THEN 1 ELSE 0 END) as creaciones,
         SUM(CASE WHEN tipo_accion = 'update' THEN 1 ELSE 0 END) as actualizaciones,
         SUM(CASE WHEN tipo_accion = 'delete' THEN 1 ELSE 0 END) as eliminaciones,
         COUNT(DISTINCT id_usuario) as usuarios_unicos
       FROM historial_usuario h
       ${whereClause}`,
      queryParams
    )

    const stats = Array.isArray(estadisticas) && estadisticas.length > 0 ? estadisticas[0] : {
      total: 0,
      logins: 0,
      creaciones: 0,
      actualizaciones: 0,
      eliminaciones: 0,
      usuarios_unicos: 0
    }

    console.log("Estadísticas calculadas:", stats)

    console.log("=== API HISTORIAL GET - ÉXITO ===")
    return NextResponse.json({ 
      historial: historial || [],
      estadisticas: stats
    })
  } catch (error) {
    console.error("=== ERROR EN API HISTORIAL ===")
    console.error("Error obteniendo historial:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
