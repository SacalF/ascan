"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Loader2, Database, Users, Stethoscope } from "lucide-react"

interface TestResult {
  endpoint: string
  status: number
  success: boolean
  response: any
  error?: string
}

export default function DebugApiPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const testEndpoints = async () => {
    setLoading(true)
    setGlobalError(null)
    setResults([])

    const endpoints = [
      { name: 'Médicos', url: '/api/medicos', method: 'GET' },
      { name: 'Pacientes', url: '/api/pacientes', method: 'GET' },
      { name: 'Citas', url: '/api/citas', method: 'GET' },
    ]

    const testResults: TestResult[] = []

    for (const endpoint of endpoints) {
      try {
        console.log(`Probando endpoint: ${endpoint.url}`)
        
        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const result: TestResult = {
          endpoint: endpoint.url,
          status: response.status,
          success: response.ok,
          response: null
        }

        if (response.ok) {
          const data = await response.json()
          result.response = data
          result.response.length = Array.isArray(data) ? data.length : 'N/A'
        } else {
          result.error = `HTTP ${response.status}: ${response.statusText}`
          try {
            const errorData = await response.json()
            result.error += ` - ${errorData.error || 'Error desconocido'}`
            if (errorData.details) {
              result.error += ` (${errorData.details})`
            }
          } catch {
            // Error parsing JSON
          }
        }

        testResults.push(result)
        console.log(`Resultado ${endpoint.url}:`, result)

      } catch (error) {
        const result: TestResult = {
          endpoint: endpoint.url,
          status: 0,
          success: false,
          response: null,
          error: String(error)
        }
        testResults.push(result)
        console.error(`Error en ${endpoint.url}:`, error)
      }
    }

    setResults(testResults)
    setLoading(false)
  }

  useEffect(() => {
    testEndpoints()
  }, [])

  const getStatusColor = (status: number, success: boolean) => {
    if (!success) return "bg-red-100 text-red-800"
    if (status < 300) return "bg-green-100 text-green-800"
    if (status < 500) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getStatusIcon = (status: number, success: boolean) => {
    if (!success) return <AlertCircle className="w-4 h-4 text-red-600" />
    if (status < 300) return <CheckCircle className="w-4 h-4 text-green-600" />
    return <AlertCircle className="w-4 h-4 text-yellow-600" />
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Debug de APIs</h1>
          <p className="text-muted-foreground">
            Verificación de endpoints y diagnóstico de errores de servidor
          </p>
        </div>
        <Button onClick={testEndpoints} disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Probar APIs
        </Button>
      </div>

      {globalError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-600">{globalError}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen general */}
      <Card>
        <CardHeader>
          <CardTitle>Estado General de APIs</CardTitle>
          <CardDescription>Resultados de las pruebas realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          {results.length > 0 ? (
            <div className="grid gap-4">
              {results.map((result) => (
                <div key={result.endpoint} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status, result.success)}
                    <div>
                      <p className="font-semibold">{result.endpoint}</p>
                      {result.error ? (
                        <p className="text-sm text-red-600">{result.error}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {Array.isArray(result.response) 
                            ? `${result.response.length} registros` 
                            : 'Respuesta exitosa'}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge className={getStatusColor(result.status, result.success)}>
                    HTTP {result.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Ejecuta las pruebas para ver los resultados</p>
          )}
        </CardContent>
      </Card>

      {/* Detalles de respuestas exitosas */}
      {results.filter(r => r.success).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Respuestas Exitosas</CardTitle>
            <CardDescription>Datos obtenidos de las APIs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results
                .filter(r => r.success && Array.isArray(r.response))
                .map((result) => (
                  <div key={`details-${result.endpoint}`} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{result.endpoint}</h4>
                    <div className="text-sm text-muted-foreground">
                      <pre className="whitespace-pre-wrap overflow-auto max-h-48 bg-gray-50 p-2 rounded">
                        {JSON.stringify(result.response, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información de debugging */}
      <Card>
        <CardHeader>
          <CardTitle>Herramientas de Debugging</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>1.</strong> Revisa la consola del navegador para más detalles de errores</p>
            <p><strong>2.</strong> Revisa la consola del servidor para logs detallados</p>
            <p><strong>3.</strong> Verifica que tienes una sesión activa de usuario</p>
            <p><strong>4.</strong> Si obtienes errores 401, asegúrate de estar logueado</p>
            <p><strong>5.</strong> Si obtienes errores 500, revisa la configuración de la base de datos MySQL</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}