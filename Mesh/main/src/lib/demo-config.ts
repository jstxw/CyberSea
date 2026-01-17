    export interface DemoAnnotation {
    name: string;
    description: string;
    category: string;
    annotatedImage: string; // Path to image in public folder
    }

    export interface DemoModel {
    id: string;
    name: string;
    path: string; // Path to GLB file in public folder
    annotation: DemoAnnotation; // Single default annotation for the entire model
    }

    export const DEMO_MODELS: DemoModel[] = [
    {
        id: "demo-1",
        name: "Tactical UAV Drone",
        path: "/models/drone.glb",
        annotation: {
        name: "Tactical UAV Drone System",
        description: "Military-grade unmanned aerial vehicle featuring quad-rotor propulsion, advanced stabilization systems, and reconnaissance capabilities. Used for surveillance, intelligence gathering, and tactical operations. Note this is a demo annotation and actual diagram will depend on the object and mesh selected.",
        category: "Unmanned Aerial Vehicle",
        annotatedImage: "/annotations/drone-annotate.jpeg"
        }
    },
    {
        id: "demo-2",
        name: "F-16 Fighting Falcon",
        path: "/models/f16-model.glb",
        annotation: {
        name: "F-16 Fighting Falcon Multirole Fighter",
        description: "Fourth-generation multirole fighter aircraft designed for air-to-air combat and air-to-ground attack missions. Features advanced avionics, afterburning turbofan engine, and proven air superiority capabilities. Highly maneuverable with 9G capability. Primary armament includes AIM-9 Sidewinder missiles, AIM-120 AMRAAM, and M61 Vulcan 20mm cannon.",
        category: "Multirole Fighter Aircraft",
        annotatedImage: "/annotations/f16-annotate.jpeg"
        }
    }
    ];

    export const getDemoAnnotation = (modelId: string): DemoAnnotation | null => {
    const model = DEMO_MODELS.find(m => m.id === modelId);
    return model?.annotation || null;
    };
