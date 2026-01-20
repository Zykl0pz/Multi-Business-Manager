@echo off
setlocal enabledelayedexpansion

echo ========================================
echo  Iniciando Servidor de Desarrollo
echo ========================================
echo.

REM Configuración
set PORT=3000
set WAIT_TIME=30
set URL=http://localhost:%PORT%

REM Verificar si npm está instalado
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm no se encuentra instalado o no está en el PATH.
    echo Instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar si existe package.json
if not exist "package.json" (
    echo ERROR: No se encontro package.json en la ruta actual.
    echo Ruta actual: %cd%
    pause
    exit /b 1
)

REM Verificar si el script "dev" está definido en package.json
findstr /i "\"dev\"" package.json >nul
if %errorlevel% neq 0 (
    echo ADVERTENCIA: No se encontro el script "dev" en package.json.
    echo Scripts disponibles en package.json:
    findstr /i "\"scripts\"" package.json
    echo.
    set /p continuar="¿Deseas continuar de todas formas? (s/n): "
    if /i not "!continuar!"=="s" (
        echo Operacion cancelada.
        pause
        exit /b 1
    )
)

echo Iniciando servidor de desarrollo...
echo Servidor: npm run dev
echo Puerto: %PORT%
echo.
echo El navegador se abrira automaticamente en %WAIT_TIME% segundos...
echo Presiona Ctrl+C en la ventana del servidor para detenerlo.
echo.

REM Iniciar npm run dev en una nueva ventana
start "Servidor Dev - Puerto %PORT%" cmd /k "npm run dev"

echo Esperando %WAIT_TIME% segundos para que el servidor se inicie...
echo.

REM Contador regresivo visual
for /l %%i in (%WAIT_TIME%, -1, 1) do (
    echo Abriendo navegador en %%i segundos...
    timeout /t 1 /nobreak >nul
    cls
    echo ========================================
    echo  Iniciando Servidor de Desarrollo
    echo ========================================
    echo.
    echo Servidor npm run dev iniciado en nueva ventana...
    echo.
)

REM Intentar verificar si el puerto está disponible antes de abrir el navegador
echo Verificando si el servidor esta listo en puerto %PORT%...
powershell -Command "Test-NetConnection -ComputerName localhost -Port %PORT%" | find "TcpTestSucceeded : True" >nul

if %errorlevel% equ 0 (
    echo ✓ Servidor detectado en puerto %PORT%
) else (
    echo ⚠ No se pudo verificar el puerto %PORT%
    echo   El servidor puede estar iniciandose todavía...
)

echo.
echo Abriendo navegador en: %URL%

REM Abrir el navegador por defecto
start "" "%URL%"

echo.
echo ========================================
echo  Instrucciones:
echo  1. El servidor se ejecuta en una ventana separada
echo  2. Para detenerlo: Cierra la ventana o presiona Ctrl+C
echo  3. URL: %URL%
echo ========================================
echo.
echo Este script finalizara en 5 segundos...
timeout /t 5 /nobreak >nul