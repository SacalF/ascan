# Script para iniciar el frontend en modo producción
Write-Host "🚀 Iniciando frontend en modo producción..." -ForegroundColor Green

# Configurar variables de entorno
$env:NODE_ENV = "production"

# Cargar variables del archivo .env.production (si existe)
if (Test-Path "../backend/.env.production") {
    Write-Host "📋 Cargando configuración de .env.production..." -ForegroundColor Yellow
    
    Get-Content "../backend/.env.production" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
            Write-Host "  ✓ $name" -ForegroundColor Gray
        }
    }
}

# Iniciar el frontend
Write-Host "🎯 Iniciando frontend..." -ForegroundColor Green
npm run dev



