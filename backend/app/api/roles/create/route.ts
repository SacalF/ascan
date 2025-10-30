import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"
import { authenticateRequest } from "@/lib/auth-middleware"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log("=== API ROLES CREATE - Iniciando ===")
    
    // Autenticar usuario
    const authResult = await authenticateRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    console.log("Usuario autenticado:", authResult.id_usuario, "Rol:", authResult.rol)

    // Verificar permisos de administrador
    if (authResult.rol !== "administrador") {
      console.log("ERROR: Acceso denegado, rol:", authResult.rol)
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Obtener datos del body
    const body = await request.json()
    const { nombre_rol, descripcion, permisos } = body

    if (!nombre_rol || !descripcion) {
      return NextResponse.json({ 
        error: "Nombre del rol y descripción son requeridos" 
      }, { status: 400 })
    }

    // Verificar que el rol no exista ya
    console.log("Verificando si el rol ya existe...")
    const existingRole = await executeQuery(
      `SELECT id_rol FROM roles WHERE nombre_rol = ?`,
      [nombre_rol.toLowerCase()]
    )

    if (Array.isArray(existingRole) && existingRole.length > 0) {
      console.log("ERROR: El rol ya existe")
      return NextResponse.json({ 
        error: "Ya existe un rol con ese nombre" 
      }, { status: 409 })
    }

    // Crear el nuevo rol
    console.log("Creando nuevo rol...")
    const result = await executeQuery(
      `INSERT INTO roles (nombre_rol, descripcion, permisos, activo)
       VALUES (?, ?, ?, 1)`,
      [nombre_rol.toLowerCase(), descripcion, JSON.stringify(permisos || [])]
    )

    console.log("Rol creado exitosamente:", result)

    console.log("=== API ROLES CREATE - ÉXITO ===")
    return NextResponse.json({ 
      message: "Rol creado exitosamente",
      rol: {
        nombre_rol: nombre_rol.toLowerCase(),
        descripcion,
        permisos: permisos || []
      }
    })
  } catch (error) {
    console.error("=== ERROR EN API ROLES CREATE ===")
    console.error("Error creando rol:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
