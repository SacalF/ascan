import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

interface User {
  id: string
  nombres: string
  apellidos: string
  email: string
  rol: string
  estado: string
}

interface AuthState {
  user: User | null
  loading: boolean
  authenticated: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    authenticated: false
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }))
      
      const result = await apiClient.getCurrentUser()
      
      if (result.data && (result.data as any).authenticated) {
        setAuthState({
          user: (result.data as any).user,
          loading: false,
          authenticated: true
        })
      } else {
        setAuthState({
          user: null,
          loading: false,
          authenticated: false
        })
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error)
      setAuthState({
        user: null,
        loading: false,
        authenticated: false
      })
    }
  }

  const logout = async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error('Error en logout:', error)
    } finally {
      setAuthState({
        user: null,
        loading: false,
        authenticated: false
      })
      // Redirigir al login
      window.location.href = '/auth/login'
    }
  }

  return {
    ...authState,
    logout,
    checkAuth
  }
}