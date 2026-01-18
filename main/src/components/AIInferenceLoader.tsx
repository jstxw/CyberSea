'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Zap, Scan, Box, Cpu, Activity, Search, FileText, CheckCircle, ChevronRight, Users, Fuel, DollarSign, Wrench, Gauge, Navigation } from 'lucide-react';
import { VehicleStats } from '@/lib/demo-config';

interface AIInferenceLoaderProps {
  onFinished?: () => void;
  objectName?: string;
  shouldClose?: boolean;
  scene?: THREE.Scene | null;
  camera?: THREE.PerspectiveCamera | null;
  renderer?: THREE.WebGLRenderer | null;
  composer?: any;
  allObjects?: THREE.Object3D[];
  controls?: OrbitControls | null;
  vehicleStats?: VehicleStats | null;
}

const STAGES = [
  { label: 'Initializing AI Engine', icon: Zap },
  { label: 'Scanning Mesh Geometry', icon: Scan },
  { label: 'Extracting Features', icon: Box },
  { label: 'Processing Vertices', icon: Cpu },
  { label: 'Analyzing Topology', icon: Activity },
  { label: 'Running Inference', icon: Search },
  { label: 'Generating Annotations', icon: FileText },
  { label: 'Finalizing Results', icon: CheckCircle },
];

