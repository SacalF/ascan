import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { addSecurityHeaders, addCORSHeaders } from '@/lib/security-headers'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const origin = request.headers.get('origin')

  // Aplicar headers de seguridad
  addSecurityHeaders(response)
  addCORSHeaders(response, origin || undefined)

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200, 
      headers: response.headers 
    })
  }

  return response
}

export const config = {
  matcher: '/api/:path*',
}
