/**
 * Utilidades simplificadas para formateo de fechas y horas
 * Usa la zona horaria local del navegador (que debería ser Guatemala)
 */

/**
 * Formatea una fecha ISO a string localizado
 */
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) {
    return 'Fecha inválida'
  }

  return date.toLocaleDateString('es', options)
}

/**
 * Formatea una hora ISO a string localizado
 */
export function formatTime(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) {
    return 'Hora inválida'
  }

  return date.toLocaleTimeString('es', options)
}

/**
 * Formatea fecha y hora completa
 */
export function formatDateTime(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) {
    return 'Fecha y hora inválidas'
  }

  return date.toLocaleString('es', options)
}

/**
 * Formatea fecha para mostrar en listas (formato corto)
 */
export function formatDateShort(dateString: string): string {
  return formatDate(dateString, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Formatea fecha para mostrar en listas (formato largo)
 */
export function formatDateLong(dateString: string): string {
  return formatDate(dateString, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Formatea hora para mostrar (formato 12 horas)
 */
export function formatTime12(dateString: string): string {
  return formatTime(dateString, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Formatea hora para mostrar (formato 24 horas)
 */
export function formatTime24(dateString: string): string {
  return formatTime(dateString, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

/**
 * Formatea fecha y hora para logs/auditoría
 */
export function formatDateTimeForLog(dateString: string): string {
  return formatDateTime(dateString, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })
}

/**
 * Formatea fecha y hora para mostrar en tarjetas
 */
export function formatDateTimeForCard(dateString: string): string {
  return formatDateTime(dateString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Función de debug para verificar la zona horaria
 */
export function debugTimezone() {
  const now = new Date()
  const testDate = "2025-10-10T15:46:10.000Z" // Fecha del log que está mal
  
  console.log('=== DEBUG ZONA HORARIA SIMPLE ===')
  console.log('Hora actual UTC:', now.toISOString())
  console.log('Hora actual local:', now.toString())
  console.log('Zona horaria del navegador:', Intl.DateTimeFormat().resolvedOptions().timeZone)
  
  console.log('\n=== PRUEBA CON FECHA DEL LOG ===')
  console.log('Fecha original:', testDate)
  console.log('Formateada (local):', new Date(testDate).toLocaleString('es', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }))
  
  console.log('\n=== HORA ACTUAL ===')
  console.log('Formateada (local):', now.toLocaleString('es', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }))
  
  return {
    utc: now.toISOString(),
    local: now.toString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    testDate: testDate,
    testDateFormatted: new Date(testDate).toLocaleString('es', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }
}
