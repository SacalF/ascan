import { useState, useEffect } from 'react'
import { useAuth } from './use-auth'
import { apiClient } from '@/lib/api-client'

interface ActionsData {
  user: {
    id: string
    nombres: string
    apellidos: string
    rol: string
  }
  actions: string[]
  hasAction: (action: string) => boolean
}

export function useActions() {
  const { user, authenticated } = useAuth()
  const [actions, setActions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authenticated && user) {
      fetchActions()
    } else {
      setActions([])
      setLoading(false)
    }
  }, [authenticated, user])

  const fetchActions = async () => {
    try {
      setLoading(true)
      const result = await apiClient.makeRequest('/roles/actions')
      
      if (result.data) {
        const data = result.data as ActionsData
        setActions(data.actions || [])
      } else {
        setActions([])
      }
    } catch (error) {
      console.error('Error obteniendo acciones:', error)
      setActions([])
    } finally {
      setLoading(false)
    }
  }

  const hasAction = (action: string): boolean => {
    if (!authenticated || !user || loading) return false
    return actions.includes(action)
  }

  const canPerform = (action: string): boolean => {
    return hasAction(action)
  }

  const hasAnyAction = (actionList: string[]): boolean => {
    if (!authenticated || !user || loading) return false
    return actionList.some(action => actions.includes(action))
  }

  const hasAllActions = (actionList: string[]): boolean => {
    if (!authenticated || !user || loading) return false
    return actionList.every(action => actions.includes(action))
  }

  return {
    actions,
    hasAction,
    canPerform,
    hasAnyAction,
    hasAllActions,
    loading,
    userRole: user?.rol
  }
}
