"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  LayoutDashboard,
  Users,
  Calendar,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  FlaskConical,
  Shield,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { usePermissions } from "@/hooks/use-permissions"

interface Profile {
  nombre: string
  especialidad: string
  email: string
}

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    module: "dashboard"
  },
  {
    title: "Pacientes",
    icon: Users,
    href: "/pacientes",
    module: "pacientes"
  },
  {
    title: "Citas",
    icon: CalendarDays,
    href: "/citas",
    module: "citas"
  },
  {
    title: "Consultas",
    icon: Calendar,
    href: "/consultas",
    module: "consultas"
  },
  {
    title: "Laboratorio",
    icon: FlaskConical,
    href: "/laboratorio",
    module: "laboratorio"
  },
  {
    title: "Administración",
    icon: Shield,
    href: "/administracion",
    module: "administracion"
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const { canAccess, refreshPermissions } = usePermissions()

  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await fetch("/api/auth/me")
        const data = await response.json()

        if (data && data.user) {
          const userData = data.user
          setProfile({
            nombre: `${userData.nombres || ""} ${userData.apellidos || ""}`.trim() || "Usuario",
            especialidad: userData.especialidad || "Profesional médico",
            email: userData.correo_electronico || userData.email || "",
          })
        }
      } catch (error) {
        console.error("Error cargando perfil:", error)
        setProfile({
          nombre: "Usuario",
          especialidad: "Profesional médico",
          email: "",
        })
      }
    }

    getProfile()
  }, [])

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/auth/login")
    } catch (error) {
      console.error("Error cerrando sesión:", error)
      router.push("/auth/login")
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div
      className={`bg-card border-r border-border/50 shadow-sm transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <img src="/ascan-logo.png" alt="ASCAN Logo" className="h-6 w-6 object-contain" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground text-sm">Sistema Clinico</h2>
                  <p className="text-xs text-muted-foreground">ASCAN</p>
                </div>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="h-8 w-8 p-0">
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            // Verificar si el usuario tiene acceso a este módulo
            const hasAccess = canAccess(item.module)
            console.log(`🔍 Verificando acceso a ${item.module}: ${hasAccess}`)
            if (!hasAccess) {
              return null
            }

            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Button
                key={item.href}
                asChild
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start transition-colors ${isCollapsed ? "px-2 h-10" : "px-3 h-10"} ${
                  isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Link href={item.href} className="flex items-center w-full">
                  <item.icon className={`h-4 w-4 flex-shrink-0 ${isCollapsed ? "" : "mr-3"}`} />
                  {!isCollapsed && <span className="truncate">{item.title}</span>}
                </Link>
              </Button>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border/50">
          {!isCollapsed && profile && (
            <div className="mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(profile.nombre)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{profile.nombre}</p>
                  <p className="text-xs text-muted-foreground truncate">{profile.especialidad}</p>
                </div>
              </div>
              <Separator className="mb-3" />
            </div>
          )}

          <div className="space-y-2">
            {/* Botón para refrescar permisos (solo para administradores) */}
            {profile && (profile.especialidad === "Administrador" || profile.nombre.includes("Administrador")) && (
              <>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50 ${
                    isCollapsed ? "px-2" : "px-3"
                  }`}
                  onClick={() => {
                    refreshPermissions()
                    window.location.reload()
                  }}
                >
                  <RefreshCw className={`h-4 w-4 ${isCollapsed ? "" : "mr-3"}`} />
                  {!isCollapsed && <span>Refrescar Permisos</span>}
                </Button>
                
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-green-600 hover:text-green-700 hover:bg-green-50 ${
                    isCollapsed ? "px-2" : "px-3"
                  }`}
                  onClick={() => {
                    // Forzar recarga completa
                    localStorage.removeItem('permissions')
                    sessionStorage.clear()
                    window.location.href = '/dashboard'
                  }}
                >
                  <RefreshCw className={`h-4 w-4 ${isCollapsed ? "" : "mr-3"}`} />
                  {!isCollapsed && <span>Forzar Recarga</span>}
                </Button>
              </>
            )}
            
            <Button
              variant="ghost"
              className={`w-full justify-start text-destructive hover:text-destructive ${
                isCollapsed ? "px-2" : "px-3"
              }`}
              onClick={handleSignOut}
            >
              <LogOut className={`h-4 w-4 ${isCollapsed ? "" : "mr-3"}`} />
              {!isCollapsed && <span>Cerrar Sesión</span>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
