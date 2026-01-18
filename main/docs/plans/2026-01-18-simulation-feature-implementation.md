# Arctic Patrol Simulation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a SIMULATE button to model viewer that launches a 3D Arctic patrol simulation with the selected asset.

**Architecture:** Split-view page with 3D globe (70%) showing Arctic patrol and command dashboard (30%) with real-time stats. Reuses existing Globe.tsx, extends with patrol routes, markers, and animation. Pre-scripted timeline for demo reliability.

**Tech Stack:** Next.js 15, React, Three.js, TypeScript, Tailwind CSS

---

## Task 1: Add SIMULATE Button to ModelViewer

**Files:**
- Modify: `/Users/jstwx07/Desktop/projects/Mesh/main/src/components/ModelViewer.tsx:1856-1857`

**Step 1: Add the SIMULATE button after the Wireframe/Solid toggle**

Find line 1856 (after the `</div>` closing the Wireframe/Solid button group) and add the simulate button:

```tsx
              </div>
              <Link
                href={`/simulation?asset=${currentDemoModelId || 'demo-2'}`}
                className="h-[32px] px-3 bg-[#3B82F6] border border-[#3B82F6] text-white text-[10px] font-bold hover:bg-[#2563EB] transition-colors flex items-center gap-1.5 uppercase tracking-wide cursor-pointer"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="none"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Simulate
              </Link>
              <button
                onClick={exportGLB}
```

**Step 2: Verify Link import exists at top of file**

Check line ~4 for `import Link from "next/link";` - it should already be there.

**Step 3: Test the button appears**

Run: `cd /Users/jstwx07/Desktop/projects/Mesh/main && npm run dev`
Open: http://localhost:3000/dashboard
Expected: Blue SIMULATE button visible between Wireframe/Solid toggle and Export button

**Step 4: Commit**

```bash
cd /Users/jstwx07/Desktop/projects/Mesh/main && git add src/components/ModelViewer.tsx && git commit -m "feat: add SIMULATE button to model viewer"
```

---

## Task 2: Create Simulation Page Layout

**Files:**
- Create: `/Users/jstwx07/Desktop/projects/Mesh/main/src/app/simulation/page.tsx`

**Step 1: Create the simulation directory and page**

```tsx
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const SimulationContent = dynamic(() => import('@/components/simulation/SimulationContent'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-white/50 text-sm">Loading simulation...</div>
    </div>
  ),
});

function SimulationPageContent() {
  const searchParams = useSearchParams();
  const assetId = searchParams.get('asset') || 'demo-2';

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-mono flex flex-col overflow-hidden">
      {/* Header */}
      <nav className="px-0 h-12 flex justify-between items-center bg-black z-50 border-b border-white/10">
        <div className="flex items-center h-full flex-1">
          <Link
            href="/dashboard"
            className="px-4 h-full flex items-center gap-2 text-[10px] font-medium uppercase tracking-wide text-[#E5E6DA]/60 hover:text-[#E5E6DA] hover:bg-white/5 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Viewer
          </Link>
          <div className="w-px h-6 bg-[#E5E6DA]/20"></div>
          <div className="px-4 text-[10px] font-medium uppercase tracking-wide text-[#E5E6DA]">
            Arctic Patrol Simulation
          </div>
        </div>
        <div className="flex items-center gap-4 px-4">
          <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse"></div>
          <div className="text-[10px] uppercase tracking-widest opacity-50 text-[#E5E6DA]">Simulation Active</div>
        </div>
      </nav>

      {/* Main Content - Split View */}
      <div className="flex-1 flex">
        <SimulationContent assetId={assetId} />
      </div>
    </div>
  );
}

export default function SimulationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/50">Loading...</div>}>
      <SimulationPageContent />
    </Suspense>
  );
}
```

**Step 2: Test the route exists**

Run: `npm run dev`
Open: http://localhost:3000/simulation?asset=demo-2
Expected: Page loads with header, shows "Loading simulation..." placeholder

**Step 3: Commit**

