#!/usr/bin/env python3
"""
Production-Grade STEP to OBJ Converter
Uses pythonocc-core for industrial-grade CAD processing
"""

import sys
import os
from pathlib import Path

try:
    from OCC.Core.STEPControl import STEPControl_Reader
    from OCC.Core.IFSelect import IFSelect_RetDone
    from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
    from OCC.Core.TopExp import TopExp_Explorer
    from OCC.Core.TopAbs import TopAbs_FACE, TopAbs_SHAPE
    from OCC.Core.BRep import BRep_Tool
    from OCC.Core.TopoDS import topods_Face
    from OCC.Extend.TopologyUtils import TopologyExplorer
except ImportError:
    print("ERROR: pythonocc-core not installed")
    print("Install: pip install pythonocc-core")
    sys.exit(1)

def convert_step_to_obj(step_file, obj_file, linear_deflection=0.1, angular_deflection=0.5):
    """
    Convert STEP file to OBJ with high precision
    
    Args:
        step_file: Path to input STEP/STP file
        obj_file: Path to output OBJ file
        linear_deflection: Mesh quality (lower = finer, 0.01-1.0)
        angular_deflection: Angular tolerance (lower = finer, 0.1-1.0)
    """
    print(f"\n{'='*80}")
    print(f"Converting: {Path(step_file).name}")
    print(f"{'='*80}")
    
    # Read STEP file
    print("📖 Reading STEP file...")
    step_reader = STEPControl_Reader()
    status = step_reader.ReadFile(str(step_file))
    
    if status != IFSelect_RetDone:
        print(f"❌ Error reading STEP file: {status}")
        return False
    
    print("✅ STEP file loaded successfully")
    
    # Transfer shapes
    print("🔄 Transferring shapes...")
    step_reader.TransferRoots()
    shape = step_reader.OneShape()
    
    # Tessellate (convert to mesh)
    print(f"🎨 Tessellating with precision: linear={linear_deflection}, angular={angular_deflection}")
    mesh = BRepMesh_IncrementalMesh(shape, linear_deflection, False, angular_deflection, True)
    mesh.Perform()
    
    if not mesh.IsDone():
        print("❌ Meshing failed")
        return False
    
    print("✅ Mesh created successfully")
    
    # Extract triangles
    print("📐 Extracting triangulation data...")
    vertices = []
    faces = []
    vertex_map = {}
    vertex_counter = 1
    
    explorer = TopExp_Explorer(shape, TopAbs_FACE)
    face_count = 0
    
    while explorer.More():
        face = topods_Face(explorer.Current())
        location = face.Location()
        facing = BRep_Tool.Triangulation(face, location)
        
        if facing is not None:
            face_count += 1
            transform = location.Transformation()
            
            # Get vertices
            for i in range(1, facing.NbNodes() + 1):
                vertex = facing.Node(i)
                transformed = vertex.Transformed(transform)
                coord = (
                    round(transformed.X(), 6),
                    round(transformed.Y(), 6),
                    round(transformed.Z(), 6)
                )
                
                if coord not in vertex_map:
                    vertex_map[coord] = vertex_counter
                    vertices.append(coord)
                    vertex_counter += 1
            
            # Get faces
            for i in range(1, facing.NbTriangles() + 1):
                triangle = facing.Triangle(i)
                v1_idx = triangle.Value(1)
                v2_idx = triangle.Value(2)
                v3_idx = triangle.Value(3)
                
                # Get actual coordinates
                v1 = facing.Node(v1_idx).Transformed(transform)
                v2 = facing.Node(v2_idx).Transformed(transform)
                v3 = facing.Node(v3_idx).Transformed(transform)
                
                c1 = (round(v1.X(), 6), round(v1.Y(), 6), round(v1.Z(), 6))
                c2 = (round(v2.X(), 6), round(v2.Y(), 6), round(v2.Z(), 6))
                c3 = (round(v3.X(), 6), round(v3.Y(), 6), round(v3.Z(), 6))
                
                # Reverse winding if needed (check face orientation)
                if face.Orientation() == 1:  # TopAbs_REVERSED
                    faces.append((vertex_map[c1], vertex_map[c3], vertex_map[c2]))
                else:
                    faces.append((vertex_map[c1], vertex_map[c2], vertex_map[c3]))
        
        explorer.Next()
    
    print(f"✅ Extracted {len(vertices):,} vertices and {len(faces):,} triangles from {face_count} faces")
    
    # Write OBJ file
    print(f"💾 Writing OBJ file: {obj_file}")
    with open(obj_file, 'w') as f:
        f.write(f"# OBJ file generated from {Path(step_file).name}\n")
        f.write(f"# Vertices: {len(vertices)}, Faces: {len(faces)}\n\n")
        
        # Write vertices
        for v in vertices:
            f.write(f"v {v[0]} {v[1]} {v[2]}\n")
        
        f.write("\n")
        
        # Write faces (OBJ is 1-indexed)
        for face in faces:
            f.write(f"f {face[0]} {face[1]} {face[2]}\n")
    
    file_size = Path(obj_file).stat().st_size / (1024 * 1024)
    print(f"✅ OBJ file created: {file_size:.2f} MB")
    print(f"{'='*80}\n")
    
    return True

def main():
    if len(sys.argv) < 3:
        print("Usage: python production-cad-converter.py <input.step> <output.obj> [linear_deflection] [angular_deflection]")
        print("\nExamples:")
        print("  python production-cad-converter.py model.step model.obj")
        print("  python production-cad-converter.py model.step model.obj 0.05 0.3  # Higher quality")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    linear_def = float(sys.argv[3]) if len(sys.argv) > 3 else 0.1
    angular_def = float(sys.argv[4]) if len(sys.argv) > 4 else 0.5
    
    if not os.path.exists(input_file):
        print(f"❌ Input file not found: {input_file}")
        sys.exit(1)
    
    success = convert_step_to_obj(input_file, output_file, linear_def, angular_def)
    
    if success:
        print("✅ Conversion successful!")
        sys.exit(0)
    else:
        print("❌ Conversion failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
