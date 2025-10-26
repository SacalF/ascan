import React from 'react'
import Image from 'next/image'

interface AscanLogoProps {
  size?: number
  className?: string
}

export default function AscanLogo({ size = 40, className = "" }: AscanLogoProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Image
        src="/ascan-logo.png"
        alt="ASCAN Logo"
        width={size}
        height={size}
        className="rounded-full"
        priority
      />
    </div>
  )
}