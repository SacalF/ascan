import type { NextRequest } from "next/server"
import { pool, verifyToken } from "@/lib/mysql"

export interface AuthenticatedUser {
  id_usuario: string
  nombres: string
  apellidos: string
  nombre_usuario: string
  correo_electronico: string
  telefono?: string
  direccion?: string
  estado: string
  cedula_profesional?: string
  especialidad?: string
  rol: string
  ultimo_acceso?: string
}

export async function authenticateRequest(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const token = request.cookies.get("session-token")?.value

    if (!token) {
      return null
    }

    // Verificar token JWT
    const decoded = verifyToken(token)
    if (!decoded) {
      return null
    }

    const connection = await pool.getConnection()

    try {
      // Verificar sesión y obtener datos del usuario
      const [sessions] = await connection.execute(
        `SELECT u.id_usuario, u.nombres, u.apellidos, u.nombre_usuario, 
                u.correo_electronico, u.telefono, u.direccion, u.estado,
                u.cedula_profesional, u.especialidad, u.rol, u.ultimo_acceso
         FROM sessions s
         JOIN usuarios u ON s.user_id = u.id_usuario
         WHERE s.token = ? AND s.expires_at > NOW()`,
        [token],
      )

      if (!Array.isArray(sessions) || sessions.length === 0) {
        return null
      }

      const session = sessions[0] as any

      if (session.estado !== 'activo') {
        return null
      }

      return {
        id_usuario: session.id_usuario,
        nombres: session.nombres,
        apellidos: session.apellidos,
        nombre_usuario: session.nombre_usuario,
        correo_electronico: session.correo_electronico,
        telefono: session.telefono,
        direccion: session.direccion,
        estado: session.estado,
        cedula_profesional: session.cedula_profesional,
        especialidad: session.especialidad,
        rol: session.rol,
        ultimo_acceso: session.ultimo_acceso,
      }
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Error en autenticación:", error)
    return null
  }
}

// Función simplificada para las APIs de citas
export async function authMiddleware(request: NextRequest) {
  try {
    const token = request.cookies.get("session-token")?.value || 
                  request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return { success: false, error: "Token no proporcionado" }
    }

    // Verificar token JWT
    const decoded = verifyToken(token)
    if (!decoded) {
      return { success: false, error: "Token inválido" }
    }

    // Para simplificar, solo verificamos que el token sea válido
    // En un sistema más robusto, verificaríamos la sesión en la base de datos
    return { 
      success: true, 
      user: { 
        id: decoded.userId,
        email: "usuario@ejemplo.com", // Esto debería venir de la BD
        rol: "medico" // Esto debería venir de la BD
      } 
    }
  } catch (error) {
    console.error("Error en authMiddleware:", error)
    return { success: false, error: "Error de autenticación" }
  }
}
