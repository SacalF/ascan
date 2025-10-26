import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"
import { authenticateRequest } from "@/lib/auth-middleware"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const user = await authenticateRequest(request)

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Obtener información del paciente
    const pacientes = await executeQuery("SELECT * FROM pacientes WHERE id_paciente = ?", [id])

    if (!Array.isArray(pacientes) || pacientes.length === 0) {
      return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 })
    }

    const paciente = pacientes[0]

    // Obtener citas del paciente
    const citas = await executeQuery(
      `SELECT c.*, u.nombres as medico_nombre, u.apellidos as medico_apellidos
       FROM cita c
       LEFT JOIN usuarios u ON c.medico_id = u.id_usuario
       WHERE c.paciente_id = ? 
       ORDER BY c.fecha_hora DESC 
       LIMIT 20`,
      [id],
    )

    // Obtener consultas iniciales
    const consultasIniciales = await executeQuery(
      `SELECT ci.*, u.nombres as medico_nombre, u.apellidos as medico_apellidos
       FROM consulta_inicial ci
       LEFT JOIN usuarios u ON ci.medico_id = u.id_usuario
       WHERE ci.paciente_id = ? 
       ORDER BY ci.fecha_consulta DESC 
       LIMIT 10`,
      [id],
    )

    // Obtener consultas de seguimiento
    const consultasSeguimiento = await executeQuery(
      `SELECT cs.*, u.nombres as medico_nombre, u.apellidos as medico_apellidos
       FROM consulta_seguimiento cs
       LEFT JOIN usuarios u ON cs.medico_id = u.id_usuario
       WHERE cs.paciente_id = ? 
       ORDER BY cs.fecha DESC 
       LIMIT 10`,
      [id],
    )

    // Obtener valoraciones
    const valoraciones = await executeQuery(
      `SELECT v.*, u.nombres as enfermera_nombre, u.apellidos as enfermera_apellidos
       FROM valoracion v
       LEFT JOIN usuarios u ON v.enfermera_id = u.id_usuario
       WHERE v.paciente_id = ? 
       ORDER BY v.fecha_registro DESC 
       LIMIT 20`,
      [id],
    )

    // Obtener exámenes físicos
    const examenesFisicos = await executeQuery(
      `SELECT ef.*, u.nombres as medico_nombre, u.apellidos as medico_apellidos
       FROM examen_fisico ef
       LEFT JOIN usuarios u ON ef.usuario_registro = u.id_usuario
       WHERE ef.paciente_id = ? 
       ORDER BY ef.created_at DESC 
       LIMIT 10`,
      [id],
    )

    // Obtener resultados de laboratorio
    const laboratorios = await executeQuery(
      `SELECT * FROM resultados_laboratorio
       WHERE paciente_id = ? 
       ORDER BY fecha_examen DESC 
       LIMIT 20`,
      [id],
    )

    return NextResponse.json({
      paciente,
      citas,
      consultasIniciales,
      consultasSeguimiento,
      valoraciones,
      examenesFisicos,
      laboratorios,
    })
  } catch (error) {
    console.error("Error obteniendo paciente:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const user = await authenticateRequest(request)

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      numero_registro_medico, nombres, apellidos, dpi, sexo, estado_civil,
      telefono, correo_electronico, direccion, fecha_nacimiento, lugar_nacimiento,
      ocupacion, raza, conyuge, padre_madre, lugar_trabajo, nombre_responsable,
      telefono_responsable
    } = body

    // Verificar que el paciente existe
    const existing = await executeQuery("SELECT id_paciente FROM pacientes WHERE id_paciente = ?", [id])

    if (!Array.isArray(existing) || existing.length === 0) {
      return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 })
    }

    // Actualizar paciente
    await executeQuery(
      `UPDATE pacientes SET 
       numero_registro_medico = ?, nombres = ?, apellidos = ?, dpi = ?, sexo = ?, 
       estado_civil = ?, telefono = ?, correo_electronico = ?, direccion = ?, 
       fecha_nacimiento = ?, lugar_nacimiento = ?, ocupacion = ?, raza = ?, 
       conyuge = ?, padre_madre = ?, lugar_trabajo = ?, nombre_responsable = ?, 
       telefono_responsable = ?
       WHERE id_paciente = ?`,
      [numero_registro_medico, nombres, apellidos, dpi, sexo, estado_civil,
       telefono, correo_electronico, direccion, fecha_nacimiento, lugar_nacimiento,
       ocupacion, raza, conyuge, padre_madre, lugar_trabajo, nombre_responsable,
       telefono_responsable, id],
    )

    // Obtener paciente actualizado
    const updated = await executeQuery("SELECT * FROM pacientes WHERE id_paciente = ?", [id])

    return NextResponse.json({
      message: "Paciente actualizado exitosamente",
      paciente: updated[0],
    })
  } catch (error) {
    console.error("Error actualizando paciente:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const user = await authenticateRequest(request)

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Solo administradores pueden eliminar pacientes
    if (user.rol !== "administrador") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Verificar que el paciente existe
    const existing = await executeQuery("SELECT id_paciente FROM pacientes WHERE id_paciente = ?", [id])

    if (!Array.isArray(existing) || existing.length === 0) {
      return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 })
    }

    // Eliminar paciente (las referencias se eliminan por CASCADE)
    await executeQuery("DELETE FROM pacientes WHERE id_paciente = ?", [id])

    return NextResponse.json({
      message: "Paciente eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error eliminando paciente:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
