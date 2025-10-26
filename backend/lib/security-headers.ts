import { NextResponse } from "next/server"

export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevenir MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Prevenir clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  
  // Protección XSS (para navegadores que lo soporten)
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // HSTS - Forzar HTTPS en producción
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security', 
      'max-age=31536000; includeSubDomains; preload'
    )
  }
  
  // Política de referrer
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Content Security Policy básica
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; font-src 'self'; object-src 'none'; media-src 'self'; frame-src 'none';"
  )
  
  // Prevenir información del servidor
  response.headers.set('X-Powered-By', '')
  
  // Cache control para respuestas sensibles
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  
  return response
}

export function addCORSHeaders(response: NextResponse, origin?: string): NextResponse {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001'
  ]
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  } else if (process.env.NODE_ENV === 'development') {
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000')
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Max-Age', '86400')
  
  return response
}

export function createSecureResponse(data: any, status: number = 200, origin?: string): NextResponse {
  const response = NextResponse.json(data, { status })
  return addSecurityHeaders(addCORSHeaders(response, origin))
}
