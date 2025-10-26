import type React from "react"
import { Sidebar } from "@/components/dashboard/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // El middleware ya verificó la autenticación, no necesitamos verificar aquí
  return (
    <div className="flex h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
