import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"

export async function POST(request: NextRequest) {
  try {
    console.log("🧹 Limpiando todas las sesiones activas...")
    
    // Eliminar todas las sesiones
    await executeQuery("DELETE FROM sessions")
    
    // Obtener el número de sesiones eliminadas
    const result = await executeQuery("SELECT ROW_COUNT() as deleted_sessions")
    const deletedCount = Array.isArray(result) && result.length > 0 ? (result[0] as any).deleted_sessions : 0
    
    console.log(`✅ ${deletedCount} sesiones eliminadas`)
    
    return NextResponse.json({
      message: "Sesiones limpiadas exitosamente",
      deleted_sessions: deletedCount,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error("❌ Error limpiando sesiones:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
