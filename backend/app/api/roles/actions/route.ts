import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"
import { authenticateUser } from "@/lib/auth-guard"

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    // Obtener acciones específicas del rol del usuario
    const rolePermissions = await executeQuery(
      `SELECT permisos FROM roles WHERE nombre_rol = ? AND activo = 1`,
      [user.rol]
    )

    let actions: string[] = []

    if (Array.isArray(rolePermissions) && rolePermissions.length > 0) {
      const roleData = rolePermissions[0] as any
      try {
        actions = JSON.parse(roleData.permisos || '[]')
      } catch (error) {
        console.error("Error parseando acciones:", error)
        actions = []
      }
    }

    return NextResponse.json({
      user: {
        id: user.id_usuario,
        nombres: user.nombres,
        apellidos: user.apellidos,
        rol: user.rol
      },
      actions,
      hasAction: (action: string) => actions.includes(action)
    })

  } catch (error) {
    console.error("Error obteniendo acciones:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
