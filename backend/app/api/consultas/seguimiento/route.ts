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
    console.log("Datos recibidos en seguimiento:", body)
    
    const {
      paciente_id,
      medico_id,
      fecha,
      medico,
      evolucion,
      notas,
      tratamiento_actual
    } = body

    if (!paciente_id || !medico_id || !fecha || !medico) {
      console.log("Campos faltantes:", {
        paciente_id: !!paciente_id,
        medico_id: !!medico_id,
        fecha: !!fecha,
        medico: !!medico
      })
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    console.log("Ejecutando query con datos:", {
      paciente_id,
      medico_id,
      fecha,
      medico,
      evolucion: evolucion || null,
      notas: notas || null,
      tratamiento_actual: tratamiento_actual || null,
      usuario_registro: authResult.id_usuario
    })

    const result = await executeQuery(
      `INSERT INTO consulta_seguimiento (
        paciente_id, medico_id, fecha, medico,
        evolucion, notas, tratamiento_actual, usuario_registro
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        paciente_id,
        medico_id,
        fecha,
        medico,
        evolucion || null,
        notas || null,
        tratamiento_actual || null,
        authResult.id_usuario
      ]
    )

    console.log("Resultado del query:", result)

    return NextResponse.json(
      {
        id_seguimiento: (result as any).insertId,
        message: "Consulta de seguimiento creada exitosamente",
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creando consulta de seguimiento:", error)
    console.error("Stack trace:", error.stack)
    
    // Si es un error de MySQL, incluir más detalles
    if (error.code) {
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)
    }
    
    return NextResponse.json(
      { 
        error: "Error interno del servidor"
        // NO incluir details, stack, o códigos internos por seguridad
      },
      { status: 500 }
    )
  }
}
