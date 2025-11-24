interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseUrl: string

  constructor() {
    // Siempre usar localhost en desarrollo, independientemente del NODE_ENV
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined
    
    if (isDevelopment) {
      this.baseUrl = "http://localhost:3001/api"
    } else {
      // En producción, garantizar que el baseUrl termine en /api
      const publicUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://ascangt.org').replace(/\/$/, '')
      this.baseUrl = `${publicUrl}/api`
    }
    
    console.log(`[API] Base URL: ${this.baseUrl}`)
    console.log(`[API] Environment: ${process.env.NODE_ENV}`)
    console.log(`[API] Environment NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL}`)
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      console.log(`[API] Making request to: ${url}`)
      console.log(`[API] Options:`, options)
      
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          // Solo agregar Content-Type si no es FormData
          ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
          ...options.headers,
        }
      })

      console.log(`[API] Response status: ${response.status}`)
      console.log(`[API] Response headers:`, Object.fromEntries(response.headers.entries()))

      // Verificar si la respuesta es HTML en lugar de JSON
      const contentType = response.headers.get('content-type')
      console.log(`[API] Content-Type: ${contentType}`)
      
      if (contentType && contentType.includes('text/html')) {
        const htmlText = await response.text()
        console.log(`[API] HTML Response (first 200 chars):`, htmlText.substring(0, 200))
        return { error: "El servidor devolvió HTML en lugar de JSON. Posible error 404/500." }
      }

      const data = await response.json()
      console.log(`[API] Response data:`, data)

      if (!response.ok) {
        return { error: data.error || "Error en la solicitud" }
      }

      return { data }
    } catch (error) {
      console.error("[API] Error:", error)
      return { error: "Error de conexión: " + error.message }
    }
  }

  // Auth methods
  async login(email: string, password: string, rol: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ correoElectronico: email, password, rol }),
    })
  }

  async register(userData: any) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async logout() {
    return this.request("/auth/logout", { method: "POST" })
  }

  async getCurrentUser() {
    return this.request("/auth/me")
  }

  // Public request method for external use
  async makeRequest(endpoint: string, options: RequestInit = {}) {
    return this.request(endpoint, options)
  }

  // Pacientes methods
  async getPacientes() {
    return this.request("/pacientes")
  }

  async getPaciente(id: string) {
    return this.request(`/pacientes/${id}`)
  }

  async createPaciente(pacienteData: any) {
    return this.request("/pacientes", {
      method: "POST",
      body: JSON.stringify(pacienteData),
    })
  }

  async updatePaciente(id: string, pacienteData: any) {
    return this.request(`/pacientes/${id}`, {
      method: "PUT",
      body: JSON.stringify(pacienteData),
    })
  }

  async deletePaciente(id: string) {
    return this.request(`/pacientes/${id}`, {
      method: "DELETE",
    })
  }

  // Citas methods
  async getCitas(fecha?: string, pacienteId?: string) {
    const params = new URLSearchParams()
    if (fecha) params.append("fecha", fecha)
    if (pacienteId) params.append("paciente_id", pacienteId)

    return this.request(`/citas?${params.toString()}`)
  }

  async getCita(id: string) {
    return this.request(`/citas/${id}`)
  }

  async createCita(citaData: any) {
    return this.request("/citas", {
      method: "POST",
      body: JSON.stringify(citaData),
    })
  }

  async updateCita(id: string, citaData: any) {
    return this.request(`/citas/${id}`, {
      method: "PUT",
      body: JSON.stringify(citaData),
    })
  }

  // Consultas methods
  async getConsultas(pacienteId?: string) {
    const params = pacienteId ? `?paciente_id=${pacienteId}` : ""
    return this.request(`/consultas${params}`)
  }

  async createConsulta(consultaData: any) {
    return this.request("/consultas", {
      method: "POST",
      body: JSON.stringify(consultaData),
    })
  }

  async createConsultaInicial(data: any) {
    return this.request('/consultas/inicial', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async createValoracion(data: any) {
    return this.request('/valoraciones', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async createExamenFisico(data: any) {
    return this.request('/examenes-fisicos', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async createConsultaSeguimiento(data: any) {
    return this.request('/consultas/seguimiento', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Médicos methods
  async getMedicos() {
    return this.request("/medicos")
  }

  // Laboratorio methods
  async getResultadosLaboratorio(pacienteId?: string) {
    const params = pacienteId ? `?paciente_id=${pacienteId}` : ""
    return this.request(`/laboratorio${params}`)
  }

  async getResultadoLaboratorio(id: string) {
    return this.request(`/laboratorio/${id}`)
  }

  async createResultadoLaboratorio(resultadoData: any) {
    return this.request("/laboratorio", {
      method: "POST",
      body: JSON.stringify(resultadoData),
    })
  }

}

export const apiClient = new ApiClient()
