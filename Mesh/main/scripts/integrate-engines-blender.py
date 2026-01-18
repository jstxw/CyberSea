"""
ENGINE INTEGRATION SCRIPT FOR BLENDER
Combines aircraft model with separate engine GLB files
Positions engines correctly BEHIND the aircraft and creates exploded view
"""

import bpy
import sys
import os
import math

def clear_scene():
    """Remove all objects"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def import_glb(filepath, name_prefix=""):
    """Import GLB file and return imported objects"""
    print(f"\n📦 Importing: {os.path.basename(filepath)}")
    
    # Store existing objects
    existing_objects = set(bpy.data.objects)
    
    # Import GLB
    bpy.ops.import_scene.gltf(filepath=filepath)
    
    # Get newly imported objects
    new_objects = set(bpy.data.objects) - existing_objects
    imported = list(new_objects)
    
    # Rename if prefix provided
    if name_prefix:
        for obj in imported:
            obj.name = f"{name_prefix}_{obj.name}"
    
    print(f"   ✅ Imported {len(imported)} objects")
    return imported

def get_aircraft_bounds(objects):
    """Get bounding box of aircraft"""
    import mathutils
    
    min_x = min_y = min_z = float('inf')
    max_x = max_y = max_z = float('-inf')
    
    for obj in objects:
        if obj.type == 'MESH':
            # Transform each bounding box vertex to world space
            for vert in obj.bound_box:
                world_vert = obj.matrix_world @ mathutils.Vector(vert)
                min_x = min(min_x, world_vert[0])
                max_x = max(max_x, world_vert[0])
                min_y = min(min_y, world_vert[1])
                max_y = max(max_y, world_vert[1])
                min_z = min(min_z, world_vert[2])
                max_z = max(max_z, world_vert[2])
    
    return {
        'min': (min_x, min_y, min_z),
        'max': (max_x, max_y, max_z),
        'center': ((min_x + max_x)/2, (min_y + max_y)/2, (min_z + max_z)/2),
        'length': max_y - min_y  # Front to back
    }

def create_collection(name):
    """Create or get a collection"""
    if name in bpy.data.collections:
        return bpy.data.collections[name]
    
    collection = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(collection)
    return collection

def move_to_collection(objects, collection):
    """Move objects to a collection"""
    for obj in objects:
        # Unlink from all collections
        for coll in obj.users_collection:
            coll.objects.unlink(obj)
        # Link to target collection
        collection.objects.link(obj)

def position_engine(engine_objects, aircraft_bounds, aircraft_type="twin", side="center"):
    """
    Position engine objects AT THE REAR of the aircraft (attached, not floating)
    aircraft_type: "single" (F-35) or "twin" (A-10)
    side: "center", "left", or "right"
    """
    print(f"\n🔧 Positioning {side} engine...")
    
    # Position engines AT the rear of the aircraft (min Y), not behind it
    # Use a fraction of the aircraft length to position engines just inside the rear
    aircraft_length = aircraft_bounds['max'][1] - aircraft_bounds['min'][1]
    
    if aircraft_type == "single":
        # F-35: Single engine centered in fuselage rear
        x = aircraft_bounds['center'][0]  # Centered on aircraft X axis
        y = aircraft_bounds['min'][1] + (aircraft_length * 0.15)  # 15% from rear (inside the aircraft)
        z = aircraft_bounds['center'][2] - 0.3  # Slightly below center
    else:
        # A-10: Twin engines mounted on sides of rear fuselage
        # Calculate aircraft width for proper engine spacing
        aircraft_width = aircraft_bounds['max'][0] - aircraft_bounds['min'][0]
        
        if side == "left":
            x = aircraft_bounds['center'][0] - (aircraft_width * 0.28)  # 28% of width to the left
            y = aircraft_bounds['min'][1] + (aircraft_length * 0.25)  # 25% from rear
            z = aircraft_bounds['center'][2] + (aircraft_bounds['max'][2] - aircraft_bounds['min'][2]) * 0.1  # 10% above center
        else:  # right
            x = aircraft_bounds['center'][0] + (aircraft_width * 0.28)  # 28% of width to the right
            y = aircraft_bounds['min'][1] + (aircraft_length * 0.25)  # 25% from rear
            z = aircraft_bounds['center'][2] + (aircraft_bounds['max'][2] - aircraft_bounds['min'][2]) * 0.1  # 10% above center
    
    # Move all engine objects
    for obj in engine_objects:
        obj.location = (x, y, z)
        # Rotate engine to face backwards (nozzle pointing to -Y)
        obj.rotation_euler = (0, 0, 0)
    
    print(f"   ✅ Positioned at ({x:.2f}, {y:.2f}, {z:.2f})")
    print(f"      Aircraft bounds: Y={aircraft_bounds['min'][1]:.2f} to {aircraft_bounds['max'][1]:.2f}")
    
    return (x, y, z)

def create_exploded_view(collections, aircraft_type="twin", explode_distance=5.0):
    """
    Create exploded view by moving engines away from airframe
    Engines should move BACKWARDS (more negative Y) and outwards
    """
    print(f"\n💥 Creating exploded view (distance: {explode_distance})")
    
    for coll_name, collection in collections.items():
        if coll_name == "Airframe":
            continue  # Keep main airframe in place
        
        if aircraft_type == "single":
            # F-35: Move single engine straight back
            for obj in collection.objects:
                obj.location.y -= explode_distance * 2  # Move backwards
        else:
            # A-10: Move twin engines back and outwards
            if "left" in coll_name.lower():
                for obj in collection.objects:
                    obj.location.x -= explode_distance * 1.5  # Move left
                    obj.location.y -= explode_distance  # Move back
            elif "right" in coll_name.lower():
                for obj in collection.objects:
                    obj.location.x += explode_distance * 1.5  # Move right
                    obj.location.y -= explode_distance  # Move back
    
    print("   ✅ Exploded view created")

def export_glb(output_path):
    """Export combined model as GLB"""
    print(f"\n💾 Exporting to: {os.path.basename(output_path)}")
    
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        export_materials='EXPORT',
        export_normals=True,
        export_tangents=True,
        export_apply=True,
        export_yup=True
    )
    
    file_size = os.path.getsize(output_path) / (1024 * 1024)
    print(f"   ✅ Exported: {file_size:.2f} MB")

def main():
    """Main integration workflow"""
    
    # Get arguments
    try:
        separator_index = sys.argv.index('--')
        args = sys.argv[separator_index + 1:]
    except ValueError:
        print("Usage: blender --background --python script.py -- <aircraft.glb> <engine.glb> <output.glb> [exploded_distance] [aircraft_type]")
        sys.exit(1)
    
    if len(args) < 3:
        print(f"Error: Need at least 3 arguments, got {len(args)}")
        sys.exit(1)
    
    aircraft_file = args[0]
    engine_file = args[1]
    output_file = args[2]
    explode_distance = float(args[3]) if len(args) > 3 else 0
    aircraft_type = args[4] if len(args) > 4 else "twin"  # "single" or "twin"
    
    # Auto-detect aircraft type from filename if not specified
    if aircraft_type == "twin":
        if "f-35" in aircraft_file.lower() or "f35" in aircraft_file.lower():
            aircraft_type = "single"
        elif "a-10" in aircraft_file.lower() or "a10" in aircraft_file.lower():
            aircraft_type = "twin"
    
    print(f"\n{'='*80}")
    print("✈️  AIRCRAFT + ENGINE INTEGRATION SYSTEM")
    print('='*80)
    print(f"\nAircraft:      {aircraft_file}")
    print(f"Engine Model:  {engine_file}")
    print(f"Output:        {output_file}")
    print(f"Type:          {aircraft_type.upper()}-ENGINE")
    if explode_distance > 0:
        print(f"Explode View:  {explode_distance} units")
    print('='*80 + '\n')
    
    # Clear scene
    clear_scene()
    
    # Create collections for organization
    if aircraft_type == "single":
        collections = {
            "Airframe": create_collection("Airframe"),
            "Engine_Center": create_collection("Engine_Center")
        }
    else:
        collections = {
            "Airframe": create_collection("Airframe"),
            "Engine_Left": create_collection("Engine_Left"),
            "Engine_Right": create_collection("Engine_Right")
        }
    
    # Import Aircraft
    aircraft_objects = import_glb(aircraft_file, "Aircraft")
    move_to_collection(aircraft_objects, collections["Airframe"])
    
    # Get aircraft dimensions
    aircraft_bounds = get_aircraft_bounds(aircraft_objects)
    print(f"\n📏 Aircraft bounds: Y={aircraft_bounds['min'][1]:.2f} to {aircraft_bounds['max'][1]:.2f}")
    
    if aircraft_type == "single":
        # F-35: Single engine centered
        engine_center = import_glb(engine_file, "Engine_C")
        move_to_collection(engine_center, collections["Engine_Center"])
        position_engine(engine_center, aircraft_bounds, "single", "center")
    else:
        # A-10: Twin engines
        # Import LEFT engine
        engine_left = import_glb(engine_file, "Engine_L")
        move_to_collection(engine_left, collections["Engine_Left"])
        position_engine(engine_left, aircraft_bounds, "twin", "left")
        
        # Import RIGHT engine
        engine_right = import_glb(engine_file, "Engine_R")
        move_to_collection(engine_right, collections["Engine_Right"])
        position_engine(engine_right, aircraft_bounds, "twin", "right")
    
    # Create exploded view if requested
    if explode_distance > 0:
        create_exploded_view(collections, aircraft_type, explode_distance)
        output_exploded = output_file.replace('.glb', '-exploded.glb')
        export_glb(output_exploded)
    
    # Export normal view
    if explode_distance > 0:
        # Reset positions for normal export
        if aircraft_type == "single":
            position_engine(engine_center, aircraft_bounds, "single", "center")
        else:
            position_engine(engine_left, aircraft_bounds, "twin", "left")
            position_engine(engine_right, aircraft_bounds, "twin", "right")
    
    export_glb(output_file)
    
    print(f"\n{'='*80}")
    print("✅ ENGINE INTEGRATION COMPLETE!")
    print('='*80)
    print(f"\nOutput files:")
    print(f"   - {os.path.basename(output_file)} (Normal view)")
    if explode_distance > 0:
        print(f"   - {os.path.basename(output_exploded)} (Exploded view)")
    print("")

if __name__ == "__main__":
    main()
