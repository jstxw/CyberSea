

# 🛠️ FREECAD COMPONENT EXTRACTION GUIDE

## Goal
Extract all 41 components from A-10 STEP file with REAL CAD names

## Time: 15-20 minutes

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### **STEP 1: Open FreeCAD (1 min)**

1. Launch **FreeCAD 1.0**
2. You should see the main window with blank workspace

### **STEP 2: Import STEP File (2-3 min)**

1. **File → Open**
2. Navigate to: `C:\Users\aclie\Mesh\Mesh\main\downloads\cad\`
3. Select: `a10-warthog.stp`
4. Click **Open**
5. **Wait 1-2 minutes** while FreeCAD imports
   - You'll see progress in bottom status bar
   - When done, you'll see component tree on left side

### **STEP 3: Explore Component Tree (1 min)**

On the **left sidebar**, you'll see the Model tree:
```
📁 a10 warthog (root)
  ├── 📦 30mm GAU-8/A
  ├── 📦 AGM-65
  ├── 📦 AGM-65.1
  ├── 📦 AIM-9 sidewinder
  ├── 📦 Mk-82
  ├── 📦 NoseGear
  ├── 📦 PrimaryGear
  ├── 📦 Part1.1 (fuselage sections)
  └── ... 33 more components
```

**This is the GOLD - these are the real CAD names!**

### **STEP 4: Export Each Component (10-15 min)**

For each component in the tree, do this:

#### **Quick Method (Recommended):**

1. **Right-click** on component (e.g., "30mm GAU-8/A")
2. **Select "Export"** or **File → Export**
3. **Format:** Choose **OBJ (.obj)**
4. **Filename:** Use format: `001_gau8_avenger.obj`
   - Use numbers to keep order: 001, 002, 003, etc.
   - Use underscore for spaces
   - Be descriptive
5. **Location:** Save to: `C:\Users\aclie\Mesh\Mesh\main\downloads\temp\structured\`
6. **Settings (IMPORTANT):**
   ```
   ✅ Linear Deflection: 0.01 (NOT 0.1!)
   ✅ Angular Deflection: 5 (NOT 30!)
   ✅ Mesh Deviation: 0.01
   ✅ Export Normals: YES
   ```
7. Click **Export**
8. **Repeat for all visible components**

#### **Component Export Order (Suggested):**

Priority components to export first:
1. `001_gau8_avenger.obj` - 30mm GAU-8/A
2. `002_fuselage_main.obj` - Main fuselage body
3. `003_wing_left.obj` - Left wing
4. `004_wing_right.obj` - Right wing
5. `005_engine_left.obj` - Left turbofan
6. `006_engine_right.obj` - Right turbofan
7. `007_nose_gear.obj` - NoseGear
8. `008_main_gear_left.obj` - PrimaryGear
9. `009_main_gear_right.obj` - PrimaryGear1
10. `010_agm65_1.obj` - AGM-65 missile
11. `011_agm65_2.obj` - AGM-65.1
... continue for all 41 components

### **STEP 5: Quick Quality Check (2 min)**

After exporting all components:

1. Open file explorer: `C:\Users\aclie\Mesh\Mesh\main\downloads\temp\structured\`
2. You should see 41 OBJ files (one per component)
3. Check file sizes - should be 100KB - 50MB each
4. Total size should be around 200-500 MB

---

## ⚡ FASTER ALTERNATIVE: Export Groups

If you want to save time:

1. **Export just the KEY components** (10-15 components):
   - GAU-8 Avenger cannon
   - Main fuselage
   - Wings (left/right)
   - Engines (left/right)
   - Landing gear
   - A few weapons

2. **Group smaller parts**:
   - Export all missiles together as "weapons_group"
   - Export all landing gear parts as "landing_gear_group"

This gives you 70% of the benefit in 30% of the time!

---

## 🎯 EXPECTED OUTPUT

```
downloads/temp/structured/
├── 001_gau8_avenger.obj (15 MB)
├── 002_fuselage_main.obj (80 MB)
├── 003_wing_left.obj (30 MB)
├── 004_wing_right.obj (30 MB)
├── 005_engine_left.obj (25 MB)
├── 006_engine_right.obj (25 MB)
├── 007_nose_gear.obj (5 MB)
├── 008_main_gear_left.obj (8 MB)
├── 009_main_gear_right.obj (8 MB)
├── 010_agm65_1.obj (3 MB)
... and 31 more
```

---

## 🚨 TROUBLESHOOTING

**Problem:** Export button is greyed out
- **Fix:** Make sure you right-clicked on the actual component, not the folder

**Problem:** Export takes too long (>5 min per component)
- **Fix:** Increase Linear Deflection to 0.05 (slightly lower quality but faster)

**Problem:** OBJ file is HUGE (>200MB for one component)
- **Fix:** Use 0.05 Linear Deflection, or 10 Angular Deflection

**Problem:** Can't see component tree on left
- **Fix:** View → Panels → Model

---

## ✅ WHEN DONE

Run this command to assemble everything:
```bash
cd C:\Users\aclie\Mesh\Mesh\main
node scripts/assemble-structured-model.js
```

This will:
- ✅ Combine all 41 OBJ files into one GLB
- ✅ Preserve component names
- ✅ Generate metadata JSON
- ✅ Ready for your viewer!

---

## 📊 RESULT

**Instead of this:**
```
- Object 1
- Object 2
- Object 3
```

**You get THIS:**
```
- GAU-8/A Avenger 30mm Rotary Cannon
- AGM-65 Maverick Missile
- Forward Fuselage Section
- Left Turbofan Engine
```

**TRUE PRODUCTION QUALITY!** 🎖️
