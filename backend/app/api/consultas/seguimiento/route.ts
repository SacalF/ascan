import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"
import { authenticateRequest } from "@/lib/auth-middleware"
import { DigitalOceanSpacesService } from "@/lib/digitalocean-spaces"
import { randomUUID } from "crypto"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const formData = await request.formData()
    console.log("FormData recibido en seguimiento")
    
    // Extraer datos del formulario
    const paciente_id = formData.get("paciente_id") as string
    const medico_id = formData.get("medico_id") as string
    const fecha = formData.get("fecha") as string
    const medico = formData.get("medico") as string
    const evolucion = formData.get("evolucion") as string
    const notas = formData.get("notas") as string
    const tratamiento_actual = formData.get("tratamiento_actual") as string
    const imagenesCount = parseInt(formData.get("imagenes_count") as string) || 0

    // authResult es AuthenticatedUser | null, así que accedemos directamente a sus propiedades
    // Usar el ID del usuario autenticado como fallback si no viene medico_id
    const finalMedicoId = medico_id || (authResult ? authResult.id_usuario : null)
    // Si no viene el nombre del médico, intentar construirlo desde el usuario autenticado
    const finalMedico = medico || (authResult && authResult.nombres && authResult.apellidos 
      ? `${authResult.nombres} ${authResult.apellidos}` 
      : (authResult ? authResult.nombres : null) || 'Médico')

    // Validar campos requeridos con mejor mensaje de error
    const camposFaltantes = []
    if (!paciente_id) camposFaltantes.push('paciente_id')
    if (!finalMedicoId) camposFaltantes.push('medico_id')
    if (!fecha) camposFaltantes.push('fecha')
    if (!finalMedico) camposFaltantes.push('medico')
    
    if (camposFaltantes.length > 0) {
      console.error("Campos faltantes en seguimiento:", camposFaltantes)
      console.error("Datos recibidos:", { paciente_id, medico_id: finalMedicoId, fecha, medico: finalMedico })
      return NextResponse.json(
        { error: `Faltan campos requeridos: ${camposFaltantes.join(', ')}` },
        { status: 400 }
      )
    }

    // Procesar imágenes: subirlas a DigitalOcean Spaces
    const imagenesUrls: string[] = []
    
    if (imagenesCount > 0) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      const maxSize = 5 * 1024 * 1024 // 5MB

      for (let i = 0; i < imagenesCount; i++) {
        const imagenFile = formData.get(`imagen_${i}`) as File | null
        
        if (imagenFile && imagenFile.size > 0) {
          // Validar tipo de archivo
          if (!allowedTypes.includes(imagenFile.type)) {
            return NextResponse.json(
              { error: `Tipo de archivo no permitido para imagen ${i + 1}. Solo se permiten JPG, PNG, GIF, WEBP.` },
              { status: 400 }
            )
          }

          // Validar tamaño del archivo
          if (imagenFile.size > maxSize) {
            return NextResponse.json(
              { error: `El archivo ${imagenFile.name} es demasiado grande. Máximo 5MB.` },
              { status: 400 }
            )
          }

          try {
            // Convertir archivo a Buffer
            const buffer = Buffer.from(await imagenFile.arrayBuffer())
            
            // Subir a DigitalOcean Spaces en la carpeta 'consultas/seguimiento'
            const url = await DigitalOceanSpacesService.uploadFile(
              buffer, 
              imagenFile.name, 
              imagenFile.type,
              'consultas/seguimiento'
            )
            
            imagenesUrls.push(url)
            console.log(`Imagen ${i + 1} subida exitosamente a Spaces:`, url)
          } catch (error) {
            console.error(`Error subiendo imagen ${i + 1} a Spaces:`, error)
            return NextResponse.json(
              { error: `Error al subir la imagen ${imagenFile.name} a DigitalOcean Spaces` },
              { status: 500 }
            )
          }
        }
      }
    }
    
    // Convertir URLs de imágenes a JSON string si existen
    const imagenesJson = imagenesUrls.length > 0 
      ? JSON.stringify(imagenesUrls) 
      : null

    // Generar ID único para el seguimiento
    const id_seguimiento = randomUUID()

    console.log("Ejecutando query con datos:", {
      id_seguimiento,
      paciente_id,
      medico_id: finalMedicoId,
      fecha,
      medico: finalMedico,
      evolucion: evolucion || null,
      notas: notas || null,
      tratamiento_actual: tratamiento_actual || null,
      usuario_registro: authResult.id_usuario,
      imagenes: imagenesJson ? "presente" : null
    })

    const result = await executeQuery(
      `INSERT INTO consulta_seguimiento (
        id_seguimiento, paciente_id, medico_id, fecha, medico,
        evolucion, notas, tratamiento_actual, usuario_registro, imagenes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_seguimiento,
        paciente_id,
        finalMedicoId,
        fecha,
        finalMedico,
        evolucion || null,
        notas || null,
        tratamiento_actual || null,
        authResult ? authResult.id_usuario : null,
        imagenesJson
      ]
    )

    console.log("Resultado del query:", result)

    return NextResponse.json(
      {
        id_seguimiento: id_seguimiento,
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