```bash
git add src/app/simulation/page.tsx && git commit -m "feat: create simulation page route and layout"
```

---

## Task 3: Create Simulation Data Configuration

**Files:**
- Create: `/Users/jstwx07/Desktop/projects/Mesh/main/src/lib/simulation-data.ts`

**Step 1: Create the simulation data file with Arctic coordinates, routes, and timeline**

```typescript
// Arctic patrol simulation configuration

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PointOfInterest {
  id: string;
  name: string;
  type: 'base' | 'port' | 'resource';
  coordinates: Coordinates;
}

export interface TradeRoute {
  id: string;
  name: string;
  points: Coordinates[];
  color: string;
}

export interface TimelineEvent {
  time: number; // seconds from start
  type: 'deploy' | 'route_start' | 'contact' | 'weather' | 'fuel_warning' | 'route_complete' | 'return' | 'mission_complete';
  message: string;
  data?: {
    routeId?: string;
    fuelPercent?: number;
    contactType?: string;
    weatherType?: string;
  };
}

// Canadian Arctic points of interest
export const POINTS_OF_INTEREST: PointOfInterest[] = [
  { id: 'cfs-alert', name: 'CFS Alert', type: 'base', coordinates: { lat: 82.5, lng: -62.3 } },
  { id: 'resolute', name: 'Resolute Bay', type: 'port', coordinates: { lat: 74.7, lng: -94.8 } },
  { id: 'iqaluit', name: 'Iqaluit', type: 'port', coordinates: { lat: 63.7, lng: -68.5 } },
  { id: 'tuktoyaktuk', name: 'Tuktoyaktuk', type: 'port', coordinates: { lat: 69.4, lng: -133.0 } },
  { id: 'prudhoe', name: 'Prudhoe Bay', type: 'resource', coordinates: { lat: 70.3, lng: -148.4 } },
];

// Northwest Passage and Arctic trade routes
export const TRADE_ROUTES: TradeRoute[] = [
  {
    id: 'nwp-east',
    name: 'Northwest Passage - Eastern',
    points: [
      { lat: 63.7, lng: -68.5 },   // Iqaluit
      { lat: 66.5, lng: -61.0 },
      { lat: 70.0, lng: -65.0 },
      { lat: 74.7, lng: -80.0 },
      { lat: 74.7, lng: -94.8 },   // Resolute
    ],
    color: '#3B82F6',
  },
  {
    id: 'nwp-west',
    name: 'Northwest Passage - Western',
    points: [
      { lat: 74.7, lng: -94.8 },   // Resolute
      { lat: 72.0, lng: -110.0 },
      { lat: 70.5, lng: -120.0 },
      { lat: 69.4, lng: -133.0 },  // Tuktoyaktuk
    ],
    color: '#10B981',
  },
  {
    id: 'arctic-shipping',
    name: 'Arctic Shipping Lane',
    points: [
      { lat: 69.4, lng: -133.0 },  // Tuktoyaktuk
      { lat: 70.3, lng: -148.4 },  // Prudhoe Bay
      { lat: 71.0, lng: -156.0 },
    ],
    color: '#F59E0B',
  },
];

// Patrol path for the asset (combines routes)
export const PATROL_PATH: Coordinates[] = [
  { lat: 74.7, lng: -94.8 },   // Start: Resolute Bay
  { lat: 72.0, lng: -85.0 },
  { lat: 70.0, lng: -75.0 },
  { lat: 68.0, lng: -70.0 },
  { lat: 66.5, lng: -68.5 },   // Near Iqaluit
  { lat: 68.0, lng: -80.0 },
  { lat: 70.0, lng: -95.0 },
  { lat: 72.0, lng: -110.0 },
  { lat: 70.5, lng: -120.0 },
  { lat: 69.4, lng: -133.0 },  // Tuktoyaktuk
  { lat: 71.0, lng: -120.0 },
  { lat: 74.7, lng: -94.8 },   // Return: Resolute Bay
];

// Pre-scripted timeline (total ~4:30)
export const SIMULATION_TIMELINE: TimelineEvent[] = [
  { time: 0, type: 'deploy', message: 'Asset deployed from Resolute Bay' },
  { time: 30, type: 'route_start', message: 'Beginning eastern patrol sector', data: { routeId: 'nwp-east' } },
  { time: 45, type: 'contact', message: 'Contact detected - cargo vessel on route', data: { contactType: 'vessel' } },
  { time: 75, type: 'weather', message: 'Weather system approaching - ice drift detected', data: { weatherType: 'ice' } },
  { time: 105, type: 'route_start', message: 'Proceeding to western patrol sector', data: { routeId: 'nwp-west' } },
  { time: 135, type: 'fuel_warning', message: 'Fuel status: 50% remaining', data: { fuelPercent: 50 } },
  { time: 165, type: 'weather', message: 'Weather clearing - visibility improved', data: { weatherType: 'clear' } },
  { time: 195, type: 'contact', message: 'Contact detected - fishing vessel', data: { contactType: 'vessel' } },
  { time: 225, type: 'return', message: 'Return to base initiated' },
  { time: 270, type: 'mission_complete', message: 'Mission complete - patrol successful' },
];

export const SIMULATION_DURATION = 270; // seconds

// Asset speed configuration (used for interpolation)
export const ASSET_CONFIG = {
  cruiseSpeed: 350, // knots (for display)
  fuelBurnRate: 0.35, // percent per second at cruise
  detectionRadius: 150, // nm (for display)
};
```

