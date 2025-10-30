import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"
import { authenticateRequest } from "@/lib/auth-middleware"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const {
      paciente_id,
      consulta_id,
      tipo_consulta,
      cabeza,
      cuello,
      torax,
      abdomen,
      extremidades,
      ojos,
      dientes,
      tiroides,
      pulmones,
      corazon,
      higado,
      genitales,
      nariz,
      ganglios,
      recto
    } = body

    if (!paciente_id || !tipo_consulta) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    const result = await executeQuery(
      `INSERT INTO examen_fisico (
        paciente_id, consulta_id, tipo_consulta, cabeza, cuello,
        torax, abdomen, extremidades, ojos, dientes, tiroides,
        pulmones, corazon, higado, genitales, nariz, ganglios,
        recto, usuario_registro
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        paciente_id,
        consulta_id || null,
        tipo_consulta,
        cabeza || null,
        cuello || null,
        torax || null,
        abdomen || null,
        extremidades || null,
        ojos || null,
        dientes || null,
        tiroides || null,
        pulmones || null,
        corazon || null,
        higado || null,
        genitales || null,
        nariz || null,
        ganglios || null,
        recto || null,
        authResult.id_usuario
      ]
    )

    return NextResponse.json(
      {
        id_examen: (result as any).insertId,
        message: "Examen físico creado exitosamente",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creando examen físico:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
