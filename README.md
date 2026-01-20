# Cybersea

An AI-powered 3D visualization platform for military equipment intelligence and Canadian Arctic maritime domain awareness. Built for the CyberSea Hackathon.

## Overview

Cybersea combines interactive 3D model analysis with real-time Arctic patrol simulation capabilities for:

- **Threat Identification** - Real-time AI-driven component recognition of military equipment from 3D wireframe models
- **Arctic Sovereignty Monitoring** - Visualization and simulation of maritime patrol operations across the Northwest Passage
- **Defense Technology Training** - Interactive 3D model analysis for identifying and assessing weapon systems, vehicles, and tactical components
- **Intelligence Gathering** - Component breakdown and tactical assessment generation with AI-assisted analysis

## Tech Stack

- **Framework**: Next.js 16 with App Router, React 19, TypeScript 5
- **3D Graphics**: Three.js with post-processing effects (bloom, composition)
- **Animation**: Framer Motion, GSAP
- **AI**: Google Gemini API for component identification and vision analysis
- **Styling**: Tailwind CSS 4

## Features

### Model Viewer Dashboard (`/dashboard`)

- Interactive 3D model viewer with holographic and solid rendering modes
- Component isolation - click to isolate individual parts
- Explosion animation - explode models into components with adjustable distance
- AI-powered component analysis via Gemini vision API
- Real-time component inspector
- Model export as GLB/JSON
- Guided onboarding overlay

### Arctic Patrol Simulation (`/simulation`)

- 3D Earth globe focused on Canadian Arctic
- Northwest Passage trade routes visualization
- Points of interest: military bases, ports, radar stations, resource sites
- Real-time mission progression with timeline events
- Command dashboard with weather conditions, threat levels, mission metrics
- Playback controls with speed adjustment (1x, 2x, 4x)

## Demo Assets

10 pre-loaded military equipment models with tactical specifications:

| Asset | Type |
|-------|------|
| Tactical UAV Drone | Quad-rotor reconnaissance |
| A-10 Thunderbolt II | Close air support aircraft |
| F/A-18F Super Hornet | Carrier-based multirole fighter |
| F-35 Lightning II | Stealth fighter |
| F-15E Strike Eagle | Fighter-bomber |
| MQ-9 Reaper | Armed UAV |
| SH-60B Seahawk | Naval helicopter |
| T-90 Main Battle Tank | Armored vehicle |
| Arleigh Burke-class Destroyer | Naval warship |
| M1025 HMMWV (Humvee) | Light tactical vehicle |

## Project Structure

```
main/
├── public/
│   ├── models/              # GLB/GLTF 3D assets
│   └── annotations/         # Annotated reference images
├── src/
│   ├── app/
│   │   ├── page.tsx         # Landing page
│   │   ├── dashboard/       # Model viewer
│   │   ├── simulation/      # Arctic patrol simulation
│   │   └── api/             # API routes
│   ├── components/
│   │   ├── ModelViewer.tsx  # Main 3D viewer
│   │   ├── Globe.tsx        # Interactive 3D Earth
│   │   └── simulation/      # Simulation components
│   └── lib/
│       ├── demo-config.ts   # Model registry
│       └── simulation-data.ts # Arctic scenario data
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd main
npm install
```

### Environment Variables

Create a `.env.local` file in the `main` directory:

```env
GEMINI_API_KEY=your_gemini_api_key
SKETCHFAB_API_TOKEN=your_sketchfab_token  # Optional, for model fetching
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
npm run build
npm start
```

## API Routes

| Route | Description |
|-------|-------------|
| `/api/model` | Fetch 3D models from Sketchfab |
| `/api/search` | Search Sketchfab model library |
| `/api/download` | Model export and download |
| `/api/ai-explain` | Gemini AI component analysis |

## License

Built for the uOttawa Hackathon.
