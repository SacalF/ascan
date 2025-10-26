import { type NextRequest, NextResponse } from "next/server"
import { pool, generateUUID } from "@/lib/mysql"
import { authenticateRequest } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const pacienteId = searchParams.get("paciente_id")
    const limit = Number.parseInt(searchParams.get("limit") || "20") || 20
    const offset = Number.parseInt(searchParams.get("offset") || "0") || 0

    // Obtener fecha actual en formato YYYY-MM-DD
    const fechaActual = new Date().toISOString().split('T')[0]
    console.log("=== FILTRO DE FECHAS CONSULTAS ===")
    console.log("Fecha actual (filtro):", fechaActual)

    const connection = await pool.getConnection()

    try {
      // Obtener citas programadas con información del paciente
      let query = `
        SELECT 
          c.id_cita as id,
          c.paciente_id,
          c.medico_id,
          c.fecha_hora,
          c.motivo as motivo_consulta,
          c.estado,
          '' as notas,
          p.nombres,
          p.apellidos,
          p.telefono,
          p.correo_electronico,
          p.fecha_nacimiento,
          p.sexo,
          u.nombres as medico_nombre,
          u.apellidos as medico_apellidos,
          c.created_at
         FROM cita c
         LEFT JOIN pacientes p ON c.paciente_id = p.id_paciente
         LEFT JOIN usuarios u ON c.medico_id = u.id_usuario
        WHERE c.estado IN ('programada', 'confirmada')
        AND DATE(c.fecha_hora) >= ?
      `
      
      const params: any[] = [fechaActual]

      if (pacienteId) {
        query += ` AND c.paciente_id = ?`
        params.push(pacienteId)
      }

      // Ordenar por fecha de la cita - sanitizando LIMIT y OFFSET
      const sanitizedLimit = Math.max(1, Math.min(100, limit || 10))
      const sanitizedOffset = Math.max(0, offset || 0)
      query += ` ORDER BY c.fecha_hora ASC LIMIT ? OFFSET ?`
      params.push(sanitizedLimit.toString(), sanitizedOffset.toString())


      const [citas] = await connection.execute(query, params)
      console.log("=== CITAS ENCONTRADAS EN CONSULTAS ===")
      console.log("Número de citas:", Array.isArray(citas) ? citas.length : 0)
      console.log("Citas:", citas)

      // Obtener total de citas para paginación
      let countQuery = `
        SELECT COUNT(*) as total
         FROM cita c
        WHERE c.estado IN ('programada', 'confirmada')
        AND DATE(c.fecha_hora) >= ?
      `
      const countParams: any[] = [fechaActual]
      
      if (pacienteId) {
        countQuery += ` AND c.paciente_id = ?`
        countParams.push(pacienteId)
      }
      
      const [countResult] = await connection.execute(countQuery, countParams)
      const total = (countResult as any[])[0]?.total || 0

      return NextResponse.json({ 
        consultas: citas,
        total,
        limit,
        offset
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Error obteniendo consultas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const {
      pacienteId,
      tipoConsulta,
      motivoConsulta,
      diagnostico,
      planTratamiento,
      fechaConsulta,
      // Campos específicos para consulta inicial
      primerSintoma,
      fechaPrimerSintoma,
      antecedentesMedicos,
      antecedentesQuirurgicos,
      revisionSistemas,
      menstruacionMenarca,
      menstruacionUltima,
      gravidez,
      partos,
      abortos,
      habitosTabaco,
      habitosOtros,
      historiaFamiliar,
      // Campos específicos para consulta de seguimiento
      evolucion,
      notas,
      tratamientoActual,
      consultaInicialId
    } = body

    // Validaciones básicas
    if (!pacienteId || !tipoConsulta) {
      return NextResponse.json({ error: "Paciente y tipo de consulta son requeridos" }, { status: 400 })
    }

    const connection = await pool.getConnection()

    try {
      if (tipoConsulta === 'inicial') {
        // Crear consulta inicial
        const consultaId = generateUUID()
        
        await connection.execute(
          `INSERT INTO consulta_inicial (
            id_consulta, paciente_id, medico_id, fecha_consulta, medico,
            primer_sintoma, fecha_primer_sintoma, antecedentes_medicos,
            antecedentes_quirurgicos, revision_sistemas, menstruacion_menarca,
            menstruacion_ultima, gravidez, partos, abortos, habitos_tabaco,
            habitos_otros, historia_familiar, diagnostico, tratamiento,
            usuario_registro
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            consultaId,
            pacienteId,
            user.id_usuario,
            fechaConsulta || new Date().toISOString().split('T')[0],
            `${user.nombres} ${user.apellidos}`,
            primerSintoma || motivoConsulta,
            fechaPrimerSintoma,
            antecedentesMedicos,
            antecedentesQuirurgicos,
            revisionSistemas,
            menstruacionMenarca,
            menstruacionUltima,
            gravidez || 0,
            partos || 0,
            abortos || 0,
            habitosTabaco || 0,
            habitosOtros,
            historiaFamiliar,
            diagnostico,
            planTratamiento,
            user.id_usuario
          ],
        )

        return NextResponse.json(
          {
            message: "Consulta inicial registrada exitosamente",
            consulta: { id: consultaId, tipo_consulta: 'inicial' },
          },
          { status: 201 },
        )

      } else if (tipoConsulta === 'seguimiento') {
        // Crear consulta de seguimiento
        const seguimientoId = generateUUID()
        
        await connection.execute(
          `INSERT INTO consulta_seguimiento (
            id_seguimiento, paciente_id, medico_id, consulta_inicial_id,
            fecha, medico, evolucion, notas, tratamiento_actual, usuario_registro
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            seguimientoId,
            pacienteId,
            user.id_usuario,
            consultaInicialId,
            fechaConsulta || new Date().toISOString().split('T')[0],
            `${user.nombres} ${user.apellidos}`,
            evolucion || diagnostico,
            notas || motivoConsulta,
            tratamientoActual || planTratamiento,
            user.id_usuario
          ],
        )

        return NextResponse.json(
          {
            message: "Consulta de seguimiento registrada exitosamente",
            consulta: { id: seguimientoId, tipo_consulta: 'seguimiento' },
          },
          { status: 201 },
        )
      } else {
        return NextResponse.json({ error: "Tipo de consulta no válido" }, { status: 400 })
      }

    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Error registrando consulta:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
