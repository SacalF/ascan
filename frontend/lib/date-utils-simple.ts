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
 * Parsea un timestamp de MySQL (YYYY-MM-DD HH:mm:ss) o fecha DATE (YYYY-MM-DD) como hora local
 * Los timestamps y fechas de MySQL deben tratarse como hora local, no UTC
 */
function parseMySQLTimestamp(dateString: string): Date {
  if (!dateString) {
    return new Date(NaN)
  }

  // Si viene en formato MySQL DATE: YYYY-MM-DD (solo fecha, sin hora)
  const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/
  const dateOnlyMatch = dateString.match(dateOnlyPattern)
  
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch
    // Crear fecha en zona horaria local (sin hora, solo fecha)
    // Esto evita problemas de zona horaria cuando se parsea como UTC
    return new Date(
      parseInt(year),
      parseInt(month) - 1, // Los meses son 0-indexados
      parseInt(day)
    )
  }

  // Si viene en formato MySQL TIMESTAMP: YYYY-MM-DD HH:mm:ss
  const mysqlPattern = /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?$/
  const match = dateString.match(mysqlPattern)
  
  if (match) {
    const [, year, month, day, hour, minute, second] = match
    // Crear fecha en zona horaria local
    return new Date(
      parseInt(year),
      parseInt(month) - 1, // Los meses son 0-indexados
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    )
  }

  // Si viene en formato ISO con 'Z' (UTC), convertir a local
  if (dateString.includes('Z') || dateString.includes('+') || (dateString.includes('T') && dateString.endsWith('00:00:00'))) {
    const date = new Date(dateString)
    // Si el timestamp tiene 'Z' o es UTC, ajustar a hora local
    const localTime = date.getTime() - (date.getTimezoneOffset() * 60000)
    return new Date(localTime)
  }

  // Fallback: Si parece una fecha ISO sin zona horaria, tratarla como local
  // Esto maneja casos como "2025-11-18T00:00:00" sin Z
  if (dateString.includes('T') && !dateString.includes('Z') && !dateString.match(/[+-]\d{2}:?\d{2}$/)) {
    // Es una fecha ISO sin zona horaria, tratarla como local
    const parts = dateString.split('T')
    if (parts.length === 2) {
      const [datePart, timePart] = parts
      const dateMatch = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/)
      const timeMatch = timePart.match(/^(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?/)
      if (dateMatch && timeMatch) {
        const [, year, month, day] = dateMatch
        const [, hour, minute, second] = timeMatch
        return new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hour),
          parseInt(minute),
          parseInt(second)
        )
      }
    }
  }

  // Fallback a Date normal (último recurso)
  const date = new Date(dateString)
  // Si el resultado parece estar en UTC (día anterior) para una fecha DATE simple, parsearla manualmente
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // Es una fecha DATE simple, ya debería haberse manejado arriba, pero por si acaso
    const simpleDateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (simpleDateMatch) {
      const [, year, month, day] = simpleDateMatch
      return new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      )
    }
  }
  return date
}

/**
 * Formatea fecha para mostrar en listas (formato largo)
 * Maneja correctamente timestamps de MySQL como hora local
 */
export function formatDateLong(dateString: string): string {
  const date = parseMySQLTimestamp(dateString)
  
  if (isNaN(date.getTime())) {
    return 'Fecha inválida'
  }

  return date.toLocaleDateString('es', {
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
