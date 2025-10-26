import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import DashboardPageClient from "./page-client"

export default async function DashboardPage() {
  // Verificar que existe el token (la verificación real se hace en el backend)
  const cookieStore = cookies()
  const token = cookieStore.get("session-token")?.value
  
  if (!token) {
    redirect("/auth/login")
  }

  return <DashboardPageClient />
}
