'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CrearConsultaButtonProps {
  pacienteId: string
  pacienteNombre: string
}

export function CrearConsultaButton({ pacienteId, pacienteNombre }: CrearConsultaButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleCrearConsulta = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/consultas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paciente_id: pacienteId,
          motivo_consulta: 'Dolor abdominal persistente y pérdida de peso',
          enfermedad_actual: 'Paciente refiere dolor abdominal de 3 meses de evolución, localizado en epigastrio, acompañado de pérdida de peso no intencional de 8 kg en los últimos 2 meses.',
          exploracion_fisica: 'Paciente en buen estado general, normohidratada, afebril. Abdomen blando, dolor a la palpación en epigastrio.',
          diagnostico_provisional: 'Sospecha de neoplasia gástrica. Solicitar estudios de imagen y endoscopía.',
          plan_tratamiento: '1. Solicitar tomografía abdominal con contraste\n2. Endoscopía digestiva alta\n3. Marcadores tumorales',
          observaciones: 'Paciente ansiosa por los síntomas. Explicado el plan de estudios.'
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage('✅ Consulta creada exitosamente')
        console.log('Consulta creada:', result)
        // Recargar la página para mostrar la nueva consulta
        setTimeout(() => {
          router.refresh()
        }, 1000)
      } else {
        console.error('Error del servidor:', result)
        setMessage(`❌ Error: ${result.error}${result.details ? ` - ${result.details}` : ''}`)
      }
    } catch (error) {
      console.error('Error creando consulta:', error)
      setMessage(`❌ Error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button 
        onClick={handleCrearConsulta} 
        disabled={isLoading}
        size="sm"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Plus className="w-4 h-4 mr-2" />
        )}
        Crear Consulta
      </Button>
      {message && (
        <p className={`text-sm ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
