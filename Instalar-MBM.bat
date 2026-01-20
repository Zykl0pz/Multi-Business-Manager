@echo off
REM Script auto-ejecutable para instalar dependencias MBM
REM Guardar como: Instalar-MBM.bat
REM Doble clic para ejecutar

chcp 65001 >nul
title Instalador Automático MBM v1.0
color 0F

:INICIO
cls
echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║         INSTALADOR AUTOMÁTICO MBM v1.0              ║
echo ║    Doble clic para instalar dependencias Node.js    ║
echo ╚══════════════════════════════════════════════════════╝
echo.
echo 📅 Fecha: %date% %time%
echo 📂 Directorio: %cd%
echo.

REM Verificar PowerShell
where powershell >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ ERROR: PowerShell no está instalado
    echo.
    echo Por favor, instala PowerShell 5.1 o superior
    echo desde: https://aka.ms/pswindows
    echo.
    pause
    exit /b 1
)

:VERIFICAR_NODE
echo 🔍 Verificando Node.js...
where node >nul 2>&1
if %errorLevel% equ 0 (
    for /f %%i in ('node --version') do set NODE_VER=%%i
    for /f %%i in ('npm --version') do set NPM_VER=%%i
    echo   ✅ Node.js: %NODE_VER%
    echo   ✅ npm: %NPM_VER%
    goto :MENU_PRINCIPAL
) else (
    echo   ❌ Node.js no encontrado
    echo.
    goto :INSTALAR_NODE
)

:INSTALAR_NODE
echo 📥 Node.js no está instalado
echo.
echo ¿Deseas instalar Node.js automáticamente?
echo.
choice /C SN /M "Selecciona (S)i o (N)o: "
if %errorLevel% equ 2 goto :SIN_NODE
if %errorLevel% equ 1 goto :PROCEDER_INSTALACION_NODE

:PROCEDER_INSTALACION_NODE
echo.
echo ⚙ Instalando Node.js...
echo.

REM Crear script PowerShell temporal para instalar Node.js
set TEMP_PS=%temp%\install_node_temp.ps1
(
echo ^$ErrorActionPreference = 'Stop'
echo Write-Host "Descargando Node.js..." -ForegroundColor Cyan
echo ^$url = 'https://nodejs.org/dist/latest/node-v20-x64.msi'
echo ^$installer = "%temp%\nodejs-install.msi"
echo Invoke-WebRequest -Uri ^$url -OutFile ^$installer -UseBasicParsing
echo Start-Process msiexec.exe -ArgumentList '/i', ^$installer, '/quiet', '/norestart' -Wait
echo Remove-Item ^$installer -Force
echo Write-Host "✅ Node.js instalado. Reinicia el instalador." -ForegroundColor Green
) > "%TEMP_PS%"

powershell -ExecutionPolicy Bypass -File "%TEMP_PS%"
del "%TEMP_PS%" >nul 2>&1

echo.
echo ✅ Node.js instalado. Por favor, reinicia este instalador.
echo.
pause
exit /b 0

:SIN_NODE
echo.
echo ❌ Node.js es requerido para continuar
echo Por favor, instálalo manualmente desde:
echo https://nodejs.org/
echo.
pause
exit /b 1

:MENU_PRINCIPAL
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📋 OPCIONES DISPONIBLES:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 1. Buscar carpeta MBM automáticamente
echo 2. Crear carpeta MBM nueva
echo 3. Limpiar instalaciones anteriores
echo 4. Instalar dependencias ^(npm install^)
echo 5. Verificar instalación
echo 6. Ejecutar todo automáticamente ^(RECOMENDADO^)
echo 7. Salir
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

:LEER_OPCION
set /p OPCION="Selecciona una opción (1-7): "
if "%OPCION%"=="" goto :LEER_OPCION

if "%OPCION%"=="1" goto :BUSCAR_MBM
if "%OPCION%"=="2" goto :CREAR_MBM
if "%OPCION%"=="3" goto :LIMPIAR
if "%OPCION%"=="4" goto :INSTALAR_DEPENDENCIAS
if "%OPCION%"=="5" goto :VERIFICAR
if "%OPCION%"=="6" goto :AUTOMATICO
if "%OPCION%"=="7" goto :SALIR

echo ❌ Opción no válida. Intenta de nuevo.
timeout /t 2 >nul
goto :MENU_PRINCIPAL

