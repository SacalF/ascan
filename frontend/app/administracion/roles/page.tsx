import { Suspense } from "react"
import RolesPageClient from "./page-client"

export default function RolesPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <RolesPageClient />
    </Suspense>
  )
}
