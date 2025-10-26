"use client"

import { cn } from "@/lib/utils"

interface LoadingAscanProps {
  text?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingAscan({ 
  text = "Cargando...", 
  size = "md",
  className 
}: LoadingAscanProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center space-y-6 p-8 min-h-[200px]",
      className
    )}>
      {/* Logo ASCAN animado */}
      <div className="relative">
        {/* Círculo exterior animado */}
        <div className={cn(
          "relative rounded-full border-4 border-blue-200",
          sizeClasses[size]
        )}>
          {/* Círculo interior con gradiente ASCAN */}
          <div className={cn(
            "absolute inset-1 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center",
            sizeClasses[size]
          )}>
            {/* Letra A estilizada */}
            <span className="text-white font-bold text-lg">A</span>
          </div>
          
          {/* Anillo de carga animado */}
          <div className={cn(
            "absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin",
            sizeClasses[size]
          )} />
        </div>
        
        {/* Puntos de carga adicionales */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
      
      {/* Texto de carga */}
      <div className="text-center">
        <p className={cn(
          "text-gray-600 font-medium animate-pulse",
          textSizeClasses[size]
        )}>
          {text}
        </p>
        {/* Subtítulo opcional */}
        <p className="text-xs text-gray-400 mt-1">
          Sistema Clínico ASCAN
        </p>
      </div>
    </div>
  )
}

// Variante más simple para botones
export function LoadingAscanButton({ size = "sm" }: { size?: "sm" | "md" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5"
  }

  return (
    <div className="flex items-center space-x-2">
      <div className={cn(
        "relative rounded-full border-2 border-white/30",
        sizeClasses[size]
      )}>
        <div className={cn(
          "absolute inset-0.5 rounded-full bg-white",
          sizeClasses[size]
        )}>
          <span className="text-blue-600 font-bold text-xs flex items-center justify-center h-full">A</span>
        </div>
        <div className={cn(
          "absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin",
          sizeClasses[size]
        )} />
      </div>
      <span className="text-sm">Cargando...</span>
    </div>
  )
}

// Variante para overlays de pantalla completa
export function LoadingAscanOverlay({ text = "Cargando..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-12 border border-gray-100 min-w-[400px]">
        <LoadingAscan text={text} size="lg" />
      </div>
    </div>
  )
}

// Variante para pantalla completa centrada
export function LoadingAscanFullScreen({ text = "Cargando..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-white flex items-center justify-center z-50">
      <div className="text-center">
        <LoadingAscan text={text} size="lg" />
      </div>
    </div>
  )
}

// Variante para cards
export function LoadingAscanCard({ text = "Cargando..." }: { text?: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-12 bg-gray-50 rounded-lg border border-gray-200">
      <LoadingAscan text={text} size="md" />
    </div>
  )
}
