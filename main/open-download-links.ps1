# Open all Sketchfab download links for military vehicles
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Opening Download Links for 15 Models" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "For EACH model that opens:" -ForegroundColor Yellow
Write-Host "  1. Pick the FIRST model (most views = best quality)" -ForegroundColor White
Write-Host "  2. Click 'Download 3D Model' button" -ForegroundColor White
Write-Host "  3. Select 'Autoconverted format (glTF)'" -ForegroundColor White
Write-Host "  4. Download the ZIP file" -ForegroundColor White
Write-Host "  5. Extract the ZIP and find the .glb file inside" -ForegroundColor White
Write-Host ""
Write-Host "Opening browsers in 3 seconds..." -ForegroundColor Green
Start-Sleep -Seconds 3

$links = @(
    "https://sketchfab.com/search?q=apache+helicopter+ah64&type=models&features=downloadable&sort_by=-viewCount",
    "https://sketchfab.com/search?q=uh60+black+hawk&type=models&features=downloadable&sort_by=-viewCount",
    "https://sketchfab.com/search?q=ch47+chinook&type=models&features=downloadable&sort_by=-viewCount",
    "https://sketchfab.com/search?q=m1+abrams+tank&type=models&features=downloadable&sort_by=-viewCount",
    "https://sketchfab.com/search?q=leopard+2+tank&type=models&features=downloadable&sort_by=-viewCount",
    "https://sketchfab.com/search?q=t90+tank&type=models&features=downloadable&sort_by=-viewCount",
    "https://sketchfab.com/search?q=humvee+military+hmmwv&type=models&features=downloadable&sort_by=-viewCount",
    "https://sketchfab.com/search?q=mrap+military&type=models&features=downloadable&sort_by=-viewCount",
    "https://sketchfab.com/search?q=bradley+fighting+vehicle&type=models&features=downloadable&sort_by=-viewCount",
    "https://sketchfab.com/search?q=f35+lightning&type=models&features=downloadable&sort_by=-viewCount",
    "https://sketchfab.com/search?q=f18+super+hornet&type=models&features=downloadable&sort_by=-viewCount",
    "https://sketchfab.com/search?q=a10+warthog+thunderbolt&type=models&features=downloadable&sort_by=-viewCount",
    "https://sketchfab.com/search?q=destroyer+navy+ship&type=models&features=downloadable&sort_by=-viewCount",
    "https://sketchfab.com/search?q=aircraft+carrier&type=models&features=downloadable&sort_by=-viewCount",
    "https://sketchfab.com/search?q=mq9+reaper+predator&type=models&features=downloadable&sort_by=-viewCount"
)

$names = @(
    "AH-64 Apache",
    "UH-60 Black Hawk",
    "CH-47 Chinook",
    "M1 Abrams",
    "Leopard 2",
    "T-90 Tank",
    "Humvee",
    "MRAP",
    "Bradley IFV",
    "F-35",
    "F/A-18",
    "A-10 Warthog",
    "Destroyer",
    "Aircraft Carrier",
    "MQ-9 Reaper"
)

for ($i = 0; $i -lt $links.Count; $i++) {
    Write-Host "Opening: $($names[$i])..." -ForegroundColor Green
    Start-Process $links[$i]
    Start-Sleep -Milliseconds 800
}

Write-Host ""
Write-Host "✅ All 15 tabs opened!" -ForegroundColor Green
Write-Host ""
Write-Host "After downloading GLB files, put them in:" -ForegroundColor Yellow
Write-Host "  C:\Users\aclie\Mesh\Mesh\main\public\models\" -ForegroundColor White
Write-Host ""
Write-Host "Name them as:" -ForegroundColor Yellow
Write-Host "  apache.glb, blackhawk.glb, chinook.glb, m1_abrams.glb," -ForegroundColor White
Write-Host "  leopard2.glb, t90.glb, humvee.glb, mrap.glb, bradley.glb," -ForegroundColor White
Write-Host "  f35.glb, f18.glb, a10.glb, destroyer.glb, carrier.glb, reaper.glb" -ForegroundColor White
Write-Host ""
Write-Host "Then tell me which ones you added!" -ForegroundColor Cyan
