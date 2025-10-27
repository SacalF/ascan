import mysql from "mysql2/promise"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// Configuración de la base de datos MySQL - SOLO DigitalOcean
const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: Number.parseInt(process.env.MYSQL_PORT || '25060'),
  waitForConnections: true,
  connectionLimit: 5, // Reducido drásticamente para evitar sobrecarga
  queueLimit: 5, // Cola pequeña
  idleTimeout: 60000, // 1 minuto para cerrar conexiones inactivas
  charset: 'utf8mb4',
  timezone: '+00:00',
  // Configuración SSL segura
  ssl: process.env.NODE_ENV === 'production' && process.env.MYSQL_SSL_CA ? {
    rejectUnauthorized: true,
    ca: process.env.MYSQL_SSL_CA,
    cert: process.env.MYSQL_SSL_CERT,
    key: process.env.MYSQL_SSL_KEY
  } : undefined,
  // Configuraciones adicionales para estabilidad
  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: true,
  debug: false
}

// Pool de conexiones - Forzar recreación para DigitalOcean
let pool = mysql.createPool(dbConfig)

// Función para recrear el pool (útil para cambios de configuración)
export function recreatePool() {
  if (pool) {
    try {
      pool.end()
    } catch (error) {
      console.error("Error cerrando pool anterior:", error)
    }
  }
  pool = mysql.createPool(dbConfig)
  return pool
}

// Función para limpiar conexiones inactivas
export async function cleanupConnections() {
  try {
    console.log("🧹 Limpiando conexiones inactivas...")
    if (pool) {
      await pool.end()
      pool = mysql.createPool(dbConfig)
      console.log("✅ Pool de conexiones recreado")
    }
  } catch (error) {
    console.error("❌ Error limpiando conexiones:", error)
  }
}

// Función para probar la conexión
export async function testConnection() {
  try {
    console.log("🔍 Probando conexión a la base de datos...")
    const connection = await pool.getConnection()
    await connection.ping()
    connection.release()
    console.log("✅ Conexión exitosa a la base de datos")
    return true
  } catch (error: any) {
    console.error("❌ Error de conexión:", error.message)
    return false
  }
}

// Forzar recreación del pool al cargar el módulo
console.log("🔄 Recreando pool de conexiones para DigitalOcean...")
recreatePool()

export { pool }

// Utilidades de autenticación
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12)
}

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash)
}

export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET debe estar configurado con al menos 32 caracteres")
  }
  return jwt.sign({ userId }, secret, { expiresIn: "7d" })
}

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    const secret = process.env.JWT_SECRET
    if (!secret || secret.length < 32) {
      console.error("JWT_SECRET no configurado correctamente")
      return null
    }
    return jwt.verify(token, secret) as { userId: string }
  } catch {
    return null
  }
}

// Utilidad para generar UUID
export const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c == "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Función para ejecutar consultas SQL usando conexiones directas (más simple y confiable)
export async function executeQuery(query: string, params: any[] = [], retries = 2) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    let connection: any = null
    
    try {
      console.log(`🔍 Ejecutando query (intento ${attempt}/${retries}): [QUERY_TYPE]`)
      
      // Crear conexión directa en lugar de usar el pool
      connection = await mysql.createConnection(dbConfig)
      
      // Ejecutar query
      const [results] = await connection.execute(query, params)
      console.log("✅ Query ejecutado exitosamente, resultados:", Array.isArray(results) ? results.length : "No es array")
      
      return results
      
    } catch (error: any) {
      console.error(`❌ Error ejecutando query (intento ${attempt}/${retries}):`, error.message)
      
      // Si es un error de conexión y quedan reintentos
      if ((error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET' || error.code === 'PROTOCOL_CONNECTION_LOST' || error.code === 'ER_CON_COUNT_ERROR') && attempt < retries) {
        console.log(`🔄 Reintentando en 1 segundo... (intento ${attempt + 1}/${retries})`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        continue
      }
      
      // Si no quedan reintentos o es otro tipo de error
      throw error
      
    } finally {
      // Asegurar que la conexión se cierre siempre
      if (connection) {
        try {
          await connection.end()
        } catch (closeError) {
          console.error("❌ Error cerrando conexión:", closeError)
        }
      }
    }
  }
}
