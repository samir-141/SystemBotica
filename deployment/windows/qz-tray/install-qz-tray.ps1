# =============================================================================
# install-qz-tray.ps1
# Instala QZ Tray en la computadora de forma silenciosa.
# Requiere permisos de administrador.
# =============================================================================

param(
    [string]$InstallerPath = ".\qz-tray-installer.exe"
)

$ErrorActionPreference = "Stop"

function Test-IsAdministrator {
    $currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentIdentity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-IsAdministrator)) {
    Write-Host "ERROR: Se requieren permisos de administrador." -ForegroundColor Red
    Write-Host "Ejecuta PowerShell como administrador." -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $InstallerPath)) {
    Write-Host "ERROR: No se encontro el instalador: $InstallerPath" -ForegroundColor Red
    Write-Host "Descarga QZ Tray desde: https://qz.io/download/" -ForegroundColor Yellow
    exit 1
}

Write-Host "Instalando QZ Tray..." -ForegroundColor Cyan

$process = Start-Process -FilePath $InstallerPath -ArgumentList "/S" -Wait -PassThru

if ($process.ExitCode -ne 0) {
    Write-Host "ERROR: La instalacion termino con codigo: $($process.ExitCode)" -ForegroundColor Red
    exit $process.ExitCode
}

Write-Host "QZ Tray fue instalado correctamente." -ForegroundColor Green

$possiblePaths = @(
    "$env:ProgramFiles\QZ Tray\qz-tray.exe",
    "${env:ProgramFiles(x86)}\QZ Tray\qz-tray.exe"
)

$installedPath = $possiblePaths | Where-Object { Test-Path $_ } | Select-Object -First 1

if ($installedPath) {
    Write-Host "Ejecutable: $installedPath" -ForegroundColor Gray
    Start-Process $installedPath
    Write-Host "QZ Tray esta ejecutandose." -ForegroundColor Green
} else {
    Write-Host "QZ Tray se instalo pero no se encontro el ejecutable." -ForegroundColor Yellow
    Write-Host "Buscalo manualmente en el menu Inicio." -ForegroundColor Yellow
}

exit 0
