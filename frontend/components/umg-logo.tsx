import Image from "next/image"

interface UMGLogoProps {
  size?: number
  className?: string
  showCopyright?: boolean
}

export default function UMGLogo({ size = 40, className = "", showCopyright = true }: UMGLogoProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <Image
          src="/UMG_Logo.png"
          alt="Universidad Mariano Gálvez de Guatemala"
          width={size}
          height={size}
          className="object-contain"
          priority
        />
      </div>
      {showCopyright && (
        <div className="text-center mt-2">
          <p className="text-xs text-muted-foreground">
            Universidad Mariano Gálvez de Guatemala
          </p>
          <p className="text-xs text-muted-foreground">
            © 2024 - Todos los derechos reservados
          </p>
        </div>
      )}
    </div>
  )
}
