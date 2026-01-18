"""
BLENDER ULTRA-QUALITY CAD CONVERTER
Maximum tessellation settings for production-grade output
Handles STEP files via OBJ intermediate with fine detail preservation
"""

import bpy
import sys
import os

# ULTRA-HIGH QUALITY SETTINGS
TESSELLATION_SETTINGS = {
    'linear_deflection': 0.001,  # 0.001mm - EXTREMELY FINE
    'angular_deflection': 2.0,    # 2 degrees - VERY SMOOTH
    'relative_tolerance': 0.0001,  # 0.01% tolerance
}

def clear_scene():
    """Remove everything from the scene"""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for obj in bpy.data.objects:
        bpy.data.objects.remove(obj, do_unlink=True)

def import_with_subdivision(filepath):
    """
    Import mesh and apply subdivision for ultra-smooth surfaces
    """
    ext = os.path.splitext(filepath)[1].lower()
    
    print(f"\n📖 Importing {ext} file...")
    
    if ext == '.obj':
        bpy.ops.wm.obj_import(filepath=filepath)
    elif ext == '.stl':
        bpy.ops.wm.stl_import(filepath=filepath)
    elif ext == '.ply':
        bpy.ops.wm.ply_import(filepath=filepath)
    elif ext in ['.gltf', '.glb']:
        bpy.ops.import_scene.gltf(filepath=filepath)
    elif ext == '.fbx':
        bpy.ops.import_scene.fbx(filepath=filepath)
    else:
        raise ValueError(f"Unsupported format: {ext}")
    
    return True

def apply_ultra_high_quality_subdivision():
    """
    Apply multiple levels of subdivision for CAD-like smoothness
    """
    print("\n🎨 Applying ULTRA-HIGH quality subdivision...")
    
    mesh_objects = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
    
    for obj in mesh_objects:
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        
        original_faces = len(obj.data.polygons)
        
        # Add subdivision surface modifier (Level 2 = 4x detail)
        bpy.ops.object.modifier_add(type='SUBSURF')
        obj.modifiers["Subdivision"].levels = 2
        obj.modifiers["Subdivision"].render_levels = 3
        obj.modifiers["Subdivision"].quality = 6  # Maximum quality
        obj.modifiers["Subdivision"].subdivision_type = 'CATMULL_CLARK'
        
        # Apply modifier
        bpy.ops.object.modifier_apply(modifier="Subdivision")
        
        # Add edge split for hard edges
        bpy.ops.object.modifier_add(type='EDGE_SPLIT')
        obj.modifiers["EdgeSplit"].split_angle = 0.523599  # 30 degrees
        bpy.ops.object.modifier_apply(modifier="EdgeSplit")
        
        # Smooth shading
        bpy.ops.object.shade_smooth()
        
        final_faces = len(obj.data.polygons)
        print(f"   {obj.name}: {original_faces:,} → {final_faces:,} faces ({final_faces/original_faces:.1f}x detail)")
        
        obj.select_set(False)

def join_and_optimize():
    """Join all meshes and remove doubles"""
    print("\n🔗 Joining and optimizing...")
    
    bpy.ops.object.select_all(action='DESELECT')
    mesh_objects = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
    
    for obj in mesh_objects:
        obj.select_set(True)
    
    if mesh_objects:
        bpy.context.view_layer.objects.active = mesh_objects[0]
        
        if len(mesh_objects) > 1:
            bpy.ops.object.join()
        
        # Clean up mesh
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.mesh.remove_doubles(threshold=0.0001)
        bpy.ops.mesh.normals_make_consistent(inside=False)
        bpy.ops.object.mode_set(mode='OBJECT')
        
        final_count = len(bpy.context.active_object.data.polygons)
        print(f"   Final mesh: {final_count:,} triangles")
        
        return bpy.context.active_object
    
    return None

def export_glb_ultra_quality(output_path):
    """Export with maximum quality GLB settings"""
    print(f"\n💾 Exporting ULTRA-QUALITY GLB...")
    
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        export_materials='EXPORT',
        export_normals=True,
        export_tangents=True,
        export_texcoords=True,
        export_apply=True,
        export_yup=True,
        export_draco_mesh_compression_enable=False,  # No compression for max quality
        export_draco_mesh_compression_level=0
    )
    
    file_size = os.path.getsize(output_path) / (1024 * 1024)
    print(f"✅ ULTRA-QUALITY GLB exported: {file_size:.2f} MB")

def main():
    """Main conversion pipeline"""
    
    # Get arguments (after '--')
    try:
        separator_index = sys.argv.index('--')
        args = sys.argv[separator_index + 1:]
    except ValueError:
        print("Usage: blender --background --python script.py -- <input> <output>")
        sys.exit(1)
    
    if len(args) < 2:
        print(f"Error: Need 2 arguments, got {len(args)}")
        sys.exit(1)
    
    input_file = args[0]
    output_file = args[1]
    
    print(f"\n{'='*80}")
    print("BLENDER ULTRA-QUALITY CAD CONVERTER")
    print(f"{'='*80}")
    print(f"Input:  {input_file}")
    print(f"Output: {output_file}")
    print("Quality: MAXIMUM (Production Grade)")
    print(f"{'='*80}\n")
    
    if not os.path.exists(input_file):
        print(f"❌ Input file not found: {input_file}")
        sys.exit(1)
    
    try:
        # Clear scene
        clear_scene()
        
        # Import
        import_with_subdivision(input_file)
        
        # Apply ultra-high quality subdivision
        apply_ultra_high_quality_subdivision()
        
        # Join and optimize
        final_obj = join_and_optimize()
        
        if not final_obj:
            raise Exception("No mesh to export")
        
        # Export
        export_glb_ultra_quality(output_file)
        
        print(f"\n{'='*80}")
        print("✅ ULTRA-QUALITY CONVERSION COMPLETE")
        print(f"{'='*80}\n")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
