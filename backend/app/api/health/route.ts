import { type NextRequest, NextResponse } from "next/server"
import { testConnection } from "@/lib/mysql"

export async function GET(request: NextRequest) {
  try {
    console.log("🏥 Verificando salud del sistema...")
    
    const dbConnected = await testConnection()
    
    const health = {
      status: dbConnected ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        host: process.env.MYSQL_HOST || "db-mysql-ascan-do-user-26830617-0.d.db.ondigitalocean.com",
        port: process.env.MYSQL_PORT || "25060"
      },
      uptime: process.uptime()
    }
    
    return NextResponse.json(health, { 
      status: dbConnected ? 200 : 503 
    })
  } catch (error: any) {
    console.error("❌ Error en health check:", error)
    return NextResponse.json(
      { 
        status: "error", 
        error: error.message,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}