**Step 2: Commit**

```bash
git add src/lib/simulation-data.ts && git commit -m "feat: add Arctic simulation data configuration"
```

---

## Task 4: Create Globe Utilities

**Files:**
- Modify: `/Users/jstwx07/Desktop/projects/Mesh/main/src/utils/coordinates.ts`

**Step 1: Add helper functions for globe operations**

```typescript
export function latLongToVector3(lat: number, long: number, radius: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = long * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));

  return [x, y, z];
}

// Interpolate between two coordinates along a great circle path
export function interpolateCoordinates(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  t: number // 0 to 1
): { lat: number; lng: number } {
  // Simple linear interpolation (good enough for short distances)
  return {
    lat: start.lat + (end.lat - start.lat) * t,
    lng: start.lng + (end.lng - start.lng) * t,
  };
}

// Get position along a path of coordinates
export function getPositionOnPath(
  path: { lat: number; lng: number }[],
  progress: number // 0 to 1
): { lat: number; lng: number; segmentIndex: number } {
  if (path.length < 2) return { ...path[0], segmentIndex: 0 };

  const totalSegments = path.length - 1;
  const scaledProgress = progress * totalSegments;
  const segmentIndex = Math.min(Math.floor(scaledProgress), totalSegments - 1);
  const segmentProgress = scaledProgress - segmentIndex;

  const start = path[segmentIndex];
  const end = path[segmentIndex + 1];

  return {
    ...interpolateCoordinates(start, end, segmentProgress),
    segmentIndex,
  };
}

// Calculate heading between two coordinates (for asset rotation)
export function calculateHeading(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number {
  const dLng = (to.lng - from.lng) * Math.PI / 180;
  const lat1 = from.lat * Math.PI / 180;
  const lat2 = to.lat * Math.PI / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  let heading = Math.atan2(y, x) * 180 / Math.PI;
  return (heading + 360) % 360;
}
```

**Step 2: Commit**

```bash
git add src/utils/coordinates.ts && git commit -m "feat: add globe coordinate utilities"
```

---

## Task 5: Create SimulationGlobe Component

**Files:**
- Create: `/Users/jstwx07/Desktop/projects/Mesh/main/src/components/simulation/SimulationGlobe.tsx`

**Step 1: Create the simulation directory**

```bash
mkdir -p /Users/jstwx07/Desktop/projects/Mesh/main/src/components/simulation
```

**Step 2: Create SimulationGlobe component**

