import { type NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/mysql"
import { authenticateRequest } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    console.log("=== API MÉDICOS LLAMADA ===")
    
    // Temporalmente sin autenticación para testing
    // const authResult = await authenticateRequest(request)
    // if (!authResult.success) {
    //   return NextResponse.json({ error: authResult.error }, { status: 401 })
    // }
    
    console.log("=== API MÉDICOS GET ===")

    // Obtener lista de médicos (usuarios con rol 'medico')
    const [medicos] = await pool.execute(`
      SELECT id_usuario, nombres, apellidos, cedula_profesional, especialidad
      FROM usuarios 
      WHERE rol = 'medico' AND estado = 'activo'
      ORDER BY nombres, apellidos
    `)

    console.log("=== MÉDICOS ENCONTRADOS EN BD ===")
    console.log("Lista:", medicos)

    return NextResponse.json(medicos)
  } catch (error) {
    console.error("Error obteniendo médicos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
