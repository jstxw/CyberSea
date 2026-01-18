# 🎖️ CAD Model Download & Conversion Scripts

Automated tools to download and convert military CAD models from GrabCAD.

---

## 🚀 Quick Start (Windows)

### Option 1: PowerShell Script (Easiest)

```powershell
cd Mesh/main/scripts
./setup-cad-models.ps1
```

**Choose from menu:**
- `1` - Open priority download links
- `7` - Full automatic setup

---

## 📥 What Models Are Available?

### **Priority 1 (Recommended First):**
- ✅ T-90 Main Battle Tank
- ✅ F-16 Fighting Falcon
- ✅ AH-64 Apache Helicopter
- ✅ HMMWV Complete

### **Priority 2 (Additional):**
- M1 Abrams Tank
- MIG-29 Fulcrum
- Leopard 2A6
- DDG-51 Arleigh Burke Destroyer

---

## 🔧 Manual Setup

### Step 1: List Download Links

```bash
node scripts/download-grabcad.js
```

This will:
- ✅ Create download directories
- ✅ List all available models
- ✅ Show direct GrabCAD links
- ✅ Save `DOWNLOAD_LIST.txt`

### Step 2: Download Models

1. Go to GrabCAD links (from script output)
2. Sign up/login (free account)
3. Click "Download" → Select "STEP" format
4. Save to: `Mesh/main/downloads/cad/`

### Step 3: Convert to GLB

```bash
node scripts/convert-cad.js
```

This will:
- ✅ Check for Blender installation
- ✅ Convert each STEP file to 3 LOD levels:
  - `model-low.glb` (5% polys - fast overview)
  - `model-med.glb` (25% polys - detailed view)
  - `model-high.glb` (80% polys - engineering detail)
- ✅ Generate `cad-models.json` config

---

## 📋 Requirements

### Required:
- **Node.js** (you have this)
- **Blender 3.0+** for conversion

### Install Blender:

**Windows (Quick):**
```powershell
winget install BlenderFoundation.Blender
```

**Windows (Manual):**
https://www.blender.org/download/

**Verify Installation:**
```bash
blender --version
```

---

## 📂 Directory Structure

```
Mesh/main/
├── scripts/
│   ├── download-grabcad.js      # Lists models & downloads
│   ├── convert-cad.js            # Converts STEP → GLB
│   ├── setup-cad-models.ps1     # Windows wizard
│   └── DOWNLOAD_LIST.txt        # Generated link list
├── downloads/
│   └── cad/                     # Place downloaded STEP files here
└── public/
    └── models/
        └── cad/                 # Converted GLB files (3 per model)
```

---

## 🎯 Output Format

Each model produces 3 files:

```
t-90-tank-low.glb    →  5 MB   (20-50 parts)     Fast overview
t-90-tank-med.glb    →  25 MB  (200-500 parts)   Click to load
t-90-tank-high.glb   →  150 MB (5000+ parts)     Engineering detail
```

---

## ⚡ Expected File Sizes

### Downloads (STEP):
- Tank: 100-300 MB
- Aircraft: 150-400 MB
- Helicopter: 80-200 MB
- Vehicle: 50-150 MB

### Converted (GLB):
- Low: 2-10 MB per model
- Med: 10-50 MB per model
- High: 50-200 MB per model

---

## 🔍 Troubleshooting

### "Blender not found"
```powershell
# Add Blender to PATH or reinstall with PATH option
winget install BlenderFoundation.Blender
```

### "No CAD files found"
- Check download directory: `Mesh/main/downloads/cad/`
- Files must be `.step`, `.stp`, `.iges`, or `.igs`
- Run download script first

### "Conversion failed"
- Ensure Blender is in PATH
- Check STEP file isn't corrupted
- Try converting one file at a time

### "Out of memory"
- Close other applications
- Convert files one at a time
- Use lower decimation levels

---

## 🎖️ Supported Formats

### Input:
- ✅ `.step` / `.stp` (STEP - best for CAD)
- ✅ `.iges` / `.igs` (IGES)
- ✅ `.obj` (Wavefront OBJ)
- ✅ `.stl` (STL)

### Output:
- ✅ `.glb` (Binary GLTF - optimized)

---

## 📊 Performance Notes

### Conversion Time:
- Small model (HMMWV): ~2-5 minutes
- Medium model (Tank): ~5-10 minutes
- Large model (Aircraft): ~10-20 minutes
- Per detail level

### System Requirements:
- **RAM**: 8 GB minimum, 16 GB recommended
- **Storage**: 5-10 GB for models
- **CPU**: Any modern processor

---

## 💡 Tips

1. **Start with Priority 1 models** - highest quality
2. **Download overnight** - files are 100-400 MB each
3. **Convert in batches** - do 2-3 at a time
4. **Keep STEP files** - you can reconvert with different settings
5. **Test low-detail first** - loads instantly in browser

---

## 🔗 Useful Links

- **GrabCAD**: https://grabcad.com/library
- **Blender**: https://www.blender.org/download/
- **FreeCAD**: https://www.freecad.org/ (optional)

---

## ✅ Next Steps After Conversion

1. Models are in `public/models/cad/`
2. Config is in `src/lib/cad-models.json`
3. Integrate with LOD system (coming next)
4. Test in viewer

---

**Need help?** Check the script output or open an issue.
