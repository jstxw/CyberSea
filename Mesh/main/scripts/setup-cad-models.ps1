# CAD Model Setup Script for Windows
# Automates the download and conversion of military CAD models

Write-Host "`n🎖️  MILITARY CAD MODEL SETUP WIZARD`n" -ForegroundColor Cyan
Write-Host "=" -NoNewline -ForegroundColor Gray
Write-Host ("=" * 79) -ForegroundColor Gray

# Define models
$models = @(
    @{Name="T-90 Main Battle Tank"; URL="https://grabcad.com/library/t-90-tank-1"; Priority=1}
    @{Name="F-16 Fighting Falcon"; URL="https://grabcad.com/library/f-16-fighting-falcon-21"; Priority=1}
    @{Name="AH-64 Apache Helicopter"; URL="https://grabcad.com/library/ah-64-apache-helicopter-8"; Priority=1}
    @{Name="M1 Abrams Tank"; URL="https://grabcad.com/library/m1-abrams-6"; Priority=2}
    @{Name="HMMWV Complete"; URL="https://grabcad.com/library/hmmwv-complete-1"; Priority=1}
    @{Name="MIG-29 Fulcrum"; URL="https://grabcad.com/library/mig-29-fulcrum-3"; Priority=2}
    @{Name="Leopard 2A6"; URL="https://grabcad.com/library/leopard-2a6-2"; Priority=2}
)

# Create directories
$downloadDir = Join-Path $PSScriptRoot "..\downloads\cad"
$outputDir = Join-Path $PSScriptRoot "..\public\models\cad"

if (!(Test-Path $downloadDir)) {
    New-Item -ItemType Directory -Path $downloadDir -Force | Out-Null
    Write-Host "`n✅ Created download directory: $downloadDir" -ForegroundColor Green
}

if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
    Write-Host "✅ Created output directory: $outputDir`n" -ForegroundColor Green
}

