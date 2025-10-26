import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, Calendar, Plus } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function CitasNotFound() {
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Inicio
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <Image src="/images/ascan-logo.jpg" alt="ASCAN Logo" width={32} height={32} className="rounded-full" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Página No Encontrada</h1>
            <p className="text-gray-600">La página solicitada no existe</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <AlertCircle className="h-5 w-5" />
            Página No Encontrada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">404 - Página No Encontrada</h3>
            <p className="text-gray-600 mb-6">La página que estás buscando no existe o ha sido movida.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="flex-1">
              <Link href="/citas">
                <Calendar className="h-4 w-4 mr-2" />
                Ir a Citas
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1 bg-transparent">
              <Link href="/agendar-cita">
                <Plus className="h-4 w-4 mr-2" />
                Agendar Cita
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
