import { NextRequest, NextResponse } from "next/server"
import { cleanupConnections } from "@/lib/mysql"

export async function POST(request: NextRequest) {
  try {
    console.log("🧹 Iniciando limpieza de conexiones...")
    
    await cleanupConnections()
    
    return NextResponse.json({
      message: "Conexiones limpiadas exitosamente",
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error("❌ Error en limpieza de conexiones:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
