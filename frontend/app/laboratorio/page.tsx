import LaboratorioPageClient from "./page-client"
import { ProtectedRoute } from "@/components/protected-route"

export default function LaboratorioPage() {
  return (
    <ProtectedRoute requiredRoles={['administrador', 'medico', 'laboratorio', 'ultrasonido']}>
      <LaboratorioPageClient />
    </ProtectedRoute>
  )
}