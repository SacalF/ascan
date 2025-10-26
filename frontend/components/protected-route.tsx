"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { LoadingAscanCard } from '@/components/ui/loading-ascan'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { user, loading, authenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !authenticated) {
      console.log('🔒 Usuario no autenticado, redirigiendo al login')
      router.push('/auth/login')
    }
  }, [loading, authenticated, router])

  useEffect(() => {
    if (!loading && authenticated && requiredRoles && user) {
      if (!requiredRoles.includes(user.rol)) {
        console.log(`🔒 Rol insuficiente. Requerido: ${requiredRoles.join(', ')}, Actual: ${user.rol}`)
        // Redirigir a una página de acceso denegado o al dashboard
        router.push('/dashboard?error=access_denied')
      }
    }
  }, [loading, authenticated, user, requiredRoles, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingAscanCard text="Verificando autenticación..." />
      </div>
    )
  }

  if (!authenticated) {
    return null // Se redirigirá al login
  }

  if (requiredRoles && user && !requiredRoles.includes(user.rol)) {
    return null // Se redirigirá al dashboard
  }

  return <>{children}</>
}