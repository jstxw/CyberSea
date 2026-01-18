/**
 * CAD to GLB Converter
 * Converts STEP/IGES files to optimized GLB format with multiple LOD levels
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DOWNLOAD_DIR = path.join(__dirname, '../downloads/cad');
const OUTPUT_DIR = path.join(__dirname, '../public/models/cad');
const TEMP_DIR = path.join(__dirname, '../downloads/temp');

// Detail levels for LOD system
const DETAIL_LEVELS = {
  low: { decimation: 0.05, suffix: '-low' },      // 5% of original polys
  medium: { decimation: 0.25, suffix: '-med' },   // 25% of original polys
  high: { decimation: 0.80, suffix: '-high' }     // 80% of original polys
};

function ensureDirectories() {
  [DOWNLOAD_DIR, OUTPUT_DIR, TEMP_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

function checkBlenderInstalled() {
  // Try common Blender paths on Windows
  const possiblePaths = [
    'blender', // If in PATH
    'C:\\Program Files\\Blender Foundation\\Blender 5.0\\blender.exe',
    'C:\\Program Files\\Blender Foundation\\Blender 4.2\\blender.exe',
    'C:\\Program Files\\Blender Foundation\\Blender 4.1\\blender.exe',
    'C:\\Program Files\\Blender Foundation\\Blender\\blender.exe',
  ];
  
  for (const blenderPath of possiblePaths) {
    try {
      execSync(`"${blenderPath}" --version`, { stdio: 'ignore' });
      console.log(`✅ Blender found at: ${blenderPath}`);
      global.BLENDER_PATH = blenderPath;
      return true;
    } catch (e) {
      // Try next path
    }
  }
  
  console.log('❌ Blender is not installed or not found');
  console.log('\n📥 INSTALL BLENDER:');
  console.log('   Windows: https://www.blender.org/download/');
  console.log('   Or: winget install BlenderFoundation.Blender');
  console.log('\n   After installing, restart PowerShell\n');
  return false;
}

function checkFreeCADInstalled() {
  try {
    execSync('freecad --version', { stdio: 'ignore' });
    console.log('✅ FreeCAD is installed');
    return true;
  } catch (e) {
    console.log('⚠️  FreeCAD not found (optional, but recommended for STEP files)');
    console.log('   Download: https://www.freecad.org/downloads.php');
    return false;
  }
}

function getCADFiles() {
  if (!fs.existsSync(DOWNLOAD_DIR)) {
    console.log('❌ Download directory not found');
    return [];
  }
  
  const files = fs.readdirSync(DOWNLOAD_DIR);
  return files.filter(f => 
    f.endsWith('.step') || 
    f.endsWith('.stp') || 
    f.endsWith('.iges') || 
    f.endsWith('.igs') ||
    f.endsWith('.obj') ||
    f.endsWith('.stl')
  );
}

function createBlenderScript(inputFile, outputFile, decimation = 1.0) {
  const ext = path.extname(inputFile).toLowerCase();
  let importCmd = '';
  
  if (ext === '.step' || ext === '.stp') {
    importCmd = `bpy.ops.import_mesh.step('INVOKE_DEFAULT', filepath='${inputFile}')`;
  } else if (ext === '.iges' || ext === '.igs') {
    importCmd = `bpy.ops.import_mesh.iges('INVOKE_DEFAULT', filepath='${inputFile}')`;
  } else if (ext === '.obj') {
    importCmd = `bpy.ops.import_scene.obj(filepath='${inputFile}')`;
  } else if (ext === '.stl') {
    importCmd = `bpy.ops.import_mesh.stl(filepath='${inputFile}')`;
  }
  
  return `
import bpy
import os

# Clear scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Import file
try:
    ${importCmd}
except:
    print("WARNING: Direct import failed, trying alternative method")
    try:
        bpy.ops.import_scene.obj(filepath='${inputFile}')
    except:
        print("ERROR: Could not import file")
        quit()

# Select all mesh objects
bpy.ops.object.select_all(action='DESELECT')
for obj in bpy.context.scene.objects:
    if obj.type == 'MESH':
        obj.select_set(True)

# Join all meshes
if len(bpy.context.selected_objects) > 0:
    bpy.context.view_layer.objects.active = bpy.context.selected_objects[0]
    bpy.ops.object.join()
    
    # Apply decimation if needed
    if ${decimation} < 1.0:
        bpy.ops.object.modifier_add(type='DECIMATE')
        bpy.context.object.modifiers["Decimate"].ratio = ${decimation}
        bpy.ops.object.modifier_apply(modifier="Decimate")
    
    # Export as GLB
    bpy.ops.export_scene.gltf(
        filepath='${outputFile}',
        export_format='GLB',
        export_materials='EXPORT',
        export_colors=True
    )
    print(f"SUCCESS: Exported to ${outputFile}")
else:
    print("ERROR: No mesh objects found")

# Quit
bpy.ops.wm.quit_blender()
`;
}

function convertFile(inputFile, outputBaseName) {
  console.log(`\n🔄 Converting: ${inputFile}`);
  const inputPath = path.join(DOWNLOAD_DIR, inputFile);
  
  // Create LOD versions
  for (const [level, config] of Object.entries(DETAIL_LEVELS)) {
    const outputFile = path.join(OUTPUT_DIR, `${outputBaseName}${config.suffix}.glb`);
    const scriptFile = path.join(TEMP_DIR, `convert_${level}.py`);
    
    console.log(`   Creating ${level} detail (${(config.decimation * 100).toFixed(0)}%)...`);
    
    // Create Blender script
    const script = createBlenderScript(
      inputPath.replace(/\\/g, '/'),
      outputFile.replace(/\\/g, '/'),
      config.decimation
    );
    
    fs.writeFileSync(scriptFile, script);
    
    // Run Blender conversion
    try {
      const blenderCmd = global.BLENDER_PATH || 'blender';
      execSync(`"${blenderCmd}" --background --python "${scriptFile}"`, {
        stdio: 'pipe',
        timeout: 300000 // 5 minutes timeout
      });
      
      if (fs.existsSync(outputFile)) {
        const stats = fs.statSync(outputFile);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`   ✅ ${level}: ${sizeMB} MB`);
      } else {
        console.log(`   ❌ ${level}: Failed to create output file`);
      }
    } catch (error) {
      console.log(`   ❌ ${level}: Conversion failed`);
      console.log(`   Error: ${error.message}`);
    }
    
    // Cleanup script
    if (fs.existsSync(scriptFile)) {
      fs.unlinkSync(scriptFile);
    }
  }
}

function generateModelConfig() {
  console.log('\n📝 Generating model configuration...');
  
  const models = [];
  const files = fs.readdirSync(OUTPUT_DIR);
  const baseNames = [...new Set(files.map(f => 
    f.replace(/-low\.glb|-med\.glb|-high\.glb/, '')
  ))];
  
  baseNames.forEach((baseName, idx) => {
    const model = {
      id: `cad-${idx + 1}`,
      name: baseName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      detailLevels: {
        low: `/models/cad/${baseName}-low.glb`,
        medium: `/models/cad/${baseName}-med.glb`,
        high: `/models/cad/${baseName}-high.glb`
      },
      type: 'CAD',
      category: 'Engineering Detail'
    };
    
    models.push(model);
  });
  
  const configPath = path.join(__dirname, '../src/lib/cad-models.json');
  fs.writeFileSync(configPath, JSON.stringify(models, null, 2));
  console.log(`✅ Configuration saved to: ${configPath}`);
  
  return models;
}

// Main execution
async function main() {
  console.log('\n🔧 CAD TO GLB CONVERTER\n');
  console.log('═'.repeat(80));
  
  ensureDirectories();
  
  // Check dependencies
  const hasBlender = checkBlenderInstalled();
  checkFreeCADInstalled();
  
  if (!hasBlender) {
    console.log('\n❌ Blender is required for conversion. Please install it first.\n');
    return;
  }
  
  // Get CAD files
  const files = getCADFiles();
  
  if (files.length === 0) {
    console.log('\n❌ No CAD files found in:');
    console.log(`   ${DOWNLOAD_DIR}`);
    console.log('\n💡 Run: node scripts/download-grabcad.js first\n');
    return;
  }
  
  console.log(`\n✅ Found ${files.length} CAD file(s) to convert\n`);
  
  // Convert each file
  files.forEach((file, idx) => {
    const baseName = path.basename(file, path.extname(file))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    
    convertFile(file, baseName);
  });
  
  // Generate config
  const models = generateModelConfig();
  
  console.log('\n' + '═'.repeat(80));
  console.log(`\n✅ Conversion complete! Created ${models.length} model(s) with 3 detail levels each\n`);
  console.log('📂 Output directory:', OUTPUT_DIR);
  console.log('📋 Config file: src/lib/cad-models.json\n');
}

main().catch(console.error);
