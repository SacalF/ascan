/**
 * Utilidades para formateo de fechas y horas en zona horaria de Guatemala
 */

// Zona horaria de Guatemala (GMT-6)
// Intentamos diferentes zonas horarias para Guatemala
const TIMEZONE = 'America/Guatemala' // Zona horaria principal
const FALLBACK_TIMEZONE = 'America/Central' // Zona horaria de respaldo

/**
 * Formatea una fecha ISO a string localizado para Guatemala
 */
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString)
  
  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) {
    return 'Fecha inválida'
  }

  try {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      timeZone: TIMEZONE,
      ...options
    }

    return date.toLocaleDateString('es', defaultOptions)
  } catch (error) {
    // Si falla la zona horaria específica, usar la zona local
    console.warn('Error con zona horaria específica, usando zona local:', error)
    return date.toLocaleDateString('es', options)
  }
}

/**
 * Formatea una hora ISO a string localizado para Guatemala
 */
export function formatTime(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) {
    return 'Hora inválida'
  }

  try {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      timeZone: TIMEZONE,
      ...options
    }

    return date.toLocaleTimeString('es', defaultOptions)
  } catch (error) {
    // Si falla la zona horaria específica, usar la zona local
    console.warn('Error con zona horaria específica, usando zona local:', error)
    return date.toLocaleTimeString('es', options)
  }
}

/**
 * Formatea fecha y hora completa para Guatemala
 */
export function formatDateTime(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) {
    return 'Fecha y hora inválidas'
  }

  try {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      timeZone: TIMEZONE,
      ...options
    }

    return date.toLocaleString('es', defaultOptions)
  } catch (error) {
    // Si falla la zona horaria específica, usar la zona local
    console.warn('Error con zona horaria específica, usando zona local:', error)
    return date.toLocaleString('es', options)
  }
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
    second: '2-digit'
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
    minute: '2-digit'
  })
}

/**
 * Obtiene la fecha actual en zona horaria de Guatemala
 */
export function getCurrentDateInGuatemala(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: TIMEZONE }))
}

/**
 * Convierte una fecha a zona horaria de Guatemala
 */
export function toGuatemalaTime(date: Date): Date {
  return new Date(date.toLocaleString("en-US", { timeZone: TIMEZONE }))
}

/**
 * Función de debug para verificar la zona horaria
 */
export function debugTimezone() {
  const now = new Date()
  const testDate = "2025-10-10T15:46:10.000Z" // Fecha del log que está mal
  
  console.log('=== DEBUG ZONA HORARIA ===')
  console.log('Hora actual UTC:', now.toISOString())
  console.log('Hora actual local:', now.toString())
  console.log('Zona horaria configurada:', TIMEZONE)
  
  // Probar diferentes zonas horarias válidas
  const timezones = [
    'America/Guatemala',
    'America/Mexico_City',
    'America/El_Salvador',
    'America/Belize',
    'America/Costa_Rica',
    'America/Managua'
  ]
  
  console.log('\n=== PRUEBA CON FECHA DEL LOG ===')
  console.log('Fecha original:', testDate)
  
  timezones.forEach(tz => {
    const formatted = new Date(testDate).toLocaleString('es', { 
      timeZone: tz,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
    console.log(`${tz}: ${formatted}`)
  })
  
  console.log('\n=== HORA ACTUAL EN DIFERENTES ZONAS ===')
  timezones.forEach(tz => {
    const formatted = now.toLocaleString('es', { 
      timeZone: tz,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
    console.log(`${tz}: ${formatted}`)
  })
  
  return {
    utc: now.toISOString(),
    local: now.toString(),
    guatemala: now.toLocaleString('es', { timeZone: TIMEZONE }),
    timezone: TIMEZONE,
    testDate: testDate,
    testDateFormatted: new Date(testDate).toLocaleString('es', { timeZone: TIMEZONE })
  }
}
