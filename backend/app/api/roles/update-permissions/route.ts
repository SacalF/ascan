import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"
import { authenticateUser } from "@/lib/auth-guard"

export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    // Verificar que sea administrador
    if (user.rol !== 'administrador' && user.rol !== 'Administrador') {
      return NextResponse.json(
        { error: "Acceso denegado. Solo administradores pueden modificar permisos." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { rolId, permisos } = body

    if (!rolId || !Array.isArray(permisos)) {
      return NextResponse.json(
        { error: "ID del rol y permisos son requeridos" },
        { status: 400 }
      )
    }

    // Verificar que el rol existe
    const rolExiste = await executeQuery(
      "SELECT id_rol, nombre_rol FROM roles WHERE id_rol = ?",
      [rolId]
    )

    if (!Array.isArray(rolExiste) || rolExiste.length === 0) {
      return NextResponse.json(
        { error: "Rol no encontrado" },
        { status: 404 }
      )
    }

    const rol = rolExiste[0]

    // Actualizar permisos del rol
    await executeQuery(
      "UPDATE roles SET permisos = ?, updated_at = NOW() WHERE id_rol = ?",
      [JSON.stringify(permisos), rolId]
    )

    console.log(`✅ Permisos actualizados para rol ${rol.nombre_rol}:`, permisos)

    return NextResponse.json({
      message: "Permisos actualizados exitosamente",
      rol: {
        id: rol.id_rol,
        nombre: rol.nombre_rol,
        permisos: permisos
      }
    })

  } catch (error) {
    console.error("Error actualizando permisos:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
