import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"
import { authenticateRequest } from "@/lib/auth-middleware-improved"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { id } = await params

    const query = `
      SELECT l.*, p.nombres, p.apellidos, p.numero_registro_medico, p.fecha_nacimiento, p.sexo
      FROM resultados_laboratorio l
      LEFT JOIN pacientes p ON l.paciente_id = p.id_paciente
      WHERE l.id = ?
    `

    const result = await executeQuery(query, [id])
    const laboratorios = Array.isArray(result) ? result : []

    if (laboratorios.length === 0) {
      return NextResponse.json({ error: "Resultado no encontrado" }, { status: 404 })
    }

    const laboratorio = laboratorios[0]
    
    // Combinar nombres y apellidos para el paciente
    const paciente_nombre = `${laboratorio.nombres || ''} ${laboratorio.apellidos || ''}`.trim()

    return NextResponse.json({
      ...laboratorio,
      paciente_nombre: paciente_nombre || "Paciente sin nombre"
    })
  } catch (error) {
    console.error("Error obteniendo resultado de laboratorio:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { id } = await params

    // Verificar que el resultado existe
    const checkQuery = "SELECT id FROM resultados_laboratorio WHERE id = ?"
    const checkResult = await executeQuery(checkQuery, [id])
    const results = Array.isArray(checkResult) ? checkResult : []

    if (results.length === 0) {
      return NextResponse.json({ error: "Resultado no encontrado" }, { status: 404 })
    }

    // Eliminar el resultado
    const deleteQuery = "DELETE FROM resultados_laboratorio WHERE id = ?"
    await executeQuery(deleteQuery, [id])

    return NextResponse.json({ message: "Resultado eliminado exitosamente" })
  } catch (error) {
    console.error("Error eliminando resultado de laboratorio:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}