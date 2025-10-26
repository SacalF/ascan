// EL FRONTEND NO DEBE CONECTARSE DIRECTAMENTE A LA BASE DE DATOS
// El frontend debe usar las APIs del backend

console.log("🔧 Frontend - NO conectado directamente a la base de datos")
console.log("✅ El frontend se comunica con el backend a través de APIs")
console.log("✅ Solo el backend se conecta a DigitalOcean")

// El frontend NO debe tener conexión directa a la base de datos
// export { pool } // ELIMINADO - No debe existir

// Utilidades de autenticación
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12)
}

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash)
}

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "7d" })
}

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as { userId: string }
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

// Función para ejecutar consultas SQL
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(query, params)
    return results
  } catch (error) {
    console.error("Error ejecutando query:", error)
    throw error
  }
}
