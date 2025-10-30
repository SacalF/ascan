import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"
import { authenticateRequest } from "@/lib/auth-middleware-improved"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const citaResults = await executeQuery(
      `SELECT c.*, CONCAT(p.nombres, ' ', p.apellidos) as paciente_nombre,
              p.telefono, p.correo_electronico as email
       FROM cita c
       LEFT JOIN pacientes p ON c.paciente_id = p.id_paciente
       WHERE c.id_cita = ?`,
      [params.id],
    )

    if (!Array.isArray(citaResults) || citaResults.length === 0) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 })
    }

    return NextResponse.json(citaResults[0])
  } catch (error) {
    console.error("Error fetching cita:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[BACKEND] Iniciando actualización de cita:", params.id)
    
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      console.log("[BACKEND] Error de autenticación:", authResult.error)
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const body = await request.json()
    console.log("[BACKEND] Datos recibidos:", body)
    
    const { fecha_hora, motivo, numero_clinica, estado, notas, paciente_id, medico_id } = body

    // Validar que el estado sea válido
    const estadosValidos = ['programada', 'confirmada', 'completada', 'cancelada', 'no_asistio']
    if (estado && !estadosValidos.includes(estado)) {
      console.log("[BACKEND] Estado inválido:", estado)
      return NextResponse.json({ error: "Estado de cita inválido" }, { status: 400 })
    }

    console.log("[BACKEND] Actualizando cita con estado:", estado)

    // Construir la consulta dinámicamente basada en los campos proporcionados
    const updateFields = []
    const updateValues = []

    if (fecha_hora !== undefined) {
      updateFields.push("fecha_hora = ?")
      updateValues.push(fecha_hora)
    }
    if (motivo !== undefined) {
      updateFields.push("motivo = ?")
      updateValues.push(motivo)
    }
    if (estado !== undefined) {
      updateFields.push("estado = ?")
      updateValues.push(estado)
    }
    if (notas !== undefined) {
      updateFields.push("notas = ?")
      updateValues.push(notas)
    }
    if (paciente_id !== undefined) {
      updateFields.push("paciente_id = ?")
      updateValues.push(paciente_id)
    }
    if (medico_id !== undefined) {
      updateFields.push("medico_id = ?")
      updateValues.push(medico_id)
    }
    if (numero_clinica !== undefined) {
      updateFields.push("numero_clinica = ?")
      updateValues.push(numero_clinica)
    }

    // Siempre actualizar updated_at
    updateFields.push("updated_at = NOW()")
    updateValues.push(params.id)

    if (updateFields.length === 1) { // Solo updated_at
      console.log("[BACKEND] No hay campos para actualizar")
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    const query = `UPDATE cita SET ${updateFields.join(', ')} WHERE id_cita = ?`
    console.log("[BACKEND] Query:", query)
    console.log("[BACKEND] Values:", updateValues)

    await executeQuery(query, updateValues)

    console.log("[BACKEND] Cita actualizada exitosamente")
    return NextResponse.json({ message: "Cita actualizada exitosamente" })
  } catch (error) {
    console.error("[BACKEND] Error updating cita:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    await executeQuery("DELETE FROM cita WHERE id_cita = ?", [params.id])
    return NextResponse.json({ message: "Cita eliminada exitosamente" })
  } catch (error) {
    console.error("Error deleting cita:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
