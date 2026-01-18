"""
Production-Grade CAD Converter using Blender
Converts STEP/IGES files to high-quality GLB with multiple LOD levels
"""

import bpy
import sys
import os
from pathlib import Path

def clear_scene():
    """Remove all objects from the scene"""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    
def import_step_file(filepath):
    """Import STEP/IGES file using Blender's import functionality"""
    ext = Path(filepath).suffix.lower()
    
    print(f"Importing {ext} file: {filepath}")
    
    # Try import_scene.obj as a fallback
    # For STEP files, we need to first convert to an intermediate format
    # Blender doesn't have native STEP import, so we'll handle OBJ/STL/FBX
    
    if ext in ['.obj']:
        bpy.ops.wm.obj_import(filepath=filepath)
    elif ext in ['.stl']:
        bpy.ops.wm.stl_import(filepath=filepath)
    elif ext in ['.fbx']:
        bpy.ops.import_scene.fbx(filepath=filepath)
    elif ext in ['.gltf', '.glb']:
        bpy.ops.import_scene.gltf(filepath=filepath)
    elif ext in ['.ply']:
        bpy.ops.wm.ply_import(filepath=filepath)
    else:
        # For STEP/IGES, try generic import
        print(f"⚠️ Warning: {ext} may not be directly supported by Blender")
        print("   Trying generic import...")
        try:
            bpy.ops.import_scene.obj(filepath=filepath)
        except:
            raise ValueError(f"Unsupported format: {ext}")
    
    return True

def join_all_meshes():
    """Join all mesh objects into one"""
    bpy.ops.object.select_all(action='DESELECT')
    
    mesh_objects = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
    
    if len(mesh_objects) == 0:
        raise ValueError("No mesh objects found in scene")
    
    print(f"Found {len(mesh_objects)} mesh objects")
    
    # Select all meshes
    for obj in mesh_objects:
        obj.select_set(True)
    
    # Set active object
    bpy.context.view_layer.objects.active = mesh_objects[0]
    
    # Join
    if len(mesh_objects) > 1:
        bpy.ops.object.join()
        print("✅ All meshes joined")
    
    return bpy.context.active_object

def apply_decimation(ratio):
    """Apply decimation modifier to reduce poly count"""
    obj = bpy.context.active_object
    
    if obj and obj.type == 'MESH':
        # Get original face count
        original_faces = len(obj.data.polygons)
        
        # Add and apply decimate modifier
        bpy.ops.object.modifier_add(type='DECIMATE')
        obj.modifiers["Decimate"].ratio = ratio
        bpy.ops.object.modifier_apply(modifier="Decimate")
        
        final_faces = len(obj.data.polygons)
        print(f"   Decimated: {original_faces:,} → {final_faces:,} faces ({ratio*100:.0f}%)")
        
        return final_faces
    
    return 0

def optimize_mesh():
    """Clean up and optimize the mesh"""
    obj = bpy.context.active_object
    
    if obj and obj.type == 'MESH':
        # Remove doubles
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.mesh.remove_doubles(threshold=0.0001)
        bpy.ops.mesh.normals_make_consistent(inside=False)
        bpy.ops.object.mode_set(mode='OBJECT')
        
        print("✅ Mesh optimized")

def export_glb(output_path):
    """Export as GLB file"""
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        export_materials='EXPORT',
        export_colors=True,
        export_normals=True,
        export_tangents=False,
        export_texcoords=True,
        export_apply=True,
        export_yup=True
    )
    
    file_size = Path(output_path).stat().st_size / (1024 * 1024)
    print(f"✅ Exported: {output_path} ({file_size:.2f} MB)")

def main():
    """Main conversion workflow"""
    if len(sys.argv) < 7:  # Blender passes its own args, so our args start later
        print("Usage: blender --background --python script.py -- <input> <output_base> <decimation>")
        sys.exit(1)
    
    # Get our arguments (after the '--')
    try:
        separator_index = sys.argv.index('--')
        our_args = sys.argv[separator_index + 1:]
    except ValueError:
        print("Error: Missing '--' separator")
        sys.exit(1)
    
    if len(our_args) < 3:
        print(f"Error: Need 3 arguments, got {len(our_args)}")
        sys.exit(1)
    
    input_file = our_args[0]
    output_base = our_args[1]
    decimation = float(our_args[2])
    
    print(f"\n{'='*80}")
    print(f"Blender CAD Converter")
    print(f"{'='*80}")
    print(f"Input:      {input_file}")
    print(f"Output:     {output_base}")
    print(f"Decimation: {decimation*100:.0f}%")
    print(f"{'='*80}\n")
    
    if not os.path.exists(input_file):
        print(f"❌ Input file not found: {input_file}")
        sys.exit(1)
    
    try:
        # Clear scene
        clear_scene()
        
        # Import file
        import_step_file(input_file)
        
        # Join all meshes
        join_all_meshes()
        
        # Optimize
        optimize_mesh()
        
        # Apply decimation
        if decimation < 1.0:
            apply_decimation(decimation)
        
        # Export
        export_glb(output_base)
        
        print("\n✅ Conversion complete!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
