# =============================================================================
# verify-qz-tray.ps1
# Verifica que QZ Tray este instalado y ejecutandose.
# =============================================================================

$possiblePaths = @(
    "$env:ProgramFiles\QZ Tray\qz-tray.exe",
    "${env:ProgramFiles(x86)}\QZ Tray\qz-tray.exe"
)

$installedPath = $possiblePaths | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $installedPath) {
    Write-Host "QZ Tray NO esta instalado." -ForegroundColor Red
    Write-Host "Descarga desde: https://qz.io/download/" -ForegroundColor Yellow
    exit 1
}

Write-Host "QZ Tray instalado en: $installedPath" -ForegroundColor Green

$process = Get-Process | Where-Object { $_.ProcessName -like "*qz*" } | Select-Object -First 1

if ($process) {
    Write-Host "QZ Tray esta EJECUTANDOSE (PID: $($process.Id))." -ForegroundColor Green
    exit 0
} else {
    Write-Host "QZ Tray esta instalado pero NO esta ejecutandose." -ForegroundColor Yellow
    Write-Host "Abre QZ Tray desde el menu Inicio." -ForegroundColor Yellow
    exit 2
}
