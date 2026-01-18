# Arctic Patrol Simulation Feature Design

**Date**: 2026-01-18
**Status**: Approved
**Purpose**: Add simulation capability to model viewer for Arctic trade route patrol visualization

## Overview

Add a "SIMULATE" button to the model viewer page that transitions to a full tactical Arctic patrol simulation. The selected asset carries over as the primary patrol unit deployed on a 3D globe showing Canadian Arctic trade routes.

## Navigation Flow

```
Model Viewer → [SIMULATE button] → Tactical Simulation View
                                          ↓
                                   [BACK button] → Model Viewer
```

- **New route**: `/simulation?asset={assetId}`
- **State passed**: Asset ID from model viewer URL param

## Layout: Split View

```
┌─────────────────────────────────────┬──────────────────┐
│                                     │                  │
│           3D ARCTIC GLOBE           │    COMMAND       │
│              (70%)                  │   DASHBOARD      │
│                                     │     (30%)        │
│   - Trade routes                    │                  │
│   - Points of interest              │  - Resources     │
│   - Weather overlays                │  - Coverage      │
│   - Asset patrol animation          │  - Asset Status  │
│                                     │  - Event Log     │
├─────────────────────────────────────┴──────────────────┤
│  ◀◀  │  ▶ PLAY  │  ▶▶  │  1x ▼  │  ████░░░░░ 2:30    │
│      PLAYBACK CONTROLS (watch-only)                    │
└────────────────────────────────────────────────────────┘
```

## 3D Globe (Left Panel - 70%)

### Base
- Reuse existing `Globe.tsx` from Mesh project (Three.js wireframe globe)
- Tilt camera to focus on Canadian Arctic region (North Pole view)
- Dark theme with blue accents (matches existing UI)

### Overlay Layers

| Layer | Visual | Implementation |
|-------|--------|----------------|
| **Trade routes** | Cyan/blue lines showing shipping lanes | `THREE.Line` or `THREE.TubeGeometry` curves |
| **Points of interest** | Icons for ports, bases, resource sites | Marker meshes at lat/lng positions |
| **Weather** | Semi-transparent ice coverage, drifting storms | Animated textures or particle systems |
| **Patrol path** | Highlighted route with breadcrumb trail | Animated dashed line showing asset path |
| **Asset marker** | Icon/model of deployed asset | 3D sprite/model animating along path |

### Helper Functions
```typescript
// Convert lat/lng to 3D position on globe
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3

// Animate asset along path
function animateAlongPath(asset: THREE.Object3D, path: THREE.CurvePath, progress: number)
```

## Command Dashboard (Right Panel - 30%)

### Layout (top to bottom)

```
┌─────────────────────────┐
│  MISSION CLOCK  00:00   │
├─────────────────────────┤
│  RESOURCE TRACKING      │
│  ▸ Fuel: ████████░░ 80% │
│  ▸ Distance: 124 nm     │
│  ▸ Time on Station: 45m │
├─────────────────────────┤
│  COVERAGE STATS         │
│  ▸ Area Covered: 34%    │
│  ▸ Detection Prob: 78%  │
│  ▸ Routes Monitored: 2/5│
├─────────────────────────┤
│  ASSET STATUS           │
│  ┌─────┐ A-10 WARTHOG   │
│  │icon │ Status: ACTIVE │
│  └─────┘ Heading: 045°  │
│          Alt: 15,000 ft │
│          Speed: 320 kts │
├─────────────────────────┤
│  EVENT LOG              │
│  00:45 ⚠ Contact detected│
│  01:12 ☁ Weather update │
│  01:30 ✓ Route A clear  │
└─────────────────────────┘
```

### Styling
- Dark cards matching model viewer aesthetic
- Blue accent for active/highlighted values
- Icons for event types
- Real-time value updates during simulation

## Playback Controls

### Controls
- **Play/Pause** - Toggle simulation
- **Speed** - 1x, 2x, 4x dropdown
- **Progress bar** - Position in timeline
- **Restart** - Reset to beginning

### Mode
- Watch-only (no user interaction with map/assets)
- Pre-scripted demo for reliable hackathon presentation

## Pre-scripted Timeline (~4-5 minutes)

| Time | Event |
|------|-------|
| 0:00 | Asset deploys from base, begins patrol |
| 0:30 | First trade route reached, monitoring begins |
| 0:45 | Contact detected - vessel on route |
| 1:15 | Weather system enters map (ice drift) |
| 1:45 | Second trade route patrol begins |
| 2:15 | Fuel warning (50% remaining) |
| 2:45 | Weather clears, visibility improved |
| 3:15 | Contact detected - second vessel |
| 3:45 | Return to base initiated |
| 4:15 | Mission complete - summary displayed |

## Simulate Button Integration

### Placement
Add to model viewer top-right action bar:

```
WIREFRAME | SOLID | ▶ SIMULATE | EXPORT | RESET
```

### Styling
- Blue accent background (primary action)
- Play icon (▶) prefix
- Same height as existing buttons

### Behavior
- On click: Navigate to `/simulation?asset={currentAssetId}`
- Simulation page reads asset param and deploys that unit

## File Structure

### New Files
```
src/app/simulation/page.tsx           ← Main simulation page
src/components/simulation/
  ├── SimulationGlobe.tsx             ← Extended globe with overlays
  ├── CommandDashboard.tsx            ← Stats panel container
  ├── PlaybackControls.tsx            ← Play/pause/speed bar
  ├── ResourceTracker.tsx             ← Fuel, distance, time
  ├── CoverageStats.tsx               ← Area covered, detection prob
  ├── AssetStatus.tsx                 ← Current asset info
  ├── EventLog.tsx                    ← Timeline of events
  ├── ArcticOverlays.tsx              ← Trade routes, POIs, weather
  ├── AssetMarker.tsx                 ← Animated patrol unit
  └── simulation-data.ts              ← Pre-scripted timeline, routes, coordinates
src/utils/globe-utils.ts              ← latLngToVector3, path helpers
```

### Modified Files
- Model viewer page - add SIMULATE button with navigation

## Technical Notes

- All simulation logic runs client-side
- No backend changes required
- Reuse existing Globe.tsx as foundation
- Simulation state managed with useReducer or Zustand
- Timeline events stored as array with timestamps in simulation-data.ts

## Hackathon Success Criteria Addressed

| Criteria | How This Feature Addresses It |
|----------|-------------------------------|
| **#1 Operational Relevance** | Shows asset patrolling Arctic trade routes |
| **#2 Resource Efficiency** | Real-time fuel, time, distance tracking |
| **#4 Usability** | Clear visual feedback, simple watch-only interface |
| **#6 Insight & Metrics** | Coverage stats, detection probability, event logging |

## Next Steps

1. Add SIMULATE button to model viewer page
2. Create `/simulation` route and page layout
3. Extend Globe.tsx for Arctic focus and overlays
4. Build dashboard components
5. Implement playback controls and timeline
6. Create pre-scripted demo scenario data
7. Test end-to-end flow
