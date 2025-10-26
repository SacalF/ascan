import { SignJWT, jwtVerify } from "jose"

// Validar que el JWT_SECRET esté configurado
const JWT_SECRET_STRING = process.env.JWT_SECRET
if (!JWT_SECRET_STRING || JWT_SECRET_STRING.length < 32) {
  throw new Error("JWT_SECRET debe tener al menos 32 caracteres. Configura la variable de entorno JWT_SECRET")
}

const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING)

export async function signJWT(payload: any, expiresIn = "7d") {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET)
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return { success: true, payload }
  } catch (error) {
    return { success: false, error: "Token inválido" }
  }
}

export function getTokenFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }
  return null
}
