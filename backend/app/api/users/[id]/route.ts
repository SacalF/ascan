import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"
import { authenticateRequest } from "@/lib/auth-middleware"
import { logUpdate, logDelete } from "@/lib/audit-logger"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Verificar que sea administrador
    if (authResult.rol !== "administrador") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const { id } = params

    // Obtener usuario específico
    const usuarios = await executeQuery(`
      SELECT 
        id_usuario,
        nombres,
        apellidos,
        correo_electronico,
        telefono,
        direccion,
        estado,
        cedula_profesional,
        especialidad,
        rol,
        created_at,
        ultimo_acceso
      FROM usuarios 
      WHERE id_usuario = ?
    `, [id])

    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const usuario = usuarios[0] as any

    return NextResponse.json({
      usuario: {
        id: usuario.id_usuario,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        email: usuario.correo_electronico,
        telefono: usuario.telefono,
        direccion: usuario.direccion,
        estado: usuario.estado,
        cedula_profesional: usuario.cedula_profesional,
        especialidad: usuario.especialidad,
        rol: usuario.rol,
        created_at: usuario.created_at,
        ultimo_acceso: usuario.ultimo_acceso,
        activo: usuario.estado === 'activo',
        nombre_completo: `${usuario.nombres} ${usuario.apellidos}`
      }
    })

  } catch (error: any) {
    console.error("Error en GET /api/users/[id]:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Verificar que sea administrador
    if (authResult.rol !== "administrador") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()
    const { 
      nombres, 
      apellidos, 
      correo_electronico, 
      telefono, 
      direccion, 
      estado, 
      cedula_profesional, 
      especialidad, 
      rol 
    } = body

    // Validar campos requeridos
    if (!nombres || !apellidos || !correo_electronico) {
      return NextResponse.json(
        { error: "Nombres, apellidos y correo son requeridos" },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe y obtener datos anteriores
    const usuarioExistente = await executeQuery(
      "SELECT * FROM usuarios WHERE id_usuario = ?",
      [id]
    )

    if (!Array.isArray(usuarioExistente) || usuarioExistente.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    const datosAnteriores = usuarioExistente[0] as any


    // Verificar que el correo no esté en uso por otro usuario
    const usuarioConMismoCorreo = await executeQuery(
      "SELECT id_usuario FROM usuarios WHERE correo_electronico = ? AND id_usuario != ?",
      [correo_electronico, id]
    )

    if (Array.isArray(usuarioConMismoCorreo) && usuarioConMismoCorreo.length > 0) {
      return NextResponse.json(
        { error: "El correo electrónico ya está en uso" },
        { status: 400 }
      )
    }

    // Actualizar usuario
    await executeQuery(`
      UPDATE usuarios SET 
        nombres = ?,
        apellidos = ?,
        correo_electronico = ?,
        telefono = ?,
        direccion = ?,
        estado = ?,
        cedula_profesional = ?,
        especialidad = ?,
        rol = ?,
        updated_at = NOW()
      WHERE id_usuario = ?
    `, [
      nombres,
      apellidos,
      correo_electronico,
      telefono || null,
      direccion || null,
      estado || 'activo',
      cedula_profesional || null,
      especialidad || null,
      rol || 'medico',
      id
    ])

    // Registrar en historial
    const datosNuevos = {
      nombres,
      apellidos,
      correo_electronico,
      telefono: telefono || null,
      direccion: direccion || null,
      estado: estado || 'activo',
      cedula_profesional: cedula_profesional || null,
      especialidad: especialidad || null,
      rol: rol || 'medico'
    }

    await logUpdate(
      authResult.id_usuario,
      'usuarios',
      `Usuario actualizado: ${datosAnteriores.nombres} ${datosAnteriores.apellidos}`,
      datosAnteriores,
      datosNuevos
    )

    return NextResponse.json({
      message: "Usuario actualizado exitosamente",
      usuario_id: id
    })

  } catch (error: any) {
    console.error("Error en PUT /api/users/[id]:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Verificar que sea administrador
    if (authResult.rol !== "administrador") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const { id } = params

    // Verificar que el usuario existe y obtener datos completos
    const usuario = await executeQuery(
      "SELECT * FROM usuarios WHERE id_usuario = ?",
      [id]
    )

    if (!Array.isArray(usuario) || usuario.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    const datosUsuario = usuario[0] as any

    // No permitir eliminar el propio usuario
    if (id === authResult.id_usuario) {
      return NextResponse.json(
        { error: "No puedes eliminar tu propio usuario" },
        { status: 400 }
      )
    }

    // Soft delete - cambiar estado a inactivo en lugar de eliminar
    await executeQuery(
      "UPDATE usuarios SET estado = 'inactivo', updated_at = NOW() WHERE id_usuario = ?",
      [id]
    )

    // Registrar en historial
    await logDelete(
      authResult.id_usuario,
      'usuarios',
      `Usuario eliminado: ${datosUsuario.nombres} ${datosUsuario.apellidos}`,
      datosUsuario
    )

    return NextResponse.json({
      message: "Usuario eliminado exitosamente",
      usuario_id: id
    })

  } catch (error: any) {
    console.error("Error en DELETE /api/users/[id]:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}