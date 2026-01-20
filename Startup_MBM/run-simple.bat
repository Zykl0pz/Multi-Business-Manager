@echo off
echo Iniciando servidor de desarrollo...
echo.

REM Ejecutar npm run dev en una ventana nueva
start "Servidor Dev" cmd /k "npm run dev"

echo Servidor iniciado. Esperando 30 segundos para abrir el navegador...
echo.

REM Esperar 30 segundos
timeout /t 30 /nobreak >nul

REM Abrir navegador en localhost:3000
start http://localhost:3000

echo Navegador abierto en http://localhost:3000
echo.
echo El servidor se ejecuta en una ventana separada.
echo Para detenerlo: Cierra la ventana del servidor o presiona Ctrl+C en ella.
echo.
pause