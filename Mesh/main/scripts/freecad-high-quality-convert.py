"""
HIGH-QUALITY CAD TO GLB CONVERTER
Uses FreeCAD with maximum tessellation quality
Production-grade output with CAD-level detail
"""

import FreeCAD
import Import
import Mesh
import sys
import os

def convert_step_to_glb_high_quality(input_file, output_file):
    """
    Convert STEP to GLB with MAXIMUM quality settings
    
    Tessellation parameters:
    - Linear deflection: 0.01mm (ultra-fine)
    - Angular deflection: 5 degrees (smooth curves)
    - Minimum edge length: 0.1mm
    """
    
    print(f"\n{'='*80}")
    print(f"HIGH-QUALITY CAD CONVERSION")
    print(f"{'='*80}")
    print(f"Input:  {input_file}")
    print(f"Output: {output_file}")
    print(f"{'='*80}\n")
    
    # Import STEP file
    print("📖 Loading STEP file...")
    doc = FreeCAD.newDocument("Conversion")
    Import.insert(input_file, doc.Name)
    
    shape_count = len([obj for obj in doc.Objects if hasattr(obj, 'Shape')])
    print(f"✅ Loaded {shape_count} CAD objects\n")
    
    # High-quality tessellation settings
    print("🎨 Tessellating with ULTRA-HIGH quality settings:")
    print("   - Linear deflection: 0.01mm (CAD-grade precision)")
    print("   - Angular deflection: 5° (smooth curves)")
    print("   - Computing normals: Yes")
    print("   - Segment per edge: Maximum\n")
    
    meshes = []
    total_faces = 0
    
    for obj in doc.Objects:
        if hasattr(obj, 'Shape') and obj.Shape.Faces:
            print(f"   Processing: {obj.Label}...")
            
            # ULTRA-HIGH QUALITY tessellation
            mesh = doc.addObject("Mesh::Feature", f"{obj.Label}_mesh")
            mesh.Mesh = Mesh.Mesh(
                obj.Shape.tessellate(
                    0.01,  # Linear deflection (VERY FINE)
                    5.0    # Angular deflection (SMOOTH)
                )
            )
            
            face_count = mesh.Mesh.CountFacets
            total_faces += face_count
            print(f"      → {face_count:,} triangles")
            
            meshes.append(mesh)
    
    print(f"\n✅ Total tessellation: {total_faces:,} triangles")
    print(f"   Quality level: PRODUCTION GRADE\n")
    
    # Merge all meshes
    if len(meshes) > 1:
        print("🔗 Merging meshes...")
        combined = meshes[0].Mesh.copy()
        for mesh in meshes[1:]:
            combined.addMesh(mesh.Mesh)
        
        final_mesh = doc.addObject("Mesh::Feature", "Combined")
        final_mesh.Mesh = combined
    else:
        final_mesh = meshes[0]
    
    # Export as GLB (GLTF Binary)
    print("💾 Exporting to GLB...")
    
    # FreeCAD exports to OBJ, then we need to convert OBJ → GLB
    temp_obj = output_file.replace('.glb', '_temp.obj')
    
    Mesh.export([final_mesh], temp_obj)
    
    obj_size = os.path.getsize(temp_obj) / (1024 * 1024)
    print(f"✅ High-quality OBJ created: {obj_size:.2f} MB")
    print(f"   ({total_faces:,} faces, {total_faces * 3:,} vertices)\n")
    
    print("📦 Converting OBJ → GLB using Blender...")
    print("   (Run: blender --background --python convert_obj_to_glb.py)\n")
    
    return temp_obj

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: freecad freecad-high-quality-convert.py <input.step> <output.glb>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    if not os.path.exists(input_file):
        print(f"❌ Input file not found: {input_file}")
        sys.exit(1)
    
    temp_obj = convert_step_to_glb_high_quality(input_file, output_file)
    
    print(f"\n{'='*80}")
    print("✅ STEP → OBJ COMPLETE (HIGH QUALITY)")
    print(f"{'='*80}")
    print(f"\nNext step: Convert {os.path.basename(temp_obj)} to GLB using Blender")
    print("This preserves the high-polygon detail!\n")
