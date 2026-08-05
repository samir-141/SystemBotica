# Instalador de Impresion POS Marifarma

## Requisitos

- Windows 10 o superior
- Permisos de administrador
- QZ Tray 2.x

## Instalacion rapida

1. Descarga QZ Tray desde https://qz.io/download/
2. Guarda el instalador como `qz-tray-installer.exe` en esta carpeta
3. Ejecuta `install-pos-printing.bat` como administrador
4. Abre el POS y ve a Configuracion > Impresion

## Archivos

| Archivo | Descripcion |
|---------|-------------|
| `install-qz-tray.ps1` | Instalador silencioso de QZ Tray |
| `verify-qz-tray.ps1` | Verifica que QZ Tray este activo |
| `uninstall-qz-tray.ps1` | Desinstala QZ Tray |
| `install-pos-printing.bat` | Lanzador completo (verifica + instala) |

## Solucion de problemas

Si QZ Tray no conecta:
1. Verifica que este ejecutandose (bandeja del sistema)
2. Ejecuta `verify-qz-tray.ps1`
3. Revisa el firewall (puerto 8181)
4. Reinicia QZ Tray
