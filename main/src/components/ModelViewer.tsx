"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { AnimatePresence } from "framer-motion";
import BlockyLoader from "./BlockyLoader";
import AIInferenceLoader from "./AIInferenceLoader";
import OnboardingOverlay from "./OnboardingOverlay";
import { DEMO_MODELS, getDemoAnnotation, DemoModel } from "@/lib/demo-config";
import { MODEL_REGISTRY, getModelById, hasModel } from "@/lib/models";

const IS_PRODUCTION_DEMO = true; // Always show model catalog

interface ComponentData {
  mesh: THREE.Mesh;
  originalLocalPos: THREE.Vector3;
  centroid: THREE.Vector3;
}

interface ExplodedGroupData {
  originalCenter: THREE.Vector3;
  components: ComponentData[];
}

type ViewMode = "holo" | "solid";

interface ModelViewerProps {
  onClose?: () => void;
  selectedModelId?: string | null; // Optional prop to control which model is loaded
  skipOnboarding?: boolean; // Skip showing the built-in onboarding overlay
}

export default function ModelViewer({ onClose, selectedModelId: externalSelectedModelId, skipOnboarding = false }: ModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("holo");
  const [prompt, setPrompt] = useState("");
  const [isExploded, setIsExploded] = useState(false);
  const [explosionDistance, setExplosionDistance] = useState(1.0);
  const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(
    null
  );
  const [isIsolating, setIsIsolating] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [aiIdentifyActive, setAiIdentifyActive] = useState(false); // Track if AI identify modal is showing
  const [generateStarted, setGenerateStarted] = useState(false);
  const [inspectorData, setInspectorData] = useState({
    name: "",
    description: "",
    type: "",
  });
  const [showInspector, setShowInspector] = useState(true);
  const [annotationOverlay, setAnnotationOverlay] = useState<string | null>(
    null
  );
  const [showSplitSection, setShowSplitSection] = useState(false);
  const [showExplodedControls, setShowExplodedControls] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);
  const [showAnnotatedModal, setShowAnnotatedModal] = useState(false);
  const showAnnotatedModalRef = useRef(false);
  useEffect(() => { showAnnotatedModalRef.current = showAnnotatedModal; }, [showAnnotatedModal]);
  const [annotatedImage, setAnnotatedImage] = useState<string | null>(null);
  const [showInferenceLoader, setShowInferenceLoader] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(!skipOnboarding);
  const showInferenceLoaderRef = useRef(false);
  useEffect(() => { showInferenceLoaderRef.current = showInferenceLoader; }, [showInferenceLoader]);
  const aiIdentifyActiveRef = useRef(false);
  useEffect(() => { aiIdentifyActiveRef.current = aiIdentifyActive; }, [aiIdentifyActive]);

  const [inferenceLoaderReady, setInferenceLoaderReady] = useState(false);
  const [currentDemoModelId, setCurrentDemoModelId] = useState<string | null>(null);
  const [isBottomDropdownOpen, setIsBottomDropdownOpen] = useState(false);
  const bottomDropdownRef = useRef<HTMLDivElement>(null);
  const [showInteractionHint, setShowInteractionHint] = useState(false);
  const [showA10Image, setShowA10Image] = useState(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);
  const shadowPlaneRef = useRef<THREE.Mesh | null>(null);
  const generatedObjectsRef = useRef<THREE.Object3D[]>([]);
  const hoveredObjectRef = useRef<THREE.Object3D | null>(null);
  const placeholderRef = useRef<THREE.Mesh | null>(null);
  const raycasterRef = useRef<THREE.Raycaster | null>(null);
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const explodedGroupsRef = useRef<Map<THREE.Group, ExplodedGroupData>>(
    new Map()
  );
  const animationFrameRef = useRef<number | null>(null);
  const isIsolatingRef = useRef(false);
  const selectedObjectRef = useRef<THREE.Object3D | null>(null);
  // Store AI annotations mapped by object UUID to persist session knowledge correctly
  // Key: Object UUID, Value: { annotatedImage: string, name: string, description: string, type: string }
  const annotationsCacheRef = useRef<Record<string, any>>({});
  const splitMeshLastTimeRef = useRef<number>(0); // Fix TypeScript errors
  const viewModeRef = useRef<ViewMode>("holo");
  const tooltipRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<THREE.Sprite[]>([]);
  const [showLabels, setShowLabels] = useState(true);

  useEffect(() => {
    isIsolatingRef.current = isIsolating;
  }, [isIsolating]);

  useEffect(() => {
    selectedObjectRef.current = selectedObject;
  }, [selectedObject]);

  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);

  // Handle clicks outside bottom dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bottomDropdownRef.current && !bottomDropdownRef.current.contains(event.target as Node)) {
        setIsBottomDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show interaction hint when model loads
  useEffect(() => {
    if (modelReady && !showOnboarding) {
      setShowInteractionHint(true);
      // Auto-hide after 8 seconds
      const timer = setTimeout(() => {
        setShowInteractionHint(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [modelReady, showOnboarding]);

  // Hide hint when user selects an object
  useEffect(() => {
    if (selectedObject) {
      setShowInteractionHint(false);
    }
  }, [selectedObject]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup any existing canvas to prevent duplicates
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a); // Very dark grey background
    scene.fog = null; // Remove fog for clearer view
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.05,
      2000
    );
    // Initialize camera position
    const DEFAULT_AZ = Math.PI / 4;
    const DEFAULT_EL = Math.PI / 6;
    const DEFAULT_R = 8;

    camera.position.set(
      DEFAULT_R * Math.cos(DEFAULT_EL) * Math.sin(DEFAULT_AZ),
      DEFAULT_R * Math.sin(DEFAULT_EL),
      DEFAULT_R * Math.cos(DEFAULT_EL) * Math.cos(DEFAULT_AZ)
    );
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = false; // Disable shadows
    renderer.setClearColor(0x0a0a0a, 1); // Very dark grey
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 100;
    controlsRef.current = controls;

    // Lighting - Adjusted for light theme
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = false;
    // dirLight.shadow.mapSize.width = 2048;
    // dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    const accentLight = new THREE.SpotLight(0x3b82f6, 2); // Orange accent
    accentLight.position.set(-10, 5, -5);
    accentLight.lookAt(0, 0, 0);
    scene.add(accentLight);

    // Grid Helper - White grid on dark background
    const gridHelper = new THREE.GridHelper(50, 50, 0xffffff, 0x666666);
    gridHelper.position.y = -4;
    gridHelper.material.opacity = 0.4;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Shadow plane
    /*
    const planeGeo = new THREE.PlaneGeometry(50, 50);
    const planeMat = new THREE.ShadowMaterial({ opacity: 0.1, color: 0x1D1E15 }); // Dark shadow on light bg
    const shadowPlane = new THREE.Mesh(planeGeo, planeMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -4;
    shadowPlane.receiveShadow = false;
    shadowPlane.visible = false; // Controlled by view mode
    scene.add(shadowPlane);
    shadowPlaneRef.current = shadowPlane;
    */

    // Post-processing
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    bloomPass.threshold = 0.95; // High threshold to avoid blooming the light background
    bloomPass.strength = 0.4;
    bloomPass.radius = 0.5;
    bloomPass.enabled = true;
    bloomPassRef.current = bloomPass;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composerRef.current = composer;

    // Raycaster
    const raycaster = new THREE.Raycaster();
    raycasterRef.current = raycaster;

    // Placeholder spinning wireframe rounded cube
    const roundedCubeGeometry = new THREE.BoxGeometry(2, 2, 2, 4, 4, 4);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x1D1E15,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const placeholder = new THREE.Mesh(roundedCubeGeometry, wireframeMaterial);
    placeholder.position.set(0, 0, 0);
    scene.add(placeholder);
    placeholderRef.current = placeholder;

    // Animation loop
    let lastT = performance.now();
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.max(0, now - lastT);
      lastT = now;

      // Rotate placeholder if no model is loaded
      if (placeholderRef.current && generatedObjectsRef.current.length === 0) {
        placeholderRef.current.rotation.x += dt * 0.001;
        placeholderRef.current.rotation.y += dt * 0.0015;
        placeholderRef.current.visible = true;
      } else if (placeholderRef.current) {
        placeholderRef.current.visible = false;
      }

      if (composerRef.current) composerRef.current.render();
    };
    animate();

    // Resize handler for window
    const onWindowResize = () => {
      if (!cameraRef.current || !rendererRef.current || !composerRef.current)
        return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      composerRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onWindowResize);

    // Ensure correct clear color immediately
    renderer.setClearColor(0x000000, 1);

    return () => {
      window.removeEventListener("resize", onWindowResize);
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const highlightMaterial = (obj: THREE.Mesh) => {
    if (!(obj as any).userData.mats) return;
    const currentMat = (obj.material as THREE.Material).clone();
    if ("emissive" in currentMat) {
      (currentMat as THREE.MeshStandardMaterial).emissive.setHex(0xffffff);
      (currentMat as THREE.MeshStandardMaterial).emissiveIntensity = 0.5;
    }
    if (viewModeRef.current === "solid" && "color" in currentMat) {
      (currentMat as THREE.MeshStandardMaterial).color.offsetHSL(0, 0, 0.2);
    }
    obj.material = currentMat;
  };

  const restoreMaterial = (obj: THREE.Mesh) => {
    if (!obj || !(obj as any).userData.mats) return;
    const mats = (obj as any).userData.mats;
    obj.material = viewModeRef.current === "solid" ? mats.solid : mats.holo;
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (
      showInferenceLoader ||
      !containerRef.current ||
      !raycasterRef.current ||
      !cameraRef.current ||
      !sceneRef.current
    )
      return;

    // Update mouse ref for click events
    mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Hover effect logic
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(
      generatedObjectsRef.current,
      true
    );

    if (intersects.length > 0) {
      const object = intersects[0].object as THREE.Mesh;
      if (
        (object as any).userData.name &&
        object !== hoveredObjectRef.current &&
        object !== selectedObjectRef.current
      ) {
        if (
          hoveredObjectRef.current &&
          hoveredObjectRef.current !== selectedObjectRef.current
        ) {
          restoreMaterial(hoveredObjectRef.current as THREE.Mesh);
        }
        hoveredObjectRef.current = object;
        highlightMaterial(object);
        containerRef.current.style.cursor = "pointer";

        if (tooltipRef.current) {
          tooltipRef.current.textContent = (object as any).userData.name;
          tooltipRef.current.style.opacity = "1";
          tooltipRef.current.style.transform = `translate(${event.clientX + 10
            }px, ${event.clientY + 10}px)`;
        }
      }
    } else {
      if (
        hoveredObjectRef.current &&
        hoveredObjectRef.current !== selectedObjectRef.current
      ) {
        restoreMaterial(hoveredObjectRef.current as THREE.Mesh);
        hoveredObjectRef.current = null;
      }
      containerRef.current.style.cursor = "default";

      if (tooltipRef.current) {
        tooltipRef.current.style.opacity = "0";
      }
    }
  };

  const handleClick = (event: React.MouseEvent) => {
    if (showInferenceLoader || !raycasterRef.current || !cameraRef.current || !sceneRef.current)
      return;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(
      generatedObjectsRef.current,
      true
    );

    if (intersects.length > 0) {
      const object = intersects[0].object;
      if ((object as any).userData?.name) {
        handleObjectClick(object);
      }
    }
  };

  const createDualMaterials = (
    baseColor: THREE.Color,
    roughness = 0.5,
    metalness = 0.1
  ) => {
    const holo = new THREE.MeshPhysicalMaterial({
      color: baseColor,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
      emissive: baseColor,
      emissiveIntensity: 0.3,
      side: THREE.DoubleSide,
    });

    const solid = new THREE.MeshStandardMaterial({
      color: baseColor,
      wireframe: false,
      roughness,
      metalness,
      side: THREE.DoubleSide,
    });

    return { holo, solid };
  };

  const loadModelFromUrl = (url: string, isBlob: boolean = false) => {
    if (!sceneRef.current) return;

    setLoading(true);
    setModelReady(false);
    setAnimationFinished(false);

    const loader = new GLTFLoader();

    // Setup DRACO loader
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    dracoLoader.setDecoderConfig({ type: 'js' }); // Explicitly use JS decoder for broader compatibility
    loader.setDRACOLoader(dracoLoader);

    // Clear existing models and their cached annotation data
    generatedObjectsRef.current.forEach((obj) => {
      // Clear annotation data from all meshes in the object before removing
      obj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && (child as any).userData) {
          // Clear cached annotation data (this ensures old annotations don't persist)
          delete (child as any).userData.annotatedImage;
        }
      });
      sceneRef.current!.remove(obj);
    });
    generatedObjectsRef.current = [];
    explodedGroupsRef.current.clear();
    resetView();

    // Clear all annotation state and cached data when loading a new model
    console.log("Clearing all annotation state for new model");
    annotationsCacheRef.current = {}; // Clear central annotation cache
    setAiIdentifyActive(false);
    setShowAnnotatedModal(false);
    setAnnotatedImage(null);
    setShowInspector(false);
    setIsIdentifying(false);
    setShowInferenceLoader(false);
    setInspectorData({
      name: "",
      description: "",
      type: "",
    });
    setSelectedObject(null);
    selectedObjectRef.current = null;

    // Show placeholder when no models
    if (placeholderRef.current) {
      placeholderRef.current.visible = true;
    }

    loader.load(
      url,
      (gltf) => {
        const model = gltf.scene;

        // Flatten hierarchy to ensure Split Mesh works correctly
        const flatGroup = new THREE.Group();
        const meshes: THREE.Mesh[] = [];

        // 1. Update world matrices to capture current transforms
        model.updateMatrixWorld(true);

        // 2. Collect all meshes
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            meshes.push(child as THREE.Mesh);
          }
        });

        // 3. Move meshes to flat group, preserving world transform
        meshes.forEach((mesh) => {
          const worldMatrix = mesh.matrixWorld.clone();

          // Create dual materials while we're here
          const originalMat = mesh.material as THREE.MeshStandardMaterial;
          const baseColor = originalMat.color
            ? originalMat.color
            : new THREE.Color(0x00aaff);
          const mats = createDualMaterials(baseColor, 0.5, 0.2);
          if (originalMat.map) mats.solid = originalMat;

          // Apply new material
          mesh.material = mats.solid; // Default to solid for now
          // Create fresh userData without any cached annotations from previous models
          (mesh as any).userData = {
            mats,
            name: mesh.name || `Part ${meshes.length}`,
            description: "Imported Geometry",
            type: "Imported",
            // Explicitly ensure no cached annotation data from previous models
            annotatedImage: undefined,
          };
          mesh.castShadow = false;
          mesh.receiveShadow = false;

          // Add to flat group
          flatGroup.add(mesh);

          // Apply world transform
          // Since flatGroup is at identity (0,0,0), setting local matrix to world matrix works
          mesh.matrix.copy(worldMatrix);
          mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
          mesh.updateMatrixWorld();
        });

        // 4. Center and scale the flat group
        const box = new THREE.Box3().setFromObject(flatGroup);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        // Scale to fit (Target size ~4 units)
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 4 / (maxDim || 1);
        flatGroup.scale.set(scale, scale, scale);

        // Center the model at origin
        flatGroup.position.copy(center).multiplyScalar(-scale);
        flatGroup.updateMatrixWorld(true);

        // Apply smart names to initial meshes
        meshes.forEach((mesh, idx) => {
          const geom = mesh.geometry;
          geom.computeBoundingBox();
          const bbox = geom.boundingBox!;
          const meshSize = new THREE.Vector3();
          bbox.getSize(meshSize);
          const meshCenter = new THREE.Vector3();
          bbox.getCenter(meshCenter);
          mesh.localToWorld(meshCenter);

          const smartName = generateComponentName(
            meshCenter,
            meshSize,
            center,
            idx,
            meshes.length
          );

          (mesh as any).userData.name = smartName;
        });

        sceneRef.current!.add(flatGroup);
        generatedObjectsRef.current.push(flatGroup);

        // Hide placeholder when model is loaded
        if (placeholderRef.current) {
          placeholderRef.current.visible = false;
        }

        if (controlsRef.current) {
          controlsRef.current.reset();
        }

        updateViewMode();

        if (meshes.length > 1) {
          setupMultiMeshExplodedView(flatGroup, meshes);
        }

        if (isBlob) {
          URL.revokeObjectURL(url);
        }

        setModelReady(true);
      },
      (progress) => {
        // Optional logging
      },
      (error) => {
        console.error("Error loading file:", error);
        alert("Error loading file. See console.");
        if (isBlob) {
          URL.revokeObjectURL(url);
        }
        setLoading(false);
      }
    );
  };

  const generateModel = async (prompt: string) => {
    // Hide onboarding if active
    if (showOnboarding) setShowOnboarding(false);

    if (!sceneRef.current || !prompt.trim()) return;

    setGenerateStarted(true);
    setLoading(true);

    try {
      console.log("Searching for:", prompt);
      const searchRes = await fetch(
        `/api/search?q=${encodeURIComponent(prompt)}`
      );
      const searchData = await searchRes.json();

      if (!searchRes.ok) {
        throw new Error(
          searchData.error +
          (searchData.details
            ? `: ${JSON.stringify(searchData.details)}`
            : "") || "Search failed"
        );
      }

      if (!searchData.uid) {
        alert("No 3D model found for this prompt.");
        setLoading(false);
        return;
      }

      console.log("Found UID:", searchData.uid);
      const downloadRes = await fetch(`/api/download?uid=${searchData.uid}`);
      const downloadData = await downloadRes.json();

      if (!downloadRes.ok || !downloadData.success) {
        if (
          downloadData.potentialUrls &&
          downloadData.potentialUrls.length > 0
        ) {
          console.log("Using potential URL fallback");
          // potentialUrls might be an array of strings. We need to find the best one.
          // Filter for .glb or .gltf if possible
          const bestUrl =
            downloadData.potentialUrls.find((u: string) =>
              u.includes(".glb")
            ) ||
            downloadData.potentialUrls.find((u: string) =>
              u.includes(".gltf")
            ) ||
            downloadData.potentialUrls[0];

          loadModelFromUrl(bestUrl, false);
          return;
        }
        throw new Error(downloadData.message || "Failed to get download URL");
      }

      // Extract URL
      let modelUrl = downloadData.data.glb?.url || downloadData.data.gltf?.url;

      // Fallback: sometimes the structure is directly inside the data if the endpoint returned different format
      if (!modelUrl && downloadData.data.gltf) {
        modelUrl = downloadData.data.gltf.url;
      }

      if (!modelUrl) {
        // If we have a successful response but no direct GLB/GLTF url in standard location
        console.warn(
          "Standard URL location failed, checking alternatives in response data...",
          downloadData
        );
        throw new Error(
          "No compatible model format (GLB/GLTF) found in API response."
        );
      }

      console.log("Loading model from:", modelUrl);
      loadModelFromUrl(modelUrl, false);
    } catch (error) {
      console.error("Generation error:", error);
      alert(
        "Failed to generate model. " +
        (error instanceof Error ? error.message : "")
      );
      setLoading(false);
      // Keep generateStarted true so the bar stays at bottom even on error
    }
  };

  const updateViewMode = () => {
    if (!sceneRef.current || !bloomPassRef.current || !rendererRef.current)
      return;

    const isSolid = viewMode === "solid";

    // Always disable bloom to maintain exact background color #E5E6DA
    bloomPassRef.current.enabled = false;

    sceneRef.current.background = new THREE.Color(0x0a0a0a);
    // No fog in dark mode
    rendererRef.current.setClearColor(0x0a0a0a, 1);

    // Shadows only in solid mode
    if (shadowPlaneRef.current) {
      shadowPlaneRef.current.visible = false;
    }

    generatedObjectsRef.current.forEach((group) => {
      group.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && (child as any).userData?.mats) {
          const mesh = child as THREE.Mesh;
          const mats = (mesh as any).userData.mats;

          // Update materials for light theme if needed
          if (!isSolid) {
            // For Holo mode in light theme, we want dark wireframes
            const holoMat = mats.holo as THREE.MeshPhysicalMaterial;
            if (holoMat) {
              holoMat.color.setHex(0x3b82f6); // Orange wireframe
              holoMat.emissive.setHex(0x3b82f6);
              // Reduced intensity to prevent color blowout, increased opacity for visibility
              holoMat.emissiveIntensity = 1.0;
              holoMat.opacity = 0.8;
            }
          }

          mesh.material = isSolid ? mats.solid : mats.holo;
          mesh.castShadow = false; // Shadows only in solid mode
          mesh.receiveShadow = false;
        }
      });
    });
  };

  useEffect(() => {
    updateViewMode();
  }, [viewMode]);

  const handleObjectClick = (object: THREE.Object3D) => {
    if (!sceneRef.current) return;

    const userData = (object as any).userData;
    if (!userData?.name) return;

    if (isIsolating && selectedObject !== object) {
      resetView();
      setTimeout(() => isolateComponent(object), 100);
    } else {
      isolateComponent(object);
    }
  };

  const isolateComponent = (object: THREE.Object3D) => {
    if (!sceneRef.current) return;

    if (selectedObject === object && isIsolating) return;

    // Restore all materials first if switching
    if (isIsolating && selectedObject) {
      sceneRef.current.traverse((child) => {
        if (
          (child as THREE.Mesh).isMesh &&
          child !== shadowPlaneRef.current &&
          (child as any).userData?.mats
        ) {
          const mesh = child as THREE.Mesh;
          const mats = (mesh as any).userData.mats;
          mesh.material = viewMode === "solid" ? mats.solid : mats.holo;
          (mesh.material as THREE.Material).transparent = false;
          (mesh.material as THREE.Material).opacity = 1;
        }
      });
    }

    setSelectedObject(object);
    setIsIsolating(true);

    const userData = (object as any).userData;
    if (object.type === "Mesh") {
      setShowSplitSection(true);
    } else {
      setShowSplitSection(false);
    }

    // Dim all other meshes
    sceneRef.current.traverse((child) => {
      if (
        (child as THREE.Mesh).isMesh &&
        child !== object &&
        child !== shadowPlaneRef.current
      ) {
        const mesh = child as THREE.Mesh;
        if ((mesh as any).userData?.mats) {
          const mats = (mesh as any).userData.mats;
          mesh.material = (
            viewMode === "solid" ? mats.solid : mats.holo
          ).clone();
        }
        (mesh.material as THREE.Material).transparent = true;
        (mesh.material as THREE.Material).opacity = 0.1;
      }
    });

    // Highlight selected
    const mesh = object as THREE.Mesh;
    const mats = (mesh as any).userData.mats;
    if (viewMode === "holo") {
      mesh.material = mats.holo.clone();
      (mesh.material as THREE.MeshPhysicalMaterial).color.setHex(0x667eea);
      (mesh.material as THREE.Material).opacity = 1;
    } else {
      mesh.material = mats.solid.clone();
      (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x667eea);
      (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3;
    }

    setInspectorData({
      name: userData.name,
      description: userData.description,
      type: userData.type,
    });

    // Load cached annotation if available
    if (userData.annotatedImage) {
      setAnnotatedImage(userData.annotatedImage);
      setShowAnnotatedModal(true);
    } else {
      setAnnotatedImage(null);
    }

    setShowInspector(true);
  };

  const resetView = () => {
    if (!sceneRef.current) return;

    sceneRef.current.traverse((child) => {
      if (
        (child as THREE.Mesh).isMesh &&
        child !== shadowPlaneRef.current &&
        (child as any).userData?.mats
      ) {
        const mesh = child as THREE.Mesh;
        const mats = (mesh as any).userData.mats;
        mesh.material = viewMode === "solid" ? mats.solid : mats.holo;
        (mesh.material as THREE.Material).transparent = false;
        (mesh.material as THREE.Material).opacity = 1;
      }
    });

    setSelectedObject(null);
    setIsIsolating(false);
    setShowInspector(false);
    setShowSplitSection(false);
    setAnnotationOverlay(null);
    setAnnotatedImage(null);
    setShowAnnotatedModal(false);
  };

  // Enhanced military-specific component naming based on position, size, and geometry
  const generateComponentName = (
    centroid: THREE.Vector3,
    size: THREE.Vector3,
    modelCenter: THREE.Vector3,
    componentIndex: number,
    totalComponents: number
  ): string => {
    const relativePos = centroid.clone().sub(modelCenter);
    const normalized = relativePos.clone().normalize();

    // Position descriptors (normalized coordinates)
    const isForward = relativePos.z > 0.3;
    const isRear = relativePos.z < -0.3;
    const isTop = relativePos.y > 0.3;
    const isBottom = relativePos.y < -0.3;
    const isLeft = relativePos.x < -0.3;
    const isRight = relativePos.x > 0.3;
    const isCentral = Math.abs(relativePos.x) < 0.3 && Math.abs(relativePos.z) < 0.3;

    // Size and shape descriptors
    const volume = size.x * size.y * size.z;
    const isLarge = volume > 1.5;
    const isMedium = volume > 0.5 && volume <= 1.5;
    const isSmall = volume <= 0.5;
    const isTiny = volume < 0.1;

    const aspectRatio = Math.max(size.x, size.y, size.z) / Math.min(size.x, size.y, size.z);
    const isElongated = aspectRatio > 4;
    const isFlatHorizontal = size.y < Math.min(size.x, size.z) * 0.4;
    const isFlatVertical = (size.x < Math.min(size.y, size.z) * 0.4) || (size.z < Math.min(size.x, size.y) * 0.4);
    const isCylindrical = aspectRatio > 2.5 && !isFlatHorizontal && !isFlatVertical;

    // Identify specific military components

    // ENGINE COMPONENTS
    if (isRear && isCylindrical && isMedium) {
      return isLeft ? "Port Engine Nacelle" : isRight ? "Starboard Engine Nacelle" : "Engine Assembly";
    }
    if (isRear && isCylindrical && isSmall) {
      return "Exhaust Nozzle";
    }

    // COCKPIT / CANOPY
    if (isForward && isTop && isSmall && !isFlatHorizontal) {
      return "Cockpit Canopy";
    }
    if (isForward && isTop && isTiny) {
      return "Windscreen";
    }

    // NOSE / RADOME
    if (isForward && isCentral && isElongated) {
      return "Nose Cone (Radome)";
    }
    if (isForward && isSmall && !isTop && !isBottom) {
      return "Forward Avionics Bay";
    }

    // WING COMPONENTS
    if ((isLeft || isRight) && isFlatHorizontal && isElongated) {
      const side = isLeft ? "Port" : "Starboard";
      if (isLarge) return `${side} Wing Assembly`;
      if (isMedium) return `${side} Wing`;
      return `${side} Wing Tip`;
    }
    if ((isLeft || isRight) && isFlatHorizontal && !isElongated) {
      return isLeft ? "Port Flap" : "Starboard Aileron";
    }

    // TAIL ASSEMBLY
    if (isRear && isTop && isFlatVertical && isElongated) {
      return "Vertical Stabilizer";
    }
    if (isRear && isFlatHorizontal && !isCentral) {
      return isLeft ? "Port Horizontal Stabilizer" : "Starboard Horizontal Stabilizer";
    }
    if (isRear && isTop && isSmall) {
      return "Rudder Assembly";
    }

    // FUSELAGE SECTIONS
    if (isLarge && isCentral) {
      if (isForward) return "Forward Fuselage";
      if (isRear) return "Aft Fuselage";
      return "Center Fuselage Section";
    }
    if (isMedium && isCentral) {
      if (isForward) return "Nose Section";
      if (isRear) return "Tail Boom";
      return "Mid-Fuselage";
    }

    // WEAPONS & HARDPOINTS
    if (isBottom && isTiny && (isLeft || isRight)) {
      return isLeft ? "Port Wing Pylon" : "Starboard Wing Pylon";
    }
    if (isBottom && isSmall && isCentral) {
      return "Weapons Bay Door";
    }

    // LANDING GEAR
    if (isBottom && isSmall) {
      if (isForward) return "Nose Landing Gear Bay";
      if (isRear || isLeft || isRight) return "Main Landing Gear Well";
      return "Landing Gear Strut";
    }

    // AIR INTAKES
    if (!isTop && !isBottom && (isLeft || isRight) && isCylindrical) {
      return isLeft ? "Port Air Intake" : "Starboard Air Intake";
    }

    // AVIONICS & SENSORS
    if (isTop && isTiny) {
      return "Antenna Mount";
    }
    if (isTop && isSmall && isCentral) {
      return "Avionics Hump";
    }

    // STRUCTURAL PANELS
    if (isFlatVertical && !isElongated) {
      if (isLeft) return "Port Side Panel";
      if (isRight) return "Starboard Side Panel";
      if (isRear) return "Rear Bulkhead";
      return "Access Panel";
    }

    // GENERIC DESCRIPTIVE FALLBACKS
    if (isTop && isFlatHorizontal) {
      return "Upper Skin Panel";
    }
    if (isBottom && isFlatHorizontal) {
      return "Lower Belly Panel";
    }
    if (isForward) {
      return isTop ? "Forward Upper Assembly" : "Forward Lower Structure";
    }
    if (isRear) {
      return isTop ? "Tail Section" : "Rear Lower Structure";
    }
    if (isSmall) {
      return `Detail Component ${componentIndex + 1}`;
    }

    return `Sub-Assembly ${componentIndex + 1}`;
  };

  const handleSplitMesh = async () => {
    // Use ref as fallback to ensure we have the latest selected object (especially for Bluetooth triggers)
    const currentObject = selectedObject || selectedObjectRef.current;

    if (
      !currentObject ||
      !(currentObject as THREE.Mesh).geometry ||
      !sceneRef.current
    )
      return;

    const mesh = currentObject as THREE.Mesh;
    const parent = mesh.parent;
    const geom = mesh.geometry;

    // Check if part of multi-mesh model
    let parentGroup = parent;
    let multiMeshData: ExplodedGroupData | null = null;
    while (parentGroup) {
      if (explodedGroupsRef.current.has(parentGroup as THREE.Group)) {
        multiMeshData = explodedGroupsRef.current.get(
          parentGroup as THREE.Group
        )!;
        break;
      }
      parentGroup = parentGroup.parent;
    }

    if (multiMeshData) {
      setIsExploded(true);
      applyExplodedView(
        parentGroup as THREE.Group,
        multiMeshData.components,
        multiMeshData.originalCenter
      );
      setShowExplodedControls(true);
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Ensure indexed
      let indexedGeom = geom;
      if (!geom.index) {
        indexedGeom = BufferGeometryUtils.mergeVertices(geom);
      }

      const index = indexedGeom.index!.array;
      const vertexCount = indexedGeom.attributes.position.count;
      const facesCount = index.length / 3;

      // Build vertex-to-faces map
      const vertToFaces: number[][] = new Array(vertexCount)
        .fill(0)
        .map(() => []);
      for (let i = 0; i < facesCount; i++) {
        vertToFaces[index[i * 3]].push(i);
        vertToFaces[index[i * 3 + 1]].push(i);
        vertToFaces[index[i * 3 + 2]].push(i);
      }

      // BFS to find connected components
      const visitedFaces = new Uint8Array(facesCount);
      const components: number[][] = [];

      for (let i = 0; i < facesCount; i++) {
        if (visitedFaces[i]) continue;

        const component: number[] = [];
        const stack = [i];
        visitedFaces[i] = 1;

        while (stack.length > 0) {
          const f = stack.pop()!;
          component.push(f);

          const a = index[f * 3];
          const b = index[f * 3 + 1];
          const c = index[f * 3 + 2];

          [a, b, c].forEach((vIdx) => {
            const neighbors = vertToFaces[vIdx];
            for (const n of neighbors) {
              if (!visitedFaces[n]) {
                visitedFaces[n] = 1;
                stack.push(n);
              }
            }
          });
        }
        components.push(component);
      }

      if (components.length <= 1) {
        alert(
          "Mesh is already a single continuous piece. Cannot split further."
        );
        setLoading(false);
        return;
      }

      // Calculate local geometry center for explosion origin
      let localCenter = new THREE.Vector3();
      if (indexedGeom.boundingBox) {
        indexedGeom.boundingBox.getCenter(localCenter);
      } else {
        indexedGeom.computeBoundingBox();
        indexedGeom.boundingBox!.getCenter(localCenter);
      }

      // Reconstruct meshes
      const newGroup = new THREE.Group();
      newGroup.position.copy(mesh.position);
      newGroup.rotation.copy(mesh.rotation);
      newGroup.scale.copy(mesh.scale);

      const componentData: ComponentData[] = [];

      if (parent) parent.remove(mesh);
      if (parent) parent.add(newGroup);

      const posAttr = indexedGeom.attributes.position;

      components.forEach((faceIndices, idx) => {
        const newPositions: number[] = [];

        faceIndices.forEach((f) => {
          const a = index[f * 3];
          const b = index[f * 3 + 1];
          const c = index[f * 3 + 2];

          newPositions.push(
            posAttr.getX(a),
            posAttr.getY(a),
            posAttr.getZ(a),
            posAttr.getX(b),
            posAttr.getY(b),
            posAttr.getZ(b),
            posAttr.getX(c),
            posAttr.getY(c),
            posAttr.getZ(c)
          );
        });

        const newGeo = new THREE.BufferGeometry();
        newGeo.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(newPositions, 3)
        );
        newGeo.computeVertexNormals();

        const mats =
          (mesh as any).userData.mats ||
          createDualMaterials(new THREE.Color(0x00aaff));

        // Calculate component centroid and size
        const positions = newGeo.attributes.position;
        let sumX = 0,
          sumY = 0,
          sumZ = 0;
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;

        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const y = positions.getY(i);
          const z = positions.getZ(i);
          sumX += x;
          sumY += y;
          sumZ += z;
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
          minZ = Math.min(minZ, z);
          maxZ = Math.max(maxZ, z);
        }

        const geometryCenter = new THREE.Vector3(
          sumX / positions.count,
          sumY / positions.count,
          sumZ / positions.count
        );

        const componentSize = new THREE.Vector3(
          maxX - minX,
          maxY - minY,
          maxZ - minZ
        );

        // Generate smart component name
        const smartName = generateComponentName(
          geometryCenter,
          componentSize,
          localCenter,
          idx,
          components.length
        );

        const newMesh = new THREE.Mesh(
          newGeo,
          viewMode === "solid" ? mats.solid : mats.holo
        );
        (newMesh as any).userData = {
          name: smartName,
          description: "Component awaiting AI identification. Click 'Identify with AI' for detailed analysis.",
          type: "Aircraft Component",
          mats,
        };
        newMesh.castShadow = false;
        newMesh.receiveShadow = false;

        // Center the geometry to its own origin so rotation/scaling works from center
        newGeo.translate(
          -geometryCenter.x,
          -geometryCenter.y,
          -geometryCenter.z
        );

        // mats is already defined above (line 694), reusing it.

        // newMesh is already defined above (line 695). We are modifying it, but since it was created with newGeo BEFORE translation,
        // the geometry update (translate) will reflect in the mesh.
        // However, we need to update the userData if we wanted to change it, but the previous code set it up correctly.
        // The issue with the previous code was that newMesh was at (0,0,0) relative to parent, but geometry was offset.
        // Now geometry is centered at (0,0,0), and we will move newMesh to the centroid position.

        const localPos = geometryCenter.clone();

        componentData.push({
          mesh: newMesh,
          originalLocalPos: localPos.clone(),
          centroid: geometryCenter.clone(),
        });

        newMesh.position.copy(localPos);
        newGroup.add(newMesh);
      });

      // Store exploded view data
      explodedGroupsRef.current.set(newGroup, {
        originalCenter: localCenter,
        components: componentData,
      });

      // Enable exploded view
      setIsExploded(true);
      applyExplodedView(newGroup, componentData, localCenter);
      setShowExplodedControls(true);

      // Cleanup
      const rootIdx = generatedObjectsRef.current.indexOf(mesh);
      if (rootIdx > -1) generatedObjectsRef.current[rootIdx] = newGroup;

      setLoading(false);
      resetView();
    }, 100);
  };

  const applyExplodedView = (
    group: THREE.Group,
    componentData: ComponentData[],
    center: THREE.Vector3
  ) => {
    // Center the model at origin
    if (isExploded || explosionDistance <= 0.05) {
      // If exploded view is active, we might need to be careful, but this function is mostly loop/animate
      // For now, relying on the stored data.
    }

    componentData.forEach((data, idx) => {
      // Calculate direction from center
      let direction = new THREE.Vector3();
      if (data.centroid) {
        direction.subVectors(data.centroid, center);
      } else {
        direction.subVectors(data.originalLocalPos, center);
      }

      const dist = direction.length();

      if (dist < 0.001) {
        const angle = (idx / componentData.length) * Math.PI * 2;
        const elevation = ((idx % 3) - 1) * 0.3;
        direction.set(
          Math.cos(angle) * Math.cos(elevation),
          Math.sin(elevation),
          Math.sin(angle) * Math.cos(elevation)
        );
      } else {
        direction.normalize();
      }

      // Adjust explosion distance by model scale to ensure consistent visual displacement
      // regardless of the model's original size or the applied normalization scale.
      const scale = group.scale.x || 1;
      const adjustedDistance = explosionDistance / scale;

      const offset = direction.multiplyScalar(adjustedDistance);
      data.mesh.position.copy(data.originalLocalPos).add(offset);
    });
  };

  useEffect(() => {
    explodedGroupsRef.current.forEach((data, group) => {
      applyExplodedView(group, data.components, data.originalCenter);
    });
  }, [isExploded, explosionDistance]);

  // Watch for external model selection changes
  useEffect(() => {
    if (externalSelectedModelId && hasModel(externalSelectedModelId)) {
      const model = getModelById(externalSelectedModelId);
      if (model) {
        console.log("Loading model from external selection:", model.id, model.path);
        setCurrentDemoModelId(externalSelectedModelId);
        loadModelFromUrl(model.path, false);
        setShowOnboarding(false); // Hide onboarding when model is loaded externally
      }
    }
  }, [externalSelectedModelId]);

  useEffect(() => {
    if (modelReady && animationFinished) {
      setLoading(false);
      // Reset states for next load
      setModelReady(false);
      setAnimationFinished(false);
    }
  }, [modelReady, animationFinished]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !sceneRef.current) return;

    // Hide onboarding if active
    if (showOnboarding) setShowOnboarding(false);

    const url = URL.createObjectURL(file);
    loadModelFromUrl(url, true);

    // Reset file input to allow re-uploading the same file
    if (event.target) {
      event.target.value = "";
    }
  };

  const setupMultiMeshExplodedView = (
    group: THREE.Group,
    meshes: THREE.Mesh[]
  ) => {
    const componentData: ComponentData[] = [];
    group.updateMatrixWorld();

    meshes.forEach((mesh) => {
      let localPos = new THREE.Vector3();

      if (mesh.parent === group) {
        localPos.copy(mesh.position);
      } else {
        const worldPos = new THREE.Vector3();
        mesh.getWorldPosition(worldPos);
        const groupInverse = new THREE.Matrix4()
          .copy(group.matrixWorld)
          .invert();
        localPos = worldPos.clone().applyMatrix4(groupInverse);
      }

      const meshBox = new THREE.Box3().setFromObject(mesh);
      const meshCenter = new THREE.Vector3();
      meshBox.getCenter(meshCenter);

      // Convert world center to local center relative to group
      // This ensures that when we use it for direction, it respects the group's transform
      group.worldToLocal(meshCenter);

      componentData.push({
        mesh,
        originalLocalPos: localPos.clone(),
        centroid: meshCenter.clone(),
      });
    });

    // Calculate average local center based on component centroids
    const localCenter = new THREE.Vector3();
    if (componentData.length > 0) {
      const box = new THREE.Box3();
      componentData.forEach((c) => box.expandByPoint(c.centroid));
      box.getCenter(localCenter);
    }

    explodedGroupsRef.current.set(group, {
      originalCenter: localCenter,
      components: componentData,
    });
  };

  const exportGLB = () => {
    if (!sceneRef.current) return;
    const exporter = new GLTFExporter();
    exporter.parse(
      sceneRef.current,
      (result) => {
        const output = JSON.stringify(result, null, 2);
        const blob = new Blob([output], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `model-${Date.now()}.glb`;
        link.click();
      },
      (err) => console.error(err)
    );
  };

  const identifyPart = async () => {
    // Use ref as fallback if state hasn't updated yet (e.g., after auto-selection)
    const currentObject = selectedObject || selectedObjectRef.current;

    if (
      !currentObject ||
      !rendererRef.current ||
      !sceneRef.current ||
      !cameraRef.current
    ) {
      console.error("identifyPart: Missing required references", {
        selectedObject: !!selectedObject,
        selectedObjectRef: !!selectedObjectRef.current,
        renderer: !!rendererRef.current,
        scene: !!sceneRef.current,
        camera: !!cameraRef.current,
      });
      return;
    }

    const objectName = (currentObject as any).userData?.name || currentObject.name || "Unknown";

    if (IS_PRODUCTION_DEMO && currentDemoModelId) {
      console.log("Production Demo: Loading preloaded annotation for", objectName);

      // Show loader for 5 seconds to simulate AI processing
      setIsIdentifying(true);
      setShowInferenceLoader(true);

      setTimeout(() => {
        // In production demo, we use the single default annotation for the model
        const annotation = getDemoAnnotation(currentDemoModelId);

        if (annotation) {
          setInspectorData((prev) => ({
            ...prev,
            name: annotation.name,
            description: annotation.description,
            type: annotation.category,
          }));
          setAiIdentifyActive(true);
        } else {
          console.warn("No demo annotation found for model:", currentDemoModelId);
          // Fallback
          setInspectorData((prev) => ({
            ...prev,
            name: objectName,
            description: "This is a demo part without a specific preloaded annotation.",
            type: "Demo Component",
          }));
          alert("No preloaded annotation for this model in demo mode.");
        }

        // Hide loader
        setIsIdentifying(false);
        setShowInferenceLoader(false);
      }, 5000); // 5 second delay

      return;
    }

    console.log("identifyPart: Starting AI identification for", objectName);
    console.log("identifyPart: Object reference:", currentObject);
    console.log("identifyPart: Object UUID:", currentObject.uuid);

    // Verify object is still in the current scene (not from a previous model)
    let objectInScene = false;
    if (sceneRef.current) {
      sceneRef.current.traverse((child) => {
        if (child === currentObject || child.uuid === currentObject.uuid) {
          objectInScene = true;
        }
      });
    }
    console.log("identifyPart: Object is in current scene:", objectInScene);

    if (!objectInScene) {
      console.error("identifyPart: Object is not in current scene - may be from old model, skipping cache check");
    } else {
      // Check central cache using Object UUID
      // This is more reliable than userData which might persist or get confused
      const cachedData = annotationsCacheRef.current[currentObject.uuid];
      console.log("identifyPart: Checking central cache for UUID:", currentObject.uuid);
      console.log("identifyPart: Cached data exists:", !!cachedData);

      if (cachedData && cachedData.annotatedImage) {
        console.log("identifyPart: Using cached result from central store for", objectName);
        setAnnotatedImage(cachedData.annotatedImage);
        setShowAnnotatedModal(true);
        setAiIdentifyActive(true); // Mark as active so button can close it
        return;
      }
    }

    console.log("identifyPart: No cache found or object not in scene - will run AI identification for", objectName);

    setIsIdentifying(true);
    setShowInferenceLoader(true);

    try {
      // 1. Capture Image
      // Ensure we render the current isolated view first
      if (composerRef.current) composerRef.current.render();
      else rendererRef.current.render(sceneRef.current, cameraRef.current);

      const screenshot = rendererRef.current.domElement.toDataURL("image/jpeg", 0.8);

      console.log("identifyPart: Screenshot captured, size:", screenshot.length);

      // 2. Gather Mesh Data
      const mesh = currentObject as THREE.Mesh;
      const geometry = mesh.geometry;
      if (!geometry.boundingBox) geometry.computeBoundingBox();
      const box = geometry.boundingBox!;
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);

      const meshAnalysis = {
        name: (mesh as any).userData.name || "Unknown Part",
        position: mesh.position,
        size: { width: size.x, height: size.y, depth: size.z },
        vertexCount: geometry.attributes.position.count,
        centerPoint: center,
      };

      console.log("identifyPart: Mesh analysis prepared", meshAnalysis);

      // 3. Call API
      console.log("identifyPart: Calling AI API...");
      const res = await fetch("/api/ai-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meshAnalysis,
          modelType: prompt, // Use the search prompt as model type hint
          meshImage: screenshot,
          searchQuery: prompt,
        }),
      });

      console.log("identifyPart: API response status:", res.status);

      if (!res.ok) {
        throw new Error(`API request failed with status ${res.status}`);
      }

      const data = await res.json();
      console.log("identifyPart: API response received", data);

      if (data.error) throw new Error(data.error);

      // Debug logging
      console.log("API Response received:", {
        hasAnnotatedImage: !!data.annotatedImage,
        annotatedImageLength: data.annotatedImage?.length || 0,
        annotatedImagePreview: data.annotatedImage?.substring(0, 100) || "none",
      });

      // 4. Update Inspector
      setInspectorData((prev) => ({
        ...prev,
        name: data.name,
        description: data.description,
        type: data.category,
        annotatedImage: data.annotatedImage || null,
      }));

      // 5. Cache data in central store
      if (currentObject) {
        const objectName = (currentObject as any).userData?.name || currentObject.name || "Unknown";
        console.log("identifyPart: Caching annotation data to central store for UUID:", currentObject.uuid);

        annotationsCacheRef.current[currentObject.uuid] = {
          name: data.name,
          description: data.description,
          type: data.category,
          annotatedImage: data.annotatedImage || null,
        };

        // Also update userData for fallback/inspector compatibility
        (currentObject as any).userData = {
          ...(currentObject as any).userData,
          name: data.name,
          description: data.description,
          type: data.category,
          annotatedImage: data.annotatedImage || null,
        };
        console.log("identifyPart: Cache saved - annotatedImage length:", data.annotatedImage?.length || 0);
      } else {
        console.error("identifyPart: Cannot cache - currentObject is null");
      }

      // 6. Show annotated image if available
      if (data.annotatedImage) {
        console.log("identifyPart: Setting annotated image and opening modal");
        setAnnotatedImage(data.annotatedImage);
        setShowAnnotatedModal(true);
        setAiIdentifyActive(true); // Mark as active so button can close it
      } else {
        console.log("identifyPart: No annotated image in response");
      }
    } catch (error) {
      console.error("identifyPart: Error during AI identification:", error);

      // Fallback: Show basic info without AI
      setInspectorData((prev) => ({
        ...prev,
        name: (currentObject as any).userData?.name || "Unknown Part",
        description: "AI identification failed. Please try again or check your API configuration.",
        type: "Unknown",
      }));
    } finally {
      setIsIdentifying(false);
      setShowInferenceLoader(false);
      // Note: aiIdentifyActive remains true until user presses Button A again to close modal
    }
  };

  const handleExport = () => {
    if (!sceneRef.current) return;

    // Export the scene as GLB
    new GLTFExporter().parse(
      sceneRef.current,
      (result) => {
        const output = JSON.stringify(result, null, 2);
        const blob = new Blob([output], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `model-${Date.now()}.glb`;
        link.click();
      },
      (err) => console.error(err)
    );
  };

  const handleDemoSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const modelId = e.target.value;
    if (!modelId) return;

    // Hide onboarding if active
    if (showOnboarding) setShowOnboarding(false);

    // Try to use model registry first, fallback to DEMO_MODELS for compatibility
    let model: { path: string; name?: string; displayName?: string } | undefined = getModelById(modelId);
    if (!model) {
      model = DEMO_MODELS.find(m => m.id === modelId);
    }

    if (model) {
      console.log("Loading demo model:", model.name || model.displayName, model.path);
      setCurrentDemoModelId(modelId);
      loadModelFromUrl(model.path, false);
    } else {
      console.error("Model not found in registry:", modelId);
    }
  };

  // Helper for Onboarding overlay to trigger demo select
  const handleOnboardingDemoSelect = (modelId: string) => {
    if (!modelId) return;
    setShowOnboarding(false);

    // Try to use model registry first, fallback to DEMO_MODELS for compatibility
    let model: { path: string; name?: string; displayName?: string } | undefined = getModelById(modelId);
    if (!model) {
      model = DEMO_MODELS.find(m => m.id === modelId);
    }

    if (model) {
      console.log("Loading demo model:", model.name || model.displayName, model.path);
      setCurrentDemoModelId(modelId);
      loadModelFromUrl(model.path, false);
    } else {
      console.error("Model not found in registry:", modelId);
    }
  };

  return (
    <div className="absolute inset-0 bg-black z-0">
      <div className="w-full h-full relative">
        {/* Onboarding Overlay */}
        {showOnboarding && (
          <OnboardingOverlay
            isDemoMode={IS_PRODUCTION_DEMO}
            onGenerate={generateModel}
            onSelectDemo={handleOnboardingDemoSelect}
            onImport={() => {
              document.getElementById("file-input")?.click();
              // Don't dismiss immediately, wait for file selection in handleFileUpload
            }}
            onDismiss={() => setShowOnboarding(false)}
            onSketchfabLoad={(url) => {
              setShowOnboarding(false);
              loadModelFromUrl(url, true);
            }}
          />
        )}

        {/* Top Controls */}
        <div className="absolute top-0 left-0 w-full z-10 p-4 flex justify-between items-center pointer-events-none">
          {/* Back Button */}
          <Link
            href="/"
            className="pointer-events-auto h-[32px] px-4 bg-[#1D1E15] border border-[#1D1E15] text-[#E5E6DA] text-[10px] font-bold hover:bg-[#3B82F6] hover:border-[#3B82F6] transition-colors flex items-center gap-2 uppercase tracking-wide cursor-pointer shadow-md"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>

          {!showInferenceLoader && (
            <div className="flex items-center gap-2 pointer-events-auto">
              {/* Model Catalog Dropdown */}
              <div className="relative" ref={bottomDropdownRef}>
                <button
                  onClick={() => setIsBottomDropdownOpen(!isBottomDropdownOpen)}
                  className="h-8 px-4 bg-[#2a2b22] border border-white/20 rounded text-[#E5E6DA] text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:bg-[#3a3b32] transition-all duration-200 min-w-[280px] flex items-center justify-between gap-2"
                  style={{ fontFamily: 'monospace' }}
                >
                  <span>{currentDemoModelId ? DEMO_MODELS.find(m => m.id === currentDemoModelId)?.name.toUpperCase() : 'SELECT A MODEL'}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${isBottomDropdownOpen ? 'rotate-180' : ''}`}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {isBottomDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-[#2a2b22] border border-white/20 rounded min-w-[280px] max-h-[300px] overflow-y-auto z-50">
                    <div
                      className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[#E5E6DA] hover:bg-[#3a3b32] cursor-pointer"
                      onClick={() => {
                        setIsBottomDropdownOpen(false);
                      }}
                    >
                      SELECT A MODEL
                    </div>
                    {DEMO_MODELS.map((model) => (
                      <div
                        key={model.id}
                        className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider cursor-pointer ${currentDemoModelId === model.id ? 'bg-[#3B82F6] text-white' : 'text-[#E5E6DA] hover:bg-[#3a3b32]'}`}
                        onClick={() => {
                          if (showOnboarding) setShowOnboarding(false);
                          let modelData: { path: string } | undefined = getModelById(model.id);
                          if (!modelData) {
                            modelData = DEMO_MODELS.find(m => m.id === model.id);
                          }
                          if (modelData) {
                            setCurrentDemoModelId(model.id);
                            loadModelFromUrl(modelData.path, false);
                          }
                          setIsBottomDropdownOpen(false);
                        }}
                      >
                        {model.name.toUpperCase()}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 bg-[#2a2b22] border border-white/20 p-1 backdrop-blur-md h-[32px]">
                <button
                  onClick={() => setViewMode("holo")}
                  className={`h-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors cursor-pointer flex items-center justify-center ${viewMode === "holo"
                    ? "bg-[#3B82F6] text-white"
                    : "bg-transparent text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  Wireframe
                </button>
                <button
                  onClick={() => setViewMode("solid")}
                  className={`h-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors cursor-pointer flex items-center justify-center ${viewMode === "solid"
                    ? "bg-[#3B82F6] text-white"
                    : "bg-transparent text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  Solid
                </button>
              </div>
              <Link
                href={`/simulation?asset=${currentDemoModelId || 'demo-2'}`}
                className="pointer-events-auto h-[32px] px-3 bg-[#3B82F6] border border-[#3B82F6] text-white text-[10px] font-bold hover:bg-[#2563EB] transition-colors flex items-center gap-1.5 uppercase tracking-wide cursor-pointer"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="none"
                  aria-hidden="true"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Simulate
              </Link>
              <button
                onClick={exportGLB}
                className="h-[32px] px-3 bg-[#2a2b22] border border-white/20 text-white text-[10px] font-bold hover:bg-white/10 transition-colors flex items-center gap-1.5 uppercase tracking-wide cursor-pointer"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export
              </button>
              <button
                onClick={resetView}
                className="h-[32px] px-3 bg-[#2a2b22] border border-white/20 text-white text-[10px] font-bold hover:bg-white/10 transition-colors flex items-center gap-1.5 uppercase tracking-wide cursor-pointer"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" />
                </svg>
                Reset
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="h-[42px] px-3 bg-white text-[#1D1E15] text-[10px] font-bold hover:bg-[#3B82F6] hover:text-white transition-colors uppercase tracking-wide cursor-pointer rounded-lg border border-[#1D1E15]"
                >
                  Close
                </button>
              )}
            </div>
          )}
        </div>

        {/* Generate Prompt Bar - Hidden completely since we have catalog dropdown at top */}
        {!showOnboarding && !IS_PRODUCTION_DEMO && (
          <div className="absolute bottom-0 left-0 w-full z-10 p-4 pointer-events-none">
            <div className="max-w-2xl mx-auto pointer-events-auto">
              <div className="bg-white border border-[#1D1E15] backdrop-blur-md p-1.5 flex gap-2 items-center shadow-lg">
                {false ? (
                  <div className="flex-1 relative" ref={bottomDropdownRef}>
                    <button
                      onClick={() => setIsBottomDropdownOpen(!isBottomDropdownOpen)}
                      className="w-full bg-[#1D1E15] border border-[#1D1E15] text-[#E5E6DA] text-[10px] font-mono px-3 py-2 rounded outline-none focus:border-[#3B82F6] transition-colors flex items-center justify-between hover:bg-[#1D1E15]/90"
                    >
                      <span className={currentDemoModelId ? "text-[#E5E6DA]" : "text-[#E5E6DA]/60"}>
                        {currentDemoModelId
                          ? DEMO_MODELS.find(m => m.id === currentDemoModelId)?.name
                          : "Select a Demo Model"}
                      </span>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`transition-transform duration-200 ${isBottomDropdownOpen ? "rotate-180" : ""}`}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>

                    {isBottomDropdownOpen && (
                      <div className="absolute bottom-full left-0 right-0 mb-1 bg-[#1D1E15] border border-[#1D1E15] rounded shadow-lg overflow-hidden z-50 max-h-48 overflow-y-auto">
                        {DEMO_MODELS.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => {
                              handleDemoSelect({ target: { value: model.id } } as any);
                              setIsBottomDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2.5 text-[10px] font-mono text-[#E5E6DA] hover:bg-[#3B82F6] hover:text-white transition-colors border-b border-[#E5E6DA]/10 last:border-0"
                          >
                            {model.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <input
                      id="prompt-input"
                      type="text"
                      placeholder="Generate procedural model"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          generateModel(prompt);
                        }
                      }}
                      className="flex-1 bg-transparent border-none outline-none text-[#1D1E15] placeholder-[#1D1E15]/40 text-[10px] font-mono px-3"
                    />
                    <button
                      onClick={() => generateModel(prompt)}
                      disabled={!prompt.trim() || loading}
                      className="px-4 py-2 bg-white border border-[#1D1E15] text-[#1D1E15] text-[10px] font-bold hover:bg-[#3B82F6] hover:text-white transition-colors flex-shrink-0 uppercase tracking-wide cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Generate
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Control Instructions */}
        {!showOnboarding && (
          <div className="absolute bottom-16 right-4 z-10 pointer-events-none">
            <div className="text-[9px] font-mono text-[#E5E6DA]/60 space-y-0.5 text-right">
              <div>Left Click + Drag: Rotate</div>
              <div>Right Click + Drag: Pan</div>
              <div>Scroll: Zoom In/Out</div>
              <div>⌘ + Click + Drag: Pan (Mac)</div>
            </div>
          </div>
        )}

        {/* Vehicle Stats Panel - Right Side */}
        {!showOnboarding && currentDemoModelId && DEMO_MODELS.find(m => m.id === currentDemoModelId)?.stats && (
          <div className="absolute top-20 right-4 w-56 bg-[#0a0a0a]/95 border border-[#E5E6DA]/20 backdrop-blur-md flex flex-col overflow-hidden transition-transform duration-300 shadow-xl z-20">
            <div className="px-4 py-3 border-b border-[#E5E6DA]/10">
              <div className="text-[9px] text-[#E5E6DA]/50 uppercase tracking-widest font-mono">Vehicle Specifications</div>
            </div>
            <div className="p-4 space-y-3">
              {(() => {
                const stats = DEMO_MODELS.find(m => m.id === currentDemoModelId)?.stats;
                if (!stats) return null;
                return (
                  <>
                    <div className="flex items-center gap-3">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                      <div className="flex-1">
                        <div className="text-[8px] text-[#E5E6DA]/40 uppercase tracking-widest font-mono">Crew</div>
                        <div className="text-[11px] text-[#E5E6DA]/80 font-mono">{stats.crew}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2"><path d="M3 22h18" /><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" /></svg>
                      <div className="flex-1">
                        <div className="text-[8px] text-[#E5E6DA]/40 uppercase tracking-widest font-mono">Fuel Capacity</div>
                        <div className="text-[11px] text-[#E5E6DA]/80 font-mono">{stats.fuelCapacity}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                      <div className="flex-1">
                        <div className="text-[8px] text-[#E5E6DA]/40 uppercase tracking-widest font-mono">Unit Cost</div>
                        <div className="text-[11px] text-[#E5E6DA]/80 font-mono">{stats.unitCost}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                      <div className="flex-1">
                        <div className="text-[8px] text-[#E5E6DA]/40 uppercase tracking-widest font-mono">Maintenance</div>
                        <div className="text-[11px] text-[#E5E6DA]/80 font-mono">{stats.maintenanceCost}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>
                      <div className="flex-1">
                        <div className="text-[8px] text-[#E5E6DA]/40 uppercase tracking-widest font-mono">Max Speed</div>
                        <div className="text-[11px] text-[#E5E6DA]/80 font-mono">{stats.maxSpeed}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
                      <div className="flex-1">
                        <div className="text-[8px] text-[#E5E6DA]/40 uppercase tracking-widest font-mono">Range</div>
                        <div className="text-[11px] text-[#E5E6DA]/80 font-mono">{stats.range}</div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Inspector Panel - Always Visible */}
        <div
          className="absolute top-20 left-4 bottom-20 w-64 bg-[#1D1E15]/90 border border-white/20 backdrop-blur-md flex flex-col overflow-hidden transition-transform duration-300 shadow-xl z-20 translate-x-0"
        >
          <div className="shrink-0 border-b border-white/10 pb-3 px-4 pt-4">
            {/* Component Dropdown */}
            <div className="mb-3">
              <label className="text-[9px] text-white/50 uppercase tracking-wider mb-1 block">
                Component Selector
              </label>
              <select
                value={selectedObject ? (selectedObject as any).uuid : "overall"}
                onChange={(e) => {
                  if (e.target.value === "overall") {
                    resetView();
                  } else {
                    // Find and select the component by UUID
                    sceneRef.current?.traverse((child) => {
                      if (child.uuid === e.target.value && (child as THREE.Mesh).isMesh) {
                        handleObjectClick(child);
                      }
                    });
                  }
                }}
                className="w-full px-2 py-1.5 bg-[#2a2b22] border border-white/20 text-[10px] font-mono text-white cursor-pointer hover:border-[#3B82F6] transition-colors"
              >
                <option value="overall">📊 Overall Model View</option>
                {generatedObjectsRef.current.map((group) => {
                  const components: React.ReactElement[] = [];
                  group.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh && (child as any).userData?.name) {
                      const mesh = child as THREE.Mesh;
                      components.push(
                        <option key={mesh.uuid} value={mesh.uuid}>
                          🔹 {(mesh as any).userData.name}
                        </option>
                      );
                    }
                  });
                  return components;
                })}
              </select>
            </div>

            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h2 className="text-base font-bold text-white truncate font-sans flex-1">
                {inspectorData.name || "Component Inspector"}
              </h2>
              {showSplitSection && (
                <div className="flex items-center gap-1 bg-gradient-to-br from-[#3B82F6]/30 to-[#3B82F6]/20 border border-[#3B82F6] rounded px-1.5 py-0.5 shrink-0 animate-pulse">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5">
                    <path d="M21 8v13H3V8" />
                    <path d="M1 3h22v5H1z" />
                    <path d="M10 12h4" />
                  </svg>
                  <span className="text-[8px] font-bold text-[#3B82F6] uppercase">Splittable</span>
                </div>
              )}
            </div>
            <span className="px-1.5 py-0.5 bg-[#3B82F6]/20 border border-[#3B82F6] rounded text-[10px] text-[#3B82F6] font-mono uppercase">
              {inspectorData.type || "Select a component"}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 font-mono">
            {selectedObject ? (
              <>
                <div>
                  <h3 className="text-[10px] text-white/50 uppercase tracking-wider mb-1.5">
                    Description
                  </h3>
                  <p className="text-[10px] text-white/80 leading-relaxed break-words">
                    {inspectorData.description}
                  </p>

                  {/* Prominent AI Identification Section */}
                  <div className="mt-4 p-3 bg-gradient-to-br from-[#3B82F6]/20 to-[#3B82F6]/10 border-2 border-[#3B82F6]/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div>
                        <h4 className="text-[10px] font-bold text-white uppercase tracking-wide">AI Analysis</h4>
                        <p className="text-[9px] text-white/60">Get detailed component intel</p>
                      </div>
                    </div>
                    <button
                      onClick={identifyPart}
                      disabled={isIdentifying}
                      className="mt-2 w-full px-4 py-3 bg-[#3B82F6] border-2 border-[#3B82F6] text-white text-[11px] font-bold hover:bg-[#3B82F6]/80 transition-all uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isIdentifying ? (
                        <>
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ANALYZING...
                        </>
                      ) : (
                        <>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                            <path d="M11 8v6" />
                            <path d="M8 11h6" />
                          </svg>
                          IDENTIFY COMPONENT
                        </>
                      )}
                    </button>
                  </div>
                </div>
                {showSplitSection && (
                  <div className="mt-2 p-3 bg-white/5 border border-white/10 rounded-xl">
                    <div className="text-[10px] text-white/70 mb-2 font-bold uppercase tracking-wider">
                      Actions
                    </div>
                    <button
                      onClick={handleSplitMesh}
                      className="w-full px-3 py-2 bg-[#3B82F6] border border-[#3B82F6] text-white text-[10px] font-bold flex items-center justify-center gap-1.5 mb-2 hover:bg-[#3B82F6]/80 transition-colors uppercase tracking-wide cursor-pointer"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 8v13H3V8" />
                        <path d="M1 3h22v5H1z" />
                        <path d="M10 12h4" />
                      </svg>
                      Split Mesh
                    </button>
                    <p className="text-[10px] text-white/60 mb-2 leading-relaxed break-words">
                      Separates disconnected geometry into distinct parts.
                    </p>
                    {showExplodedControls && (
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[10px] text-white font-bold uppercase">
                            Exploded View
                          </label>
                          <button
                            onClick={() => {
                              setIsExploded(!isExploded);
                            }}
                            className={`px-2 py-1 text-[10px] font-bold uppercase border transition-colors cursor-pointer ${isExploded
                              ? "bg-[#3B82F6] text-white border-[#3B82F6]"
                              : "bg-transparent text-white border-white/30 hover:bg-white/10"
                              }`}
                          >
                            {isExploded ? "On" : "Off"}
                          </button>
                        </div>
                        <div className="mt-1.5">
                          <label className="text-[10px] text-white/60 block mb-1">
                            Distance: {explosionDistance.toFixed(1)}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="3"
                            step="0.1"
                            value={explosionDistance}
                            onChange={(e) =>
                              setExplosionDistance(parseFloat(e.target.value))
                            }
                            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/5 p-2 border border-white/10">
                    <div className="text-[10px] text-white/50 mb-1 uppercase">
                      Geometry
                    </div>
                    <div className="text-white font-bold text-[10px]">
                      High Poly
                    </div>
                  </div>
                  <div className="bg-white/5 p-2 border border-white/10">
                    <div className="text-[10px] text-white/50 mb-1 uppercase">
                      Status
                    </div>
                    <div className="text-white font-bold text-[10px]">
                      Active
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col items-center text-center px-6 py-4">
                  <div className="w-16 h-16 bg-[#3B82F6]/20 rounded-full flex items-center justify-center mb-3">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">
                    {currentDemoModelId ? DEMO_MODELS.find(m => m.id === currentDemoModelId)?.name : "Overall Model View"}
                  </h3>
                  <p className="text-[10px] text-white/60 leading-relaxed mb-4">
                    {currentDemoModelId
                      ? "Select a component from the dropdown above or click on the 3D model to inspect individual parts."
                      : "Load a model from the dropdown at the top to begin analysis."}
                  </p>
                </div>

                {/* Model Statistics */}
                {generatedObjectsRef.current.length > 0 && (
                  <div className="px-4">
                    <h4 className="text-[10px] font-bold text-white uppercase tracking-wider mb-2">Model Statistics</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white/5 p-2 border border-white/10 rounded">
                        <div className="text-[9px] text-white/50 mb-1 uppercase">Components</div>
                        <div className="text-white font-bold text-sm">
                          {(() => {
                            let count = 0;
                            generatedObjectsRef.current.forEach(group => {
                              group.traverse(child => {
                                if ((child as THREE.Mesh).isMesh) count++;
                              });
                            });
                            return count;
                          })()}
                        </div>
                      </div>
                      <div className="bg-white/5 p-2 border border-white/10 rounded">
                        <div className="text-[9px] text-white/50 mb-1 uppercase">View Mode</div>
                        <div className="text-white font-bold text-sm capitalize">{viewMode}</div>
                      </div>
                      <div className="bg-white/5 p-2 border border-white/10 rounded col-span-2">
                        <div className="text-[9px] text-white/50 mb-1 uppercase">Model Type</div>
                        <div className="text-white font-bold text-[10px]">
                          {currentDemoModelId ? DEMO_MODELS.find(m => m.id === currentDemoModelId)?.annotation.category : "No Model Loaded"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tooltip */}
        <div
          ref={tooltipRef}
          className="fixed z-50 px-3 py-2 bg-[#1D1E15] text-[#E5E6DA] border border-[#1D1E15] text-xs font-mono uppercase tracking-wide pointer-events-none opacity-0 transition-opacity duration-150 shadow-lg"
          style={{ top: 0, left: 0 }}
        />

        {/* Canvas Container */}
        <div
          ref={containerRef}
          className="w-full h-full relative"
          onClick={handleClick}
          onMouseMove={handleMouseMove}
        />

        {/* Interaction Hint Popup */}
        {showInteractionHint && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative">
              {/* Hint Box */}
              <div className="bg-[#3B82F6] border-2 border-[#1D1E15] px-4 py-3 shadow-2xl max-w-[320px]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#1D1E15] rounded flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-xs font-bold uppercase tracking-wide mb-1">
                      Quick Tip
                    </p>
                    <p className="text-white/90 text-[10px] font-mono leading-relaxed">
                      Click on the model to open the inspector panel and explore its components
                    </p>
                  </div>
                </div>

                {/* Dismiss Button */}
                <button
                  onClick={() => setShowInteractionHint(false)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-[#1D1E15] text-white rounded-full flex items-center justify-center hover:bg-[#1D1E15]/80 transition-colors cursor-pointer border-2 border-[#3B82F6]"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Loader */}
        {loading && (
          <BlockyLoader onFinished={() => setAnimationFinished(true)} />
        )}

        {/* AI Inference Loader */}
        <AnimatePresence>
          {showInferenceLoader && (
            <AIInferenceLoader
              objectName={(selectedObject as any)?.userData?.name || "Selected Object"}
              shouldClose={inferenceLoaderReady}
              onFinished={() => setShowInferenceLoader(false)}
              scene={sceneRef.current}
              camera={cameraRef.current}
              renderer={rendererRef.current}
              composer={composerRef.current}
              allObjects={generatedObjectsRef.current}
              controls={controlsRef.current}
              vehicleStats={currentDemoModelId ? DEMO_MODELS.find(m => m.id === currentDemoModelId)?.stats : null}
            />
          )}
        </AnimatePresence>

        {/* Model-specific Image Overlay */}
        {showA10Image && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative max-w-4xl max-h-[90vh] p-4">
              <button
                onClick={() => setShowA10Image(false)}
                className="absolute -top-2 -right-2 z-10 w-10 h-10 bg-[#1D1E15] text-white rounded-full flex items-center justify-center hover:bg-[#3B82F6] transition-colors cursor-pointer border-2 border-[#3B82F6]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <img
                src={
                  currentDemoModelId === "demo-1" ? "/UAV.png" :
                    currentDemoModelId === "demo-3" ? "/1.png" :
                      "/A10.png"
                }
                alt={
                  currentDemoModelId === "demo-1" ? "UAV Drone" :
                    currentDemoModelId === "demo-3" ? "F/A-18F Super Hornet" :
                      "A10"
                }
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