# Function to check if Blender is installed
function Test-BlenderInstalled {
    try {
        $null = Get-Command blender -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Display menu
Write-Host "`n📋 SETUP OPTIONS:`n" -ForegroundColor Yellow

Write-Host "1. Open Download Links (Priority Models)" -ForegroundColor White
Write-Host "   Opens GrabCAD pages for high-priority models`n" -ForegroundColor Gray

Write-Host "2. Open Download Links (All Models)" -ForegroundColor White
Write-Host "   Opens GrabCAD pages for all available models`n" -ForegroundColor Gray

Write-Host "3. Check Downloaded Files" -ForegroundColor White
Write-Host "   Shows CAD files in download directory`n" -ForegroundColor Gray

Write-Host "4. Convert CAD to GLB" -ForegroundColor White
Write-Host "   Converts downloaded STEP/IGES files to GLB format`n" -ForegroundColor Gray

Write-Host "5. Install Blender (Required for conversion)" -ForegroundColor White
Write-Host "   Opens Blender download page`n" -ForegroundColor Gray

Write-Host "6. Open Download Directory" -ForegroundColor White
Write-Host "   Opens the folder where you should save downloaded files`n" -ForegroundColor Gray

Write-Host "7. Full Auto Setup (Download + Convert)" -ForegroundColor White
Write-Host "   Complete automated setup process`n" -ForegroundColor Gray

Write-Host "=" -NoNewline -ForegroundColor Gray
Write-Host ("=" * 79) -ForegroundColor Gray

$choice = Read-Host "`nEnter your choice (1-7)"

switch ($choice) {
    "1" {
        Write-Host "`n🔗 Opening priority model download pages..." -ForegroundColor Cyan
        $priorityModels = $models | Where-Object { $_.Priority -eq 1 }
        foreach ($model in $priorityModels) {
            Write-Host "   Opening: $($model.Name)" -ForegroundColor White
            Start-Process $model.URL
            Start-Sleep -Milliseconds 500
        }
        Write-Host "`n✅ Opened $($priorityModels.Count) download pages" -ForegroundColor Green
        Write-Host "📥 Download STEP files and save to: $downloadDir`n" -ForegroundColor Yellow
    }
    
    "2" {
        Write-Host "`n🔗 Opening all model download pages..." -ForegroundColor Cyan
        foreach ($model in $models) {
            Write-Host "   Opening: $($model.Name)" -ForegroundColor White
            Start-Process $model.URL
            Start-Sleep -Milliseconds 500
        }
        Write-Host "`n✅ Opened $($models.Count) download pages" -ForegroundColor Green
        Write-Host "📥 Download STEP files and save to: $downloadDir`n" -ForegroundColor Yellow
    }
    
    "3" {
        Write-Host "`n🔍 Checking for downloaded CAD files...`n" -ForegroundColor Cyan
        $cadFiles = Get-ChildItem -Path $downloadDir -Include *.step,*.stp,*.iges,*.igs,*.obj,*.stl -ErrorAction SilentlyContinue
        
        if ($cadFiles.Count -eq 0) {
            Write-Host "❌ No CAD files found" -ForegroundColor Red
            Write-Host "   Directory: $downloadDir" -ForegroundColor Gray
            Write-Host "`n💡 Download models from GrabCAD first (Option 1 or 2)`n" -ForegroundColor Yellow
        } else {
            Write-Host "✅ Found $($cadFiles.Count) CAD file(s):`n" -ForegroundColor Green
            foreach ($file in $cadFiles) {
                $sizeMB = [math]::Round($file.Length / 1MB, 2)
                Write-Host "   • $($file.Name) ($sizeMB MB)" -ForegroundColor White
            }
            Write-Host ""
        }
    }
    
    "4" {
        Write-Host "`n🔧 Starting CAD conversion...`n" -ForegroundColor Cyan
        
        if (!(Test-BlenderInstalled)) {
            Write-Host "❌ Blender is not installed or not in PATH" -ForegroundColor Red
            Write-Host "`n📥 Please install Blender first (Option 5)" -ForegroundColor Yellow
            Write-Host "   Or run: winget install BlenderFoundation.Blender`n" -ForegroundColor Gray
        } else {
            Set-Location (Join-Path $PSScriptRoot "..")
            node scripts/convert-cad.js
        }
    }
    
    "5" {
        Write-Host "`n📥 Opening Blender download page..." -ForegroundColor Cyan
        Start-Process "https://www.blender.org/download/"
        Write-Host "`n✅ Opened Blender download page" -ForegroundColor Green
        Write-Host "`n📝 INSTALLATION STEPS:" -ForegroundColor Yellow
        Write-Host "   1. Download Blender installer" -ForegroundColor White
        Write-Host "   2. Run installer (add to PATH when prompted)" -ForegroundColor White
        Write-Host "   3. Restart PowerShell" -ForegroundColor White
        Write-Host "   4. Run this script again`n" -ForegroundColor White
        Write-Host "💡 QUICK INSTALL: winget install BlenderFoundation.Blender`n" -ForegroundColor Cyan
    }
    
    "6" {
        Write-Host "`n📂 Opening download directory..." -ForegroundColor Cyan
        Start-Process $downloadDir
        Write-Host "`n✅ Save downloaded STEP files to this folder`n" -ForegroundColor Green
    }
    
    "7" {
        Write-Host "`n🚀 FULL AUTO SETUP`n" -ForegroundColor Cyan
        Write-Host "=" -NoNewline -ForegroundColor Gray
        Write-Host ("=" * 79) -ForegroundColor Gray
        
        # Step 1: Open download links
        Write-Host "`nStep 1: Opening priority model download pages..." -ForegroundColor Yellow
        $priorityModels = $models | Where-Object { $_.Priority -eq 1 }
        foreach ($model in $priorityModels) {
            Write-Host "   • $($model.Name)" -ForegroundColor White
            Start-Process $model.URL
            Start-Sleep -Milliseconds 500
        }
        
        # Step 2: Wait for downloads
        Write-Host "`nStep 2: Please download the models..." -ForegroundColor Yellow
        Write-Host "   1. Sign up/login to GrabCAD (free)" -ForegroundColor Gray
        Write-Host "   2. Click 'Download' on each page" -ForegroundColor Gray
        Write-Host "   3. Select 'STEP' format" -ForegroundColor Gray
        Write-Host "   4. Save to: $downloadDir" -ForegroundColor Gray
        Write-Host "`nPress any key when downloads are complete..." -ForegroundColor Cyan
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        
        # Step 3: Check files
        Write-Host "`nStep 3: Checking downloaded files..." -ForegroundColor Yellow
        $cadFiles = Get-ChildItem -Path $downloadDir -Include *.step,*.stp,*.iges,*.igs -Recurse -ErrorAction SilentlyContinue
        Write-Host "   Found: $($cadFiles.Count) file(s)" -ForegroundColor White
        
        if ($cadFiles.Count -eq 0) {
            Write-Host "`n❌ No files found. Please download models first.`n" -ForegroundColor Red
            exit
        }
        
        # Step 4: Check Blender
        Write-Host "`nStep 4: Checking for Blender..." -ForegroundColor Yellow
        if (!(Test-BlenderInstalled)) {
            Write-Host "   ❌ Blender not found" -ForegroundColor Red
            Write-Host "`n   Installing Blender via winget..." -ForegroundColor Cyan
            try {
                winget install BlenderFoundation.Blender
                Write-Host "   ✅ Blender installed" -ForegroundColor Green
                Write-Host "   ⚠️  Please restart PowerShell and run this script again`n" -ForegroundColor Yellow
                exit
            } catch {
                Write-Host "   ❌ Auto-install failed. Please install manually (Option 5)`n" -ForegroundColor Red
                exit
            }
        } else {
            Write-Host "   ✅ Blender found" -ForegroundColor Green
        }
        
        # Step 5: Convert
        Write-Host "`nStep 5: Converting CAD files to GLB..." -ForegroundColor Yellow
        Set-Location (Join-Path $PSScriptRoot "..")
        node scripts/convert-cad.js
        
        Write-Host "`n✅ SETUP COMPLETE!`n" -ForegroundColor Green
    }
    
    default {
        Write-Host "`n❌ Invalid choice. Please run the script again.`n" -ForegroundColor Red
    }
}

Write-Host "`n" -ForegroundColor Gray
