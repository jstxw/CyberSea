/**
 * Centralized Model Registry
 * Maps model IDs to their file paths and metadata
 */

export interface ModelDefinition {
  id: string;
  name: string;
  path: string; // Path relative to /public/models/
  displayName: string; // Human-readable name for UI
}

export const MODEL_REGISTRY: Record<string, ModelDefinition> = {
  // Use DEMO_MODELS IDs for compatibility
  'demo-1': {
    id: 'demo-1',
    name: 'Tactical UAV Drone',
    path: '/models/drone.glb',
    displayName: 'Tactical UAV Drone',
  },
  'demo-2': {
    id: 'demo-2',
    name: 'A-10 Thunderbolt II',
    path: '/models/a10.glb',
    displayName: 'A-10 Thunderbolt II "Warthog"',
  },
  'demo-3': {
    id: 'demo-3',
    name: 'F/A-18F Super Hornet',
    path: '/models/f18.glb',
    displayName: 'F/A-18F Super Hornet',
  },
  'demo-4': {
    id: 'demo-4',
    name: 'F-35 Lightning II',
    path: '/models/f35.glb',
    displayName: 'F-35 Lightning II',
  },
  'demo-5': {
    id: 'demo-5',
    name: 'F-15E Strike Eagle',
    path: '/models/f15.glb',
    displayName: 'F-15E Strike Eagle',
  },
  'demo-6': {
    id: 'demo-6',
    name: 'MQ-9 Reaper',
    path: '/models/reaper.glb',
    displayName: 'MQ-9 Reaper',
  },
  'demo-7': {
    id: 'demo-7',
    name: 'SH-60B Seahawk',
    path: '/models/seahawk.glb',
    displayName: 'SH-60B Seahawk',
  },
  'demo-8': {
    id: 'demo-8',
    name: 'T-90 Main Battle Tank',
    path: '/models/t-90.glb',
    displayName: 'T-90 Main Battle Tank',
  },
  'demo-9': {
    id: 'demo-9',
    name: 'Arleigh Burke-class Destroyer',
    path: '/models/destroyer.glb',
    displayName: 'Arleigh Burke-class Destroyer',
  },
  'demo-10': {
    id: 'demo-10',
    name: 'M1025 HMMWV',
    path: '/models/hmmwv_m998a1_soft_top/scene.gltf',
    displayName: 'M1025 HMMWV (Humvee)',
  },
  // Also support simple IDs for convenience
  'drone': {
    id: 'demo-1',
    name: 'Tactical UAV Drone',
    path: '/models/drone.glb',
    displayName: 'Tactical UAV Drone',
  },
  'a10': {
    id: 'demo-2',
    name: 'A-10 Thunderbolt II',
    path: '/models/a10.glb',
    displayName: 'A-10 Thunderbolt II "Warthog"',
  },
  'f18': {
    id: 'demo-3',
    name: 'F/A-18F Super Hornet',
    path: '/models/f18.glb',
    displayName: 'F/A-18F Super Hornet',
  },
  'f35': {
    id: 'demo-4',
    name: 'F-35 Lightning II',
    path: '/models/f35.glb',
    displayName: 'F-35 Lightning II',
  },
  'f15': {
    id: 'demo-5',
    name: 'F-15E Strike Eagle',
    path: '/models/f15.glb',
    displayName: 'F-15E Strike Eagle',
  },
  'reaper': {
    id: 'demo-6',
    name: 'MQ-9 Reaper',
    path: '/models/reaper.glb',
    displayName: 'MQ-9 Reaper',
  },
  'seahawk': {
    id: 'demo-7',
    name: 'SH-60B Seahawk',
    path: '/models/seahawk.glb',
    displayName: 'SH-60B Seahawk',
  },
  't90': {
    id: 'demo-8',
    name: 'T-90 Main Battle Tank',
    path: '/models/t-90.glb',
    displayName: 'T-90 Main Battle Tank',
  },
  'destroyer': {
    id: 'demo-9',
    name: 'Arleigh Burke-class Destroyer',
    path: '/models/destroyer.glb',
    displayName: 'Arleigh Burke-class Destroyer',
  },
  'humvee': {
    id: 'demo-10',
    name: 'M1025 HMMWV',
    path: '/models/hmmwv_m998a1_soft_top/scene.gltf',
    displayName: 'M1025 HMMWV (Humvee)',
  },
};

/**
 * Get model definition by ID
 */
export function getModelById(id: string): ModelDefinition | undefined {
  return MODEL_REGISTRY[id];
}

/**
 * Get all available models as an array (unique by ID)
 */
export function getAllModels(): ModelDefinition[] {
  const seen = new Set<string>();
  const models: ModelDefinition[] = [];
  for (const model of Object.values(MODEL_REGISTRY)) {
    if (!seen.has(model.id)) {
      seen.add(model.id);
      models.push(model);
    }
  }
  return models;
}

/**
 * Check if a model ID exists in the registry
 */
export function hasModel(id: string): boolean {
  return id in MODEL_REGISTRY;
}
