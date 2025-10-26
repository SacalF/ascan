interface RateLimitEntry {
  attempts: number[]
  blocked: boolean
  blockUntil?: number
}

class RateLimiter {
  private attempts = new Map<string, RateLimitEntry>()
  private readonly maxAttempts: number
  private readonly windowMs: number
  private readonly blockDurationMs: number

  constructor(
    maxAttempts: number = 5,
    windowMs: number = 15 * 60 * 1000, // 15 minutos
    blockDurationMs: number = 30 * 60 * 1000 // 30 minutos
  ) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
    this.blockDurationMs = blockDurationMs
  }

  private getClientId(request: Request): string {
    // Usar IP del cliente como identificador
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const remoteAddr = request.headers.get('x-remote-addr')
    
    return forwarded?.split(',')[0] || realIp || remoteAddr || 'unknown'
  }

  private cleanupOldAttempts(attempts: number[]): number[] {
    const now = Date.now()
    return attempts.filter(time => now - time < this.windowMs)
  }

  public checkRateLimit(request: Request): { allowed: boolean; remaining: number; resetTime: number } {
    const clientId = this.getClientId(request)
    const now = Date.now()
    
    let entry = this.attempts.get(clientId)
    
    if (!entry) {
      entry = { attempts: [], blocked: false }
      this.attempts.set(clientId, entry)
    }

    // Si está bloqueado, verificar si ya pasó el tiempo de bloqueo
    if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockUntil
      }
    }

    // Si el bloqueo expiró, resetear
    if (entry.blocked && entry.blockUntil && now >= entry.blockUntil) {
      entry.blocked = false
      entry.blockUntil = undefined
      entry.attempts = []
    }

    // Limpiar intentos antiguos
    entry.attempts = this.cleanupOldAttempts(entry.attempts)

    // Verificar si excede el límite
    if (entry.attempts.length >= this.maxAttempts) {
      entry.blocked = true
      entry.blockUntil = now + this.blockDurationMs
      
      console.warn(`🚨 Rate limit exceeded for client: ${clientId}`)
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockUntil
      }
    }

    // Agregar este intento
    entry.attempts.push(now)
    
    return {
      allowed: true,
      remaining: this.maxAttempts - entry.attempts.length,
      resetTime: entry.attempts[0] + this.windowMs
    }
  }

  public recordAttempt(request: Request): void {
    const clientId = this.getClientId(request)
    const now = Date.now()
    
    let entry = this.attempts.get(clientId)
    
    if (!entry) {
      entry = { attempts: [], blocked: false }
      this.attempts.set(clientId, entry)
    }

    entry.attempts.push(now)
    
    // Limpiar intentos antiguos
    entry.attempts = this.cleanupOldAttempts(entry.attempts)
  }

  public resetClient(clientId: string): void {
    this.attempts.delete(clientId)
  }

  public getStats(): { totalClients: number; blockedClients: number } {
    let blockedClients = 0
    const now = Date.now()
    
    this.attempts.forEach((entry) => {
      if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
        blockedClients++
      }
    })
    
    return {
      totalClients: this.attempts.size,
      blockedClients
    }
  }
}

// Instancia global del rate limiter
export const rateLimiter = new RateLimiter()

// Función helper para middleware
export function checkRateLimit(request: Request) {
  return rateLimiter.checkRateLimit(request)
}

// Función helper para registrar intentos
export function recordAttempt(request: Request) {
  rateLimiter.recordAttempt(request)
}
