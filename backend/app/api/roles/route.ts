import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"
import { authenticateRequest } from "@/lib/auth-middleware"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Verificar que sea administrador
    if (authResult.rol !== "administrador") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Obtener todos los usuarios con sus roles
    const usuarios = await executeQuery(`
      SELECT 
        id_usuario,
        nombres,
        apellidos,
        correo_electronico,
        rol,
        estado,
        created_at,
        ultimo_acceso
      FROM usuarios 
      ORDER BY created_at DESC
    `)

    // Obtener estadísticas de roles (tanto de usuarios como de la tabla roles)
    const statsRoles = await executeQuery(`
      SELECT 
        rol,
        COUNT(*) as cantidad
      FROM usuarios 
      GROUP BY rol
    `)

    // Obtener roles disponibles de la tabla roles
    const rolesDB = await executeQuery(`
      SELECT 
        id_rol,
        nombre_rol,
        descripcion,
        permisos,
        activo,
        created_at
      FROM roles 
      ORDER BY created_at DESC
    `)

    // Formatear roles disponibles para los select inputs
    const rolesDisponibles = Array.isArray(rolesDB) 
      ? rolesDB
          .filter((r: any) => r.activo)
          .map((r: any) => ({
            value: r.nombre_rol.toLowerCase(),
            label: r.nombre_rol.charAt(0).toUpperCase() + r.nombre_rol.slice(1).toLowerCase()
          }))
      : []

    return NextResponse.json({
      roles: Array.isArray(rolesDB) ? rolesDB : [],
      usuarios: Array.isArray(usuarios) ? usuarios : [],
      estadisticas: Array.isArray(statsRoles) ? statsRoles : [],
      rolesDisponibles
    })

  } catch (error: any) {
    console.error("Error en GET /api/roles:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Verificar que sea administrador
    if (authResult.rol !== "administrador") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const body = await request.json()
    const { id_usuario, rol, id_rol, permisos } = body

    // Si se está actualizando permisos de un rol
    if (id_rol && permisos) {
      console.log("🔧 Actualizando permisos para rol:", id_rol, "Permisos:", permisos)
      
      // Verificar que el rol existe
      const rolExiste = await executeQuery(
        "SELECT id_rol FROM roles WHERE id_rol = ?",
        [id_rol]
      )

      if (!Array.isArray(rolExiste) || rolExiste.length === 0) {
        return NextResponse.json(
          { error: "Rol no encontrado" },
          { status: 404 }
        )
      }

      // Actualizar permisos del rol
      await executeQuery(
        "UPDATE roles SET permisos = ?, updated_at = NOW() WHERE id_rol = ?",
        [JSON.stringify(permisos), id_rol]
      )

      console.log("✅ Permisos actualizados exitosamente")
      return NextResponse.json({
        message: "Permisos actualizados exitosamente",
        rol_id: id_rol,
        permisos: permisos
      })
    }

    // Si se está actualizando el rol de un usuario (funcionalidad anterior)
    if (id_usuario && rol) {
      console.log("👤 Actualizando rol de usuario:", id_usuario, "Nuevo rol:", rol)

      // Validar que el rol sea válido (consultar tabla roles)
      const rolValido = await executeQuery(
        "SELECT nombre_rol FROM roles WHERE nombre_rol = ? AND activo = 1",
        [rol]
      )

      // También permitir roles básicos del sistema
      const rolesSistema = ["medico", "enfermera", "administrador"]
      
      if (!rolesSistema.includes(rol) && (!Array.isArray(rolValido) || rolValido.length === 0)) {
        return NextResponse.json(
          { error: "Rol no válido" },
          { status: 400 }
        )
      }

      // Verificar que el usuario existe
      const usuario = await executeQuery(
        "SELECT id_usuario FROM usuarios WHERE id_usuario = ?",
        [id_usuario]
      )

      if (!Array.isArray(usuario) || usuario.length === 0) {
        return NextResponse.json(
          { error: "Usuario no encontrado" },
          { status: 404 }
        )
      }

      // Actualizar el rol
      await executeQuery(
        "UPDATE usuarios SET rol = ?, updated_at = NOW() WHERE id_usuario = ?",
        [rol, id_usuario]
      )

      console.log("✅ Rol de usuario actualizado exitosamente")
      return NextResponse.json({
        message: "Rol actualizado exitosamente",
        usuario_id: id_usuario,
        nuevo_rol: rol
      })
    }

    return NextResponse.json(
      { error: "Parámetros insuficientes" },
      { status: 400 }
    )

  } catch (error: any) {
    console.error("Error en PUT /api/roles:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
