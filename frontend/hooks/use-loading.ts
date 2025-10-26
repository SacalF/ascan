"use client"

import { useState, useCallback } from "react"

interface LoadingState {
  isLoading: boolean
  loadingText: string
  error: string | null
}

export function useLoading(initialText: string = "Cargando...") {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    loadingText: initialText,
    error: null
  })

  const startLoading = useCallback((text?: string) => {
    setState({
      isLoading: true,
      loadingText: text || initialText,
      error: null
    })
  }, [initialText])

  const stopLoading = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: false
    }))
  }, [])

  const setError = useCallback((error: string) => {
    setState({
      isLoading: false,
      loadingText: initialText,
      error
    })
  }, [initialText])

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }))
  }, [])

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      loadingText: initialText,
      error: null
    })
  }, [initialText])

  return {
    ...state,
    startLoading,
    stopLoading,
    setError,
    clearError,
    reset
  }
}

// Hook específico para operaciones async
export function useAsyncLoading<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  loadingText: string = "Cargando..."
) {
  const loading = useLoading(loadingText)

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    try {
      loading.startLoading()
      const result = await asyncFunction(...args)
      loading.stopLoading()
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      loading.setError(errorMessage)
      return null
    }
  }, [asyncFunction, loading])

  return {
    ...loading,
    execute
  }
}
