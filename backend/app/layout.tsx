import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ASCAN Backend API",
  description: "API Backend para el sistema ASCAN",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
