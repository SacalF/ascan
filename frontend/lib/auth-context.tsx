"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { apiClient } from "./api-client"

interface User {
  id: string
  email: string
  nombre?: string
  rol?: string
  especialidad?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string, rol: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  register: (userData: any) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setLoading(false)
        return
      }

      const response = await apiClient.getCurrentUser()
      if (response.data) {
        setUser(response.data)
      } else {
        localStorage.removeItem("auth_token")
      }
    } catch (error) {
      console.error("[v0] Error checking user:", error)
      localStorage.removeItem("auth_token")
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string, rol: string) => {
    try {
      const response = await apiClient.login(email, password, rol)

      if (response.error) {
        return { error: response.error }
      }

      if (response.data?.token) {
        localStorage.setItem("auth_token", response.data.token)
        setUser(response.data.user)
      }

      return {}
    } catch (error) {
      return { error: "Error al iniciar sesión" }
    }
  }

  const logout = async () => {
    await apiClient.logout()
    setUser(null)
  }

  const register = async (userData: any) => {
    try {
      const response = await apiClient.register(userData)

      if (response.error) {
        return { error: response.error }
      }

      return {}
    } catch (error) {
      return { error: "Error al registrar usuario" }
    }
  }

  return <AuthContext.Provider value={{ user, loading, login, logout, register }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
