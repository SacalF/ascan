"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SubirResultadoForm } from "@/components/laboratorio/subir-resultado-form"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface Paciente {
  id_paciente: string
  nombres: string
  apellidos: string
  numero_registro_medico: string
}

export default function SubirResultadoPage() {
  const router = useRouter()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargarPacientes = async () => {
      try {
        console.log("Cargando pacientes...")
        const response = await fetch('/api/pacientes', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        })

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/auth/login')
            return
          }
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        console.log("Pacientes cargados:", data.length)
        setPacientes(Array.isArray(data) ? data : [])
      } catch (error: any) {
        console.error("Error cargando pacientes:", error)
        setError(error.message || "Error al cargar pacientes")
      } finally {
        setLoading(false)
      }
    }

    cargarPacientes()
  }, [router])

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-10 w-96" />
            <Skeleton className="h-5 w-80 mt-2" />
          </div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded">
          <h3 className="font-semibold">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Subir Resultado de Laboratorio</h1>
          <p className="text-muted-foreground">Adjunta archivos PDF o imágenes de resultados de laboratorio</p>
        </div>

        <SubirResultadoForm pacientes={pacientes} />
      </div>
    </div>
  )
}
