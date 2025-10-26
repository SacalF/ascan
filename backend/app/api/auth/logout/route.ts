import { type NextRequest, NextResponse } from "next/server"
import { executeQuery, verifyToken } from "@/lib/mysql"
import { logLogout } from "@/lib/audit-logger"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("session-token")?.value

    if (token) {
      try {
        // Obtener información del usuario antes de eliminar la sesión
        const decoded = verifyToken(token)
        let userInfo = null
        
        if (decoded) {
          // Obtener información del usuario
          const users = await executeQuery(
            "SELECT id_usuario, nombres, apellidos, correo_electronico FROM usuarios WHERE id_usuario = ?",
            [decoded.userId]
          )
          
          if (Array.isArray(users) && users.length > 0) {
            const user = users[0] as any
            userInfo = {
              id_usuario: user.id_usuario,
              nombre_usuario: `${user.nombres || ''} ${user.apellidos || ''}`.trim() || user.correo_electronico || 'Usuario'
            }
          }
        }

        // Eliminar sesión de la base de datos
        await executeQuery("DELETE FROM sessions WHERE token = ?", [token])

        // Registrar logout en historial si tenemos información del usuario
        if (userInfo) {
          console.log("🔍 Registrando logout para usuario:", userInfo.nombre_usuario)
          try {
            await logLogout(userInfo.id_usuario, userInfo.nombre_usuario)
            console.log("✅ Logout registrado exitosamente")
          } catch (auditError) {
            console.error("❌ Error registrando logout:", auditError)
          }
        } else {
          console.log("⚠️ No se pudo obtener información del usuario para el logout")
        }
      } catch (dbError) {
        console.error("Error en operaciones de base de datos durante logout:", dbError)
        // Continuar con el logout aunque haya error en BD
      }
    }

    // Crear respuesta y limpiar cookie
    const response = NextResponse.json({ message: "Logout exitoso" })
    response.cookies.delete("session-token")

    return response
  } catch (error) {
    console.error("Error en logout:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
