# CypberSea - Arctic Maritime Domain Awareness Platform

An AI-powered 3D visualization platform for Canadian Arctic maritime surveillance and real-time situational awareness.

## Overview

Mesh is a defense technology demonstration built for the CyberSea Hackathon, showcasing how AI-assisted 3D visualization can enhance Arctic sovereignty monitoring. The platform combines interactive 3D model analysis with real-time simulation of maritime patrol operations across the Northwest Passage.

## Features

### 3D Asset Intelligence
- **Interactive Model Viewer**: Explore military and naval assets in detailed 3D
- **AI-Powered Analysis**: Gemini AI identifies components, systems, and capabilities
- **Component Annotation**: Click any part to get instant technical documentation
- **Sketchfab Integration**: Access thousands of 3D models from the Sketchfab library

### Arctic Patrol Simulation
- **Real-Time Globe Visualization**: 3D Earth with Canadian Arctic focus
- **Maritime Trade Routes**: Northwest Passage shipping lanes and Arctic corridors
- **Points of Interest**: Military bases, ports, radar stations, and resource sites
- **Mission Playback**: Pre-scripted patrol scenarios with event timeline
- **Command Dashboard**: Weather conditions, threat levels, mission metrics

### Demo Assets
- Tactical UAV Drone
- A-10 Thunderbolt II
- F/A-18F Super Hornet
- F-35 Lightning II
- F-15E Strike Eagle
- MQ-9 Reaper
- SH-60B Seahawk
- T-90 Main Battle Tank
- Arleigh Burke-class Destroyer
- M1025 HMMWV (Humvee)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **3D Engine**: Three.js / React Three Fiber
- **AI**: Google Gemini (via OpenRouter)
- **3D Models**: Sketchfab API
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mesh.git
cd mesh/main

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SKETCHFAB_API_TOKEN=your_sketchfab_token
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_key
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
main/
├── public/
│   ├── models/          # GLB/GLTF 3D model files
│   ├── annotations/     # Annotated reference images
│   └── *.jpg            # Earth textures for globe
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── page.tsx     # Landing page
│   │   ├── viewer/      # 3D model viewer
│   │   └── simulation/  # Arctic patrol simulation
│   ├── components/
│   │   ├── ModelViewer.tsx      # Main 3D viewer component
│   │   └── simulation/          # Simulation components
│   │       ├── SimulationGlobe.tsx
│   │       ├── CommandDashboard.tsx
│   │       ├── PlaybackControls.tsx
│   │       └── SimulationContent.tsx
│   ├── lib/
│   │   ├── models.ts            # Model registry
│   │   ├── demo-config.ts       # Demo model configurations
│   │   └── simulation-data.ts   # Arctic simulation data
│   └── utils/
│       └── coordinates.ts       # Lat/long conversion utilities
```

## Usage

### Model Viewer
1. Navigate to `/viewer`
2. Select a demo model or search Sketchfab
3. Click on model components for AI analysis
4. View technical specifications and annotations

### Arctic Simulation
1. Navigate to `/simulation`
2. Use playback controls to start the patrol
3. Monitor the command dashboard for events
4. Track asset movement across trade routes

## API Integrations

### Sketchfab
- Model search and discovery
- 3D model downloads (GLB format)
- Thumbnail previews

### OpenRouter (Gemini)
- Component identification from screenshots
- Technical analysis and documentation
- Natural language descriptions

## Hackathon Context

Built for the **CyberSea Hackathon** focusing on:
- Canadian Arctic sovereignty
- Maritime domain awareness
- Defense technology innovation
- AI-assisted intelligence gathering

## License

MIT License - See [LICENSE](LICENSE) for details.

## Acknowledgments

- Sketchfab for 3D model hosting
- Google Gemini for AI capabilities
- Three.js community for 3D rendering tools
- CyberSea Hackathon organizers
