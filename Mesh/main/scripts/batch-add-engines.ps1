# Batch add engines to all aircraft
param([double]$ExplodeDistance = 5.0)

$ErrorActionPreference = "Stop"

$blender = "C:\Program Files\Blender Foundation\Blender 5.0\blender.exe"
$script = "C:\Users\aclie\Mesh\Mesh\main\scripts\integrate-engines-blender.py"
$engine = "C:\Users\aclie\Mesh\Mesh\main\public\models\turbine__turbofan_engine__jet_engine.glb"
$outDir = "C:\Users\aclie\Mesh\Mesh\main\public\models\with-engines"

Write-Host "`nBATCH ENGINE INTEGRATION`n"

# Check files
if (!(Test-Path $blender)) { Write-Host "ERROR: Blender not found"; exit 1 }
if (!(Test-Path $engine)) { Write-Host "ERROR: Engine not found"; exit 1 }

Write-Host "Blender: OK"
Write-Host "Engine: OK`n"

# Create output dir
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

# Aircraft list
$aircraft = @(
    @{ Name="A-10"; Path="C:\Users\aclie\Mesh\Mesh\main\public\models\professional\a10-war-thunder-330k.glb"; Out="a10-with-engines" },
    @{ Name="F-18"; Path="C:\Users\aclie\Mesh\Mesh\main\public\models\f18.glb"; Out="f18-with-engines" },
    @{ Name="F-35A"; Path="C:\Users\aclie\Mesh\Mesh\main\public\models\f-35a_lightning_ii.glb"; Out="f35a-with-engines" },
    @{ Name="F-35"; Path="C:\Users\aclie\Mesh\Mesh\main\public\models\f35.glb"; Out="f35-with-engines" },
    @{ Name="F-15"; Path="C:\Users\aclie\Mesh\Mesh\main\public\models\f15.glb"; Out="f15-with-engines" }
)

# Process each
$ok = 0
foreach ($a in $aircraft) {
    if (!(Test-Path $a.Path)) { 
        Write-Host "SKIP: $($a.Name) - not found"
        continue 
    }
    
    Write-Host "`nProcessing: $($a.Name)..."
    $out = Join-Path $outDir "$($a.Out).glb"
    
    $proc = Start-Process -FilePath $blender -ArgumentList "--background","--python",$script,"--",$a.Path,$engine,$out,$ExplodeDistance -NoNewWindow -Wait -PassThru
    
    if ($proc.ExitCode -eq 0 -and (Test-Path $out)) {
        $size = [math]::Round((Get-Item $out).Length/1MB,2)
        Write-Host "  SUCCESS: $size MB"
        $ok++
    } else {
        Write-Host "  FAILED"
    }
}

Write-Host "`nComplete: $ok aircraft processed"

if ($ok -gt 0) {
    Write-Host "`nOutput:"
    Get-ChildItem $outDir -Filter "*.glb" | ForEach-Object {
        Write-Host "  $($_.Name)"
    }
    explorer $outDir
}
