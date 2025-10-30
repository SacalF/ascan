import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"
import { authenticateRequest } from "@/lib/auth-middleware"

export const dynamic = 'force-dynamic'

// Función para generar UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const {
      paciente_id,
      medico_id,
      fecha_consulta,
      medico,
      primer_sintoma,
      fecha_primer_sintoma,
      antecedentes_medicos,
      antecedentes_quirurgicos,
      revision_sistemas,
      menstruacion_menarca,
      menstruacion_ultima,
      gravidez,
      partos,
      abortos,
      habitos_tabaco,
      habitos_otros,
      historia_familiar,
      diagnostico,
      tratamiento
    } = body

    if (!paciente_id || !medico_id || !fecha_consulta || !medico) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    // Generar un ID único para la consulta
    const id_consulta = generateUUID()
    
    console.log("Fecha de consulta recibida:", fecha_consulta)
    
    const result = await executeQuery(
      `INSERT INTO consulta_inicial (
        id_consulta, paciente_id, medico_id, fecha_consulta, medico,
        primer_sintoma, fecha_primer_sintoma, antecedentes_medicos,
        antecedentes_quirurgicos, revision_sistemas, menstruacion_menarca,
        menstruacion_ultima, gravidez, partos, abortos,
        habitos_tabaco, habitos_otros, historia_familiar,
        diagnostico, tratamiento, usuario_registro
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_consulta,
        paciente_id,
        medico_id,
        fecha_consulta,
        medico,
        primer_sintoma || null,
        fecha_primer_sintoma || null,
        antecedentes_medicos || null,
        antecedentes_quirurgicos || null,
        revision_sistemas || null,
        menstruacion_menarca || null,
        menstruacion_ultima || null,
        gravidez || 0,
        partos || 0,
        abortos || 0,
        habitos_tabaco || 0,
        habitos_otros || null,
        historia_familiar || null,
        diagnostico || null,
        tratamiento || null,
        authResult.id_usuario
      ]
    )

    console.log("Consulta inicial creada con ID:", id_consulta)

    return NextResponse.json(
      {
        id_consulta: id_consulta,
        id: id_consulta,
        message: "Consulta inicial creada exitosamente",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creando consulta inicial:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
