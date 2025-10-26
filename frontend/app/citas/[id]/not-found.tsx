import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function CitaNotFound() {
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/citas">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Citas
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <Image src="/images/ascan-logo.jpg" alt="ASCAN Logo" width={32} height={32} className="rounded-full" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cita No Encontrada</h1>
            <p className="text-gray-600">La cita solicitada no existe</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <AlertCircle className="h-5 w-5" />
            Cita No Encontrada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No se pudo encontrar la cita solicitada</h3>
            <p className="text-gray-600 mb-6">
              La cita que estás buscando no existe, fue eliminada, o el enlace es incorrecto.
            </p>

            <div className="space-y-3">
              <p className="text-sm text-gray-500">Posibles causas:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• La cita fue eliminada del sistema</li>
                <li>• El ID de la cita es incorrecto</li>
                <li>• El enlace está dañado o es obsoleto</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="flex-1">
              <Link href="/citas">
                <Calendar className="h-4 w-4 mr-2" />
                Ver Todas las Citas
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1 bg-transparent">
              <Link href="/agendar-cita">Agendar Nueva Cita</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
