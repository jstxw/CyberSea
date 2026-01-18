/**
 * Advanced CAD Converter - STEP/IGES → GLB with FreeCAD + Blender
 * Two-stage conversion for maximum detail
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DOWNLOAD_DIR = path.join(__dirname, '../downloads/cad');
const OUTPUT_DIR = path.join(__dirname, '../public/models/cad');
const TEMP_DIR = path.join(__dirname, '../downloads/temp');

function ensureDirectories() {
  [DOWNLOAD_DIR, OUTPUT_DIR, TEMP_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

function findFreeCAD() {
  const possiblePaths = [
    'C:\\Program Files\\FreeCAD 1.0\\bin\\FreeCADCmd.exe',
    'C:\\Program Files\\FreeCAD 0.21\\bin\\FreeCADCmd.exe',
    'C:\\Program Files\\FreeCAD\\bin\\FreeCADCmd.exe',
    'freecadcmd'
  ];
  
  for (const freecadPath of possiblePaths) {
    try {
      execSync(`"${freecadPath}" --version`, { stdio: 'ignore' });
      console.log(`✅ FreeCAD found at: ${freecadPath}`);
      return freecadPath;
    } catch (e) {
      // Try next path
    }
  }
  
  return null;
}

function findBlender() {
  const possiblePaths = [
    'C:\\Program Files\\Blender Foundation\\Blender 5.0\\blender.exe',
    'C:\\Program Files\\Blender Foundation\\Blender 4.2\\blender.exe',
    'C:\\Program Files\\Blender Foundation\\Blender\\blender.exe',
    'blender'
  ];
  
  for (const blenderPath of possiblePaths) {
    try {
      execSync(`"${blenderPath}" --version`, { stdio: 'ignore' });
      console.log(`✅ Blender found at: ${blenderPath}`);
      return blenderPath;
    } catch (e) {
      // Try next path
    }
  }
  
  return null;
}

function getCADFiles() {
  if (!fs.existsSync(DOWNLOAD_DIR)) {
    return [];
  }
  
  const files = fs.readdirSync(DOWNLOAD_DIR);
  return files.filter(f => 
    f.endsWith('.step') || 
    f.endsWith('.stp') || 
    f.endsWith('.iges') || 
    f.endsWith('.igs')
  );
}

// Create FreeCAD Python script to convert STEP/IGES → OBJ
function createFreeCADScript(inputFile, outputFile) {
  return `
import FreeCAD
import Import
import Mesh

# Import STEP/IGES file
print("Importing ${inputFile}...")
Import.insert("${inputFile.replace(/\\/g, '/')}", "Unnamed")

# Get all objects
objs = FreeCAD.ActiveDocument.Objects
print(f"Found {len(objs)} objects")

# Export as OBJ (Wavefront)
print("Exporting to OBJ...")
__objs__ = []
for obj in objs:
    if hasattr(obj, "Shape"):
        __objs__.append(obj)

Import.export(__objs__, "${outputFile.replace(/\\/g, '/')}")
print("Export complete!")
`;
}

// Create Blender Python script to convert OBJ → GLB with decimation
function createBlenderScript(inputFile, outputFile, decimation = 1.0) {
  return `
import bpy
import sys

print("Clearing scene...")
bpy.ops.wm.read_factory_settings(use_empty=True)

print("Importing OBJ: ${inputFile}")
try:
    bpy.ops.wm.obj_import(filepath="${inputFile.replace(/\\/g, '/')}")
except:
    # Fallback for older Blender versions
    bpy.ops.import_scene.obj(filepath="${inputFile.replace(/\\/g, '/')}")

# Join all meshes
print("Joining meshes...")
bpy.ops.object.select_all(action='DESELECT')
mesh_objects = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']

if len(mesh_objects) == 0:
    print("ERROR: No mesh objects found!")
    sys.exit(1)

for obj in mesh_objects:
    obj.select_set(True)

if len(mesh_objects) > 0:
    bpy.context.view_layer.objects.active = mesh_objects[0]
    bpy.ops.object.join()
    
    # Apply decimation if needed
    if ${decimation} < 1.0:
        print(f"Applying decimation: ${decimation * 100}%")
        bpy.ops.object.modifier_add(type='DECIMATE')
        bpy.context.object.modifiers["Decimate"].ratio = ${decimation}
        bpy.ops.object.modifier_apply(modifier="Decimate")
    
    # Export as GLB
    print("Exporting to GLB: ${outputFile}")
    bpy.ops.export_scene.gltf(
        filepath="${outputFile.replace(/\\/g, '/')}",
        export_format='GLB',
        export_materials='EXPORT',
        export_colors=True
    )
    print("SUCCESS!")
else:
    print("ERROR: No meshes to export")
    sys.exit(1)
`;
}

async function convertFile(inputFile) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔄 Converting: ${inputFile}`);
  console.log(`${'='.repeat(80)}`);
  
  const baseName = path.basename(inputFile, path.extname(inputFile))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
  
  const inputPath = path.join(DOWNLOAD_DIR, inputFile);
  const objPath = path.join(TEMP_DIR, `${baseName}.obj`);
  
  const freecadPath = findFreeCAD();
  const blenderPath = findBlender();
  
  if (!freecadPath) {
    console.log('❌ FreeCAD not found - skipping STEP/IGES file');
    return false;
  }
  
  if (!blenderPath) {
    console.log('❌ Blender not found - cannot convert to GLB');
    return false;
  }
  
  // STAGE 1: FreeCAD STEP/IGES → OBJ
  console.log(`\n📐 STAGE 1: Converting STEP/IGES → OBJ`);
  const freecadScript = createFreeCADScript(inputPath, objPath);
  const freecadScriptPath = path.join(TEMP_DIR, `freecad_${baseName}.py`);
  fs.writeFileSync(freecadScriptPath, freecadScript);
  
  try {
    console.log('   Running FreeCAD...');
    execSync(`"${freecadPath}" -c "${freecadScriptPath}"`, {
      stdio: 'pipe',
      timeout: 300000 // 5 minutes
    });
    
    if (fs.existsSync(objPath)) {
      const objStats = fs.statSync(objPath);
      console.log(`   ✅ OBJ created: ${(objStats.size / (1024 * 1024)).toFixed(2)} MB`);
    } else {
      console.log('   ❌ OBJ file not created');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ FreeCAD conversion failed: ${error.message}`);
    return false;
  }
  
  // STAGE 2: Blender OBJ → GLB (3 detail levels)
  console.log(`\n🎨 STAGE 2: Converting OBJ → GLB (multiple detail levels)`);
  
  const detailLevels = [
    { name: 'high', decimation: 0.90, suffix: '-high' },
    { name: 'medium', decimation: 0.50, suffix: '-med' },
    { name: 'low', decimation: 0.20, suffix: '-low' }
  ];
  
  let successCount = 0;
  
  for (const level of detailLevels) {
    const outputFile = path.join(OUTPUT_DIR, `${baseName}${level.suffix}.glb`);
    const blenderScript = createBlenderScript(objPath, outputFile, level.decimation);
    const blenderScriptPath = path.join(TEMP_DIR, `blender_${baseName}_${level.name}.py`);
    
    fs.writeFileSync(blenderScriptPath, blenderScript);
    
    console.log(`   Converting ${level.name} detail (${(level.decimation * 100).toFixed(0)}%)...`);
    
    try {
      execSync(`"${blenderPath}" --background --python "${blenderScriptPath}"`, {
        stdio: 'pipe',
        timeout: 300000
      });
      
      if (fs.existsSync(outputFile)) {
        const glbStats = fs.statSync(outputFile);
        console.log(`   ✅ ${level.name}: ${(glbStats.size / (1024 * 1024)).toFixed(2)} MB`);
        successCount++;
      } else {
        console.log(`   ❌ ${level.name}: Failed`);
      }
    } catch (error) {
      console.log(`   ❌ ${level.name}: ${error.message}`);
    }
    
    // Cleanup Blender script
    if (fs.existsSync(blenderScriptPath)) {
      fs.unlinkSync(blenderScriptPath);
    }
  }
  
  // Cleanup
  if (fs.existsSync(freecadScriptPath)) {
    fs.unlinkSync(freecadScriptPath);
  }
  if (fs.existsSync(objPath)) {
    fs.unlinkSync(objPath);
  }
  
  return successCount > 0;
}

// Main execution
async function main() {
  console.log('\n🔧 ADVANCED CAD TO GLB CONVERTER');
  console.log('=' .repeat(80));
  
  ensureDirectories();
  
  const freecadPath = findFreeCAD();
  const blenderPath = findBlender();
  
  if (!freecadPath) {
    console.log('\n❌ FreeCAD not found!');
    console.log('   FreeCAD is required for STEP/IGES conversion');
    console.log('   Install: winget install FreeCAD.FreeCAD\n');
    return;
  }
  
  if (!blenderPath) {
    console.log('\n❌ Blender not found!');
    console.log('   Blender is required for GLB export');
    console.log('   Install: winget install BlenderFoundation.Blender\n');
    return;
  }
  
  const files = getCADFiles();
  
  if (files.length === 0) {
    console.log('\n❌ No CAD files found in:');
    console.log(`   ${DOWNLOAD_DIR}\n`);
    return;
  }
  
  console.log(`\n✅ Found ${files.length} CAD file(s) to convert\n`);
  
  let successCount = 0;
  for (const file of files) {
    const success = await convertFile(file);
    if (success) successCount++;
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n✅ Conversion complete! Successfully converted ${successCount}/${files.length} model(s)`);
  console.log(`\n📂 Output directory: ${OUTPUT_DIR}\n`);
}

main().catch(console.error);
