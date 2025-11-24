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
    
    // Extraer datos del formulario
    const paciente_id = formData.get("paciente_id") as string
    const medico_id = formData.get("medico_id") as string
    const fecha_consulta = formData.get("fecha_consulta") as string
    const medico = formData.get("medico") as string
    const primer_sintoma = formData.get("primer_sintoma") as string
    const fecha_primer_sintoma = formData.get("fecha_primer_sintoma") as string
    const antecedentes_medicos = formData.get("antecedentes_medicos") as string
    const antecedentes_quirurgicos = formData.get("antecedentes_quirurgicos") as string
    const revision_sistemas = formData.get("revision_sistemas") as string
    const menstruacion_menarca = formData.get("menstruacion_menarca") as string
    const menstruacion_ultima = formData.get("menstruacion_ultima") as string
    const gravidez = formData.get("gravidez") as string
    const partos = formData.get("partos") as string
    const abortos = formData.get("abortos") as string
    const habitos_tabaco = formData.get("habitos_tabaco") as string
    const habitos_otros = formData.get("habitos_otros") as string
    const historia_familiar = formData.get("historia_familiar") as string
    const diagnostico = formData.get("diagnostico") as string
    const tratamiento = formData.get("tratamiento") as string
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
    if (!fecha_consulta) camposFaltantes.push('fecha_consulta')
    if (!finalMedico) camposFaltantes.push('medico')
    
    if (camposFaltantes.length > 0) {
      console.error("Campos faltantes en consulta inicial:", camposFaltantes)
      console.error("Datos recibidos:", { paciente_id, medico_id: finalMedicoId, fecha_consulta, medico: finalMedico })
      return NextResponse.json(
        { error: `Faltan campos requeridos: ${camposFaltantes.join(', ')}` },
        { status: 400 }
      )
    }

    // Generar un ID único para la consulta
    const id_consulta = randomUUID()
    
    console.log("Fecha de consulta recibida:", fecha_consulta)
    
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
            
            // Subir a DigitalOcean Spaces en la carpeta 'consultas/inicial'
            const url = await DigitalOceanSpacesService.uploadFile(
              buffer, 
              imagenFile.name, 
              imagenFile.type,
              'consultas/inicial'
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

    const result = await executeQuery(
      `INSERT INTO consulta_inicial (
        id_consulta, paciente_id, medico_id, fecha_consulta, medico,
        primer_sintoma, fecha_primer_sintoma, antecedentes_medicos,
        antecedentes_quirurgicos, revision_sistemas, menstruacion_menarca,
        menstruacion_ultima, gravidez, partos, abortos,
        habitos_tabaco, habitos_otros, historia_familiar,
        diagnostico, tratamiento, usuario_registro, imagenes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_consulta,
        paciente_id,
        finalMedicoId,
        fecha_consulta,
        finalMedico,
        primer_sintoma || null,
        fecha_primer_sintoma || null,
        antecedentes_medicos || null,
        antecedentes_quirurgicos || null,
        revision_sistemas || null,
        menstruacion_menarca || null,
        menstruacion_ultima || null,
        parseInt(gravidez) || 0,
        parseInt(partos) || 0,
        parseInt(abortos) || 0,
        parseInt(habitos_tabaco) || 0,
        habitos_otros || null,
        historia_familiar || null,
        diagnostico || null,
        tratamiento || null,
        authResult ? authResult.id_usuario : null,
        imagenesJson
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
