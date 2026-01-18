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

      // Dispose all geometries and materials
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else if (child.material) {
            child.material.dispose();
          }
        }
        if (child instanceof THREE.Line) {
          child.geometry?.dispose();
          if (child.material instanceof THREE.Material) {
            child.material.dispose();
          }
        }
      });

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
