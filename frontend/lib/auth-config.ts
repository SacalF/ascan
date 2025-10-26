// Configuración para habilitar/deshabilitar autenticación gradualmente
export const AUTH_CONFIG = {
  // Rutas que requieren autenticación
  protectedRoutes: {
    // APIs del backend
    '/api/citas': true, // ✅ HABILITADO
    '/api/pacientes': true, // ✅ HABILITADO
    '/api/medicos': true, // ✅ HABILITADO
    '/api/consultas': true, // ✅ HABILITADO
    
    // Páginas del frontend
    '/citas': true, // ✅ HABILITADO
    '/citas/[id]': true, // ✅ HABILITADO
    '/agendar-cita': true, // ✅ HABILITADO
    '/consultas': true, // ✅ HABILITADO
    '/dashboard': false, // Temporalmente deshabilitado
  },
  
  // Rutas que siempre requieren autenticación
  alwaysProtected: [
    '/api/auth/me',
    '/api/auth/logout'
  ],
  
  // Rutas públicas (no requieren autenticación)
  publicRoutes: [
    '/auth/login',
    '/auth/register',
    '/test-login',
    '/test-connection',
    '/test-kaspersky',
    '/test-consultas',
    '/test-citas',
    '/crear-consulta-prueba',
    '/debug-database',
    '/debug-api'
  ]
}

// Función para verificar si una ruta requiere autenticación
export function isRouteProtected(pathname: string): boolean {
  // Verificar rutas siempre protegidas
  if (AUTH_CONFIG.alwaysProtected.some(route => pathname.startsWith(route))) {
    return true
  }
  
  // Verificar rutas públicas
  if (AUTH_CONFIG.publicRoutes.some(route => pathname.startsWith(route))) {
    return false
  }
  
  // Verificar rutas configuradas
  for (const [route, enabled] of Object.entries(AUTH_CONFIG.protectedRoutes)) {
    if (pathname.startsWith(route) && enabled) {
      return true
    }
  }
  
  return false
}

// Función para habilitar autenticación en una ruta específica
export function enableAuthForRoute(route: string): void {
  if (route in AUTH_CONFIG.protectedRoutes) {
    AUTH_CONFIG.protectedRoutes[route as keyof typeof AUTH_CONFIG.protectedRoutes] = true
    console.log(`✅ Autenticación habilitada para: ${route}`)
  } else {
    console.warn(`⚠️ Ruta no encontrada en configuración: ${route}`)
  }
}

// Función para deshabilitar autenticación en una ruta específica
export function disableAuthForRoute(route: string): void {
  if (route in AUTH_CONFIG.protectedRoutes) {
    AUTH_CONFIG.protectedRoutes[route as keyof typeof AUTH_CONFIG.protectedRoutes] = false
    console.log(`❌ Autenticación deshabilitada para: ${route}`)
  } else {
    console.warn(`⚠️ Ruta no encontrada en configuración: ${route}`)
  }
}
