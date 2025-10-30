import { type NextRequest, NextResponse } from "next/server"
import { pool, hashPassword, generateUUID } from "@/lib/mysql"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      nombres, 
      apellidos, 
      password, 
      correoElectronico, 
      telefono, 
      direccion,
      cedulaProfesional, 
      especialidad, 
      rol = "medico" 
    } = body

    // Validaciones básicas
    if (!nombres || !apellidos || !password || !correoElectronico) {
      return NextResponse.json({ error: "Nombres, apellidos, contraseña y correo electrónico son requeridos" }, { status: 400 })
    }

    const connection = await pool.getConnection()

    try {
      // Verificar si el usuario ya existe
      const [existingUsers] = await connection.execute(
        "SELECT id_usuario FROM usuarios WHERE correo_electronico = ?", 
        [correoElectronico]
      )

      if (Array.isArray(existingUsers) && existingUsers.length > 0) {
        return NextResponse.json({ error: "El usuario ya existe" }, { status: 409 })
      }

      // Hash de la contraseña
      const passwordHash = await hashPassword(password)
      const userId = generateUUID()

      // Crear usuario en la nueva tabla unificada
      await connection.execute(
        `INSERT INTO usuarios (
          id_usuario, nombres, apellidos, contraseña, 
          correo_electronico, telefono, direccion, estado, fecha_registro,
          cedula_profesional, especialidad, rol
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'activo', NOW(), ?, ?, ?)`,
        [
          userId, nombres, apellidos, passwordHash,
          correoElectronico, telefono, direccion,
          cedulaProfesional, especialidad, rol
        ]
      )

      // Registrar en historial
      await connection.execute(
        `INSERT INTO historial_usuario (id_usuario, tipo_accion, modulo, descripcion, datos_nuevos) 
         VALUES (?, 'create', 'usuarios', 'Nuevo usuario registrado', ?)`,
        [userId, JSON.stringify({ nombres, apellidos, rol })]
      )

      return NextResponse.json(
        {
          message: "Usuario registrado exitosamente",
          user: {
            id_usuario: userId,
            nombres,
            apellidos,
            correo_electronico: correoElectronico,
            rol,
          },
        },
        { status: 201 },
      )
    } catch (error) {
      console.error("Error en registro:", error)
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Error en registro:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
