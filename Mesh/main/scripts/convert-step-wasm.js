/**
 * STEP to GLB Converter using OpenCascade.js (WebAssembly)
 * Pure JavaScript solution - no external CAD software needed!
 */

const fs = require('fs');
const path = require('path');
const initOpenCascade = require('opencascade.js');

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

async function convertSTEP(oc, inputPath, outputBaseName) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔄 Converting: ${path.basename(inputPath)}`);
  console.log(`${'='.repeat(80)}`);
  
  try {
    // Read STEP file
    console.log('📖 Reading STEP file...');
    const stepContent = fs.readFileSync(inputPath, 'utf8');
    
    // Import STEP
    console.log('🔧 Parsing STEP data with OpenCascade...');
    const reader = new oc.STEPControl_Reader_1();
    
    // Write content to OpenCascade filesystem
    oc.FS.writeFile('/model.step', stepContent);
    
    const readStatus = reader.ReadFile('/model.step');
    
    if (readStatus !== oc.IFSelect_ReturnStatus.IFSelect_RetDone) {
      console.log('❌ Failed to read STEP file');
      return false;
    }
    
    console.log('✅ STEP file parsed successfully');
    
    // Transfer shapes
    console.log('🔄 Transferring shapes...');
    reader.TransferRoots(new oc.Message_ProgressRange_1());
    
    const nbShapes = reader.NbShapes();
    console.log(`📦 Found ${nbShapes} shape(s)`);
    
    if (nbShapes === 0) {
      console.log('❌ No shapes found in STEP file');
      return false;
    }
    
    // Get the shape
    const shape = reader.Shape(1);
    
    // Tesselate (convert to mesh)
    console.log('🎨 Tessellating shape to mesh...');
    
    // Create mesh
    const { mesh, triangleCount, vertexCount } = tesselateShape(oc, shape);
    
    console.log(`✅ Mesh created:`);
    console.log(`   - Vertices: ${vertexCount.toLocaleString()}`);
    console.log(`   - Triangles: ${triangleCount.toLocaleString()}`);
    
    // Export as OBJ (simpler format)
    const objPath = path.join(TEMP_DIR, `${outputBaseName}.obj`);
    console.log(`💾 Exporting to OBJ: ${objPath}`);
    
    const objContent = meshToOBJ(mesh);
    fs.writeFileSync(objPath, objContent);
    
    const objStats = fs.statSync(objPath);
    console.log(`✅ OBJ created: ${(objStats.size / (1024 * 1024)).toFixed(2)} MB`);
    
    // Cleanup OpenCascade filesystem
    oc.FS.unlink('/model.step');
    
    return objPath;
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    console.log(error.stack);
    return false;
  }
}

function tesselateShape(oc, shape) {
  // Create triangulation
  const linearDeflection = 0.1;
  const angularDeflection = 0.5;
  
  const triangulation = new oc.BRepMesh_IncrementalMesh_2(
    shape,
    linearDeflection,
    false,
    angularDeflection,
    true
  );
  
  triangulation.Perform();
  
  // Extract mesh data
  const vertices = [];
  const faces = [];
  
  const explorer = new oc.TopExp_Explorer_1();
  explorer.Init(shape, oc.TopAbs_ShapeEnum.TopAbs_FACE, oc.TopAbs_ShapeEnum.TopAbs_SHAPE);
  
  let vertexOffset = 0;
  
  while (explorer.More()) {
    const face = oc.TopoDS.Face_1(explorer.Current());
    const location = new oc.TopLoc_Location_1();
    const triangulation = oc.BRep_Tool.Triangulation(face, location, 0);
    
    if (!triangulation.IsNull()) {
      const transform = location.Transformation();
      const nbNodes = triangulation.NbNodes();
      const nbTriangles = triangulation.NbTriangles();
      
      // Extract vertices
      for (let i = 1; i <= nbNodes; i++) {
        const node = triangulation.Node(i);
        const transformed = node.Transformed(transform);
        vertices.push(transformed.X(), transformed.Y(), transformed.Z());
      }
      
      // Extract triangles
      const orientation = face.Orientation_1();
      for (let i = 1; i <= nbTriangles; i++) {
        const triangle = triangulation.Triangle(i);
        let v1 = triangle.Value(1) + vertexOffset;
        let v2 = triangle.Value(2) + vertexOffset;
        let v3 = triangle.Value(3) + vertexOffset;
        
        // Reverse winding if needed
        if (orientation === oc.TopAbs_Orientation.TopAbs_REVERSED) {
          faces.push(v1, v3, v2);
        } else {
          faces.push(v1, v2, v3);
        }
      }
      
      vertexOffset += nbNodes;
    }
    
    explorer.Next();
  }
  
  return {
    mesh: { vertices, faces },
    triangleCount: faces.length / 3,
    vertexCount: vertices.length / 3
  };
}

function meshToOBJ(mesh) {
  let obj = '# OBJ file generated by OpenCascade.js\n\n';
  
  // Write vertices
  for (let i = 0; i < mesh.vertices.length; i += 3) {
    obj += `v ${mesh.vertices[i]} ${mesh.vertices[i + 1]} ${mesh.vertices[i + 2]}\n`;
  }
  
  obj += '\n';
  
  // Write faces (OBJ is 1-indexed)
  for (let i = 0; i < mesh.faces.length; i += 3) {
    obj += `f ${mesh.faces[i] + 1} ${mesh.faces[i + 1] + 1} ${mesh.faces[i + 2] + 1}\n`;
  }
  
  return obj;
}

// Main execution
async function main() {
  console.log('\n🔧 STEP TO GLB CONVERTER (OpenCascade.js)');
  console.log('=' .repeat(80));
  console.log('Using WebAssembly - No external CAD software needed!\n');
  
  ensureDirectories();
  
  const files = getCADFiles();
  
  if (files.length === 0) {
    console.log('❌ No CAD files found in:');
    console.log(`   ${DOWNLOAD_DIR}\n`);
    return;
  }
  
  console.log(`✅ Found ${files.length} CAD file(s) to convert\n`);
  
  // Initialize OpenCascade
  console.log('🚀 Initializing OpenCascade WASM engine...');
  const oc = await initOpenCascade();
  console.log('✅ OpenCascade initialized\n');
  
  let successCount = 0;
  
  for (const file of files) {
    const inputPath = path.join(DOWNLOAD_DIR, file);
    const baseName = path.basename(file, path.extname(file))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    
    const result = await convertSTEP(oc, inputPath, baseName);
    if (result) {
      successCount++;
      console.log(`\n✅ ${file} → ${baseName}.obj`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n✅ Conversion complete! Successfully converted ${successCount}/${files.length} model(s)`);
  console.log(`\n📂 Output directory: ${TEMP_DIR}`);
  console.log('\n💡 Next step: Convert OBJ to GLB with Blender or Three.js\n');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
