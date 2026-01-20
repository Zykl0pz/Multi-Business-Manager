# Script auto-ejecutable para instalar dependencias MBM
# Guardar como: Instalar-MBM.ps1
# Doble clic para ejecutar

# ============================================================
# CONFIGURACIÓN INICIAL
# ============================================================
$ErrorActionPreference = "Stop"
$global:ScriptPath = $PSScriptRoot
$global:MBMPath = $null
$global:InstallLog = Join-Path $env:TEMP "mbm-install-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

# Configurar colores de consola
$Host.UI.RawUI.ForegroundColor = "White"
Clear-Host

# ============================================================
# FUNCIONES PRINCIPALES
# ============================================================

function Show-Header {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║         INSTALADOR AUTOMÁTICO MBM v1.0              ║" -ForegroundColor Cyan
    Write-Host "║    Doble clic para instalar dependencias Node.js    ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📅 Fecha: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Gray
    Write-Host "📂 Directorio del script: $global:ScriptPath" -ForegroundColor Gray
    Write-Host ""
}

function Show-Menu {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkCyan
    Write-Host "📋 OPCIONES DISPONIBLES:" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkCyan
    
    @"
    1️⃣  Instalar Node.js + npm (si no están instalados)
    2️⃣  Buscar carpeta MBM automáticamente
    3️⃣  Crear carpeta MBM nueva
    4️⃣  Limpiar instalaciones anteriores
    5️⃣  Instalar dependencias (npm install)
    6️⃣  Verificar instalación
    7️⃣  Ejecutar todo automáticamente (RECOMENDADO)
    8️⃣  Salir
"@ | Write-Host
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkCyan
    Write-Host ""
}

