# =============================================================================
# uninstall-qz-tray.ps1
# Desinstala QZ Tray utilizando el desinstalador oficial.
# Requiere permisos de administrador.
# =============================================================================

$ErrorActionPreference = "Stop"

function Test-IsAdministrator {
    $currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentIdentity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-IsAdministrator)) {
    Write-Host "ERROR: Se requieren permisos de administrador." -ForegroundColor Red
    exit 1
}

$uninstallerPaths = @(
    "$env:ProgramFiles\QZ Tray\uninstall.exe",
    "${env:ProgramFiles(x86)}\QZ Tray\uninstall.exe"
)

$uninstaller = $uninstallerPaths | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $uninstaller) {
    Write-Host "No se encontro el desinstalador de QZ Tray." -ForegroundColor Yellow
    Write-Host "Intenta desinstalar desde Panel de Control > Programas." -ForegroundColor Yellow
    exit 1
}

Write-Host "Desinstalando QZ Tray..." -ForegroundColor Cyan

$process = Start-Process -FilePath $uninstaller -ArgumentList "/S" -Wait -PassThru

if ($process.ExitCode -ne 0) {
    Write-Host "La desinstalacion termino con codigo: $($process.ExitCode)" -ForegroundColor Yellow
}

Write-Host "QZ Tray fue desinstalado." -ForegroundColor Green
exit 0
