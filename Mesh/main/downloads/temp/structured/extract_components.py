
import FreeCAD
import Import
import Mesh
import os

print("="*80)
print("FREECAD COMPONENT EXTRACTOR")
print("="*80)

# Import STEP file
print("\nImporting STEP file...")
doc = FreeCAD.newDocument("Parser")
Import.insert("C:/Users/aclie/Mesh/Mesh/main/downloads/cad/a10-warthog.stp", doc.Name)

print(f"Loaded {len(doc.Objects)} objects\n")

# Create output directory
output_dir = "C:/Users/aclie/Mesh/Mesh/main/downloads/temp/structured"
os.makedirs(output_dir, exist_ok=True)

# Export each component separately
components = []

for i, obj in enumerate(doc.Objects):
    if hasattr(obj, 'Shape') and obj.Shape.Faces:
        name = obj.Label if obj.Label else f"Component_{i}"
        print(f"Processing: {name} ({len(obj.Shape.Faces)} faces)")
        
        # High-quality tessellation
        mesh = Mesh.Mesh(obj.Shape.tessellate(0.01, 5.0))
        
        # Export as OBJ
        filename = f"{i:03d}_{name.replace(' ', '_').replace('/', '_')}.obj"
        filepath = os.path.join(output_dir, filename)
        mesh.export(filepath)
        
        # Get bounding box
        bbox = obj.Shape.BoundBox
        
        components.append({
            'id': f"component_{i}",
            'name': name,
            'file': filename,
            'faces': len(obj.Shape.Faces),
            'bbox': {
                'min': [bbox.XMin, bbox.YMin, bbox.ZMin],
                'max': [bbox.XMax, bbox.YMax, bbox.ZMax]
            }
        })

print(f"\n✅ Exported {len(components)} components")

# Save metadata
import json
metadata = {
    'model': 'A-10 Thunderbolt II',
    'source': "a10-warthog.stp",
    'components': components
}

with open(os.path.join(output_dir, 'metadata.json'), 'w') as f:
    json.dump(metadata, f, indent=2)

print("✅ Metadata saved")
