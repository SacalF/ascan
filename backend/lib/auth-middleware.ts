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

export async function authenticateRequest(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const token = request.cookies.get("session-token")?.value

    if (!token) {
      console.log("❌ No token found in request")
      return null
    }

    // Verificar token JWT
    const decoded = verifyToken(token)
    if (!decoded) {
      console.log("❌ Invalid token")
      return null
    }

    const connection = await pool.getConnection()

    try {
      // Obtener datos del usuario directamente (como en /api/auth/me)
      const [users] = await connection.execute(
        `SELECT id_usuario, nombres, apellidos, 
                correo_electronico, telefono, direccion, estado,
                cedula_profesional, especialidad, rol, ultimo_acceso
         FROM usuarios 
         WHERE id_usuario = ?`,
        [decoded.userId],
      )

      if (!Array.isArray(users) || users.length === 0) {
        console.log("❌ User not found in database")
        return null
      }

      const user = users[0] as any

      if (user.estado !== 'activo') {
        console.log("❌ User is not active")
        return null
      }

      console.log("✅ User authenticated:", user.nombres, user.apellidos)

      return {
        id_usuario: user.id_usuario,
        nombres: user.nombres,
        apellidos: user.apellidos,
        correo_electronico: user.correo_electronico,
        telefono: user.telefono,
        direccion: user.direccion,
        estado: user.estado,
        cedula_profesional: user.cedula_profesional,
        especialidad: user.especialidad,
        rol: user.rol,
        ultimo_acceso: user.ultimo_acceso,
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
