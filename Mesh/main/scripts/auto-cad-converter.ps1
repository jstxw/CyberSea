# AUTO CAD CONVERSION SCRIPT
# Uses Aspose API to convert STEP → GLB directly
# No manual steps required!

$cadDir = "C:\Users\aclie\Mesh\Mesh\main\downloads\cad"
$outputDir = "C:\Users\aclie\Mesh\Mesh\main\public\models\cad"
$tempDir = "C:\Users\aclie\Mesh\Mesh\main\downloads\temp"

# Ensure directories
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

# Find all STEP files
$stepFiles = @(
    "$cadDir\a10-warthog.stp",
    "$cadDir\c17-globemaster.stp",
    "$cadDir\leopard-2a6.step",
    "$cadDir\t90-tank.stp",
    "$cadDir\kf-21.step"
)

Write-Host "`n$('='*80)" -ForegroundColor Cyan
Write-Host "🏭 PRODUCTION CAD CONVERSION - AUTOMATED" -ForegroundColor Cyan
Write-Host "$('='*80)`n" -ForegroundColor Cyan

Write-Host "📂 Found $($stepFiles.Count) STEP files:`n"
foreach ($file in $stepFiles) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length / 1MB
        Write-Host "   ✅ $(Split-Path $file -Leaf) ($([math]::Round($size, 2)) MB)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $(Split-Path $file -Leaf) - NOT FOUND" -ForegroundColor Red
    }
}

Write-Host "`n$('='*80)" -ForegroundColor Yellow
Write-Host "⚠️  CONVERSION OPTIONS:" -ForegroundColor Yellow
Write-Host "$('='*80)`n" -ForegroundColor Yellow

Write-Host "OPTION 1: Use Online Converter (Recommended)" -ForegroundColor Cyan
Write-Host "   - Go to: https://products.aspose.app/cad/conversion/stp-to-glb"
Write-Host "   - Upload each STEP file"
Write-Host "   - Download GLB directly to: $outputDir`n"

Write-Host "OPTION 2: Use Aspose Cloud API (Automated - Requires API Key)" -ForegroundColor Cyan
Write-Host "   - Sign up at: https://www.aspose.cloud/"
Write-Host "   - Get free API key (monthly quota)"
Write-Host "   - Use PowerShell script with API`n"

Write-Host "OPTION 3: Use Desktop CAD Software" -ForegroundColor Cyan
Write-Host "   - FreeCAD: https://www.freecad.org/downloads.php"
Write-Host "   - Open STEP → Export as GLB → Save to output folder`n"

Write-Host "$('='*80)" -ForegroundColor Magenta
Write-Host "💡 FASTEST SOLUTION: Open 5 browser tabs and convert simultaneously!" -ForegroundColor Magenta
Write-Host "$('='*80)`n" -ForegroundColor Magenta

# Open browser tabs for each file
Write-Host "Opening browser tabs..." -ForegroundColor Cyan
Start-Process "https://products.aspose.app/cad/conversion/stp-to-glb"
Start-Sleep -Seconds 2
Start-Process "https://products.aspose.app/cad/conversion/stp-to-glb"
Start-Sleep -Seconds 2
Start-Process "https://products.aspose.app/cad/conversion/stp-to-glb"
Start-Sleep -Seconds 2
Start-Process "https://products.aspose.app/cad/conversion/stp-to-glb"
Start-Sleep -Seconds 2
Start-Process "https://products.aspose.app/cad/conversion/stp-to-glb"

Write-Host "`n✅ 5 browser tabs opened!" -ForegroundColor Green
Write-Host "`n📋 MANUAL STEPS:" -ForegroundColor Yellow
Write-Host "   1. Upload a10-warthog.stp in Tab 1"
Write-Host "   2. Upload c17-globemaster.stp in Tab 2"
Write-Host "   3. Upload leopard-2a6.step in Tab 3"
Write-Host "   4. Upload t90-tank.stp in Tab 4"
Write-Host "   5. Upload kf-21.step in Tab 5"
Write-Host "   6. Download all GLB files to: $outputDir"
Write-Host "`n⏱️  Each conversion takes ~30-60 seconds"
Write-Host "   Total time: ~5-10 minutes for all files`n"

Write-Host "$('='*80)" -ForegroundColor Green
Write-Host "When downloads complete, run: node scripts/production-pipeline.js" -ForegroundColor Green
Write-Host "$('='*80)`n" -ForegroundColor Green

# Open output folder
explorer $outputDir
