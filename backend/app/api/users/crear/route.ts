import { type NextRequest, NextResponse } from "next/server"
import { pool, verifyToken, hashPassword } from "@/lib/mysql"

export async function POST(request: NextRequest) {
  try {
    console.log("=== API USERS CREAR POST - Iniciando ===")
    
    const token = request.cookies.get("session-token")?.value
    console.log("Token recibido:", token ? "Sí" : "No")

    if (!token) {
      console.log("ERROR: No hay token")
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    console.log("Verificando token...")
    const decoded = verifyToken(token)
    if (!decoded) {
      console.log("ERROR: Token inválido")
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }
    console.log("Token válido, usuario:", decoded)

    const body = await request.json()
    const { 
      nombres, 
      apellidos, 
      nombre_usuario, 
      correo_electronico, 
      contraseña, 
      telefono, 
      cedula_profesional, 
      especialidad, 
      rol 
    } = body

    console.log("Datos recibidos para crear usuario:", { 
      nombres, apellidos, nombre_usuario, correo_electronico, 
      telefono, cedula_profesional, especialidad, rol 
    })

    // Validaciones básicas
    if (!nombres || !apellidos || !nombre_usuario || !correo_electronico || !contraseña || !rol) {
      console.log("ERROR: Faltan campos requeridos")
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    console.log("Obteniendo conexión a la base de datos...")
    const connection = await pool.getConnection()
    console.log("Conexión obtenida")

    try {
      // Verificar que el usuario tenga permisos de administrador
      console.log("Verificando permisos de administrador...")
      const [adminCheck] = await connection.execute(
        `SELECT u.rol FROM usuarios u 
         WHERE u.id_usuario = ? AND u.estado = 'activo'`,
        [decoded.userId],
      )
      console.log("Resultado adminCheck:", adminCheck)

      if (!Array.isArray(adminCheck) || adminCheck.length === 0) {
        console.log("ERROR: Usuario no encontrado o inactivo")
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 })
      }

      const userRole = (adminCheck[0] as any).rol
      console.log("Rol del usuario:", userRole)
      if (userRole !== "administrador") {
        console.log("ERROR: Acceso denegado, rol:", userRole)
        return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
      }

      // Verificar que el nombre de usuario no exista
      console.log("Verificando nombre de usuario único...")
      const [usuarioExistente] = await connection.execute(
        `SELECT id_usuario FROM usuarios WHERE nombre_usuario = ? OR correo_electronico = ?`,
        [nombre_usuario, correo_electronico]
      )

      if (Array.isArray(usuarioExistente) && usuarioExistente.length > 0) {
        console.log("ERROR: Usuario o email ya existe")
        return NextResponse.json({ error: "El nombre de usuario o email ya existe" }, { status: 400 })
      }

      // Generar ID único para el usuario
      const id_usuario = crypto.randomUUID()
      console.log("ID de usuario generado:", id_usuario)

      // Hashear contraseña
      console.log("Hasheando contraseña...")
      const contraseñaHash = await hashPassword(contraseña)

      // Crear usuario
      console.log("Creando usuario en la base de datos...")
      const [result] = await connection.execute(
        `INSERT INTO usuarios (
           id_usuario, nombres, apellidos, nombre_usuario, contraseña, 
           correo_electronico, telefono, cedula_profesional, especialidad, 
           rol, estado, fecha_registro
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo', NOW())`,
        [
          id_usuario, nombres, apellidos, nombre_usuario, contraseñaHash,
          correo_electronico, telefono || null, cedula_profesional || null, 
          especialidad || null, rol
        ]
      )

      console.log("Usuario creado exitosamente:", result)

      // Registrar en historial
      try {
        await connection.execute(
          `INSERT INTO historial_usuario (id_historial, fecha_hora, id_usuario, tipo_accion, modulo, descripcion, ip_address)
           VALUES (UUID(), NOW(), ?, 'create', 'usuarios', ?, ?)`,
          [decoded.userId, `Usuario creado: ${nombres} ${apellidos} (${nombre_usuario})`, request.headers.get('x-forwarded-for') || 'unknown']
        )
      } catch (historialError) {
        console.log("Error registrando en historial:", historialError)
        // No fallar la operación por error de historial
      }

      console.log("=== API USERS CREAR POST - ÉXITO ===")
      return NextResponse.json({ 
        message: "Usuario creado exitosamente",
        id_usuario: id_usuario
      }, { status: 201 })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("=== ERROR EN API USERS CREAR POST ===")
    console.error("Error creando usuario:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
