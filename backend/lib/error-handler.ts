import { NextResponse } from "next/server"

export interface SecureError {
  message: string
  status: number
  isOperational?: boolean
}

export class AppError extends Error {
  public status: number
  public isOperational: boolean

  constructor(message: string, status: number = 500, isOperational: boolean = true) {
    super(message)
    this.status = status
    this.isOperational = isOperational
  }
}

export function handleError(error: any): NextResponse {
  // Log del error completo para debugging (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.error("Error completo:", error)
  } else {
    // En producción, solo log básico
    console.error("Error:", error.message || "Error desconocido")
  }

  // Si es un error operacional conocido
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status }
    )
  }

  // Para errores de base de datos
  if (error.code && error.code.startsWith('ER_')) {
    return NextResponse.json(
      { error: "Error en la base de datos" },
      { status: 500 }
    )
  }

  // Para errores de validación
  if (error.name === 'ValidationError') {
    return NextResponse.json(
      { error: "Datos de entrada inválidos" },
      { status: 400 }
    )
  }

  // Error genérico (no expone detalles internos)
  return NextResponse.json(
    { error: "Error interno del servidor" },
    { status: 500 }
  )
}

export function createSecureResponse(data: any, status: number = 200): NextResponse {
  return NextResponse.json(data, { status })
}