:BUSCAR_MBM
cls
echo.
echo 🔍 Buscando carpeta MBM...
echo.

REM Buscar en ubicaciones comunes
if exist "MBM" (
    set MBM_PATH=%cd%\MBM
    echo ✅ Encontrada en: %MBM_PATH%
    goto :ENCONTRADO_MBM
)

if exist "..\MBM" (
    set MBM_PATH=%cd%\..\MBM
    echo ✅ Encontrada en: %MBM_PATH%
    goto :ENCONTRADO_MBM
)

echo ❌ No se encontró carpeta MBM
echo.
echo Lugares buscados:
echo   - %cd%\MBM
echo   - %cd%\..\MBM
echo.
pause
goto :MENU_PRINCIPAL

:ENCONTRADO_MBM
echo.
echo ✅ Carpeta MBM seleccionada
set /p CONFIRMAR="¿Es correcta? (S/N): "
if /i "%CONFIRMAR%"=="S" goto :MENU_PRINCIPAL
set MBM_PATH=
goto :BUSCAR_MBM

:CREAR_MBM
cls
echo.
echo 📁 Creando carpeta MBM...
echo.
set MBM_PATH=%cd%\MBM
echo La carpeta se creará en:
echo %MBM_PATH%
echo.
set /p CONFIRMAR="¿Continuar? (S/N): "
if /i not "%CONFIRMAR%"=="S" goto :MENU_PRINCIPAL

mkdir "%MBM_PATH%" 2>nul
if %errorLevel% neq 0 (
    echo ❌ Error creando carpeta
    pause
    goto :MENU_PRINCIPAL
)

echo ✅ Carpeta creada exitosamente
echo.

REM Crear package.json básico
(
echo {
echo   "name": "mbm-project",
echo   "version": "1.0.0",
echo   "description": "Proyecto MBM",
echo   "main": "index.js",
echo   "scripts": {
echo     "start": "node index.js",
echo     "test": "echo 'Error: no test specified' && exit 1"
echo   },
echo   "dependencies": {},
echo   "devDependencies": {}
echo }
) > "%MBM_PATH%\package.json"

echo 📄 package.json básico creado
echo.
pause
goto :MENU_PRINCIPAL

:LIMPIAR
cls
echo.
echo 🧹 Limpiando instalaciones anteriores...
echo.

if "%MBM_PATH%"=="" (
    echo ⚠ Primero selecciona una carpeta MBM
    pause
    goto :MENU_PRINCIPAL
)

if exist "%MBM_PATH%\node_modules" (
    echo 🗑 Eliminando node_modules...
    rmdir /s /q "%MBM_PATH%\node_modules" 2>nul
    echo ✅ node_modules eliminado
)

if exist "%MBM_PATH%\package-lock.json" (
    echo 🗑 Eliminando package-lock.json...
    del "%MBM_PATH%\package-lock.json" 2>nul
    echo ✅ package-lock.json eliminado
)

echo.
echo ✅ Limpieza completada
echo.
pause
goto :MENU_PRINCIPAL

:INSTALAR_DEPENDENCIAS
cls
echo.
echo 📦 Instalando dependencias...
echo.

if "%MBM_PATH%"=="" (
    echo ❌ Primero selecciona una carpeta MBM
    pause
    goto :MENU_PRINCIPAL
)

if not exist "%MBM_PATH%\package.json" (
    echo ❌ No se encontró package.json
    pause
    goto :MENU_PRINCIPAL
)

echo 📂 Carpeta: %MBM_PATH%
echo.
echo ━━━━━━━━━━━━━ INICIANDO npm install ━━━━━━━━━━━━━
echo.

REM Cambiar al directorio MBM y ejecutar npm install
cd /d "%MBM_PATH%"

REM Configurar npm para salida detallada
npm config set loglevel verbose
npm config set progress true

REM Ejecutar npm install con salida detallada
echo Ejecutando: npm install --verbose --progress=true
echo.
npm install --verbose --progress=true

set NPM_EXIT=%errorLevel%
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

if %NPM_EXIT% equ 0 (
    echo ✅ Dependencias instaladas correctamente
) else (
    echo ❌ Error en la instalación ^(Código: %NPM_EXIT%^)
)

REM Volver al directorio original
cd /d "%cd%"

