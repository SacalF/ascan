import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("🧪 Test endpoint hit!")
    
    return NextResponse.json({
      status: "success",
      message: "Backend is working!",
      timestamp: new Date().toISOString(),
      url: request.url,
      method: request.method
    })
  } catch (error: any) {
    console.error("❌ Error in test endpoint:", error)
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
