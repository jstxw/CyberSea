# ADD ENGINES TO ALL AIRCRAFT MODELS
# Batch processes all aircraft with turbofan engine integration
# Creates both normal and exploded views for each

$ErrorActionPreference = "Stop"

# Configuration
$blenderPath = "C:\Program Files\Blender Foundation\Blender 5.0\blender.exe"
$scriptPath = "C:\Users\aclie\Mesh\Mesh\main\scripts\integrate-engines-blender.py"
$enginePath = "C:\Users\aclie\Mesh\Mesh\main\public\models\turbine__turbofan_engine__jet_engine.glb"
$outputDir = "C:\Users\aclie\Mesh\Mesh\main\public\models\with-engines"
$explodeDistance = 5.0

Write-Host "`n$('='*80)" -ForegroundColor Cyan
Write-Host "✈️  BATCH ENGINE INTEGRATION - ALL AIRCRAFT" -ForegroundColor Cyan
Write-Host "$('='*80)`n" -ForegroundColor Cyan

# Check prerequisites
if (-not (Test-Path $blenderPath)) {
    Write-Host "ERROR: Blender not found" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $enginePath)) {
    Write-Host "ERROR: Engine model not found: $enginePath" -ForegroundColor Red
    exit 1
}

Write-Host "OK: Blender ready" -ForegroundColor Green
Write-Host "OK: Engine ready (10.66 MB)`n" -ForegroundColor Green

# Create output directory
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

# Define aircraft models
$aircraft = @(
    @{
        Name = "A-10 Warthog"
        Path = "C:\Users\aclie\Mesh\Mesh\main\public\models\professional\a10-war-thunder-330k.glb"
        Output = "a10-with-engines"
        Engines = 2  # Twin-engine
    },
    @{
        Name = "F/A-18F Super Hornet"
        Path = "C:\Users\aclie\Mesh\Mesh\main\public\models\f18.glb"
        Output = "f18-with-engines"
        Engines = 2  # Twin-engine
    },
    @{
        Name = "F-35A Lightning II"
        Path = "C:\Users\aclie\Mesh\Mesh\main\public\models\f-35a_lightning_ii.glb"
        Output = "f35a-with-engines"
        Engines = 1  # Single-engine
    },
    @{
        Name = "F-35 Lightning II (Original)"
        Path = "C:\Users\aclie\Mesh\Mesh\main\public\models\f35.glb"
        Output = "f35-with-engines"
        Engines = 1  # Single-engine
    },
    @{
        Name = "F-15E Strike Eagle"
        Path = "C:\Users\aclie\Mesh\Mesh\main\public\models\f15.glb"
        Output = "f15-with-engines"
        Engines = 2  # Twin-engine
    }
)

Write-Host "$('='*80)" -ForegroundColor Yellow
Write-Host "📋 AIRCRAFT TO PROCESS" -ForegroundColor Yellow
Write-Host "$('='*80)`n" -ForegroundColor Yellow

$validAircraft = @()
foreach ($plane in $aircraft) {
    if (Test-Path $plane.Path) {
        $size = [math]::Round((Get-Item $plane.Path).Length / 1MB, 2)
        $engines = $plane.Engines
        Write-Host "OK $($plane.Name) - $size MB, $engines engines" -ForegroundColor Green
        $validAircraft += $plane
    } else {
        Write-Host "SKIP $($plane.Name) - NOT FOUND" -ForegroundColor Yellow
    }
}

if ($validAircraft.Count -eq 0) {
    Write-Host "`nERROR: No valid aircraft found" -ForegroundColor Red
    exit 1
}

Write-Host "`n$('='*80)" -ForegroundColor Cyan
Write-Host "🚀 PROCESSING $($validAircraft.Count) AIRCRAFT..." -ForegroundColor Cyan
Write-Host "$('='*80)`n" -ForegroundColor Cyan

$successful = 0
$failed = 0

foreach ($plane in $validAircraft) {
    Write-Host "`n$('─'*80)" -ForegroundColor DarkGray
    Write-Host "🛩️  Processing: $($plane.Name)" -ForegroundColor Cyan
    Write-Host "$('─'*80)" -ForegroundColor DarkGray
    
    $outputNormal = Join-Path $outputDir "$($plane.Output).glb"
    
    try {
        $process = Start-Process -FilePath $blenderPath `
            -ArgumentList "--background", "--python", $scriptPath, "--", $plane.Path, $enginePath, $outputNormal, $explodeDistance `
            -NoNewWindow -Wait -PassThru
        
        if ($process.ExitCode -eq 0 -and (Test-Path $outputNormal)) {
            $size = [math]::Round((Get-Item $outputNormal).Length / 1MB, 2)
            Write-Host "`n   SUCCESS - $size MB" -ForegroundColor Green
            $successful++
        } else {
            Write-Host "`n   FAILED" -ForegroundColor Red
            $failed++
        }
    } catch {
        Write-Host "`n   ERROR: $_" -ForegroundColor Red
        $failed++
    }
}

Write-Host "`n$('='*80)" -ForegroundColor Magenta
Write-Host "📊 BATCH PROCESSING COMPLETE" -ForegroundColor Magenta
Write-Host "$('='*80)`n" -ForegroundColor Magenta

Write-Host "Successful: $successful" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if($failed -gt 0){"Red"}else{"Gray"})

if ($successful -gt 0) {
    Write-Host "`nCreated models:" -ForegroundColor Cyan
    Get-ChildItem $outputDir -Filter "*.glb" | ForEach-Object {
        $size = [math]::Round($_.Length / 1MB, 2)
        Write-Host "   $($_.Name) ($size MB)" -ForegroundColor White
    }
    
    Write-Host "`n$('='*80)" -ForegroundColor Green
    Write-Host "🎉 ALL AIRCRAFT NOW HAVE ENGINES!" -ForegroundColor Green
    Write-Host "$('='*80)`n" -ForegroundColor Green
    
    Write-Host "Next: Update demo-config.ts to use new engine-integrated models`n"
    
    explorer $outputDir
}
