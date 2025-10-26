import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/mysql"
import { executeQuery } from "@/lib/mysql"

export interface AuthenticatedUser {
  id_usuario: string
  nombres: string
  apellidos: string
  correo_electronico: string
  rol: string
  estado: string
}

export async function authenticateUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Obtener token de la cookie
    const token = request.cookies.get("session-token")?.value

    if (!token) {
      console.log("🔒 No se encontró token de sesión")
      return null
    }

    // Verificar token
    const decoded = verifyToken(token)
    if (!decoded) {
      console.log("🔒 Token inválido o expirado")
      return null
    }

    // Obtener información del usuario desde la base de datos
    const users = await executeQuery(
      `SELECT id_usuario, nombres, apellidos, correo_electronico, rol, estado 
       FROM usuarios 
       WHERE id_usuario = ? AND estado = 'activo'`,
      [decoded.userId]
    )

    if (!Array.isArray(users) || users.length === 0) {
      console.log("🔒 Usuario no encontrado o inactivo")
      return null
    }

    const user = users[0] as AuthenticatedUser
    console.log(`✅ Usuario autenticado: ${user.nombres} ${user.apellidos} (${user.rol})`)
    return user

  } catch (error) {
    console.error("🔒 Error en autenticación:", error)
    return null
  }
}

export function requireAuth(handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    return handler(request, user)
  }
}

export function requireRole(allowedRoles: string[]) {
  return (handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>) => {
    return async (request: NextRequest) => {
      const user = await authenticateUser(request)
      
      if (!user) {
        return NextResponse.json(
          { error: "No autenticado" },
          { status: 401 }
        )
      }

      if (!allowedRoles.includes(user.rol)) {
        return NextResponse.json(
          { error: "Acceso denegado. Rol insuficiente." },
          { status: 403 }
        )
      }

      return handler(request, user)
    }
  }
}
