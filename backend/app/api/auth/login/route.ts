import { type NextRequest, NextResponse } from "next/server"
import { executeQuery, verifyPassword, generateToken, generateUUID } from "@/lib/mysql"
import { logLogin } from "@/lib/audit-logger"
import { checkRateLimit, recordAttempt } from "@/lib/rate-limiter"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Verificar rate limiting
    const rateLimitResult = checkRateLimit(request)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: "Demasiados intentos de login. Intenta nuevamente más tarde.",
          resetTime: rateLimitResult.resetTime
        }, 
        { status: 429 }
      )
    }

    const body = await request.json()
    const { correoElectronico, password, rol } = body

    if (!correoElectronico || !password) {
      return NextResponse.json({ error: "Correo electrónico y contraseña son requeridos" }, { status: 400 })
    }

    // Buscar usuario en la nueva tabla unificada
    const users = await executeQuery(
      `SELECT id_usuario, nombres, apellidos, contraseña, 
              correo_electronico, telefono, direccion, estado, fecha_registro,
              cedula_profesional, especialidad, rol, ultimo_acceso
       FROM usuarios 
       WHERE correo_electronico = ?`,
      [correoElectronico],
    )

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const user = users[0] as any

    // Verificar contraseña
    const isValidPassword = await verifyPassword(password, user.contraseña)
    if (!isValidPassword) {
      // Registrar intento fallido para rate limiting
      recordAttempt(request)
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Verificar si el usuario está activo
    if (user.estado !== 'activo') {
      return NextResponse.json({ error: "Usuario inactivo" }, { status: 403 })
    }

    // Verificar rol si se especifica
    if (rol && user.rol !== rol) {
      return NextResponse.json({ error: "Rol no autorizado" }, { status: 403 })
    }

    // Actualizar último acceso
    await executeQuery(
      "UPDATE usuarios SET ultimo_acceso = NOW() WHERE id_usuario = ?",
      [user.id_usuario]
    )

    // Generar token JWT
    const token = generateToken(user.id_usuario)
    const sessionId = generateUUID()

    // Crear sesión en la base de datos
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 días

    await executeQuery(
      "INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)",
      [sessionId, user.id_usuario, token, expiresAt]
    )

    // Registrar login en historial (no crítico)
    try {
      const nombreCompleto = `${user.nombres || ''} ${user.apellidos || ''}`.trim() || user.correo_electronico || 'Usuario'
      await logLogin(user.id_usuario, nombreCompleto)
    } catch (auditError) {
      console.log("⚠️ No se pudo registrar en historial:", auditError)
      // No es crítico, continuar
    }

      // Preparar respuesta
      const response = NextResponse.json({
        message: "Login exitoso",
        user: {
          id_usuario: user.id_usuario,
          nombres: user.nombres,
          apellidos: user.apellidos,
          nombre_usuario: user.nombre_usuario,
          correo_electronico: user.correo_electronico,
          telefono: user.telefono,
          direccion: user.direccion,
          estado: user.estado,
          cedula_profesional: user.cedula_profesional,
          especialidad: user.especialidad,
          rol: user.rol,
          ultimo_acceso: user.ultimo_acceso,
        },
      })

      // Establecer cookie de sesión segura
      response.cookies.set("session-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 días
        path: "/",
        domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : undefined
      })

      // Cookie de estado de autenticación (solo para desarrollo)
      if (process.env.NODE_ENV !== "production") {
        response.cookies.set("auth-status", "authenticated", {
          httpOnly: false,
          secure: false,
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60, // 7 días
          path: "/"
        })
      }

      return response
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
