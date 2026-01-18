# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mesh is an AI-powered 3D model processing platform that automates mesh component extraction, identification, and educational visualization. It combines Next.js 16 with Three.js/React Three Fiber for WebGL rendering and OpenRouter API (Gemini Pro + GPT-4) for AI analysis.

## Repository Structure

- `/Mesh/main/` - Next.js 16 application (primary codebase)

## Development Commands

All commands should be run from `/Mesh/main/` directory:

```bash
# Development
npm run dev          # Start Next.js dev server (http://localhost:3000)
npm run build        # Build production bundle
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint on codebase
```

## Environment Configuration

Required environment variables (create `.env` in `/Mesh/main/`):

```env
# AI Services
OPENROUTER_API_KEY=       # For Gemini Pro (component identification)
OPENAI_API_KEY=           # For GPT-4 (mesh explanation generation)
GOOGLE_API_KEY=           # For geospatial services
SKETCHFAB_API_KEY=        # For model search/download

# Demo Mode
NEXT_PUBLIC_PRODUCTION_DEMO=false  # Set to "true" to disable AI generation
```

When `NEXT_PUBLIC_PRODUCTION_DEMO=true`, the app uses pre-cached annotations from `/main/src/lib/demo-config.ts` instead of making API calls.

## Architecture

### Frontend Stack

- **Next.js 16** with React 19 (App Router)
- **Three.js + React Three Fiber** for WebGL rendering
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling
- **Framer Motion** for animations

### 3D Rendering Pipeline

The core 3D viewer (`/main/src/components/ModelViewer.tsx`) implements:

1. **GLTF Loading**: Uses `GLTFLoader` with `DRACOLoader` for compressed models
2. **Post-Processing**: `EffectComposer` with `UnrealBloomPass` for bloom effects
3. **Raycasting**: Precise mouse-to-3D coordinate conversion for component selection
4. **Geometry Merging**: `BufferGeometryUtils.mergeGeometries()` reduces draw calls
5. **View Modes**:
   - Holo mode (wireframe with bloom)
   - Solid mode (normal materials)
6. **Exploded View**: Programmable component separation with distance control

Key refs in ModelViewer:
- `sceneRef`, `cameraRef`, `rendererRef` - Three.js core objects
- `controlsRef` - OrbitControls instance
- `composerRef`, `bloomPassRef` - Post-processing pipeline
- `generatedObjectsRef` - Tracks loaded mesh components
- `raycasterRef` - For mouse picking

### AI Processing Pipeline

Multi-stage pipeline in `/main/src/app/api/ai-explain/route.ts`:

1. User clicks/hovers mesh component
2. Canvas screenshot captured with highlighted component
3. Screenshot + geometric data sent to OpenRouter (Gemini Pro)
4. Gemini returns:
   - JSON response (name, description, category, confidence)
   - Annotated image with wireframe overlays
5. GPT-4 processes mesh data for detailed educational explanation
6. Results displayed in inspector panel

All API routes follow Next.js 13+ convention: `/main/src/app/api/[route]/route.ts`

## Key Implementation Patterns

### Dynamic Imports for Heavy Components

ModelViewer uses dynamic imports to prevent SSR issues:

```typescript
// In page.tsx or layout.tsx
const ModelViewer = dynamic(() => import('@/components/ModelViewer'), {
  ssr: false
});
```

### State Management

No Redux/Zustand - uses React 19 local state with refs for Three.js objects. Key pattern:

```typescript
const objectRef = useRef<THREE.Object3D | null>(null);
const objectRefForUseEffect = useRef(false);
useEffect(() => {
  objectRefForUseEffect.current = someState;
}, [someState]);
```

Refs with `.current` pattern prevent stale closures in Three.js animation loops.

### Demo vs Production Mode

Check `IS_PRODUCTION_DEMO` constant in components:

```typescript
const IS_PRODUCTION_DEMO = process.env.NEXT_PUBLIC_PRODUCTION_DEMO === "true";

if (IS_PRODUCTION_DEMO) {
  // Use getDemoAnnotation(modelId) from demo-config.ts
} else {
  // Make API call to /api/ai-explain
}
```

### Performance Optimizations

1. **Lazy Loading**: Dynamic imports for `ModelViewer`, `CubeViewer`
2. **Geometry Merging**: Combine small meshes to reduce draw calls
3. **Frustum Culling**: Automatic in Three.js
4. **RAF Loop**: Smooth 60fps rendering
5. **Canvas-to-base64**: Quality-controlled image conversion for API

## Testing

No test framework currently configured. To add testing:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

Add to package.json:
```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch"
}
```

## Common Workflows

### Adding New 3D Model Format Support

1. Install loader: `npm install three/examples/jsm/loaders/[Format]Loader`
2. Import in `ModelViewer.tsx`: `import { FormatLoader } from 'three/addons/loaders/FormatLoader.js'`
3. Add loader initialization in `useEffect` setup
4. Update file input accept attribute

### Adding New API Route

1. Create `/main/src/app/api/[route]/route.ts`
2. Export async functions: `GET`, `POST`, `PUT`, `DELETE`
3. Use `NextRequest` and `NextResponse` types
4. Access env vars: `process.env.YOUR_VAR`

### Modifying Post-Processing Effects

Post-processing pipeline in ModelViewer setup:

```typescript
composerRef.current = new EffectComposer(rendererRef.current);
composerRef.current.addPass(new RenderPass(sceneRef.current, cameraRef.current));
bloomPassRef.current = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,  // strength
  0.4,  // radius
  0.85  // threshold
);
composerRef.current.addPass(bloomPassRef.current);
```

Adjust bloom parameters or add new passes (SSAO, FXAA, etc.) here.

## Technical Constraints

- Max file size: 100MB (GLB files)
- AI features require valid API keys in environment
- Three.js components must be client-side (`"use client"` directive)

## Deployment

Configured for Vercel deployment (`vercel.json` present):

```bash
vercel --prod  # Deploy to production
```

Environment variables must be set in Vercel dashboard.
