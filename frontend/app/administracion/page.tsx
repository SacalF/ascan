import AdministracionPageClient from "./page-client"
import { ProtectedRoute } from "@/components/protected-route"

export default function AdministracionPage() {
  return (
    <ProtectedRoute requiredRoles={['administrador']}>
      <AdministracionPageClient />
    </ProtectedRoute>
  )
}
