import { executeQuery } from './mysql'

export interface AuditLogEntry {
  id_usuario: string
  tipo_accion: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'view'
  modulo: string
  descripcion: string
  datos_anteriores?: string
  datos_nuevos?: string
}

/**
 * Registra una acción en el historial de usuario
 * @param entry - Datos de la acción a registrar
 */
export async function logAuditAction(entry: AuditLogEntry): Promise<void> {
  try {
    console.log(`🔍 Intentando registrar: ${entry.tipo_accion} - ${entry.modulo}`)
    
    // Primero verificar qué columnas existen en la tabla
    const structure = await executeQuery('DESCRIBE historial_usuario')
    const columns = Array.isArray(structure) ? structure.map((col: any) => col.Field) : []
    
    console.log('📋 Columnas disponibles:', columns)
    
    // Construir query dinámicamente basado en las columnas disponibles
    let query = 'INSERT INTO historial_usuario ('
    let values = 'VALUES ('
    let params: any[] = []
    
    // Columnas básicas que siempre deben existir
    const basicColumns = ['id_usuario', 'tipo_accion', 'modulo', 'descripcion']
    
    for (let i = 0; i < basicColumns.length; i++) {
      if (columns.includes(basicColumns[i])) {
        if (i > 0) {
          query += ', '
          values += ', '
        }
        query += basicColumns[i]
        values += '?'
        
        if (basicColumns[i] === 'id_usuario') params.push(entry.id_usuario)
        else if (basicColumns[i] === 'tipo_accion') params.push(entry.tipo_accion)
        else if (basicColumns[i] === 'modulo') params.push(entry.modulo)
        else if (basicColumns[i] === 'descripcion') params.push(entry.descripcion)
      }
    }
    
    // Agregar columnas opcionales si existen
    if (columns.includes('datos_anteriores')) {
      query += ', datos_anteriores'
      values += ', ?'
      params.push(entry.datos_anteriores || null)
    }
    
    if (columns.includes('datos_nuevos')) {
      query += ', datos_nuevos'
      values += ', ?'
      params.push(entry.datos_nuevos || null)
    }
    
    query += ') ' + values + ')'
    
    console.log('🔧 Query construido:', query)
    console.log('📝 Parámetros:', params)
    
    await executeQuery(query, params)
    console.log(`✅ Acción registrada en historial: ${entry.tipo_accion} - ${entry.modulo}`)
    
  } catch (error: any) {
    console.error('❌ Error registrando en historial:', error.message)
    console.error('❌ Stack trace:', error.stack)
    // No lanzar error para no interrumpir el flujo principal
  }
}

/**
 * Registra un login exitoso
 */
export async function logLogin(userId: string, username: string): Promise<void> {
  await logAuditAction({
    id_usuario: userId,
    tipo_accion: 'login',
    modulo: 'auth',
    descripcion: `Usuario ${username} inició sesión`
  })
}

/**
 * Registra un logout
 */
export async function logLogout(userId: string, username: string): Promise<void> {
  await logAuditAction({
    id_usuario: userId,
    tipo_accion: 'logout',
    modulo: 'auth',
    descripcion: `Usuario ${username} cerró sesión`
  })
}

/**
 * Registra la creación de un recurso
 */
export async function logCreate(
  userId: string, 
  modulo: string, 
  descripcion: string, 
  datosNuevos?: any
): Promise<void> {
  await logAuditAction({
    id_usuario: userId,
    tipo_accion: 'create',
    modulo,
    descripcion,
    datos_nuevos: datosNuevos ? JSON.stringify(datosNuevos) : undefined
  })
}

/**
 * Registra la actualización de un recurso
 */
export async function logUpdate(
  userId: string, 
  modulo: string, 
  descripcion: string, 
  datosAnteriores?: any,
  datosNuevos?: any
): Promise<void> {
  await logAuditAction({
    id_usuario: userId,
    tipo_accion: 'update',
    modulo,
    descripcion,
    datos_anteriores: datosAnteriores ? JSON.stringify(datosAnteriores) : undefined,
    datos_nuevos: datosNuevos ? JSON.stringify(datosNuevos) : undefined
  })
}

/**
 * Registra la eliminación de un recurso
 */
export async function logDelete(
  userId: string, 
  modulo: string, 
  descripcion: string, 
  datosAnteriores?: any
): Promise<void> {
  await logAuditAction({
    id_usuario: userId,
    tipo_accion: 'delete',
    modulo,
    descripcion,
    datos_anteriores: datosAnteriores ? JSON.stringify(datosAnteriores) : undefined
  })
}