echo.
pause
goto :MENU_PRINCIPAL

:VERIFICAR
cls
echo.
echo ✅ Verificando instalación...
echo.

set ALL_OK=1

REM Verificar Node.js
where node >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ Node.js instalado
) else (
    echo ❌ Node.js no instalado
    set ALL_OK=0
)

REM Verificar carpeta MBM
if "%MBM_PATH%"=="" (
    echo ❌ Carpeta MBM no seleccionada
    set ALL_OK=0
) else (
    if exist "%MBM_PATH%" (
        echo ✅ Carpeta MBM existe
    ) else (
        echo ❌ Carpeta MBM no existe
        set ALL_OK=0
    )
)

REM Verificar package.json
if exist "%MBM_PATH%\package.json" (
    echo ✅ package.json existe
) else (
    echo ❌ package.json no existe
    set ALL_OK=0
)

REM Verificar node_modules
if exist "%MBM_PATH%\node_modules" (
    echo ✅ node_modules existe
) else (
    echo ❌ node_modules no existe
    set ALL_OK=0
)

echo.
if %ALL_OK% equ 1 (
    echo 🎉 ¡TODAS LAS VERIFICACIONES PASARON CORRECTAMENTE!
) else (
    echo ⚠ Algunas verificaciones fallaron
)

echo.
pause
goto :MENU_PRINCIPAL

:AUTOMATICO
cls
echo.
echo 🚀 Ejecutando instalación automática...
echo.

REM Paso 1: Verificar Node.js (ya verificado)
echo PASO 1: ✅ Node.js verificado

REM Paso 2: Buscar o crear carpeta MBM
echo.
echo PASO 2: Buscando carpeta MBM...
if exist "MBM" (
    set MBM_PATH=%cd%\MBM
    echo   ✅ Encontrada: %MBM_PATH%
) else (
    echo   ⚠ No encontrada, creando...
    set MBM_PATH=%cd%\MBM
    mkdir "%MBM_PATH%" 2>nul
    
    REM Crear package.json básico
    (
    echo {
    echo   "name": "mbm-project",
    echo   "version": "1.0.0",
    echo   "description": "Proyecto MBM",
    echo   "main": "index.js",
    echo   "scripts": {
    echo     "start": "node index.js",
    echo     "test": "echo 'Error: no test specified' && exit 1"
    echo   },
    echo   "dependencies": {},
    echo   "devDependencies": {}
    echo }
    ) > "%MBM_PATH%\package.json"
    
    echo   ✅ Carpeta creada con package.json básico
)

REM Paso 3: Limpiar si existe
echo.
echo PASO 3: Limpiando instalaciones anteriores...
if exist "%MBM_PATH%\node_modules" (
    rmdir /s /q "%MBM_PATH%\node_modules" 2>nul
    echo   ✅ node_modules eliminado
)
if exist "%MBM_PATH%\package-lock.json" (
    del "%MBM_PATH%\package-lock.json" 2>nul
    echo   ✅ package-lock.json eliminado
)

REM Paso 4: Instalar dependencias
echo.
echo PASO 4: Instalando dependencias...
echo   📂 Carpeta: %MBM_PATH%
echo.

cd /d "%MBM_PATH%"
npm config set loglevel verbose
npm config set progress true

echo   Ejecutando npm install...
echo   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
npm install --verbose --progress=true

set NPM_EXIT=%errorLevel%
cd /d "%cd%"

echo   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

if %NPM_EXIT% equ 0 (
    echo   ✅ Dependencias instaladas
) else (
    echo   ❌ Error en instalación
)

REM Paso 5: Verificación final
echo.
echo PASO 5: Verificación final...

set VERIF_OK=1
if not exist "%MBM_PATH%\node_modules" set VERIF_OK=0
if not exist "%MBM_PATH%\package.json" set VERIF_OK=0

echo.
if %VERIF_OK% equ 1 (
    echo ✅ Instalación automática completada exitosamente!
) else (
    echo ⚠ Instalación completada con advertencias
)

echo.
echo 📍 Carpeta MBM: %MBM_PATH%
echo.
pause
goto :MENU_PRINCIPAL

:SALIR
cls
echo.
echo 👋 Saliendo del instalador...
echo.
echo Gracias por usar el Instalador Automático MBM
echo.
timeout /t 3 >nul
exit /b 0