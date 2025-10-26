import { type NextRequest, NextResponse } from "next/server"
import { pool, generateUUID, executeQuery } from "@/lib/mysql"
import { authenticateRequest } from "@/lib/auth-middleware"
import { logCreate } from "@/lib/audit-logger"

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await authenticateRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    
    console.log("=== API PACIENTES GET - Usuario:", authResult.nombres)

    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get("search")
    
    console.log("=== BÚSQUEDA DE PACIENTES ===")
    console.log("Término de búsqueda:", searchTerm)

    let query = `
      SELECT id_paciente, numero_registro_medico, nombres, apellidos, dpi, telefono, correo_electronico, sexo, fecha_nacimiento, created_at
      FROM pacientes 
    `
    const params: any[] = []

    // Si hay término de búsqueda, filtrar
    if (searchTerm) {
      query += `
        WHERE nombres LIKE ? 
        OR apellidos LIKE ? 
        OR dpi LIKE ?
        OR numero_registro_medico LIKE ?
      `
      const searchPattern = `%${searchTerm}%`
      params.push(searchPattern, searchPattern, searchPattern, searchPattern)
      console.log("Query con búsqueda:", query)
      console.log("Parámetros de búsqueda:", params)
    }

    query += " ORDER BY created_at DESC, nombres, apellidos LIMIT 50"

    const pacientes = await executeQuery(query, params)
    console.log("Pacientes encontrados:", pacientes)

    return NextResponse.json({ pacientes: Array.isArray(pacientes) ? pacientes : [] })
  } catch (error) {
    console.error("Error obteniendo pacientes:", error)
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
      nombres,
      apellidos,
      dpi,
      fechaNacimiento,
      sexo,
      telefono,
      correoElectronico,
      direccion,
      lugarNacimiento,
      estadoCivil,
      ocupacion,
      raza,
      conyuge,
      padreMadre,
      lugarTrabajo,
      nombreResponsable,
      telefonoResponsable,
    } = body

    // Validaciones básicas
    if (!nombres || !apellidos || !fechaNacimiento || !sexo) {
      return NextResponse.json(
        { error: "Nombres, apellidos, fecha de nacimiento y sexo son requeridos" },
        { status: 400 },
      )
    }

    const connection = await pool.getConnection()

    try {
      const pacienteId = generateUUID()

      // Calcular edad
      const fechaNac = new Date(fechaNacimiento)
      const hoy = new Date()
      const edad = hoy.getFullYear() - fechaNac.getFullYear()

      // Generar número de expediente único
      const [lastExpediente] = await connection.execute(
        "SELECT numero_registro_medico FROM pacientes ORDER BY created_at DESC LIMIT 1",
      )

      let numeroExpediente = "001"
      if (Array.isArray(lastExpediente) && lastExpediente.length > 0) {
        const lastNumber = Number.parseInt((lastExpediente[0] as any).numero_registro_medico) || 0
        numeroExpediente = String(lastNumber + 1).padStart(3, "0")
      }

      await connection.beginTransaction()

      // Insertar paciente
      await connection.execute(
        `INSERT INTO pacientes (
          id_paciente, nombres, apellidos, numero_registro_medico, dpi, edad, sexo,
          telefono, correo_electronico, direccion, fecha_nacimiento, lugar_nacimiento,
          estado_civil, ocupacion, raza, conyuge, padre_madre, lugar_trabajo,
          nombre_responsable, telefono_responsable, usuario_registro, fecha_registro
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          pacienteId, nombres, apellidos, numeroExpediente, dpi, edad, sexo,
          telefono, correoElectronico, direccion, fechaNacimiento, lugarNacimiento,
          estadoCivil, ocupacion, raza, conyuge, padreMadre, lugarTrabajo,
          nombreResponsable, telefonoResponsable, user.id_usuario
        ],
      )

      // Insertar referencia familiar si se proporciona
      if (nombreResponsable || telefonoResponsable) {
        try {
          await connection.execute(
            `INSERT INTO referencia_familiar (
              id_referencia, paciente_id, nombre_referencia, parentesco, telefono
            ) VALUES (?, ?, ?, ?, ?)`,
            [generateUUID(), pacienteId, nombreResponsable || "", "Responsable", telefonoResponsable],
          )
        } catch (error) {
          console.log("Tabla referencia_familiar no existe, saltando...")
        }
      }

      // Crear expediente
      try {
        await connection.execute(
          `INSERT INTO expediente (
            id_expediente, paciente_id, fecha_creacion, usuario_creacion
          ) VALUES (?, ?, CURDATE(), ?)`,
          [generateUUID(), pacienteId, user.id_usuario]
        )
      } catch (error) {
        console.log("Tabla expediente no existe, saltando...")
      }

      await connection.commit()

      // Registrar en historial
      const datosNuevos = {
        nombres,
        apellidos,
        numero_registro_medico: numeroExpediente,
        dpi,
        fecha_nacimiento: fechaNacimiento,
        sexo,
        telefono,
        correo_electronico: correoElectronico,
        direccion,
        lugar_nacimiento: lugarNacimiento,
        estado_civil: estadoCivil,
        ocupacion,
        raza,
        conyuge,
        padre_madre: padreMadre,
        lugar_trabajo: lugarTrabajo,
        nombre_responsable: nombreResponsable,
        telefono_responsable: telefonoResponsable
      }

      await logCreate(
        user.id_usuario,
        'pacientes',
        `Nuevo paciente registrado: ${nombres} ${apellidos} (${numeroExpediente})`,
        datosNuevos
      )

      // Obtener el paciente creado
      const [newPaciente] = await connection.execute("SELECT * FROM pacientes WHERE id_paciente = ?", [pacienteId])

      return NextResponse.json(
        {
          message: "Paciente registrado exitosamente",
          paciente: (newPaciente as any[])[0],
        },
        { status: 201 },
      )
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Error registrando paciente:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
