# ADD ENGINES TO A-10 MODEL
# Integrates separate engine GLB with A-10 model
# Creates both normal and exploded views

param(
    [Parameter(Mandatory=$false)]
    [string]$EnginePath = "",
    
    [Parameter(Mandatory=$false)]
    [double]$ExplodeDistance = 5.0
)

$ErrorActionPreference = "Stop"

# Configuration
$blenderPath = "C:\Program Files\Blender Foundation\Blender 5.0\blender.exe"
$scriptPath = "C:\Users\aclie\Mesh\Mesh\main\scripts\integrate-engines-blender.py"
$a10Path = "C:\Users\aclie\Mesh\Mesh\main\public\models\professional\a10-war-thunder-330k.glb"
$outputDir = "C:\Users\aclie\Mesh\Mesh\main\public\models\professional"

Write-Host "`n$('='*80)" -ForegroundColor Cyan
Write-Host "🚁 A-10 ENGINE INTEGRATION SYSTEM" -ForegroundColor Cyan
Write-Host "$('='*80)`n" -ForegroundColor Cyan

# Check Blender
if (-not (Test-Path $blenderPath)) {
    Write-Host "❌ Blender not found: $blenderPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Blender found" -ForegroundColor Green

# Check A-10 model
if (-not (Test-Path $a10Path)) {
    Write-Host "❌ A-10 model not found: $a10Path" -ForegroundColor Red
    exit 1
}

$a10Size = [math]::Round((Get-Item $a10Path).Length / 1MB, 2)
Write-Host "✅ A-10 model ready ($a10Size MB)" -ForegroundColor Green

# Get engine path
if (-not $EnginePath) {
    Write-Host "`n📂 Looking for engine models..." -ForegroundColor Yellow
    
    # Search for engine GLB files
    $engineFiles = Get-ChildItem "C:\Users\aclie\Mesh\Mesh\main" -Filter "*engine*.glb" -Recurse -ErrorAction SilentlyContinue
    
    if ($engineFiles.Count -eq 0) {
        Write-Host "`n❌ No engine GLB files found" -ForegroundColor Red
        Write-Host "`nPlease provide engine model:" -ForegroundColor Yellow
        Write-Host "   .\scripts\add-engines-to-a10.ps1 -EnginePath 'path\to\engine.glb'`n"
        exit 1
    }
    
    Write-Host "`nFound engine models:`n" -ForegroundColor Green
    for ($i = 0; $i -lt $engineFiles.Count; $i++) {
        $size = [math]::Round($engineFiles[$i].Length / 1MB, 2)
        Write-Host "   $($i+1). $($engineFiles[$i].Name) ($size MB)"
        Write-Host "      Path: $($engineFiles[$i].FullName)" -ForegroundColor DarkGray
        Write-Host ""
    }
    
    if ($engineFiles.Count -eq 1) {
        $EnginePath = $engineFiles[0].FullName
        Write-Host "✅ Using: $($engineFiles[0].Name)`n" -ForegroundColor Green
    } else {
        Write-Host "Multiple engines found. Please specify:" -ForegroundColor Yellow
        Write-Host "   .\scripts\add-engines-to-a10.ps1 -EnginePath 'path\to\engine.glb'`n"
        exit 1
    }
}

# Check engine file
if (-not (Test-Path $EnginePath)) {
    Write-Host "❌ Engine file not found: $EnginePath" -ForegroundColor Red
    exit 1
}

$engineSize = [math]::Round((Get-Item $EnginePath).Length / 1MB, 2)
$engineName = Split-Path $EnginePath -Leaf
Write-Host "✅ Engine model: $engineName ($engineSize MB)" -ForegroundColor Green

# Output paths
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outputNormal = Join-Path $outputDir "a10-with-engines.glb"
$outputExploded = Join-Path $outputDir "a10-with-engines-exploded.glb"

Write-Host "`n$('='*80)" -ForegroundColor Yellow
Write-Host "⚙️  CONFIGURATION" -ForegroundColor Yellow
Write-Host "$('='*80)" -ForegroundColor Yellow
Write-Host "A-10:          $a10Size MB" -ForegroundColor White
Write-Host "Engine:        $engineSize MB (x2 = $([math]::Round($engineSize*2, 2)) MB)" -ForegroundColor White
Write-Host "Explode Dist:  $ExplodeDistance units" -ForegroundColor White
Write-Host "Output:        a10-with-engines.glb" -ForegroundColor White
Write-Host "Output:        a10-with-engines-exploded.glb" -ForegroundColor White
Write-Host "$('='*80)`n" -ForegroundColor Yellow

Write-Host "🎨 Running Blender integration..." -ForegroundColor Cyan
Write-Host "$('='*80)`n" -ForegroundColor DarkGray

try {
    # Run Blender
    $process = Start-Process -FilePath $blenderPath `
        -ArgumentList "--background", "--python", $scriptPath, "--", $a10Path, $EnginePath, $outputNormal, $ExplodeDistance `
        -NoNewWindow -Wait -PassThru
    
    if ($process.ExitCode -eq 0) {
        Write-Host "`n$('='*80)" -ForegroundColor Green
        Write-Host "✅ INTEGRATION COMPLETE!" -ForegroundColor Green
        Write-Host "$('='*80)`n" -ForegroundColor Green
        
        if (Test-Path $outputNormal) {
            $normalSize = [math]::Round((Get-Item $outputNormal).Length / 1MB, 2)
            Write-Host "✅ Normal view:   $normalSize MB" -ForegroundColor Green
            Write-Host "   Path: $outputNormal" -ForegroundColor DarkGray
            Write-Host ""
        }
        
        if (Test-Path $outputExploded) {
            $explodedSize = [math]::Round((Get-Item $outputExploded).Length / 1MB, 2)
            Write-Host "✅ Exploded view: $explodedSize MB" -ForegroundColor Green
            Write-Host "   Path: $outputExploded" -ForegroundColor DarkGray
            Write-Host ""
        }
        
        Write-Host "`n$('='*80)" -ForegroundColor Cyan
        Write-Host "🎯 NEXT STEPS" -ForegroundColor Cyan
        Write-Host "$('='*80)`n" -ForegroundColor Cyan
        Write-Host "1. Models saved to: public\models\professional\" -ForegroundColor White
        Write-Host "2. Add to demo-config.ts" -ForegroundColor White
        Write-Host "3. Refresh browser to see A-10 with engines!" -ForegroundColor White
        Write-Host "4. Try exploded view to see components separated`n" -ForegroundColor White
        
        # Open output folder
        explorer $outputDir
        
    } else {
        Write-Host "`n❌ Integration failed (Exit code: $($process.ExitCode))" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "`n❌ Error: $_" -ForegroundColor Red
    exit 1
}
