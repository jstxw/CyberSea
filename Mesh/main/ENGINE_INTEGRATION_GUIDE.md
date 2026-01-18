# 🚁 ENGINE INTEGRATION GUIDE

## Add Separate Engine Models to Your A-10

This system lets you:
- ✅ Add separate engine GLB files to the A-10
- ✅ Automatically position TWO engines (left & right)
- ✅ Create exploded views
- ✅ Combine into single GLB
- ✅ Production-ready output

---

## 📋 WHAT YOU NEED

1. **A-10 Model** ✅ Already have: `a10-war-thunder-330k.glb`
2. **Engine Model** ⬅️ YOU PROVIDE: `engine.glb` (any engine model)

---

## 🚀 QUICK START

### **Step 1: Get Your Engine GLB**

You can:
- Download from Sketchfab
- Use existing engine model you have
- Export from CAD software
- Use any GLB format engine

**Save it anywhere** (script will find it)

### **Step 2: Run Integration**

```powershell
cd C:\Users\aclie\Mesh\Mesh\main
.\scripts\add-engines-to-a10.ps1 -EnginePath "path\to\your\engine.glb"
```

Or if the engine is in your downloads/models folders:
```powershell
.\scripts\add-engines-to-a10.ps1
# Script will auto-detect and ask you to confirm
```

### **Step 3: View Results**

Two files will be created:
- `a10-with-engines.glb` - Normal assembled view
- `a10-with-engines-exploded.glb` - Exploded view (components separated)

---

## ⚙️ ADVANCED OPTIONS

### **Custom Explode Distance**

```powershell
.\scripts\add-engines-to-a10.ps1 -EnginePath "engine.glb" -ExplodeDistance 10.0
```

- Default: 5.0 units
- Larger = more separated
- Smaller = closer together

---

## 📊 WHAT THE SCRIPT DOES

1. **Loads A-10 model** (330K polygons)
2. **Loads engine model**
3. **Duplicates engine** (creates left & right instances)
4. **Positions correctly:**
   - Left engine: (-2.5, -1.0, 0.8)
   - Right engine: (2.5, -1.0, 0.8)
   - Positions based on real A-10 engine placement
5. **Creates collections:**
   - Airframe (main A-10)
   - Engine_Left
   - Engine_Right
6. **Exports two versions:**
   - Normal view (integrated)
   - Exploded view (separated components)

---

## 🎨 ENGINE POSITIONING

The script automatically positions engines in A-10-appropriate locations:

```
       [Engine Left]          [Engine Right]
            |                      |
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     |      A-10 FUSELAGE            |
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Default positions:**
- X: ±2.5 (left/right from center)
- Y: -1.0 (behind wings)
- Z: 0.8 (above fuselage centerline)

---

## 💡 USE CASES

### **Normal View**
- Complete assembled aircraft
- For display and viewing
- Engines integrated with fuselage

### **Exploded View**
- See all components separately
- Engineering/training diagrams
- Component identification
- Maintenance visualization

---

## 🔧 MANUAL POSITIONING

If automatic positioning doesn't work for your engine model, you can edit the script:

Edit: `scripts/integrate-engines-blender.py`

Find the `position_engine` function and adjust:
```python
if side == "left":
    x = -2.5  # Left side (change this)
    y = -1.0  # Behind wings (change this)
    z = 0.8   # Above fuselage (change this)
```

---

## 📦 OUTPUT

After integration:

```
public/models/professional/
├── a10-war-thunder-330k.glb (Original A-10)
├── a10-with-engines.glb (NEW - Integrated)
└── a10-with-engines-exploded.glb (NEW - Exploded view)
```

File sizes:
- A-10 only: ~58 MB
- A-10 + Engines: ~60-80 MB (depends on engine model size)
- Exploded: Same size (just different positions)

---

## 🎯 NEXT STEPS AFTER INTEGRATION

1. **Add to viewer** - Update `demo-config.ts`:
```typescript
{
  id: "demo-12",
  name: "A-10 with Engines (Integrated)",
  path: "/models/professional/a10-with-engines.glb",
  annotation: { ... }
},
{
  id: "demo-13", 
  name: "A-10 Exploded View",
  path: "/models/professional/a10-with-engines-exploded.glb",
  annotation: { ... }
}
```

2. **Refresh browser**
3. **Select from dropdown**
4. **Enjoy your integrated model!**

---

## 🚀 WHERE TO GET ENGINE MODELS

### **Sketchfab** (Recommended)
```bash
node scripts/download-from-sketchfab-api.js "turbofan engine" 20000
node scripts/download-from-sketchfab-api.js "jet engine detailed" 50000
```

### **GrabCAD** (CAD Files)
- Visit: https://grabcad.com/library
- Search: "turbofan engine", "jet engine", "GE TF34"
- Download GLB or STEP format

### **Free3D**
- Visit: https://free3d.com
- Search: "jet engine 3d model"
- Download GLB format

---

## 💡 PRO TIP

**Use a GE TF34 engine model** - that's the actual engine in the A-10!

Search for:
- "GE TF34"
- "TF34-100"
- "A-10 engine"

---

## ✅ READY TO GO!

1. Get your engine GLB file
2. Run the integration script
3. View your A-10 with engines!
4. Try the exploded view!

**This gives you TRUE CAD-level component assembly!** 🎖️
