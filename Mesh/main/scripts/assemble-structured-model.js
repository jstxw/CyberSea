/**
 * STRUCTURED MODEL ASSEMBLER
 * Combines extracted CAD components into single GLB
 * Preserves component names and hierarchy
 * Generates metadata for viewer
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG = {
  componentsDir: path.join(__dirname, '../downloads/temp/structured'),
  outputDir: path.join(__dirname, '../public/models/cad/structured'),
  blenderPath: 'C:\\Program Files\\Blender Foundation\\Blender 5.0\\blender.exe',
  modelName: 'a10-warthog',
};

/**
 * Find all component OBJ files
 */
function findComponentFiles() {
  if (!fs.existsSync(CONFIG.componentsDir)) {
    return [];
  }
  
  return fs.readdirSync(CONFIG.componentsDir)
    .filter(f => f.endsWith('.obj'))
    .sort()
    .map(filename => ({
      filename,
      path: path.join(CONFIG.componentsDir, filename),
      // Extract component name from filename (001_fuselage.obj → fuselage)
      componentName: filename.replace(/^\d+_/, '').replace(/\.obj$/, '').replace(/_/g, ' '),
      id: filename.replace(/\.obj$/, '').toLowerCase()
    }));
}

/**
 * Generate Blender script to assemble components
 */
function generateBlenderAssemblyScript(components, outputPath, metadataPath) {
  const scriptPath = path.join(CONFIG.componentsDir, 'assemble.py');
  
  const componentsCode = components.map((comp, idx) => `
    # Component ${idx + 1}: ${comp.componentName}
    bpy.ops.wm.obj_import(filepath="${comp.path.replace(/\\/g, '/')}")
    imported = [obj for obj in bpy.context.selected_objects if obj.type == 'MESH']
    if imported:
        obj = imported[0]
        obj.name = "${comp.componentName}"
        obj["component_id"] = "${comp.id}"
        obj["component_index"] = ${idx}
        
        # Get bounding box
        bbox = obj.bound_box
        min_coords = [min([v[i] for v in bbox]) for i in range(3)]
        max_coords = [max([v[i] for v in bbox]) for i in range(3)]
        
        components_data.append({
            "id": "${comp.id}",
            "name": "${comp.componentName}",
            "meshIndex": ${idx},
            "bbox": {
                "min": min_coords,
                "max": max_coords
            }
        })
        
        print(f"  ✅ ${comp.componentName} ({len(obj.data.polygons):,} faces)")
`).join('\n');

  const script = `
import bpy
import json
import os

print("\\n" + "="*80)
print("STRUCTURED MODEL ASSEMBLER")
print("="*80 + "\\n")

# Clear scene
bpy.ops.wm.read_factory_settings(use_empty=True)

components_data = []

print("📦 Importing components...\\n")

${componentsCode}

print(f"\\n✅ Imported {len(components_data)} components")

# Export as GLB
print("\\n💾 Exporting structured GLB...")
bpy.ops.export_scene.gltf(
    filepath="${outputPath.replace(/\\/g, '/')}",
    export_format='GLB',
    export_materials='EXPORT',
    export_colors=True,
    export_normals=True,
    export_extras=True,  # Include custom properties
    export_yup=True
)

file_size = os.path.getsize("${outputPath.replace(/\\/g, '/')}") / (1024 * 1024)
print(f"✅ GLB exported: {file_size:.2f} MB")

# Generate metadata
print("\\n📝 Generating metadata...")
metadata = {
    "model": {
        "name": "A-10 Thunderbolt II",
        "type": "Military Aircraft",
        "source": "CAD (STEP)",
        "detail": "Production Grade"
    },
    "components": components_data,
    "stats": {
        "totalComponents": len(components_data),
        "fileSize": f"{file_size:.2f} MB"
    }
}

with open("${metadataPath.replace(/\\/g, '/')}", 'w') as f:
    json.dump(metadata, f, indent=2)

print("✅ Metadata saved")
print("\\n" + "="*80)
print("✅ STRUCTURED MODEL COMPLETE")
print("="*80 + "\\n")
`;

  fs.writeFileSync(scriptPath, script);
  return scriptPath;
}

/**
 * Main assembly process
 */
async function main() {
  console.log(`\n${'='.repeat(80)}`);
  console.log('🏗️  STRUCTURED MODEL ASSEMBLY');
  console.log('='.repeat(80)\n`);
  
  // Ensure output directory
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
  
  // Find component files
  const components = findComponentFiles();
  
  if (components.length === 0) {
    console.log(`❌ No component OBJ files found in: ${CONFIG.componentsDir}\n`);
    console.log('Please run step-parser-production.js first and extract components.\n');
    process.exit(1);
  }
  
  console.log(`📂 Found ${components.length} component files:\n`);
  components.slice(0, 10).forEach((comp, i) => {
    const size = (fs.statSync(comp.path).size / 1024).toFixed(1);
    console.log(`   ${i + 1}. ${comp.componentName} (${size} KB)`);
  });
  
  if (components.length > 10) {
    console.log(`   ... and ${components.length - 10} more`);
  }
  
  // Check Blender
  if (!fs.existsSync(CONFIG.blenderPath)) {
    console.log(`\n❌ Blender not found: ${CONFIG.blenderPath}\n`);
    process.exit(1);
  }
  
  console.log(`\n✅ Blender found\n`);
  
  // Generate output paths
  const outputGLB = path.join(CONFIG.outputDir, `${CONFIG.modelName}-structured.glb`);
  const outputMetadata = path.join(CONFIG.outputDir, `${CONFIG.modelName}-metadata.json`);
  
  // Generate Blender script
  console.log('📝 Generating assembly script...');
  const scriptPath = generateBlenderAssemblyScript(components, outputGLB, outputMetadata);
  console.log(`✅ Script generated\n`);
  
  // Run Blender
  console.log('🎨 Running Blender assembly...\n');
  console.log('='.repeat(80) + '\n');
  
  try {
    execSync(`"${CONFIG.blenderPath}" --background --python "${scriptPath}"`, {
      stdio: 'inherit',
      timeout: 600000 // 10 minutes
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ ASSEMBLY COMPLETE!');
    console.log('='.repeat(80) + '\n');
    
    // Show results
    if (fs.existsSync(outputGLB)) {
      const glbSize = (fs.statSync(outputGLB).size / (1024 * 1024)).toFixed(2);
      console.log(`📦 Structured GLB: ${path.basename(outputGLB)} (${glbSize} MB)`);
    }
    
    if (fs.existsSync(outputMetadata)) {
      console.log(`📋 Metadata: ${path.basename(outputMetadata)}`);
      
      // Show metadata preview
      const metadata = JSON.parse(fs.readFileSync(outputMetadata, 'utf-8'));
      console.log(`\n📊 Model Statistics:`);
      console.log(`   - Components: ${metadata.stats.totalComponents}`);
      console.log(`   - File size: ${metadata.stats.fileSize}`);
      console.log(`\n✨ Sample components:`);
      metadata.components.slice(0, 5).forEach((comp, i) => {
        console.log(`   ${i + 1}. ${comp.name}`);
      });
      if (metadata.components.length > 5) {
        console.log(`   ... and ${metadata.components.length - 5} more`);
      }
    }
    
    console.log(`\n📁 Output directory: ${CONFIG.outputDir}`);
    console.log(`\n🎉 Ready to integrate into viewer!\n`);
    
  } catch (error) {
    console.error('\n❌ Assembly failed:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
