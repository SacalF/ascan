"use client"

import type React from "react"

import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Lock, UserCog } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import AscanLogo from "@/components/ascan-logo"
import UMGLogo from "@/components/umg-logo"

export default function LoginPage() {
  const [correoElectronico, setCorreoElectronico] = useState("")
  const [password, setPassword] = useState("")
  const [rol, setRol] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await apiClient.login(correoElectronico, password, rol || undefined)

      if (result.data) {
        console.log("Login exitoso:", result.data)
        console.log("Cookies después del login:", document.cookie)

        // Verificar autenticación real
        if (result.data && (result.data as any).user) {
          console.log("Autenticación exitosa, redirigiendo...")
          // Usar window.location.href para forzar la navegación
          window.location.href = "/dashboard"
        } else {
          console.error("No se recibieron datos de usuario válidos")
          setError("Error: No se pudo establecer la sesión")
        }
      } else {
        throw new Error(result.error || "Error al iniciar sesión")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex flex-col">
      {/* Logo UMG en esquina superior derecha */}
      <div className="absolute top-4 right-4">
        <UMGLogo size={80} showCopyright={false} />
      </div>
      
      {/* Contenido principal centrado */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <AscanLogo size={60} />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">ASCAN</h1>
            <p className="text-muted-foreground">Asociación Quetzalteca Contra el Cáncer</p>
          </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">Ingresa tus credenciales para acceder al sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ejemplo@gmail.com"
                    className="pl-10"
                    required
                    value={correoElectronico}
                    onChange={(e) => setCorreoElectronico(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    className="pl-10"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rol" className="text-sm font-medium">
                  Rol en el Sistema
                </Label>
                <div className="relative">
                  <UserCog className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                  <Select value={rol} onValueChange={setRol} required>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Selecciona tu rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medico">Médico</SelectItem>
                      <SelectItem value="recepcionista">Recepcionista</SelectItem>
                      <SelectItem value="administrador">Administrador</SelectItem>
                      <SelectItem value="enfermera">Enfermera</SelectItem>
                      <SelectItem value="laboratorio">Laboratorista</SelectItem>
                      <SelectItem value="ultrasonido">Ultrasonido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

          </CardContent>
        </Card>
        </div>
      </div>
      
      {/* Derechos de autor al final de la página */}
      <div className="p-4 text-center">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>© 2025 Universidad Mariano Gálvez de Guatemala</p>
          <p>Frisly Wilfredo Sacalxot Velasquez - Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  )
}
