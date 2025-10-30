interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        credentials: 'include', // Para incluir cookies
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || "Error en la solicitud" }
      }

      return { data }
    } catch (error) {
      console.error("[v0] API Error:", error)
      return { error: "Error de conexión" }
    }
  }

  // Auth methods
  async login(email: string, password: string, rol: string) {
    // El backend espera 'correoElectronico', no 'email'
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
