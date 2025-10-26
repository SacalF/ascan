"use client"

import { useState, useEffect } from "react"

interface Paciente {
  id_paciente: string
  nombres: string
  apellidos: string
  telefono: string | null
}

interface Medico {
  id_usuario: string
  nombres: string
  apellidos: string
  cedula_profesional?: string
  especialidad?: string
}

export default function TestPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true)
        setError(null)

        // Probar conexión directa
        console.log('Probando conexión directa...')
        
        // Cargar pacientes
        console.log('Cargando pacientes...')
        const responsePacientes = await fetch('http://localhost:3001/api/pacientes', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        })
        
        console.log('Respuesta pacientes:', responsePacientes.status, responsePacientes.statusText)
        
        if (!responsePacientes.ok) {
          throw new Error(`Error ${responsePacientes.status}: ${responsePacientes.statusText}`)
        }
        
        const dataPacientes = await responsePacientes.json()
        console.log('Datos pacientes:', dataPacientes)
        setPacientes(dataPacientes)

        // Cargar médicos
        console.log('Cargando médicos...')
        const responseMedicos = await fetch('http://localhost:3001/api/medicos', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        })
        
        console.log('Respuesta médicos:', responseMedicos.status, responseMedicos.statusText)
        
        if (!responseMedicos.ok) {
          throw new Error(`Error ${responseMedicos.status}: ${responseMedicos.statusText}`)
        }
        
        const dataMedicos = await responseMedicos.json()
        console.log('Datos médicos:', dataMedicos)
        setMedicos(dataMedicos)

      } catch (error: any) {
        console.error("Error cargando datos:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [])

  if (loading) {
    return <div>Cargando datos...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test de Conexión API</h1>
      
      <h2>Pacientes ({pacientes.length})</h2>
      <ul>
        {pacientes.map((paciente) => (
          <li key={paciente.id_paciente}>
            {paciente.nombres} {paciente.apellidos} - {paciente.telefono}
          </li>
        ))}
      </ul>

      <h2>Médicos ({medicos.length})</h2>
      <ul>
        {medicos.map((medico) => (
          <li key={medico.id_usuario}>
            {medico.nombres} {medico.apellidos} - {medico.especialidad}
          </li>
        ))}
      </ul>
    </div>
  )
}
