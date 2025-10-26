import { NextRequest, NextResponse } from "next/server"
import { isRouteProtected } from "./auth-config"
import { authenticateRequest } from "./auth-middleware-improved"

// Middleware que solo aplica autenticación si está habilitada para la ruta
export async function conditionalAuth(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Si la ruta no requiere autenticación, continuar sin verificar
  if (!isRouteProtected(pathname)) {
    return null // No hay error, continuar
  }
  
  // Si la ruta requiere autenticación, verificar
  const authResult = await authenticateRequest(request)
  
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.error }, 
      { status: 401 }
    )
  }
  
  return null // No hay error, continuar
}

// Wrapper para APIs que permite habilitar/deshabilitar autenticación
export function withConditionalAuth(handler: (request: NextRequest, user?: any) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const pathname = request.nextUrl.pathname
    
    // Si la ruta no requiere autenticación, ejecutar sin usuario
    if (!isRouteProtected(pathname)) {
      return handler(request)
    }
    
    // Si la ruta requiere autenticación, verificar y pasar usuario
    const authResult = await authenticateRequest(request)
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error }, 
        { status: 401 }
      )
    }
    
    return handler(request, authResult.user)
  }
}
