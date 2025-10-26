"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface DownloadButtonProps {
  archivoBase64: string | null
  archivoNombre: string | null
}

export function DownloadButton({ archivoBase64, archivoNombre }: DownloadButtonProps) {
  const handleDownload = () => {
    if (archivoBase64 && archivoNombre) {
      const link = document.createElement("a")
      link.href = archivoBase64
      link.download = archivoNombre
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <Button onClick={handleDownload} className="flex items-center">
      <Download className="h-4 w-4 mr-2" />
      Descargar
    </Button>
  )
}
