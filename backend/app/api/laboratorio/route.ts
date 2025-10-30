import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"
import { authenticateRequest } from "@/lib/auth-middleware-improved"
import { DigitalOceanSpacesService } from "@/lib/digitalocean-spaces"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const pacienteId = searchParams.get("paciente_id")

    let query = `
      SELECT l.*, p.nombres, p.apellidos, p.telefono, p.correo_electronico
      FROM resultados_laboratorio l
      LEFT JOIN pacientes p ON l.paciente_id = p.id_paciente
    `
    const params: any[] = []

    if (pacienteId) {
      query += " WHERE l.paciente_id = ?"
      params.push(pacienteId)
    }

    query += " ORDER BY l.fecha_examen DESC"

    const result = await executeQuery(query, params)
    const laboratorios = Array.isArray(result) ? result : []

    return NextResponse.json({ laboratorios })
  } catch (error) {
    console.error("Error obteniendo laboratorios:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const formData = await request.formData()
    
    const paciente_id = formData.get("paciente_id") as string
    const tipo_examen = formData.get("tipo_examen") as string
    const fecha_examen = formData.get("fecha_examen") as string
    const resultados = formData.get("resultados") as string
    const observaciones = formData.get("observaciones") as string
    const archivo = formData.get("archivo") as File | null

    if (!paciente_id || !tipo_examen || !fecha_examen) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    let archivo_nombre = null
    let archivo_url = null
    let archivo_tipo = null

    // Si hay un archivo, subirlo a DigitalOcean Spaces
    if (archivo && archivo.size > 0) {
      try {
        const buffer = Buffer.from(await archivo.arrayBuffer())
        const contentType = archivo.type

        // Validar tipo de archivo
        const allowedTypes = [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/gif',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]

        if (!allowedTypes.includes(contentType)) {
          return NextResponse.json(
            { error: "Tipo de archivo no permitido. Solo se permiten PDF, imágenes y documentos de Word." },
            { status: 400 }
          )
        }

        // Validar tamaño del archivo (máximo 10MB)
        if (archivo.size > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: "El archivo es demasiado grande. Máximo 10MB." },
            { status: 400 }
          )
        }

        // Subir archivo a DigitalOcean Spaces
        archivo_nombre = archivo.name
        archivo_url = await DigitalOceanSpacesService.uploadFile(buffer, archivo.name, contentType)
        archivo_tipo = contentType
        
        console.log('Archivo subido exitosamente a Spaces:', archivo_url)
      } catch (error) {
        console.error("Error subiendo archivo a Spaces:", error)
        return NextResponse.json(
          { error: "Error al subir el archivo a DigitalOcean Spaces" },
          { status: 500 }
        )
      }
    }

    // Generar UUID para el ID
    const id = crypto.randomUUID()

    // Insertar en la base de datos
    // Guardar la URL en archivo_contenido (ya que es un campo longtext que puede almacenar URLs)
    const result = await executeQuery(
      `INSERT INTO resultados_laboratorio 
       (id, paciente_id, tipo_examen, fecha_examen, resultados, observaciones, 
        archivo_nombre, archivo_contenido, archivo_tipo, medico_solicitante, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completado')`,
      [
        id,
        paciente_id,
        tipo_examen,
        fecha_examen,
        resultados || null,
        observaciones || null,
        archivo_nombre,
        archivo_url, // Guardamos la URL en archivo_contenido
        archivo_tipo,
        authResult.user?.id_usuario,
      ],
    )

    return NextResponse.json(
      {
        id: id,
        message: "Resultado de laboratorio creado exitosamente",
        archivo_nombre: archivo_nombre,
        archivo_url: archivo_url
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creando laboratorio:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}