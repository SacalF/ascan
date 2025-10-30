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
      enfermera_id,
      peso,
      talla,
      pulso,
      respiracion,
      presion_arterial,
      temperatura
    } = body

    if (!paciente_id || !enfermera_id) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    const result = await executeQuery(
      `INSERT INTO valoracion (
        paciente_id, enfermera_id, peso, talla, pulso,
        respiracion, presion_arterial, temperatura, usuario_registro
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        paciente_id,
        enfermera_id,
        peso,
        talla,
        pulso,
        respiracion,
        presion_arterial,
        temperatura,
        authResult.id_usuario
      ]
    )

    return NextResponse.json(
      {
        id_valoracion: (result as any).insertId,
        message: "Valoración creada exitosamente",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creando valoración:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}