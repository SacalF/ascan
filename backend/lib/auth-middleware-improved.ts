import type { NextRequest } from "next/server"
import { pool, verifyToken } from "@/lib/mysql"

export interface AuthenticatedUser {
  id_usuario: string
  nombres: string
  apellidos: string
  correo_electronico: string
  telefono?: string
  direccion?: string
  estado: string
  cedula_profesional?: string
  especialidad?: string
  rol: string
  ultimo_acceso?: string
}

export async function authenticateRequest(request: NextRequest): Promise<{ success: boolean; user?: AuthenticatedUser; error?: string }> {
  try {
    const token = request.cookies.get("session-token")?.value

    if (!token) {
      return { success: false, error: "No token found" }
    }

    // Verificar token JWT
    const decoded = verifyToken(token)
    if (!decoded) {
      return { success: false, error: "Invalid token" }
    }

    // Obtener información del usuario
    const connection = await pool.getConnection()
    try {
      const [users] = await connection.execute(
        `SELECT id_usuario, nombres, apellidos, correo_electronico, telefono, 
                direccion, estado, cedula_profesional, especialidad, rol, ultimo_acceso
         FROM usuarios 
         WHERE id_usuario = ? AND estado = 'activo'`,
        [decoded.userId]
      )

      if (!Array.isArray(users) || users.length === 0) {
        return { success: false, error: "User not found or inactive" }
      }

      const user = users[0] as AuthenticatedUser
      return { success: true, user }
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Error in authenticateRequest:", error)
    return { success: false, error: "Authentication failed" }
  }
}