function Test-NodeInstalled {
    Write-Host "🔍 Verificando Node.js..." -ForegroundColor Cyan
    try {
        $nodeVersion = node --version 2>$null
        $npmVersion = npm --version 2>$null
        if ($nodeVersion -and $npmVersion) {
            Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
            Write-Host "   ✅ npm: $npmVersion" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "   ❌ Node.js no encontrado" -ForegroundColor Red
        return $false
    }
    return $false
}

function Install-NodeJS {
    Write-Host "📥 Instalando Node.js..." -ForegroundColor Cyan
    
    $tempDir = Join-Path $env:TEMP "nodejs-auto-install"
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    
    # Detectar arquitectura
    if ([Environment]::Is64BitOperatingSystem) {
        $arch = "x64"
    } else {
        $arch = "x86"
    }
    
    Write-Host "   📊 Arquitectura: $arch" -ForegroundColor Gray
    
    # Descargar última versión LTS
    $nodeUrl = "https://nodejs.org/dist/latest/node-v20-x64.msi"
    if ($arch -eq "x86") {
        $nodeUrl = "https://nodejs.org/dist/latest/node-v20-x86.msi"
    }
    
    $installerPath = Join-Path $tempDir "nodejs.msi"
    
    try {
        Write-Host "   ⏬ Descargando Node.js..." -ForegroundColor Gray
        Invoke-WebRequest -Uri $nodeUrl -OutFile $installerPath -UseBasicParsing
        
        Write-Host "   🔧 Instalando..." -ForegroundColor Gray
        $installArgs = @(
            "/i", "`"$installerPath`"",
            "/quiet",
            "/norestart",
            "/log", "$global:InstallLog"
        )
        
        Start-Process "msiexec.exe" -ArgumentList $installArgs -Wait -NoNewWindow
        
        Write-Host "   ✅ Node.js instalado correctamente" -ForegroundColor Green
        Write-Host "   🔄 Por favor, cierra y vuelve a abrir este script" -ForegroundColor Yellow
        
        Start-Sleep -Seconds 5
        exit 0
        
    } catch {
        Write-Host "   ❌ Error instalando Node.js: $_" -ForegroundColor Red
        return $false
    } finally {
        Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

function Find-MBMDirectory {
    Write-Host "🔍 Buscando carpeta MBM..." -ForegroundColor Cyan
    
    # Buscar en diferentes ubicaciones comunes
    $possiblePaths = @(
        ".\MBM",
        "..\MBM",
        ".\src\MBM",
        ".\proyecto\MBM",
        ".\app\MBM",
        ".\frontend\MBM",
        ".\client\MBM"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path -PathType Container) {
            $global:MBMPath = Resolve-Path $path
            Write-Host "   ✅ Encontrada en: $global:MBMPath" -ForegroundColor Green
            return $true
        }
    }
    
    # Buscar recursivamente
    Write-Host "   🔎 Buscando recursivamente..." -ForegroundColor Gray
    $found = Get-ChildItem -Path . -Directory -Recurse -Depth 3 -ErrorAction SilentlyContinue | 
             Where-Object { $_.Name -eq "MBM" } | 
             Select-Object -First 1 -ExpandProperty FullName
    
    if ($found) {
        $global:MBMPath = $found
        Write-Host "   ✅ Encontrada en: $global:MBMPath" -ForegroundColor Green
        return $true
    }
    
    Write-Host "   ❌ No se encontró carpeta MBM" -ForegroundColor Red
    return $false
}

function Create-MBMDirectory {
    Write-Host "📁 Creando carpeta MBM..." -ForegroundColor Cyan
    
    $defaultPath = Join-Path $global:ScriptPath "MBM"
    
    Write-Host "   📍 La carpeta se creará en:" -ForegroundColor Gray
    Write-Host "   $defaultPath" -ForegroundColor White
    
    Write-Host ""
    Write-Host "¿Deseas continuar? (S/N): " -ForegroundColor Yellow -NoNewline
    $choice = Read-Host
    
    if ($choice -eq 'S' -or $choice -eq 's') {
        try {
            New-Item -Path $defaultPath -ItemType Directory -Force | Out-Null
            $global:MBMPath = $defaultPath
            Write-Host "   ✅ Carpeta creada exitosamente" -ForegroundColor Green
            
            # Crear package.json básico
            $packageJson = @{
                name = "mbm-project"
                version = "1.0.0"
                description = "Proyecto MBM"
                main = "index.js"
                scripts = @{
                    start = "node index.js"
                    test = "echo 'Error: no test specified' && exit 1"
                }
                dependencies = @{}
                devDependencies = @{}
            }
            
            $packageJson | ConvertTo-Json | Out-File "$global:MBMPath\package.json" -Encoding UTF8
            Write-Host "   📄 package.json básico creado" -ForegroundColor Green
            
            return $true
        } catch {
            Write-Host "   ❌ Error creando carpeta: $_" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "   ⚠ Operación cancelada" -ForegroundColor Yellow
        return $false
    }
}

function Clean-PreviousInstall {
    Write-Host "🧹 Limpiando instalaciones anteriores..." -ForegroundColor Cyan
    
    if (-not $global:MBMPath) {
        Write-Host "   ⚠ Primero selecciona una carpeta MBM" -ForegroundColor Yellow
        return $false
    }
    
    $itemsToClean = @(
        "node_modules",
        "package-lock.json",
        "yarn.lock",
        "pnpm-lock.yaml",
        "npm-debug.log"
    )
    
    $cleanedCount = 0
    foreach ($item in $itemsToClean) {
        $fullPath = Join-Path $global:MBMPath $item
        if (Test-Path $fullPath) {
            try {
                if (Test-Path $fullPath -PathType Container) {
                    Remove-Item $fullPath -Recurse -Force -ErrorAction SilentlyContinue
                } else {
                    Remove-Item $fullPath -Force -ErrorAction SilentlyContinue
                }
                Write-Host "   🗑 Eliminado: $item" -ForegroundColor Gray
                $cleanedCount++
            } catch {
                Write-Host "   ⚠ No se pudo eliminar: $item" -ForegroundColor Yellow
            }
        }
    }
    
    if ($cleanedCount -gt 0) {
        Write-Host "   ✅ Limpieza completada ($cleanedCount items)" -ForegroundColor Green
    } else {
        Write-Host "   ℹ No había elementos para limpiar" -ForegroundColor Gray
    }
    
    return $true
}

function Install-Dependencies {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Cyan
    
    if (-not $global:MBMPath) {
        Write-Host "   ❌ Primero selecciona una carpeta MBM" -ForegroundColor Red
        return $false
    }
    
    if (-not (Test-Path "$global:MBMPath\package.json")) {
        Write-Host "   ❌ No se encontró package.json" -ForegroundColor Red
        return $false
    }
    
    Write-Host "   📂 Carpeta: $global:MBMPath" -ForegroundColor Gray
    
    # Cambiar al directorio
    Push-Location $global:MBMPath
    
    try {
        # Configurar npm
        npm config set loglevel verbose 2>$null
        npm config set progress true 2>$null
        
        Write-Host "   ⚙ Configurando npm..." -ForegroundColor Gray
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━ INICIANDO npm install ━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkCyan
        
        # Ejecutar npm install con salida detallada
        $processInfo = New-Object System.Diagnostics.ProcessStartInfo
        $processInfo.FileName = "npm"
        $processInfo.Arguments = "install --verbose --progress=true"
        $processInfo.WorkingDirectory = $global:MBMPath
        $processInfo.UseShellExecute = $false
        $processInfo.RedirectStandardOutput = $true
        $processInfo.RedirectStandardError = $true
        $processInfo.CreateNoWindow = $true
        
        $process = New-Object System.Diagnostics.Process
        $process.StartInfo = $processInfo
        
        # Variables para capturar salida
        $outputBuilder = New-Object System.Text.StringBuilder
        
        # Evento para procesar salida en tiempo real
        $scriptBlock = {
            $line = $EventArgs.Data
            if ($line -ne $null) {
                # Filtrar líneas vacías
                if ($line.Trim() -eq "") { return }
                
                # Formatear y colorear salida
                if ($line -match "error" -or $line -match "Error" -or $line -match "ERROR") {
                    Write-Host "   [ERROR] $line" -ForegroundColor Red
                } elseif ($line -match "warn" -or $line -match "Warn" -or $line -match "WARN") {
                    Write-Host "   [WARN]  $line" -ForegroundColor Yellow
                } elseif ($line -match "added \d+ packages" -or $line -match "up to date") {
                    Write-Host "   [INFO]  $line" -ForegroundColor Green
                } elseif ($line -match "npm (info|verb)") {
                    Write-Host "   [DETALLE] $line" -ForegroundColor Gray
                } else {
                    Write-Host "   [npm]   $line" -ForegroundColor White
                }
                
                $outputBuilder.AppendLine($line) | Out-Null
            }
        }
        
        # Registrar eventos
        $eventOutput = Register-ObjectEvent -InputObject $process `
            -EventName 'OutputDataReceived' `
            -Action $scriptBlock
            
        $eventError = Register-ObjectEvent -InputObject $process `
            -EventName 'ErrorDataReceived' `
            -Action $scriptBlock
        
        # Iniciar proceso
        $process.Start() | Out-Null
        $process.BeginOutputReadLine()
        $process.BeginErrorReadLine()
        
        # Esperar a que termine (máximo 15 minutos)
        $process.WaitForExit(900000)
        
        # Desregistrar eventos
        Unregister-Event -SourceIdentifier $eventOutput.Name
        Unregister-Event -SourceIdentifier $eventError.Name
        
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkCyan
        Write-Host ""
        
        if ($process.ExitCode -eq 0) {
            Write-Host "   ✅ Dependencias instaladas correctamente" -ForegroundColor Green
            
            # Mostrar resumen
            $output = $outputBuilder.ToString()
            if ($output -match "added (\d+) packages") {
                Write-Host "   📊 Paquetes agregados: $($Matches[1])" -ForegroundColor Green
            }
            
            return $true
        } else {
            Write-Host "   ❌ Error en la instalación (Código: $($process.ExitCode))" -ForegroundColor Red
            return $false
        }
        
    } catch {
        Write-Host "   ❌ Error: $_" -ForegroundColor Red
        return $false
    } finally {
        Pop-Location
    }
}

function Test-Installation {
    Write-Host "✅ Verificando instalación..." -ForegroundColor Cyan
    
    if (-not $global:MBMPath) {
        Write-Host "   ⚠ Primero selecciona una carpeta MBM" -ForegroundColor Yellow
        return $false
    }
    
    $checks = @(
        @{Name="Carpeta MBM"; Path=$global:MBMPath; Type="Folder"},
        @{Name="package.json"; Path="$global:MBMPath\package.json"; Type="File"},
        @{Name="node_modules"; Path="$global:MBMPath\node_modules"; Type="Folder"}
    )
    
    $allOk = $true
    foreach ($check in $checks) {
        if (Test-Path $check.Path) {
            Write-Host "   ✅ $($check.Name)" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $($check.Name)" -ForegroundColor Red
            $allOk = $false
        }
    }
    
    # Verificar node y npm
    if (Test-NodeInstalled) {
        Write-Host "   ✅ Node.js y npm funcionando" -ForegroundColor Green
    } else {
        $allOk = $false
    }
    
    if ($allOk) {
        Write-Host ""
        Write-Host "🎉 ¡TODAS LAS VERIFICACIONES PASARON CORRECTAMENTE!" -ForegroundColor Green
        return $true
    } else {
        Write-Host ""
        Write-Host "⚠ Algunas verificaciones fallaron" -ForegroundColor Yellow
        return $false
    }
}

function Run-Automatic {
    Write-Host "🚀 Ejecutando instalación automática..." -ForegroundColor Magenta
    Write-Host ""
    
    # Paso 1: Verificar Node.js
    Write-Host "PASO 1: Verificar Node.js" -ForegroundColor Cyan
    if (-not (Test-NodeInstalled)) {
        Write-Host "   Instalando Node.js automáticamente..." -ForegroundColor Yellow
        Install-NodeJS
        return
    }
    
    # Paso 2: Buscar carpeta MBM
    Write-Host ""
    Write-Host "PASO 2: Buscar carpeta MBM" -ForegroundColor Cyan
    if (-not (Find-MBMDirectory)) {
        Write-Host "   Creando carpeta MBM automáticamente..." -ForegroundColor Yellow
        Create-MBMDirectory
    }
    
    # Paso 3: Limpiar si existe node_modules
    Write-Host ""
    Write-Host "PASO 3: Limpiar instalaciones anteriores" -ForegroundColor Cyan
    if (Test-Path "$global:MBMPath\node_modules") {
        Clean-PreviousInstall
    }
    
    # Paso 4: Instalar dependencias
    Write-Host ""
    Write-Host "PASO 4: Instalar dependencias" -ForegroundColor Cyan
    Install-Dependencies
    
    # Paso 5: Verificar
    Write-Host ""
    Write-Host "PASO 5: Verificar instalación" -ForegroundColor Cyan
    Test-Installation
    
    Write-Host ""
    Write-Host "✅ Instalación automática completada" -ForegroundColor Green
}

# ============================================================
# PROGRAMA PRINCIPAL
# ============================================================

function Main {
    # Mostrar encabezado
    Show-Header
    
    # Verificar si estamos ejecutando como administrador (solo para info)
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
    if ($isAdmin) {
        Write-Host "⚠ Ejecutando como Administrador" -ForegroundColor Yellow
    } else {
        Write-Host "ℹ Ejecutando como usuario normal" -ForegroundColor Gray
    }
    
    Write-Host ""
    
    # Menú principal
    do {
        Show-Menu
        
        $choice = Read-Host "Selecciona una opción (1-8)"
        
        switch ($choice) {
            "1" {
                if (-not (Test-NodeInstalled)) {
                    Install-NodeJS
                }
            }
            "2" {
                Find-MBMDirectory
            }
            "3" {
                Create-MBMDirectory
            }
            "4" {
                Clean-PreviousInstall
            }
            "5" {
                Install-Dependencies
            }
            "6" {
                Test-Installation
            }
            "7" {
                Run-Automatic
            }
            "8" {
                Write-Host ""
                Write-Host "👋 Saliendo del instalador..." -ForegroundColor Cyan
                Start-Sleep -Seconds 2
                exit 0
            }
            default {
                Write-Host ""
                Write-Host "❌ Opción no válida. Intenta de nuevo." -ForegroundColor Red
            }
        }
        
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkCyan
        Write-Host "Presiona Enter para continuar..." -ForegroundColor Gray -NoNewline
        Read-Host
        
    } while ($true)
}

# ============================================================
# MANEJO DE ERRORES Y EJECUCIÓN
# ============================================================

try {
    # Verificar si PowerShell tiene permisos de ejecución
    if ($PSVersionTable.PSVersion.Major -lt 3) {
        Write-Host "❌ Se requiere PowerShell 3.0 o superior" -ForegroundColor Red
        Write-Host "💡 Actualiza PowerShell desde: https://aka.ms/pswindows" -ForegroundColor Yellow
        Read-Host "Presiona Enter para salir"
        exit 1
    }
    
    # Ejecutar programa principal
    Main
    
} catch {
    Write-Host ""
    Write-Host "❌❌❌ ERROR CRÍTICO ❌❌❌" -ForegroundColor Red
    Write-Host "Mensaje: $_" -ForegroundColor Red
    Write-Host "Línea: $($_.InvocationInfo.ScriptLineNumber)" -ForegroundColor Red
    Write-Host ""
    Write-Host "📝 Log guardado en: $global:InstallLog" -ForegroundColor Gray
    
} finally {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor DarkGray
    Write-Host "Fin del instalador. Puedes cerrar esta ventana." -ForegroundColor Gray
    Write-Host ""
    
    # Mantener la ventana abierta
    if ($Host.Name -eq "ConsoleHost") {
        Write-Host "Presiona cualquier tecla para cerrar..." -ForegroundColor Gray -NoNewline
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
}