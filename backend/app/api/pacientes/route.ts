import { type NextRequest, NextResponse } from "next/server"
import { pool, generateUUID, executeQuery } from "@/lib/mysql"
import { authenticateRequest } from "@/lib/auth-middleware-improved"
import { logCreate } from "@/lib/audit-logger"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error || "No autenticado" }, { status: 401 })
    }
    
    console.log("=== API PACIENTES GET - Usuario:", authResult.user?.nombres)

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
    console.log("=== API PACIENTES POST - Iniciando ===")
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      console.error("Error de autenticación:", authResult.error)
      return NextResponse.json({ error: authResult.error || "No autenticado" }, { status: 401 })
    }

    if (!authResult.user) {
      console.error("Usuario no encontrado en authResult")
      return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 })
    }

    const user = authResult.user
    console.log("Usuario autenticado:", user.nombres, user.id_usuario)

    const body = await request.json()
    console.log("Datos recibidos del body:", Object.keys(body))
    
    const {
      nombres,
      apellidos,
      dpi,
      numeroExpediente,
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
    if (!nombres || !apellidos || !fechaNacimiento || !sexo || !numeroExpediente) {
      console.error("Campos requeridos faltantes:", { 
        nombres: !!nombres, 
        apellidos: !!apellidos, 
        fechaNacimiento: !!fechaNacimiento, 
        sexo: !!sexo,
        numeroExpediente: !!numeroExpediente
      })
      return NextResponse.json(
        { error: "Nombres, apellidos, número de expediente, fecha de nacimiento y sexo son requeridos" },
        { status: 400 },
      )
    }

    const connection = await pool.getConnection()
    console.log("Conexión a BD obtenida")

    try {
      const pacienteId = generateUUID()
      console.log("ID de paciente generado:", pacienteId)

      // Calcular edad de forma más segura
      let edad = 0
      try {
        const fechaNac = new Date(fechaNacimiento)
        if (isNaN(fechaNac.getTime())) {
          console.warn("Fecha de nacimiento inválida, usando edad 0")
          edad = 0
        } else {
          const hoy = new Date()
          edad = hoy.getFullYear() - fechaNac.getFullYear()
          const mes = hoy.getMonth() - fechaNac.getMonth()
          if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
            edad--
          }
        }
      } catch (error) {
        console.warn("Error calculando edad:", error)
        edad = 0
      }
      console.log("Edad calculada:", edad)

      // Validar que el número de expediente no esté duplicado
      if (numeroExpediente) {
        try {
          const [existingPaciente] = await connection.execute(
            "SELECT id_paciente FROM pacientes WHERE numero_registro_medico = ?",
            [numeroExpediente]
          )
          
          if (Array.isArray(existingPaciente) && existingPaciente.length > 0) {
            console.error("Número de expediente duplicado:", numeroExpediente)
            return NextResponse.json(
              { error: `El número de expediente ${numeroExpediente} ya está en uso. Por favor, use otro número.` },
              { status: 400 },
            )
          }
        } catch (expError: any) {
          console.warn("Error validando número de expediente:", expError.message)
          // Continuar si hay error en la validación
        }
      }
      console.log("Número de expediente validado:", numeroExpediente)

      await connection.beginTransaction()

      // Insertar paciente
      // Normalizar fecha de nacimiento a YYYY-MM-DD
      const fechaNacimientoSql = typeof fechaNacimiento === 'string' && fechaNacimiento.includes('T')
        ? fechaNacimiento.split('T')[0]
        : fechaNacimiento

      await connection.execute(
        `INSERT INTO pacientes (
          id_paciente, nombres, apellidos, numero_registro_medico, dpi, edad, sexo,
          telefono, correo_electronico, direccion, fecha_nacimiento, lugar_nacimiento,
          estado_civil, ocupacion, raza, conyuge, padre_madre, lugar_trabajo,
          nombre_responsable, telefono_responsable, usuario_registro, fecha_registro
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          pacienteId, nombres, apellidos, numeroExpediente, dpi || null, edad, sexo,
          telefono || null, correoElectronico || null, direccion || null, fechaNacimientoSql, lugarNacimiento || null,
          estadoCivil || null, ocupacion || null, raza || null, conyuge || null, padreMadre || null, lugarTrabajo || null,
          nombreResponsable || null, telefonoResponsable || null, user.id_usuario
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

      // Registrar en historial (no crítico si falla)
      try {
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
        console.log("Registro en historial exitoso")
      } catch (historialError) {
        console.warn("Error registrando en historial (no crítico):", historialError)
        // No fallar la operación por error de historial
      }

      // Obtener el paciente creado
      const [newPaciente] = await connection.execute("SELECT * FROM pacientes WHERE id_paciente = ?", [pacienteId])
      console.log("Paciente creado exitosamente:", pacienteId)

      return NextResponse.json(
        {
          message: "Paciente registrado exitosamente",
          paciente: (newPaciente as any[])[0],
        },
        { status: 201 },
      )
    } catch (error: any) {
      await connection.rollback()
      console.error("Error en transacción de base de datos:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)
      console.error("Error sqlState:", error.sqlState)
      console.error("Stack trace:", error.stack)
      
      // Proporcionar mensaje de error más descriptivo
      let errorMessage = "Error interno del servidor"
      if (error.code === 'ER_DUP_ENTRY') {
        errorMessage = "Ya existe un paciente con este DPI o número de registro"
      } else if (error.code === 'ER_NO_SUCH_TABLE') {
        errorMessage = "Error de configuración de base de datos. Contacte al administrador."
      } else if (error.sqlState) {
        errorMessage = `Error de base de datos: ${error.message}`
      }
      
      throw new Error(errorMessage)
    } finally {
      connection.release()
    }
  } catch (error: any) {
    console.error("=== ERROR REGISTRANDO PACIENTE ===")
    console.error("Error completo:", error)
    console.error("Error message:", error?.message)
    console.error("Error stack:", error?.stack)
    
    return NextResponse.json(
      { 
        error: error?.message || "Error interno del servidor",
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      }, 
      { status: 500 }
    )
  }
}
