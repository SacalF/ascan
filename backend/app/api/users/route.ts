import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"
import { authenticateRequest } from "@/lib/auth-middleware"
import bcrypt from "bcryptjs"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log("=== API USERS GET - Iniciando ===")
    
    // Autenticar usuario
    const authResult = await authenticateRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    console.log("Usuario autenticado:", authResult.id_usuario, "Rol:", authResult.rol)

    // Verificar permisos de administrador
    if (authResult.rol !== "administrador") {
      console.log("ERROR: Acceso denegado, rol:", authResult.rol)
      // return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Obtener todos los usuarios
    console.log("Ejecutando consulta de usuarios...")
    const users = await executeQuery(
      `SELECT u.id_usuario as id, 
              u.correo_electronico as email, 
              u.nombres, 
              u.apellidos,
              CONCAT(u.nombres, ' ', u.apellidos) as nombre_completo,
              u.telefono,
              u.cedula_profesional,
              u.especialidad,
              u.rol,
              u.estado as activo,
              u.fecha_registro as created_at,
              u.ultimo_acceso
       FROM usuarios u
       ORDER BY u.nombres, u.apellidos`
    )
    
    console.log("Usuarios obtenidos:", Array.isArray(users) ? users.length : "No es array")

    console.log("=== API USERS GET - ÉXITO ===")
    return NextResponse.json({ usuarios: users })
  } catch (error) {
    console.error("=== ERROR EN API USERS ===")
    console.error("Error obteniendo usuarios:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== API USERS POST - Iniciando ===")
    
    // Autenticar usuario
    console.log("🔍 Verificando autenticación...")
    const authResult = await authenticateRequest(request)
    if (!authResult) {
      console.log("❌ ERROR: Usuario no autenticado")
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    console.log("✅ Usuario autenticado:", {
      id: authResult.id_usuario,
      nombre: `${authResult.nombres} ${authResult.apellidos}`,
      email: authResult.correo_electronico,
      rol: authResult.rol,
      estado: authResult.estado
    })

    // Verificar permisos de administrador
    if (authResult.rol !== "administrador") {
      console.log("❌ ERROR: Acceso denegado, rol:", authResult.rol)
      return NextResponse.json({ error: "Acceso denegado. Se requiere rol de administrador." }, { status: 403 })
    }
    
    console.log("✅ Permisos de administrador verificados")

    // Obtener datos del body
    console.log("📝 Obteniendo datos del body...")
    const body = await request.json()
    const { 
      nombres, 
      apellidos, 
      correo_electronico, 
      contrasena,
      telefono,
      direccion,
      cedula_profesional,
      especialidad,
      rol,
      estado
    } = body

    console.log("✅ Datos recibidos:", { 
      nombres, 
      apellidos, 
      correo_electronico, 
      rol, 
      estado,
      telefono: telefono ? "proporcionado" : "no proporcionado",
      direccion: direccion ? "proporcionado" : "no proporcionado",
      cedula_profesional: cedula_profesional ? "proporcionado" : "no proporcionado",
      especialidad: especialidad ? "proporcionado" : "no proporcionado"
    })

    // Validaciones
    console.log("🔍 Validando campos requeridos...")
    if (!nombres || !apellidos || !correo_electronico || !contrasena || !rol) {
      console.log("❌ ERROR: Faltan campos requeridos:", {
        nombres: !!nombres,
        apellidos: !!apellidos,
        correo_electronico: !!correo_electronico,
        contrasena: !!contrasena,
        rol: !!rol
      })
      return NextResponse.json({ 
        error: "Faltan campos requeridos: nombres, apellidos, correo_electronico, contrasena, rol" 
      }, { status: 400 })
    }
    console.log("✅ Validaciones de campos requeridos pasaron")

    // Validar rol permitido
    console.log("🔍 Validando rol permitido...")
    const rolesPermitidos = [
      'medico', 
      'enfermera', 
      'administrador', 
      'recepcionista', 
      'contador', 
      'secretario',
      'laboratorio',   // ← NUEVO
      'ultrasonido'    // ← NUEVO
    ]
    if (!rolesPermitidos.includes(rol)) {
      console.log("❌ ERROR: Rol no permitido:", rol)
      return NextResponse.json({ 
        error: `Rol no permitido. Roles válidos: ${rolesPermitidos.join(', ')}` 
      }, { status: 400 })
    }
    console.log("✅ Rol válido:", rol)

    // Verificar que el email no exista
    console.log("🔍 Verificando email único...")
    const emailExists = await executeQuery(
      "SELECT id_usuario FROM usuarios WHERE correo_electronico = ?",
      [correo_electronico]
    )

    if (Array.isArray(emailExists) && emailExists.length > 0) {
      console.log("❌ ERROR: Email ya existe:", emailExists)
      return NextResponse.json({ error: "El correo electrónico ya está registrado" }, { status: 409 })
    }
    console.log("✅ Email único verificado")



    // Hash de la contraseña
    console.log("🔐 Encriptando contraseña...")
    const hashedPassword = await bcrypt.hash(contrasena, 10)
    console.log("✅ Contraseña encriptada")

    // Crear el nuevo usuario
    console.log("👤 Creando nuevo usuario...")
    const result = await executeQuery(
      `INSERT INTO usuarios (
        nombres, 
        apellidos, 
        correo_electronico, 
        contraseña,
        telefono,
        direccion,
        cedula_profesional,
        especialidad,
        rol,
        estado,
        fecha_registro
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        nombres,
        apellidos,
        correo_electronico,
        hashedPassword,
        telefono || null,
        direccion || null,
        cedula_profesional || null,
        especialidad || null,
        rol,
        estado || 'activo'
      ]
    )

    console.log("✅ Usuario creado exitosamente:", result)

    console.log("=== API USERS POST - ÉXITO ===")
    return NextResponse.json({ 
      message: "Usuario creado exitosamente",
      usuario: {
        nombres,
        apellidos,
        correo_electronico,
        rol,
        estado: estado || 'activo'
      }
    })

  } catch (error) {
    console.error("=== ERROR EN API USERS POST ===")
    console.error("Error creando usuario:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("=== API USERS DELETE - Iniciando ===")
    
    // Autenticar usuario
    const authResult = await authenticateRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    console.log("Usuario autenticado:", authResult.id_usuario, "Rol:", authResult.rol)

    // Verificar permisos de administrador
    if (authResult.rol !== "administrador") {
      console.log("ERROR: Acceso denegado, rol:", authResult.rol)
      // return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("id")
    
    if (!userId) {
      console.log("ERROR: No se proporcionó ID de usuario")
      return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 })
    }

    // Verificar que el usuario a eliminar existe
    console.log("Verificando existencia del usuario a eliminar...")
    const userCheck = await executeQuery(
      `SELECT id_usuario, nombres, apellidos FROM usuarios WHERE id_usuario = ?`,
      [userId]
    )

    if (!Array.isArray(userCheck) || userCheck.length === 0) {
      console.log("ERROR: Usuario a eliminar no encontrado")
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // No permitir auto-eliminación
    if (userId === authResult.id_usuario) {
      console.log("ERROR: No se puede eliminar a sí mismo")
      return NextResponse.json({ error: "No puedes eliminar tu propia cuenta" }, { status: 400 })
    }

    // Eliminar usuario (soft delete - cambiar estado a inactivo)
    console.log("Eliminando usuario (soft delete)...")
    await executeQuery(
      `UPDATE usuarios SET estado = 'inactivo', updated_at = NOW() WHERE id_usuario = ?`,
      [userId]
    )

    console.log("Usuario eliminado exitosamente")

    console.log("=== API USERS DELETE - ÉXITO ===")
    return NextResponse.json({ message: "Usuario eliminado exitosamente" })
  } catch (error) {
    console.error("=== ERROR EN API USERS DELETE ===")
    console.error("Error eliminando usuario:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
