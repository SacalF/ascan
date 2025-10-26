import CitasContent from "./page-client"
import { ProtectedRoute } from "@/components/protected-route"

export default function CitasPage() {
  return (
    <ProtectedRoute requiredRoles={['administrador', 'medico', 'recepcionista']}>
      <CitasContent />
    </ProtectedRoute>
  )
}