```tsx
'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { latLongToVector3, getPositionOnPath, calculateHeading } from '@/utils/coordinates';
import { POINTS_OF_INTEREST, TRADE_ROUTES, PATROL_PATH } from '@/lib/simulation-data';

interface SimulationGlobeProps {
  progress: number; // 0 to 1
  isPlaying: boolean;
}

export default function SimulationGlobe({ progress, isPlaying }: SimulationGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const assetMarkerRef = useRef<THREE.Mesh | null>(null);
  const trailRef = useRef<THREE.Line | null>(null);
  const trailPointsRef = useRef<THREE.Vector3[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    // Position camera to focus on Arctic (North Pole view, tilted)
    camera.position.set(0, 3, 2.5);
    camera.lookAt(0, 0.8, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0a0a, 1);
    container.appendChild(renderer.domElement);

    // Globe
    const globeGeo = new THREE.SphereGeometry(1, 64, 64);
    const globeMat = new THREE.MeshStandardMaterial({
      color: 0x1a3a5c,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globe);

    // Solid inner globe for land/water effect
    const innerGlobeGeo = new THREE.SphereGeometry(0.99, 64, 64);
    const innerGlobeMat = new THREE.MeshStandardMaterial({
      color: 0x0a1a2e,
      transparent: true,
      opacity: 0.9,
    });
    const innerGlobe = new THREE.Mesh(innerGlobeGeo, innerGlobeMat);
    scene.add(innerGlobe);

    // Trade routes
    TRADE_ROUTES.forEach((route) => {
      const points = route.points.map((coord) => {
        const [x, y, z] = latLongToVector3(coord.lat, coord.lng, 1.02);
        return new THREE.Vector3(x, y, z);
      });
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.005, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: route.color,
        transparent: true,
        opacity: 0.6,
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(tube);
    });

    // Points of interest
    POINTS_OF_INTEREST.forEach((poi) => {
      const [x, y, z] = latLongToVector3(poi.coordinates.lat, poi.coordinates.lng, 1.02);

      // Marker
      const markerGeo = new THREE.SphereGeometry(0.015, 16, 16);
      const markerColor = poi.type === 'base' ? 0x3B82F6 : poi.type === 'port' ? 0x10B981 : 0xF59E0B;
      const markerMat = new THREE.MeshBasicMaterial({ color: markerColor });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(x, y, z);
      scene.add(marker);
    });

    // Asset marker (patrol aircraft)
    const assetGeo = new THREE.ConeGeometry(0.02, 0.04, 4);
    const assetMat = new THREE.MeshBasicMaterial({ color: 0xff4444 });
    const assetMarker = new THREE.Mesh(assetGeo, assetMat);
    assetMarker.rotation.x = Math.PI / 2;
    scene.add(assetMarker);
    assetMarkerRef.current = assetMarker;

    // Trail line
    const trailGeo = new THREE.BufferGeometry();
    const trailMat = new THREE.LineBasicMaterial({
      color: 0xff4444,
      transparent: true,
      opacity: 0.5,
    });
    const trail = new THREE.Line(trailGeo, trailMat);
    scene.add(trail);
    trailRef.current = trail;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Animation
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Slow rotation
      globe.rotation.y += 0.001;
      innerGlobe.rotation.y += 0.001;

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update asset position based on progress
  useEffect(() => {
    if (!assetMarkerRef.current || !trailRef.current) return;

    const position = getPositionOnPath(PATROL_PATH, progress);
    const [x, y, z] = latLongToVector3(position.lat, position.lng, 1.05);
    assetMarkerRef.current.position.set(x, y, z);

    // Update heading
    if (position.segmentIndex < PATROL_PATH.length - 1) {
      const nextPoint = PATROL_PATH[position.segmentIndex + 1];
      const heading = calculateHeading(position, nextPoint);
      assetMarkerRef.current.rotation.z = -heading * Math.PI / 180;
    }

    // Update trail
    const trailPoint = new THREE.Vector3(x, y, z);
    trailPointsRef.current.push(trailPoint);

    // Keep only last 100 points
    if (trailPointsRef.current.length > 100) {
      trailPointsRef.current.shift();
    }

    const trailGeo = new THREE.BufferGeometry().setFromPoints(trailPointsRef.current);
    trailRef.current.geometry.dispose();
    trailRef.current.geometry = trailGeo;
  }, [progress]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ background: 'radial-gradient(ellipse at center, #1a3a5c 0%, #0a0a0a 70%)' }}
    />
  );
}
```

