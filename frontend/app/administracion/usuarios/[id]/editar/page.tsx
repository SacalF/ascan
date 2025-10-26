import { Suspense } from "react"
import EditarUsuarioPageClient from "./page-client"

export default function EditarUsuarioPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <EditarUsuarioPageClient />
    </Suspense>
  )
}