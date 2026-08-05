@echo off
title Instalador de impresion POS Marifarma

echo ============================================
echo   Instalador de Impresion POS Marifarma
echo ============================================
echo.

echo Verificando permisos de administrador...
net session >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: Se requieren permisos de administrador.
    echo Click derecho > Ejecutar como administrador.
    pause
    exit /b 1
)

echo.
echo Instalando QZ Tray...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-qz-tray.ps1"

if errorlevel 1 (
    echo.
    echo No se pudo completar la instalacion.
    pause
    exit /b 1
)

echo.
echo Verificando instalacion...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0verify-qz-tray.ps1"

echo.
echo Instalacion completada. Abra el POS y configure la impresora.
pause