**Step 3: Commit**

```bash
git add src/components/simulation/SimulationGlobe.tsx && git commit -m "feat: create SimulationGlobe component with Arctic view"
```

---

## Task 6: Create Command Dashboard Components

**Files:**
- Create: `/Users/jstwx07/Desktop/projects/Mesh/main/src/components/simulation/CommandDashboard.tsx`

**Step 1: Create the CommandDashboard component**

```tsx
'use client';

import { DEMO_MODELS } from '@/lib/demo-config';
import { TimelineEvent, ASSET_CONFIG } from '@/lib/simulation-data';

interface CommandDashboardProps {
  assetId: string;
  elapsedTime: number;
  progress: number;
  events: TimelineEvent[];
  currentEventIndex: number;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function CommandDashboard({
  assetId,
  elapsedTime,
  progress,
  events,
  currentEventIndex,
}: CommandDashboardProps) {
  const asset = DEMO_MODELS.find((m) => m.id === assetId);
  const fuelRemaining = Math.max(0, 100 - elapsedTime * ASSET_CONFIG.fuelBurnRate);
  const distanceCovered = Math.round(progress * 1200); // Approximate nm
  const areaCovered = Math.round(progress * 100);
  const routesMonitored = Math.min(3, Math.floor(progress * 5) + 1);

  // Get heading based on progress
  const heading = Math.round((progress * 360) % 360);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] text-[#E5E6DA] overflow-hidden">
      {/* Mission Clock */}
      <div className="p-4 border-b border-white/10">
        <div className="text-[10px] uppercase tracking-wider opacity-50 mb-1">Mission Clock</div>
        <div className="text-3xl font-mono font-bold text-[#3B82F6]">{formatTime(elapsedTime)}</div>
      </div>

      {/* Resource Tracking */}
      <div className="p-4 border-b border-white/10">
        <div className="text-[10px] uppercase tracking-wider opacity-50 mb-3">Resource Tracking</div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="opacity-70">Fuel</span>
              <span className={fuelRemaining < 30 ? 'text-red-400' : ''}>{Math.round(fuelRemaining)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded">
              <div
                className={`h-full rounded transition-all ${fuelRemaining < 30 ? 'bg-red-400' : 'bg-[#3B82F6]'}`}
                style={{ width: `${fuelRemaining}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs">
            <span className="opacity-70">Distance</span>
            <span>{distanceCovered} nm</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="opacity-70">Time on Station</span>
            <span>{formatTime(elapsedTime)}</span>
          </div>
        </div>
      </div>

      {/* Coverage Stats */}
      <div className="p-4 border-b border-white/10">
        <div className="text-[10px] uppercase tracking-wider opacity-50 mb-3">Coverage Stats</div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="opacity-70">Area Covered</span>
            <span>{areaCovered}%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="opacity-70">Detection Prob</span>
            <span>{Math.min(95, 60 + Math.round(progress * 35))}%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="opacity-70">Routes Monitored</span>
            <span>{routesMonitored}/3</span>
          </div>
        </div>
      </div>

      {/* Asset Status */}
      <div className="p-4 border-b border-white/10">
        <div className="text-[10px] uppercase tracking-wider opacity-50 mb-3">Asset Status</div>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-[#3B82F6]/20 border border-[#3B82F6]/50 rounded flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold">{asset?.name || 'Unknown Asset'}</div>
            <div className="text-[10px] text-[#10B981] uppercase">Active</div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="opacity-50">Heading</span>
            <div>{heading.toString().padStart(3, '0')}°</div>
          </div>
          <div>
            <span className="opacity-50">Speed</span>
            <div>{asset?.stats.maxSpeed || '350 kts'}</div>
          </div>
        </div>
      </div>

      {/* Event Log */}
      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        <div className="text-[10px] uppercase tracking-wider opacity-50 mb-3">Event Log</div>
        <div className="flex-1 overflow-y-auto space-y-2">
          {events.slice(0, currentEventIndex + 1).reverse().map((event, idx) => (
            <div
              key={idx}
              className={`text-xs flex gap-2 ${idx === 0 ? 'text-[#3B82F6]' : 'opacity-70'}`}
            >
              <span className="font-mono w-12 shrink-0">{formatTime(event.time)}</span>
              <span className="shrink-0">
                {event.type === 'contact' && '⚠'}
                {event.type === 'weather' && '☁'}
                {event.type === 'fuel_warning' && '⛽'}
                {event.type === 'mission_complete' && '✓'}
                {event.type === 'deploy' && '▶'}
                {event.type === 'route_start' && '→'}
                {event.type === 'return' && '↩'}
              </span>
              <span>{event.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/simulation/CommandDashboard.tsx && git commit -m "feat: create CommandDashboard component"
```

---

## Task 7: Create Playback Controls Component

**Files:**
- Create: `/Users/jstwx07/Desktop/projects/Mesh/main/src/components/simulation/PlaybackControls.tsx`

**Step 1: Create PlaybackControls component**

```tsx
'use client';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onRestart: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  progress: number;
  duration: number;
  elapsedTime: number;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function PlaybackControls({
  isPlaying,
  onPlayPause,
  onRestart,
  speed,
  onSpeedChange,
  progress,
  duration,
  elapsedTime,
}: PlaybackControlsProps) {
  return (
    <div className="h-14 bg-[#0a0a0a] border-t border-white/10 flex items-center px-4 gap-4">
      {/* Restart */}
      <button
        onClick={onRestart}
        className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
        title="Restart"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" />
          <path d="M3 3v5h5" />
        </svg>
      </button>

      {/* Play/Pause */}
      <button
        onClick={onPlayPause}
        className="w-10 h-10 flex items-center justify-center bg-[#3B82F6] text-white rounded hover:bg-[#2563EB] transition-colors"
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
      </button>

      {/* Speed */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider opacity-50">Speed</span>
        <select
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="bg-white/10 border border-white/20 text-white text-xs px-2 py-1 rounded cursor-pointer"
        >
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={4}>4x</option>
        </select>
      </div>

      {/* Progress Bar */}
      <div className="flex-1 flex items-center gap-3">
        <div className="flex-1 h-1 bg-white/10 rounded overflow-hidden">
          <div
            className="h-full bg-[#3B82F6] transition-all duration-100"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className="text-xs font-mono text-white/70 w-24 text-right">
          {formatTime(elapsedTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/simulation/PlaybackControls.tsx && git commit -m "feat: create PlaybackControls component"
```

---

## Task 8: Create SimulationContent Container

**Files:**
- Create: `/Users/jstwx07/Desktop/projects/Mesh/main/src/components/simulation/SimulationContent.tsx`

**Step 1: Create the main SimulationContent component that ties everything together**

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import SimulationGlobe from './SimulationGlobe';
import CommandDashboard from './CommandDashboard';
import PlaybackControls from './PlaybackControls';
import { SIMULATION_TIMELINE, SIMULATION_DURATION } from '@/lib/simulation-data';

interface SimulationContentProps {
  assetId: string;
}

export default function SimulationContent({ assetId }: SimulationContentProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [currentEventIndex, setCurrentEventIndex] = useState(-1);

  const progress = Math.min(elapsedTime / SIMULATION_DURATION, 1);

  // Update current event based on elapsed time
  useEffect(() => {
    const newEventIndex = SIMULATION_TIMELINE.findIndex(
      (event, idx) =>
        event.time <= elapsedTime &&
        (idx === SIMULATION_TIMELINE.length - 1 || SIMULATION_TIMELINE[idx + 1].time > elapsedTime)
    );
    if (newEventIndex !== currentEventIndex) {
      setCurrentEventIndex(newEventIndex);
    }
  }, [elapsedTime, currentEventIndex]);

  // Playback loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => {
        const next = prev + 0.1 * speed;
        if (next >= SIMULATION_DURATION) {
          setIsPlaying(false);
          return SIMULATION_DURATION;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  const handlePlayPause = useCallback(() => {
    if (elapsedTime >= SIMULATION_DURATION) {
      // Restart if at end
      setElapsedTime(0);
      setCurrentEventIndex(-1);
    }
    setIsPlaying((prev) => !prev);
  }, [elapsedTime]);

  const handleRestart = useCallback(() => {
    setElapsedTime(0);
    setCurrentEventIndex(-1);
    setIsPlaying(false);
  }, []);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex">
        {/* Globe View - 70% */}
        <div className="w-[70%] relative">
          <SimulationGlobe progress={progress} isPlaying={isPlaying} />

          {/* Globe overlay info */}
          <div className="absolute top-4 left-4 text-[10px] uppercase tracking-wider text-white/50">
            Canadian Arctic Patrol Zone
          </div>
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-[#10B981] animate-pulse' : 'bg-white/30'}`} />
            <span className="text-[10px] uppercase tracking-wider text-white/50">
              {isPlaying ? 'Live' : 'Paused'}
            </span>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm p-3 rounded border border-white/10">
            <div className="text-[10px] uppercase tracking-wider text-white/50 mb-2">Legend</div>
            <div className="space-y-1 text-[10px]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-[#3B82F6]" />
                <span className="text-white/70">NW Passage East</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-[#10B981]" />
                <span className="text-white/70">NW Passage West</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-[#F59E0B]" />
                <span className="text-white/70">Arctic Shipping</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                <span className="text-white/70">Base</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="text-white/70">Port</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span className="text-white/70">Resource</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard - 30% */}
        <div className="w-[30%] border-l border-white/10">
          <CommandDashboard
            assetId={assetId}
            elapsedTime={elapsedTime}
            progress={progress}
            events={SIMULATION_TIMELINE}
            currentEventIndex={currentEventIndex}
          />
        </div>
      </div>

      {/* Playback Controls */}
      <PlaybackControls
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onRestart={handleRestart}
        speed={speed}
        onSpeedChange={handleSpeedChange}
        progress={progress}
        duration={SIMULATION_DURATION}
        elapsedTime={elapsedTime}
      />
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/simulation/SimulationContent.tsx && git commit -m "feat: create SimulationContent container component"
```

---

## Task 9: Final Integration Test

**Step 1: Run the development server**

```bash
cd /Users/jstwx07/Desktop/projects/Mesh/main && npm run dev
```

**Step 2: Test the full flow**

1. Open http://localhost:3000/dashboard
2. Select an asset from the dropdown (e.g., A-10 Thunderbolt)
3. Click the blue SIMULATE button
4. Verify the simulation page loads with:
   - 3D Arctic globe on the left (70%)
   - Command dashboard on the right (30%)
   - Playback controls at the bottom
5. Click Play and verify:
   - Asset marker moves along patrol path
   - Fuel decreases
   - Events appear in log at correct times
   - Progress bar advances
6. Test speed changes (1x, 2x, 4x)
7. Test restart button
8. Click "Back to Viewer" and verify navigation works

**Step 3: Fix any issues found during testing**

**Step 4: Final commit**

```bash
git add -A && git commit -m "feat: complete Arctic patrol simulation feature"
```

---

## Summary

**Files created:**
- `src/app/simulation/page.tsx` - Simulation route
- `src/lib/simulation-data.ts` - Arctic coordinates, routes, timeline
- `src/components/simulation/SimulationGlobe.tsx` - 3D globe with patrol visualization
- `src/components/simulation/CommandDashboard.tsx` - Stats and event log
- `src/components/simulation/PlaybackControls.tsx` - Play/pause/speed controls
- `src/components/simulation/SimulationContent.tsx` - Main container

**Files modified:**
- `src/components/ModelViewer.tsx` - Added SIMULATE button
- `src/utils/coordinates.ts` - Added path interpolation helpers
