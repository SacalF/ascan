import { NextRequest, NextResponse } from "next/server"
import { authenticateUser } from "@/lib/auth-guard"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id_usuario,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.correo_electronico,
        rol: user.rol,
        estado: user.estado
      }
    })

  } catch (error) {
    console.error("Error verificando autenticación:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}