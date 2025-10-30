import { type NextRequest, NextResponse } from "next/server"
import { pool, generateUUID } from "@/lib/mysql"
import { authenticateRequest } from "@/lib/auth-middleware"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const {
      pacienteId,
      antecedentePersonales,
      antecedentesFamiliares,
      medicamentosActuales,
      alergias,
      cirugiasPrevias,
      hospitalizaciones,
    } = body

    if (!pacienteId) {
      return NextResponse.json({ error: "ID del paciente es requerido" }, { status: 400 })
    }

    const connection = await pool.getConnection()

    try {
      const historialId = generateUUID()

      await connection.execute(
        `INSERT INTO historial_medico (
          id, paciente_id, antecedentes_personales, antecedentes_familiares,
          medicamentos_actuales, alergias, cirugias_previas, hospitalizaciones
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          historialId,
          pacienteId,
          antecedentePersonales,
          antecedentesFamiliares,
          medicamentosActuales,
          alergias,
          cirugiasPrevias,
          hospitalizaciones,
        ],
      )

      const [newHistorial] = await connection.execute("SELECT * FROM historial_medico WHERE id = ?", [historialId])

      return NextResponse.json(
        {
          message: "Historial médico registrado exitosamente",
          historial: (newHistorial as any[])[0],
        },
        { status: 201 },
      )
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Error registrando historial médico:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
