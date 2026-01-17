# Military Vehicle Model Organizer Script
# This script helps you download and organize 3D models for the Mesh project

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MESH - Military Vehicle Downloader" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Define the models to download
$models = @(
    @{
        Name = "AH-64 Apache Attack Helicopter"
        FileName = "apache.glb"
        SearchURL = "https://sketchfab.com/search?q=apache+helicopter+ah64&type=models&features=downloadable&sort_by=-viewCount"
        Category = "Helicopter"
    },
    @{
        Name = "UH-60 Black Hawk"
        FileName = "blackhawk.glb"
        SearchURL = "https://sketchfab.com/search?q=uh60+black+hawk&type=models&features=downloadable&sort_by=-viewCount"
        Category = "Helicopter"
    },
    @{
        Name = "CH-47 Chinook"
        FileName = "chinook.glb"
        SearchURL = "https://sketchfab.com/search?q=ch47+chinook&type=models&features=downloadable&sort_by=-viewCount"
        Category = "Helicopter"
    },
    @{
        Name = "M1 Abrams Tank"
        FileName = "m1_abrams.glb"
        SearchURL = "https://sketchfab.com/search?q=m1+abrams+tank&type=models&features=downloadable&sort_by=-viewCount"
        Category = "Tank"
    },
    @{
        Name = "Leopard 2 Tank"
        FileName = "leopard2.glb"
        SearchURL = "https://sketchfab.com/search?q=leopard+2+tank&type=models&features=downloadable&sort_by=-viewCount"
        Category = "Tank"
    },
    @{
        Name = "T-90 Russian Tank"
        FileName = "t90.glb"
        SearchURL = "https://sketchfab.com/search?q=t90+tank&type=models&features=downloadable&sort_by=-viewCount"
        Category = "Tank"
    },
    @{
        Name = "M1025 Humvee"
        FileName = "humvee.glb"
        SearchURL = "https://sketchfab.com/search?q=humvee+military+hmmwv&type=models&features=downloadable&sort_by=-viewCount"
        Category = "Vehicle"
    },
    @{
        Name = "MRAP (Mine-Resistant Vehicle)"
        FileName = "mrap.glb"
        SearchURL = "https://sketchfab.com/search?q=mrap+military&type=models&features=downloadable&sort_by=-viewCount"
        Category = "Vehicle"
    },
    @{
        Name = "M2 Bradley IFV"
        FileName = "bradley.glb"
        SearchURL = "https://sketchfab.com/search?q=bradley+fighting+vehicle&type=models&features=downloadable&sort_by=-viewCount"
        Category = "Vehicle"
    },
    @{
        Name = "F-35 Lightning II"
        FileName = "f35.glb"
        SearchURL = "https://sketchfab.com/search?q=f35+lightning&type=models&features=downloadable&sort_by=-viewCount"
        Category = "Aircraft"
    },
    @{
        Name = "F/A-18 Super Hornet"
        FileName = "f18.glb"
        SearchURL = "https://sketchfab.com/search?q=f18+super+hornet&type=models&features=downloadable&sort_by=-viewCount"
        Category = "Aircraft"
    },
    @{
        Name = "A-10 Thunderbolt II (Warthog)"
        FileName = "a10.glb"
        SearchURL = "https://sketchfab.com/search?q=a10+warthog+thunderbolt&type=models&features=downloadable&sort_by=-viewCount"
        Category = "Aircraft"
    },
    @{
        Name = "Arleigh Burke Destroyer"
        FileName = "destroyer.glb"
        SearchURL = "https://sketchfab.com/search?q=destroyer+navy+ship&type=models&features=downloadable&sort_by=-viewCount"
        Category = "Naval"
    },
    @{
        Name = "Aircraft Carrier"
        FileName = "carrier.glb"
        SearchURL = "https://sketchfab.com/search?q=aircraft+carrier&type=models&features=downloadable&sort_by=-viewCount"
        Category = "Naval"
    },
    @{
        Name = "MQ-9 Reaper Drone"
        FileName = "reaper.glb"
        SearchURL = "https://sketchfab.com/search?q=mq9+reaper+predator&type=models&features=downloadable&sort_by=-viewCount"
        Category = "Drone"
    }
)

# Get current directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$targetDir = Join-Path $scriptDir "public\models"
$downloadsDir = [Environment]::GetFolderPath("Downloads")

Write-Host "Target directory: $targetDir" -ForegroundColor Yellow
Write-Host "Downloads folder: $downloadsDir" -ForegroundColor Yellow
Write-Host ""

# Create target directory if it doesn't exist
if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

