#!/usr/bin/env node

/**
 * Script para generar JWT Secret seguro
 * Uso: node generate-jwt-secret.js
 */

const crypto = require('crypto')

function generateJWTSecret() {
  // Generar 64 bytes (512 bits) de datos aleatorios
  const secret = crypto.randomBytes(64).toString('hex')
  
  console.log('🔐 JWT Secret generado:')
  console.log('='.repeat(80))
  console.log(secret)
  console.log('='.repeat(80))
  console.log('')
  console.log('📝 Instrucciones:')
  console.log('1. Copia el secret de arriba')
  console.log('2. Agrégalo a tu archivo .env.local:')
  console.log('   JWT_SECRET=' + secret)
  console.log('3. Para producción, genera un secret diferente')
  console.log('4. NUNCA compartas este secret')
  console.log('')
  console.log('✅ Longitud:', secret.length, 'caracteres')
  console.log('✅ Entropía: 512 bits')
  console.log('✅ Formato: Hexadecimal')
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generateJWTSecret()
}

module.exports = { generateJWTSecret }
