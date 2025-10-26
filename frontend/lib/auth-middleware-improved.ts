import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "./mysql"

export interface AuthResult {
  success: boolean
  user?: {
    id: string
    nombres: string
    apellidos: string
    rol: string
    email: string
  }
  error?: string
}

export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  try {
    // 1. Verificar si hay token en las cookies
    const token = request.cookies.get("session-token")?.value
    
    if (!token) {
      return {
        success: false,
        error: "Token no proporcionado"
      }
    }

    // 2. Verificar el token JWT
    const payload = verifyToken(token)
    if (!payload) {
      return {
        success: false,
        error: "Token inválido o expirado"
      }
    }

    // 3. Verificar que el usuario existe y está activo
    const { executeQuery } = await import("./mysql")
    const userResults = await executeQuery(
      `SELECT id_usuario, nombres, apellidos, correo_electronico, rol, estado 
       FROM usuarios 
       WHERE id_usuario = ? AND estado = 'activo'`,
      [payload.userId]
    )

    if (!Array.isArray(userResults) || userResults.length === 0) {
      return {
        success: false,
        error: "Usuario no encontrado o inactivo"
      }
    }

    const user = userResults[0] as any

    return {
      success: true,
      user: {
        id: user.id_usuario,
        nombres: user.nombres,
        apellidos: user.apellidos,
        rol: user.rol,
        email: user.correo_electronico
      }
    }

  } catch (error) {
    console.error("Error en autenticación:", error)
    return {
      success: false,
      error: "Error interno de autenticación"
    }
  }
}

// Middleware para proteger rutas
export function withAuth(handler: (request: NextRequest, user: any) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const authResult = await authenticateRequest(request)
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error }, 
        { status: 401 }
      )
    }

    return handler(request, authResult.user)
  }
}

// Middleware para verificar roles específicos
export function withRole(requiredRoles: string[]) {
  return function(handler: (request: NextRequest, user: any) => Promise<NextResponse>) {
    return async (request: NextRequest) => {
      const authResult = await authenticateRequest(request)
      
      if (!authResult.success) {
        return NextResponse.json(
          { error: authResult.error }, 
          { status: 401 }
        )
      }

      if (!requiredRoles.includes(authResult.user!.rol)) {
        return NextResponse.json(
          { error: "No tienes permisos para acceder a este recurso" }, 
          { status: 403 }
        )
      }

      return handler(request, authResult.user)
    }
  }
}

