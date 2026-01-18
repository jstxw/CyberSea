# BATCH ULTRA-QUALITY CAD CONVERTER
# Converts all OBJ files to GLB with maximum detail
# Run after FreeCAD exports high-quality OBJ files

$blenderPath = "C:\Program Files\Blender Foundation\Blender 5.0\blender.exe"
$scriptPath = "C:\Users\aclie\Mesh\Mesh\main\scripts\blender-ultra-quality-cad.py"
$inputDir = "C:\Users\aclie\Mesh\Mesh\main\downloads\temp"
$outputDir = "C:\Users\aclie\Mesh\Mesh\main\public\models\cad"

Write-Host "`n$('='*80)" -ForegroundColor Cyan
Write-Host "🏭 BATCH ULTRA-QUALITY CAD CONVERSION" -ForegroundColor Cyan
Write-Host "$('='*80)`n" -ForegroundColor Cyan

# Check Blender
if (-not (Test-Path $blenderPath)) {
    Write-Host "❌ Blender not found at: $blenderPath" -ForegroundColor Red
    Write-Host "   Please update path in script`n" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Blender found: $(Split-Path $blenderPath -Leaf)`n" -ForegroundColor Green

# Ensure output directory
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

# Find all OBJ files
$objFiles = Get-ChildItem -Path $inputDir -Filter "*.obj" -File

if ($objFiles.Count -eq 0) {
    Write-Host "❌ No OBJ files found in: $inputDir" -ForegroundColor Red
    Write-Host "`nExpected files (from FreeCAD export):" -ForegroundColor Yellow
    Write-Host "   - a10-warthog-hq.obj"
    Write-Host "   - c17-globemaster-hq.obj"
    Write-Host "   - leopard-2a6-hq.obj"
    Write-Host "   - t90-tank-hq.obj"
    Write-Host "   - kf-21-hq.obj`n"
    exit 1
}

Write-Host "📂 Found $($objFiles.Count) OBJ file(s):`n" -ForegroundColor Cyan

$conversions = @()

foreach ($file in $objFiles) {
    $size = [math]::Round($file.Length / 1MB, 2)
    Write-Host "   ✅ $($file.Name) ($size MB)" -ForegroundColor Green
    
    $baseName = $file.BaseName -replace '-hq$', ''
    $outputFile = Join-Path $outputDir "$baseName.glb"
    
    $conversions += @{
        Input = $file.FullName
        Output = $outputFile
        Name = $baseName
    }
}

Write-Host "`n$('='*80)" -ForegroundColor Yellow
Write-Host "⚙️  STARTING BATCH CONVERSION" -ForegroundColor Yellow
Write-Host "$('='*80)`n" -ForegroundColor Yellow

$totalStart = Get-Date
$successful = 0
$failed = 0

foreach ($conversion in $conversions) {
    $start = Get-Date
    
    Write-Host "`n$('─'*80)" -ForegroundColor DarkGray
    Write-Host "📦 Converting: $($conversion.Name)" -ForegroundColor Cyan
    Write-Host "$('─'*80)" -ForegroundColor DarkGray
    
    try {
        $process = Start-Process -FilePath $blenderPath `
            -ArgumentList "--background", "--python", $scriptPath, "--", $conversion.Input, $conversion.Output `
            -NoNewWindow -Wait -PassThru
        
        if ($process.ExitCode -eq 0 -and (Test-Path $conversion.Output)) {
            $elapsed = ((Get-Date) - $start).TotalSeconds
            $outputSize = [math]::Round((Get-Item $conversion.Output).Length / 1MB, 2)
            
            Write-Host "`n✅ SUCCESS" -ForegroundColor Green
            Write-Host "   Output: $outputSize MB" -ForegroundColor Green
            Write-Host "   Time: $([math]::Round($elapsed, 1))s`n" -ForegroundColor Green
            
            $successful++
        } else {
            Write-Host "`n❌ FAILED (Exit code: $($process.ExitCode))`n" -ForegroundColor Red
            $failed++
        }
    }
    catch {
        Write-Host "`n❌ ERROR: $_`n" -ForegroundColor Red
        $failed++
    }
}

$totalElapsed = ((Get-Date) - $totalStart).TotalMinutes

Write-Host "`n$('='*80)" -ForegroundColor Magenta
Write-Host "📊 CONVERSION SUMMARY" -ForegroundColor Magenta
Write-Host "$('='*80)`n" -ForegroundColor Magenta

Write-Host "✅ Successful: $successful" -ForegroundColor Green
Write-Host "❌ Failed: $failed" -ForegroundColor $(if($failed -gt 0){"Red"}else{"Gray"})
Write-Host "⏱️  Total time: $([math]::Round($totalElapsed, 1)) minutes`n" -ForegroundColor Cyan

if ($successful -gt 0) {
    Write-Host "📦 Output location: $outputDir`n" -ForegroundColor Cyan
    
    Write-Host "✨ Models ready:" -ForegroundColor Green
    Get-ChildItem -Path $outputDir -Filter "*.glb" | ForEach-Object {
        $size = [math]::Round($_.Length / 1MB, 2)
        Write-Host "   ✅ $($_.Name) ($size MB)" -ForegroundColor Green
    }
    
    Write-Host "`n$('='*80)" -ForegroundColor Green
    Write-Host "🎉 PRODUCTION-GRADE CAD MODELS READY!" -ForegroundColor Green
    Write-Host "$('='*80)`n" -ForegroundColor Green
    
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Update src/lib/demo-config.ts with new models"
    Write-Host "2. Test in viewer: npm run dev"
    Write-Host "3. Enjoy CAD-level detail!`n"
    
    # Open output folder
    explorer $outputDir
}

Write-Host ""
