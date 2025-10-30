import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"
import { authenticateRequest } from "@/lib/auth-middleware-improved"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fecha = searchParams.get("fecha")
    const pacienteId = searchParams.get("paciente_id")

    // Obtener fecha actual en formato YYYY-MM-DD (zona horaria local)
    const fechaActual = new Date().toLocaleDateString('en-CA') // Formato YYYY-MM-DD
    console.log("=== FILTRO DE FECHAS CITAS ===")
    console.log("Fecha actual (filtro):", fechaActual)
    console.log("Zona horaria del servidor:", Intl.DateTimeFormat().resolvedOptions().timeZone)
    
    let query = `
      SELECT c.*, CONCAT(p.nombres, ' ', p.apellidos) as paciente_nombre
      FROM cita c
      LEFT JOIN pacientes p ON c.paciente_id = p.id_paciente
      WHERE DATE(c.fecha_hora) >= ?
    `
    const params: any[] = [fechaActual] // Agregar fecha actual como primer parámetro

    if (fecha) {
      query += " AND DATE(c.fecha_hora) = ?"
      params.push(fecha)
      console.log("Filtro por fecha específica:", fecha)
    }

    if (pacienteId) {
      query += " AND c.paciente_id = ?"
      params.push(pacienteId)
    }

    query += " ORDER BY c.fecha_hora ASC"

    console.log("Query final:", query)
    console.log("Parámetros:", params)
    const citas = await executeQuery(query, params)
    console.log("Citas encontradas:", citas)
    console.log("Número de citas:", Array.isArray(citas) ? citas.length : 0)
    
    // Log detallado de fechas
    if (Array.isArray(citas)) {
      citas.forEach((cita, index) => {
        console.log(`=== CITA ${index + 1} ===`)
        console.log("ID:", cita.id_cita)
        console.log("Fecha original en BD:", cita.fecha_hora)
        console.log("Tipo de fecha:", typeof cita.fecha_hora)
        
        if (cita.fecha_hora) {
          const date = new Date(cita.fecha_hora)
          console.log("Fecha parseada:", date)
          console.log("Fecha ISO:", date.toISOString())
          console.log("Fecha local:", date.toString())
          console.log("Día de la semana:", date.getDay())
          console.log("Fecha formateada (local):", date.toLocaleDateString('es', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }))
        }
        console.log("Paciente:", cita.paciente_nombre)
        console.log("Motivo:", cita.motivo)
        console.log("Estado:", cita.estado)
        console.log("========================")
      })
    }
    
    return NextResponse.json({ citas: Array.isArray(citas) ? citas : [] })
  } catch (error) {
    console.error("Error fetching citas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: authResult.error || "Usuario no autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { fecha_hora, paciente_id, medico_id, motivo, estado, paciente_nombre } = body
    
    console.log("=== DATOS RECIBIDOS PARA CREAR CITA ===")
    console.log("fecha_hora:", fecha_hora)
    console.log("paciente_id:", paciente_id)
    console.log("medico_id:", medico_id)
    console.log("motivo:", motivo)
    console.log("estado:", estado)
    console.log("paciente_nombre:", paciente_nombre)

    // Convertir fecha ISO a formato MySQL (YYYY-MM-DD HH:mm:ss)
    const fechaObj = new Date(fecha_hora)
    console.log("Fecha objeto:", fechaObj)
    console.log("Fecha local string:", fechaObj.toLocaleString())
    
    // Crear formato MySQL manualmente para evitar problemas de zona horaria
    const year = fechaObj.getFullYear()
    const month = String(fechaObj.getMonth() + 1).padStart(2, '0')
    const day = String(fechaObj.getDate()).padStart(2, '0')
    const hours = String(fechaObj.getHours()).padStart(2, '0')
    const minutes = String(fechaObj.getMinutes()).padStart(2, '0')
    const seconds = String(fechaObj.getSeconds()).padStart(2, '0')
    
    const fechaHoraMySQL = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    console.log("fecha_hora convertida a MySQL:", fechaHoraMySQL)

    // Generar ID único para la cita
    const id_cita = crypto.randomUUID()

    // Si no hay paciente_id pero hay paciente_nombre, crear un registro temporal
    let finalPacienteId = paciente_id
    if (!paciente_id && paciente_nombre) {
      try {
        // Crear un paciente temporal con solo el nombre
        const tempPacienteId = crypto.randomUUID()
        await executeQuery(
          `INSERT INTO pacientes (id_paciente, nombres, apellidos, numero_registro_medico, fecha_registro, usuario_registro)
           VALUES (?, ?, '', 'TEMP-${Date.now()}', NOW(), ?)`,
          [tempPacienteId, paciente_nombre, authResult.user.id_usuario]
        )
        finalPacienteId = tempPacienteId
      } catch (error) {
        console.log("Error creando paciente temporal:", error)
        // Si falla, usar null y guardar el nombre en el motivo
        finalPacienteId = null
      }
    }

    // Validar que se proporcione médico_id
    console.log("=== VALIDANDO MÉDICO ===")
    console.log("medico_id recibido:", medico_id)
    console.log("medico_id es válido:", !!medico_id)
    
    if (!medico_id) {
      console.log("ERROR: No se proporcionó médico_id")
      return NextResponse.json({ error: "Debe seleccionar un médico" }, { status: 400 })
    }

    console.log("=== EJECUTANDO INSERT ===")
    console.log("id:", id_cita)
    console.log("finalPacienteId:", finalPacienteId)
    console.log("medico_id:", medico_id)
    console.log("fecha_hora MySQL:", fechaHoraMySQL)
    console.log("estado:", estado || "programada")
    console.log("motivo final:", paciente_nombre && !paciente_id ? `${motivo} - Paciente: ${paciente_nombre}` : motivo)
    console.log("usuario_registro:", authResult.user.id_usuario)
    
    const result = await executeQuery(
      `INSERT INTO cita (id_cita, paciente_id, medico_id, fecha_hora, estado, motivo, usuario_registro, fecha_registro)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        id_cita, 
        finalPacienteId, 
        medico_id,
        fechaHoraMySQL,  // Usar fecha convertida a formato MySQL
        estado || "programada", 
        paciente_nombre && !paciente_id ? `${motivo} - Paciente: ${paciente_nombre}` : motivo,
        authResult.user.id_usuario  // ID del usuario autenticado
      ],
    )
    
    console.log("=== INSERT EXITOSO ===")
    console.log("Resultado:", result)

    return NextResponse.json(
      {
        id_cita: id_cita,
        message: "Cita creada exitosamente",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating cita:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}