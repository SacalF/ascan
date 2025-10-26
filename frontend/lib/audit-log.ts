/**
 * Biblioteca de funciones para registrar acciones en el historial de auditoría
 */

interface AuditLogParams {
  id_usuario?: string
  tipo_accion: 'login' | 'logout' | 'create' | 'read' | 'update' | 'delete' | 'export'
  modulo?: string
  descripcion?: string
  ip_address?: string
  user_agent?: string
  datos_anteriores?: any
  datos_nuevos?: any
}

/**
 * Registra una acción en el historial de auditoría
 */
export async function registrarAccion(params: AuditLogParams): Promise<void> {
  try {
    // Obtener IP del cliente (si es posible)
    let ip_address = params.ip_address
    if (!ip_address && typeof window !== 'undefined') {
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json')
        const ipData = await ipResponse.json()
        ip_address = ipData.ip
      } catch (e) {
        // Si falla, continuar sin IP
      }
    }

    // Obtener user agent
    const user_agent = params.user_agent || (typeof window !== 'undefined' ? window.navigator.userAgent : undefined)

    const response = await fetch('/api/historial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        ...params,
        ip_address,
        user_agent
      })
    })

    if (!response.ok) {
      console.error('Error registrando acción en historial:', await response.text())
    }
  } catch (error) {
    // No lanzar error para no interrumpir el flujo principal
    console.error('Error registrando acción en historial:', error)
  }
}

/**
 * Registra un login exitoso
 */
export async function registrarLogin(id_usuario: string, nombre_usuario: string): Promise<void> {
  await registrarAccion({
    id_usuario,
    tipo_accion: 'login',
    modulo: 'autenticacion',
    descripcion: `Usuario ${nombre_usuario} inició sesión`
  })
}

/**
 * Registra un logout
 */
export async function registrarLogout(id_usuario: string, nombre_usuario: string): Promise<void> {
  await registrarAccion({
    id_usuario,
    tipo_accion: 'logout',
    modulo: 'autenticacion',
    descripcion: `Usuario ${nombre_usuario} cerró sesión`
  })
}

/**
 * Registra la creación de un registro
 */
export async function registrarCreacion(
  modulo: string,
  descripcion: string,
  datos_nuevos?: any
): Promise<void> {
  await registrarAccion({
    tipo_accion: 'create',
    modulo,
    descripcion,
    datos_nuevos
  })
}

/**
 * Registra la actualización de un registro
 */
export async function registrarActualizacion(
  modulo: string,
  descripcion: string,
  datos_anteriores?: any,
  datos_nuevos?: any
): Promise<void> {
  await registrarAccion({
    tipo_accion: 'update',
    modulo,
    descripcion,
    datos_anteriores,
    datos_nuevos
  })
}

/**
 * Registra la eliminación de un registro
 */
export async function registrarEliminacion(
  modulo: string,
  descripcion: string,
  datos_anteriores?: any
): Promise<void> {
  await registrarAccion({
    tipo_accion: 'delete',
    modulo,
    descripcion,
    datos_anteriores
  })
}

/**
 * Registra una exportación de datos
 */
export async function registrarExportacion(
  modulo: string,
  descripcion: string
): Promise<void> {
  await registrarAccion({
    tipo_accion: 'export',
    modulo,
    descripcion
  })
}

/**
 * Registra una lectura/consulta de datos sensibles
 */
export async function registrarLectura(
  modulo: string,
  descripcion: string
): Promise<void> {
  await registrarAccion({
    tipo_accion: 'read',
    modulo,
    descripcion
  })
}

