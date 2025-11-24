import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"
import { authenticateRequest } from "@/lib/auth-middleware"
import { randomUUID } from "crypto"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const body = await request.json()
    
    // Extraer datos del body
    const paciente_id = body.paciente_id
    const enfermera_id = body.enfermera_id
    const fecha_valoracion = body.fecha_valoracion // Fecha en la que se realizó la valoración
    const peso = body.peso
    const talla = body.talla
    const pulso = body.pulso
    const respiracion = body.respiracion
    const presion_arterial = body.presion_arterial
    const temperatura = body.temperatura

    // Usar el ID del usuario autenticado como fallback si no viene enfermera_id
    const finalEnfermeraId = enfermera_id || (authResult ? authResult.id_usuario : null)

    // Validar campos requeridos
    const camposFaltantes = []
    if (!paciente_id) camposFaltantes.push('paciente_id')
    if (!finalEnfermeraId) camposFaltantes.push('enfermera_id')
    
    if (camposFaltantes.length > 0) {
      console.error("Campos faltantes en valoración:", camposFaltantes)
      console.error("Datos recibidos:", { paciente_id, enfermera_id: finalEnfermeraId })
      return NextResponse.json(
        { error: `Faltan campos requeridos: ${camposFaltantes.join(', ')}` },
        { status: 400 }
      )
    }

    // Generar ID único para la valoración
    const id_valoracion = randomUUID()

    // Insertar en la base de datos
    // Nota: fecha_registro y created_at se llenan automáticamente por el timestamp
    // fecha_valoracion es la fecha en la que se realizó la valoración
    const result = await executeQuery(
      `INSERT INTO valoracion (
        id_valoracion, paciente_id, enfermera_id, fecha_valoracion, peso, talla, pulso,
        respiracion, presion_arterial, temperatura, usuario_registro
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_valoracion,
        paciente_id,
        finalEnfermeraId,
        fecha_valoracion || null, // Si no se proporciona, se deja NULL (puede usar fecha_registro como fallback)
        peso !== null && peso !== undefined ? peso : null,
        talla !== null && talla !== undefined ? talla : null,
        pulso !== null && pulso !== undefined ? pulso : null,
        respiracion !== null && respiracion !== undefined ? respiracion : null,
        presion_arterial || null,
        temperatura !== null && temperatura !== undefined ? temperatura : null,
        authResult ? authResult.id_usuario : null
      ]
    )

    return NextResponse.json(
      {
        id_valoracion: id_valoracion,
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
