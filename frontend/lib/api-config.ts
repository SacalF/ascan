// Configuración de la API
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined
const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3001' 
  : (process.env.NEXT_PUBLIC_API_URL || 'https://ascangt.org:3001')

// Log para debugging
console.log('🔧 API Config:', {
  API_BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
})

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    users: `${API_BASE_URL}/api/users`,
    historial: `${API_BASE_URL}/api/historial`,
    reportes: `${API_BASE_URL}/api/reportes`,
    auth: {
      login: `${API_BASE_URL}/api/auth/login`,
      logout: `${API_BASE_URL}/api/auth/logout`,
      me: `${API_BASE_URL}/api/auth/me`,
      register: `${API_BASE_URL}/api/auth/register`,
    },
    citas: `${API_BASE_URL}/api/citas`,
    pacientes: `${API_BASE_URL}/api/pacientes`,
    medicos: `${API_BASE_URL}/api/medicos`,
    laboratorio: `${API_BASE_URL}/api/laboratorio`,
  }
}

// Función helper para hacer peticiones a la API
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  }

  try {
    const response = await fetch(url, defaultOptions)
    return response
  } catch (error) {
    console.error('Error en petición API:', error)
    throw error
  }
}