export default function AIInferenceLoader({
  onFinished,
  objectName = 'Object',
  shouldClose = false,
  allObjects = [],
  controls,
  vehicleStats
}: AIInferenceLoaderProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentScanningIndex, setCurrentScanningIndex] = useState(-1);
  
  const originalMaterialsRef = useRef<Map<THREE.Mesh, THREE.Material | THREE.Material[]>>(new Map());
  const scanningMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const ghostMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  // Collect all meshes
  const allMeshes = allObjects.flatMap(obj => {
    const meshes: THREE.Mesh[] = [];
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        meshes.push(child as THREE.Mesh);
      }
    });
    return meshes;
  });

  // Initialize Materials
  useEffect(() => {
    if (!scanningMaterialRef.current) {
      scanningMaterialRef.current = new THREE.MeshStandardMaterial({
        color: 0x3B82F6, 
        emissive: 0x3B82F6,
        emissiveIntensity: 2.0,
        roughness: 0.2,
        metalness: 0.8,
        depthTest: true,
        depthWrite: true,
      });
    }
    
    if (!ghostMaterialRef.current) {
      ghostMaterialRef.current = new THREE.MeshStandardMaterial({
        color: 0x1D1E15,
        transparent: true,
        opacity: 0.1,
        wireframe: true,
        wireframeLinewidth: 1,
        depthTest: true,
        depthWrite: true,
      });
    }

    return () => {
      scanningMaterialRef.current?.dispose();
      ghostMaterialRef.current?.dispose();
    };
  }, []);

  // Store Originals & Apply Ghost
  useEffect(() => {
    if (allMeshes.length === 0 || !ghostMaterialRef.current) return;

    allMeshes.forEach((mesh) => {
      if (!originalMaterialsRef.current.has(mesh)) {
        originalMaterialsRef.current.set(mesh, mesh.material);
      }
      mesh.material = ghostMaterialRef.current!;
    });

    return () => {
      // Cleanup handled in final cleanup effect
    };
  }, [allMeshes]);

  // Scanning Logic
  useEffect(() => {
    if (allMeshes.length === 0) return;

    const scanInterval = setInterval(() => {
      setCurrentScanningIndex((prev) => {
        // Restore previous
        if (prev >= 0 && prev < allMeshes.length) {
          const prevMesh = allMeshes[prev];
          if (ghostMaterialRef.current) {
            prevMesh.material = ghostMaterialRef.current;
          }
        }

        // Next
        let next = prev + 1;
        if (next >= allMeshes.length) {
          next = 0;
        }

        // Highlight
        const currentMesh = allMeshes[next];
        if (currentMesh && scanningMaterialRef.current) {
          currentMesh.material = scanningMaterialRef.current;
        }

        return next;
      });
    }, 800);

    return () => clearInterval(scanInterval);
  }, [allMeshes]);

  // Controls - Auto Rotate
  useEffect(() => {
    if (!controls) return;

    const initialAutoRotate = controls.autoRotate;
    const initialAutoRotateSpeed = controls.autoRotateSpeed;
    const initialEnableZoom = controls.enableZoom;
    const initialEnableRotate = controls.enableRotate;
    const initialEnablePan = controls.enablePan;

    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controls.enableZoom = false;
    controls.enableRotate = false;
    controls.enablePan = false;

    return () => {
      if (controls) {
        controls.autoRotate = initialAutoRotate;
        controls.autoRotateSpeed = initialAutoRotateSpeed;
        controls.enableZoom = initialEnableZoom;
        controls.enableRotate = initialEnableRotate;
        controls.enablePan = initialEnablePan;
      }
    };
  }, [controls]);

  // Progress & Stages
  useEffect(() => {
    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 1200);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99) return 99;
        const diff = 100 - prev;
        return prev + (diff * 0.02) + 0.05;
      });
    }, 50);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  // Completion
  useEffect(() => {
    if (shouldClose) {
      setProgress(100);
      setCurrentStage(STAGES.length - 1);
      
      allMeshes.forEach((mesh) => {
        const original = originalMaterialsRef.current.get(mesh);
        if (original) {
          mesh.material = original;
        }
      });

      setTimeout(() => {
        if (onFinished) onFinished();
      }, 600);
    }
  }, [shouldClose, onFinished, allMeshes]);

  // Unmount Cleanup
  useEffect(() => {
    return () => {
      allMeshes.forEach((mesh) => {
        const original = originalMaterialsRef.current.get(mesh);
        if (original) {
          mesh.material = original;
        }
      });
    };
  }, [allMeshes]);

  const currentMesh = currentScanningIndex >= 0 && currentScanningIndex < allMeshes.length 
    ? allMeshes[currentScanningIndex] 
    : null;
  const currentMeshName = currentMesh ? ((currentMesh as any).userData?.name || `Mesh ${currentScanningIndex + 1}`) : 'Initializing...';

  const currentStageData = STAGES[currentStage];
  const nextStageData = currentStage < STAGES.length - 1 ? STAGES[currentStage + 1] : null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Left Panel - Primary Context */}
      <div className="absolute top-0 bottom-0 left-0 w-72 bg-[#0a0a0a] border-r border-[#E5E6DA]/20 p-6 flex flex-col gap-6 pointer-events-auto">
        {/* Target Object - Primary */}
        <div className="space-y-3">
          <div className="text-[9px] text-[#E5E6DA]/50 uppercase tracking-widest font-mono">TARGET OBJECT</div>
          <div className="text-2xl font-mono text-[#E5E6DA] font-bold leading-tight break-words">
            {objectName || 'Unknown Component'}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#E5E6DA]/10"></div>

        {/* Current Scan - Secondary */}
        <div className="space-y-2">
          <div className="text-[9px] text-[#E5E6DA]/40 uppercase tracking-widest font-mono">CURRENT SCAN</div>
          <div className="text-sm font-mono text-[#E5E6DA]/70 break-all">
            {currentMeshName}
          </div>
          <div className="h-px w-full bg-[#E5E6DA]/10 mt-2 overflow-hidden relative">
            <motion.div 
              className="absolute inset-0 bg-[#3B82F6]"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>

        {/* Telemetry - Visually De-emphasized */}
        <div className="mt-auto pt-6 border-t border-[#E5E6DA]/10">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1D1E15]/50 p-3 border border-[#E5E6DA]/5">
              <div className="text-[9px] text-[#E5E6DA]/30 mb-1 uppercase tracking-widest font-mono">MESHES</div>
              <div className="text-base font-mono text-[#E5E6DA]/50 font-light">{allMeshes.length}</div>
            </div>
            <div className="bg-[#1D1E15]/50 p-3 border border-[#E5E6DA]/5">
              <div className="text-[9px] text-[#E5E6DA]/30 mb-1 uppercase tracking-widest font-mono">STAGE</div>
              <div className="text-base font-mono text-[#E5E6DA]/50 font-light">{currentStage + 1}/{STAGES.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Simplified Pipeline */}
      <div className="absolute top-0 bottom-0 right-0 w-64 bg-[#0a0a0a] border-l border-[#E5E6DA]/20 p-6 flex flex-col pointer-events-auto">
        <div className="text-[9px] text-[#E5E6DA]/50 uppercase tracking-widest font-mono mb-6">PROCESSING PIPELINE</div>
        
        <div className="space-y-4">
          {/* Current Step - High Contrast */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#3B82F6] text-[#0a0a0a] rounded-sm">
                <currentStageData.icon size={16} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-mono uppercase text-[#3B82F6] tracking-wider font-bold">
                  {currentStageData.label}
                </div>
                <div className="text-[9px] font-mono text-[#E5E6DA]/40 mt-0.5">
                  STAGE {currentStage + 1} OF {STAGES.length}
                </div>
              </div>
            </div>
            {/* Progress bar for current step */}
            <div className="h-1 w-full bg-[#1D1E15] overflow-hidden">
              <motion.div 
                className="h-full bg-[#3B82F6]"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((progress / STAGES.length) * 100, 100)}%` }}
                transition={{ ease: "linear" }}
              />
            </div>
          </div>

          {/* Next Step - Subtle */}
          {nextStageData && (
            <div className="space-y-2 pt-2 border-t border-[#E5E6DA]/10">
              <div className="text-[9px] text-[#E5E6DA]/30 uppercase tracking-widest font-mono mb-2">NEXT</div>
              <div className="flex items-center gap-3 opacity-50">
                <div className="p-2 bg-[#1D1E15] text-[#E5E6DA]/40 rounded-sm border border-[#E5E6DA]/10">
                  <nextStageData.icon size={14} strokeWidth={2} />
                </div>
                <div className="text-[10px] font-mono uppercase text-[#E5E6DA]/40 tracking-wide">
                  {nextStageData.label}
                </div>
              </div>
            </div>
          )}

          {/* Collapsed Steps - Minimal */}
          {currentStage < STAGES.length - 2 && (
            <div className="pt-4 border-t border-[#E5E6DA]/10">
              <div className="text-[9px] text-[#E5E6DA]/20 uppercase tracking-widest font-mono mb-2">
                REMAINING: {STAGES.length - currentStage - 2} STEPS
              </div>
            </div>
          )}
        </div>

        {/* Vehicle Statistics */}
        {vehicleStats && (
          <div className="mt-auto pt-6 border-t border-[#E5E6DA]/10">
            <div className="text-[9px] text-[#E5E6DA]/50 uppercase tracking-widest font-mono mb-4">VEHICLE SPECIFICATIONS</div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users size={12} className="text-[#3B82F6]" />
                <div className="flex-1">
                  <div className="text-[8px] text-[#E5E6DA]/40 uppercase tracking-widest font-mono">Crew</div>
                  <div className="text-[11px] text-[#E5E6DA]/80 font-mono">{vehicleStats.crew}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Fuel size={12} className="text-[#3B82F6]" />
                <div className="flex-1">
                  <div className="text-[8px] text-[#E5E6DA]/40 uppercase tracking-widest font-mono">Fuel Capacity</div>
                  <div className="text-[11px] text-[#E5E6DA]/80 font-mono">{vehicleStats.fuelCapacity}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign size={12} className="text-[#3B82F6]" />
                <div className="flex-1">
                  <div className="text-[8px] text-[#E5E6DA]/40 uppercase tracking-widest font-mono">Unit Cost</div>
                  <div className="text-[11px] text-[#E5E6DA]/80 font-mono">{vehicleStats.unitCost}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wrench size={12} className="text-[#3B82F6]" />
                <div className="flex-1">
                  <div className="text-[8px] text-[#E5E6DA]/40 uppercase tracking-widest font-mono">Maintenance</div>
                  <div className="text-[11px] text-[#E5E6DA]/80 font-mono">{vehicleStats.maintenanceCost}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Gauge size={12} className="text-[#3B82F6]" />
                <div className="flex-1">
                  <div className="text-[8px] text-[#E5E6DA]/40 uppercase tracking-widest font-mono">Max Speed</div>
                  <div className="text-[11px] text-[#E5E6DA]/80 font-mono">{vehicleStats.maxSpeed}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Navigation size={12} className="text-[#3B82F6]" />
                <div className="flex-1">
                  <div className="text-[8px] text-[#E5E6DA]/40 uppercase tracking-widest font-mono">Range</div>
                  <div className="text-[11px] text-[#E5E6DA]/80 font-mono">{vehicleStats.range}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Center Viewport - Status Overlay */}
      <div className="absolute top-0 bottom-0 left-72 right-64 pointer-events-auto cursor-wait">
        {/* In-Viewport Status Overlay - Military Style */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-[#0a0a0a]/95 border-2 border-[#3B82F6] p-8 max-w-md w-full mx-4 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            {/* Status Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-[#3B82F6] animate-pulse"></div>
              <div className="text-[10px] font-mono uppercase text-[#E5E6DA]/50 tracking-widest">
                ANALYSIS ACTIVE
              </div>
            </div>

            {/* Current Step Display */}
            <div className="space-y-4">
              <div>
                <div className="text-[9px] font-mono uppercase text-[#E5E6DA]/40 tracking-widest mb-2">
                  CURRENT OPERATION
                </div>
                <div className="text-xl font-mono text-[#3B82F6] font-bold uppercase tracking-wide leading-tight">
                  {currentStageData.label}
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[9px] font-mono text-[#E5E6DA]/50 uppercase tracking-widest">
                  <span>STAGE {currentStage + 1} OF {STAGES.length}</span>
                  <span>{Math.floor(progress)}%</span>
                </div>
                <div className="h-2 w-full bg-[#1D1E15] border border-[#E5E6DA]/10 overflow-hidden">
                  <motion.div 
                    className="h-full bg-[#3B82F6]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear" }}
                  />
                </div>
              </div>

              {/* Diagnostic Info */}
              <div className="pt-4 border-t border-[#E5E6DA]/10">
                <div className="text-[9px] font-mono uppercase text-[#E5E6DA]/30 tracking-widest mb-1">
                  SCANNING: {currentMeshName}
                </div>
                <div className="text-[9px] font-mono text-[#E5E6DA]/30 tracking-widest">
                  MESHES PROCESSED: {currentScanningIndex + 1} / {allMeshes.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle Diagnostic Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(#3B82F6 1px, transparent 1px),
              linear-gradient(90deg, #3B82F6 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
      </div>
    </div>
  );
}
