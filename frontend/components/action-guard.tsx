import React from 'react'
import { useActions } from '@/hooks/use-actions'

interface ActionGuardProps {
  action: string
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAll?: boolean
  actions?: string[]
}

export function ActionGuard({ 
  action, 
  children, 
  fallback = null, 
  requireAll = false,
  actions = []
}: ActionGuardProps) {
  const { hasAction, hasAnyAction, hasAllActions, loading } = useActions()

  if (loading) {
    return <div>Cargando permisos...</div>
  }

  let hasPermission = false

  if (actions.length > 0) {
    // Si se especifican múltiples acciones
    hasPermission = requireAll ? hasAllActions(actions) : hasAnyAction(actions)
  } else {
    // Si se especifica una sola acción
    hasPermission = hasAction(action)
  }

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Componente para botones con verificación de acciones
interface ActionButtonProps {
  action: string
  onClick: () => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
  fallback?: React.ReactNode
}

export function ActionButton({ 
  action, 
  onClick, 
  children, 
  className = "",
  disabled = false,
  fallback = null
}: ActionButtonProps) {
  const { hasAction, loading } = useActions()

  if (loading) {
    return <button disabled className={className}>Cargando...</button>
  }

  if (!hasAction(action)) {
    return <>{fallback}</>
  }

  return (
    <button 
      onClick={onClick} 
      className={className}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