# Menu
Write-Host "Choose an option:" -ForegroundColor Green
Write-Host "  1. Show all download links (open in browser)" -ForegroundColor White
Write-Host "  2. Auto-import from Downloads folder" -ForegroundColor White
Write-Host "  3. Show status of downloaded models" -ForegroundColor White
Write-Host "  4. Open Downloads folder" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host "`nOpening Sketchfab search pages for each vehicle..." -ForegroundColor Cyan
        Write-Host "For EACH model:" -ForegroundColor Yellow
        Write-Host "  1. Pick the BEST model (most views, detailed)" -ForegroundColor White
        Write-Host "  2. Click 'Download 3D Model'" -ForegroundColor White
        Write-Host "  3. Select 'Autoconverted format (glTF)'" -ForegroundColor White
        Write-Host "  4. Download the ZIP" -ForegroundColor White
        Write-Host "`nOpening browsers now..." -ForegroundColor Cyan
        Start-Sleep -Seconds 2
        
        foreach ($model in $models) {
            Write-Host "Opening: $($model.Name)..." -ForegroundColor Green
            Start-Process $model.SearchURL
            Start-Sleep -Milliseconds 500
        }
        
        Write-Host "`n✅ All search pages opened!" -ForegroundColor Green
        Write-Host "After downloading, run this script again and choose option 2" -ForegroundColor Yellow
    }
    
    "2" {
        Write-Host "`nScanning Downloads folder for .glb files..." -ForegroundColor Cyan
        
        # Find all GLB files in Downloads and subdirectories
        $glbFiles = Get-ChildItem -Path $downloadsDir -Filter "*.glb" -Recurse -ErrorAction SilentlyContinue
        
        if ($glbFiles.Count -eq 0) {
            Write-Host "❌ No .glb files found in Downloads folder" -ForegroundColor Red
            Write-Host "Make sure you:" -ForegroundColor Yellow
            Write-Host "  1. Downloaded models from Sketchfab" -ForegroundColor White
            Write-Host "  2. Extracted the ZIP files" -ForegroundColor White
            Write-Host "  3. The .glb files are in your Downloads folder" -ForegroundColor White
        } else {
            Write-Host "Found $($glbFiles.Count) GLB file(s)!" -ForegroundColor Green
            Write-Host ""
            
            foreach ($file in $glbFiles) {
                Write-Host "📦 Found: $($file.Name)" -ForegroundColor Cyan
                
                # Try to match with our models
                $matched = $false
                foreach ($model in $models) {
                    $keywords = $model.FileName -replace ".glb", "" -split "_"
                    $fileNameLower = $file.Name.ToLower()
                    
                    $matchCount = 0
                    foreach ($keyword in $keywords) {
                        if ($fileNameLower -contains $keyword) {
                            $matchCount++
                        }
                    }
                    
                    # If we find a match or user confirms
                    Write-Host "   Does this match: $($model.Name)? (Y/N)" -ForegroundColor Yellow -NoNewline
                    $response = Read-Host " "
                    
                    if ($response -eq "Y" -or $response -eq "y") {
                        $targetPath = Join-Path $targetDir $model.FileName
                        Copy-Item -Path $file.FullName -Destination $targetPath -Force
                        Write-Host "   ✅ Copied to: $($model.FileName)" -ForegroundColor Green
                        $matched = $true
                        break
                    }
                }
                
                if (-not $matched) {
                    Write-Host "   ⏭️  Skipped" -ForegroundColor Gray
                }
                Write-Host ""
            }
            
            Write-Host "✅ Import complete!" -ForegroundColor Green
            Write-Host "Run option 3 to see what you have" -ForegroundColor Yellow
        }
    }
    
    "3" {
        Write-Host "`n📊 MODEL STATUS:" -ForegroundColor Cyan
        Write-Host "==================" -ForegroundColor Cyan
        
        $downloadedCount = 0
        $totalCount = $models.Count
        
        foreach ($model in $models) {
            $filePath = Join-Path $targetDir $model.FileName
            if (Test-Path $filePath) {
                $fileSize = (Get-Item $filePath).Length / 1MB
                Write-Host "✅ $($model.Name) " -ForegroundColor Green -NoNewline
                Write-Host "($($fileSize.ToString('0.00')) MB)" -ForegroundColor Gray
                $downloadedCount++
            } else {
                Write-Host "❌ $($model.Name) " -ForegroundColor Red -NoNewline
                Write-Host "(Missing)" -ForegroundColor Gray
            }
        }
        
        Write-Host "`n📈 Progress: $downloadedCount / $totalCount models" -ForegroundColor Yellow
        
        if ($downloadedCount -eq $totalCount) {
            Write-Host "🎉 ALL MODELS DOWNLOADED!" -ForegroundColor Green
        }
    }
    
    "4" {
        Write-Host "`nOpening Downloads folder..." -ForegroundColor Cyan
        Start-Process $downloadsDir
    }
    
    default {
        Write-Host "Invalid choice" -ForegroundColor Red
    }
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
