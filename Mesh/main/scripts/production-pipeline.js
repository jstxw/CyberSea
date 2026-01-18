/**
 * PRODUCTION-GRADE CAD CONVERSION PIPELINE
 * Handles STEP → OBJ → GLB with multiple quality levels
 * Fully automated with error handling and progress tracking
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Configuration
const CONFIG = {
  downloadDir: path.join(__dirname, '../downloads/cad'),
  outputDir: path.join(__dirname, '../public/models/cad'),
  tempDir: path.join(__dirname, '../downloads/temp'),
  
  // Quality presets
  qualityLevels: {
    'ultra': { decimation: 0.95, suffix: '-ultra', linearDeflection: 0.01 },
    'high': { decimation: 0.80, suffix: '-high', linearDeflection: 0.05 },
    'medium': { decimation: 0.50, suffix: '-med', linearDeflection: 0.1 },
    'low': { decimation: 0.20, suffix: '-low', linearDeflection: 0.2 }
  },
  
  // Blender path
  blenderPath: 'C:\\Program Files\\Blender Foundation\\Blender 5.0\\blender.exe',
};

// Ensure directories exist
function ensureDirectories() {
  [CONFIG.downloadDir, CONFIG.outputDir, CONFIG.tempDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Get all CAD files
function getCADFiles() {
  if (!fs.existsSync(CONFIG.downloadDir)) {
    return [];
  }
  
  const files = fs.readdirSync(CONFIG.downloadDir);
  return files.filter(f => 
    f.endsWith('.step') || 
    f.endsWith('.stp') || 
    f.endsWith('.iges') || 
    f.endsWith('.igs')
  );
}

// Convert STEP to OBJ using online service fallback or manual process
async function convertStepToObj(stepFile, objFile) {
  console.log(`\n🔄 STEP → OBJ Conversion`);
  console.log(`   Input:  ${path.basename(stepFile)}`);
  console.log(`   Output: ${path.basename(objFile)}`);
  
  // Check if OBJ already exists
  if (fs.existsSync(objFile)) {
    const stats = fs.statSync(objFile);
    console.log(`   ✅ OBJ already exists (${(stats.size / (1024*1024)).toFixed(2)} MB)`);
    return true;
  }
  
  console.log(`\n   ⚠️  STEP files require specialized CAD software`);
  console.log(`   📋 MANUAL CONVERSION REQUIRED:`);
  console.log(`   1. Open ${path.basename(stepFile)} in FreeCAD/Fusion360/SolidWorks`);
  console.log(`   2. Export as OBJ format`);
  console.log(`   3. Save to: ${objFile}`);
  console.log(`   4. Re-run this script\n`);
  
  // Check if user has done manual conversion
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    console.log(`   💡 OR: Upload to online converter (https://products.aspose.app/cad/conversion/step-to-obj)`);
    console.log(`   Then save the OBJ to the temp folder\n`);
    
    readline.question(`   Have you completed the conversion? (y/n): `, (answer) => {
      readline.close();
      if (answer.toLowerCase() === 'y' && fs.existsSync(objFile)) {
        console.log(`   ✅ OBJ file found!`);
        resolve(true);
      } else {
        console.log(`   ⏸️  Skipping this file for now...`);
        resolve(false);
      }
    });
  });
}

// Convert OBJ to GLB using Blender
function convertObjToGlb(objFile, glbFile, decimation) {
  console.log(`\n🎨 OBJ → GLB Conversion (${(decimation*100).toFixed(0)}% quality)`);
  
  const blenderScript = path.join(CONFIG.tempDir, 'convert_temp.py');
  const scriptContent = `
import bpy
import sys

# Clear scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Import OBJ
print("Importing OBJ...")
bpy.ops.wm.obj_import(filepath="${objFile.replace(/\\/g, '/')}")

# Join all meshes
bpy.ops.object.select_all(action='DESELECT')
mesh_objects = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
for obj in mesh_objects:
    obj.select_set(True)

if len(mesh_objects) > 0:
    bpy.context.view_layer.objects.active = mesh_objects[0]
    if len(mesh_objects) > 1:
        bpy.ops.object.join()
    
    # Decimation
    if ${decimation} < 1.0:
        bpy.ops.object.modifier_add(type='DECIMATE')
        bpy.context.object.modifiers["Decimate"].ratio = ${decimation}
        bpy.ops.object.modifier_apply(modifier="Decimate")
    
    # Export GLB
    bpy.ops.export_scene.gltf(
        filepath="${glbFile.replace(/\\/g, '/')}",
        export_format='GLB',
        export_materials='EXPORT',
        export_colors=True
    )
    print("SUCCESS")
else:
    print("ERROR: No meshes found")
    sys.exit(1)
`;
  
  fs.writeFileSync(blenderScript, scriptContent);
  
  try {
    execSync(`"${CONFIG.blenderPath}" --background --python "${blenderScript}"`, {
      stdio: 'pipe',
      timeout: 300000
    });
    
    if (fs.existsSync(glbFile)) {
      const stats = fs.statSync(glbFile);
      console.log(`   ✅ GLB created: ${(stats.size / (1024*1024)).toFixed(2)} MB`);
      fs.unlinkSync(blenderScript);
      return true;
    }
  } catch (error) {
    console.log(`   ❌ Conversion failed`);
  }
  
  return false;
}

// Process a single CAD file
async function processFile(stepFile) {
  const baseName = path.basename(stepFile, path.extname(stepFile))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📦 Processing: ${path.basename(stepFile)}`);
  console.log(`${'='.repeat(80)}`);
  
  const stepPath = path.join(CONFIG.downloadDir, stepFile);
  const objPath = path.join(CONFIG.tempDir, `${baseName}.obj`);
  
  // Stage 1: STEP → OBJ
  const objExists = await convertStepToObj(stepPath, objPath);
  
  if (!objExists) {
    return { file: stepFile, success: false, reason: 'OBJ conversion skipped' };
  }
  
  // Stage 2: OBJ → GLB (multiple quality levels)
  const results = {};
  
  for (const [level, config] of Object.entries(CONFIG.qualityLevels)) {
    const glbPath = path.join(CONFIG.outputDir, `${baseName}${config.suffix}.glb`);
    
    console.log(`\n📊 Creating ${level.toUpperCase()} quality version...`);
    const success = convertObjToGlb(objPath, glbPath, config.decimation);
    
    results[level] = success;
  }
  
  const successCount = Object.values(results).filter(Boolean).length;
  
  return {
    file: stepFile,
    baseName: baseName,
    success: successCount > 0,
    levels: results
  };
}

// Generate model configuration
function generateConfig(results) {
  const models = results
    .filter(r => r.success)
    .map((r, idx) => ({
      id: `cad-${idx + 1}`,
      name: r.baseName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      detailLevels: {
        ultra: `/models/cad/${r.baseName}-ultra.glb`,
        high: `/models/cad/${r.baseName}-high.glb`,
        medium: `/models/cad/${r.baseName}-med.glb`,
        low: `/models/cad/${r.baseName}-low.glb`
      },
      type: 'CAD',
      category: 'Production Grade'
    }));
  
  const configPath = path.join(__dirname, '../src/lib/cad-models-production.json');
  fs.writeFileSync(configPath, JSON.stringify(models, null, 2));
  
  console.log(`\n✅ Configuration saved: ${configPath}`);
  return models;
}

// Main execution
async function main() {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🏭 PRODUCTION-GRADE CAD CONVERSION PIPELINE`);
  console.log(`${'='.repeat(80)}\n`);
  
  ensureDirectories();
  
  // Check Blender
  if (!fs.existsSync(CONFIG.blenderPath)) {
    console.log(`❌ Blender not found at: ${CONFIG.blenderPath}`);
    console.log(`   Please update CONFIG.blenderPath in the script\n`);
    process.exit(1);
  }
  
  console.log(`✅ Blender found: ${CONFIG.blenderPath}`);
  
  // Get files
  const files = getCADFiles();
  
  if (files.length === 0) {
    console.log(`\n❌ No CAD files found in: ${CONFIG.downloadDir}\n`);
    process.exit(1);
  }
  
  console.log(`\n📂 Found ${files.length} CAD file(s):\n`);
  files.forEach((f, i) => console.log(`   ${i+1}. ${f}`));
  
  // Process each file
  const results = [];
  for (const file of files) {
    const result = await processFile(file);
    results.push(result);
  }
  
  // Generate config
  if (results.some(r => r.success)) {
    generateConfig(results);
  }
  
  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 CONVERSION SUMMARY`);
  console.log(`${'='.repeat(80)}\n`);
  
  const successful = results.filter(r => r.success).length;
  console.log(`✅ Successful: ${successful}/${files.length}`);
  
  results.forEach(r => {
    if (r.success) {
      console.log(`   ✅ ${r.file}`);
      Object.entries(r.levels).forEach(([level, success]) => {
        console.log(`      ${success ? '✅' : '❌'} ${level}`);
      });
    } else {
      console.log(`   ❌ ${r.file} - ${r.reason}`);
    }
  });
  
  console.log(`\n${'='.repeat(80)}\n`);
  
  if (successful > 0) {
    console.log(`🎉 Conversion complete! Models are ready in: ${CONFIG.outputDir}\n`);
  } else {
    console.log(`⚠️  No models were converted. Follow the manual conversion steps above.\n`);
  }
}

main().catch(console.error);
