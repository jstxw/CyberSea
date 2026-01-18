"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface WireframeShipProps {
  className?: string;
}

export default function WireframeShip({ className }: WireframeShipProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const scene = new THREE.Scene();
    const aspect = container.clientWidth / container.clientHeight;
    const frustumSize = 4;
    const camera = new THREE.OrthographicCamera(
      -frustumSize * aspect / 2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      1000
    );
    // Top-down view
    camera.position.set(0, 10, 0);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    container.appendChild(renderer.domElement);

    // Ship group
    const shipGroup = new THREE.Group();
    scene.add(shipGroup);

    // White wireframe material - front side only for clean look
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
      side: THREE.FrontSide,
    });

    // Create angular hull shape using ExtrudeGeometry for proper ship shape
    const hullShape = new THREE.Shape();
    // Start at stern (back) left
    hullShape.moveTo(-0.35, -2);
    // Left side going forward
    hullShape.lineTo(-0.4, -1.5);
    hullShape.lineTo(-0.45, -0.5);
    hullShape.lineTo(-0.45, 0.5);
    hullShape.lineTo(-0.4, 1.2);
    hullShape.lineTo(-0.25, 1.8);
    // Pointed bow
    hullShape.lineTo(0, 2.3);
    // Right side going back
    hullShape.lineTo(0.25, 1.8);
    hullShape.lineTo(0.4, 1.2);
    hullShape.lineTo(0.45, 0.5);
    hullShape.lineTo(0.45, -0.5);
    hullShape.lineTo(0.4, -1.5);
    hullShape.lineTo(0.35, -2);
    // Stern
    hullShape.lineTo(-0.35, -2);

    const hullExtrudeSettings = {
      steps: 1,
      depth: 0.25,
      bevelEnabled: false,
    };

    const hullGeo = new THREE.ExtrudeGeometry(hullShape, hullExtrudeSettings);
    hullGeo.rotateX(Math.PI / 2);
    const hull = new THREE.Mesh(hullGeo, wireMat);
    hull.position.set(0, -0.12, 0);
    shipGroup.add(hull);

    // Hull bottom (angled for ship shape)
    const hullBottomShape = new THREE.Shape();
    hullBottomShape.moveTo(-0.25, -1.8);
    hullBottomShape.lineTo(-0.3, -1);
    hullBottomShape.lineTo(-0.3, 0.5);
    hullBottomShape.lineTo(-0.2, 1.5);
    hullBottomShape.lineTo(0, 2.0);
    hullBottomShape.lineTo(0.2, 1.5);
    hullBottomShape.lineTo(0.3, 0.5);
    hullBottomShape.lineTo(0.3, -1);
    hullBottomShape.lineTo(0.25, -1.8);
    hullBottomShape.lineTo(-0.25, -1.8);

    const hullBottomGeo = new THREE.ExtrudeGeometry(hullBottomShape, { steps: 1, depth: 0.15, bevelEnabled: false });
    hullBottomGeo.rotateX(Math.PI / 2);
    const hullBottom = new THREE.Mesh(hullBottomGeo, wireMat);
    hullBottom.position.set(0, -0.27, 0);
    shipGroup.add(hullBottom);


    // Superstructure - main bridge with more segments
    const bridgeGeo = new THREE.BoxGeometry(0.55, 0.4, 0.7, 8, 8, 8);
    const bridge = new THREE.Mesh(bridgeGeo, wireMat);
    bridge.position.set(0, 0.4, -0.2);
    shipGroup.add(bridge);

    // Bridge windows curve (cylinder slice)
    const bridgeCurveGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.5, 24, 8, true, -Math.PI/3, Math.PI*2/3);
    const bridgeCurve = new THREE.Mesh(bridgeCurveGeo, wireMat);
    bridgeCurve.position.set(0, 0.55, 0.05);
    bridgeCurve.rotation.x = Math.PI / 2;
    shipGroup.add(bridgeCurve);

    // Bridge upper level - tapered
    const bridgeUpperGeo = new THREE.CylinderGeometry(0.15, 0.22, 0.25, 16, 6);
    const bridgeUpper = new THREE.Mesh(bridgeUpperGeo, wireMat);
    bridgeUpper.position.set(0, 0.72, -0.2);
    shipGroup.add(bridgeUpper);

    // Main radar mast - lattice structure
    const mastGeo = new THREE.CylinderGeometry(0.015, 0.025, 0.6, 12, 8);
    const mast = new THREE.Mesh(mastGeo, wireMat);
    mast.position.set(0, 1.15, -0.2);
    shipGroup.add(mast);

    // Radar dome 1 (main) - high detail sphere
    const radarDome1Geo = new THREE.SphereGeometry(0.14, 24, 24);
    const radarDome1 = new THREE.Mesh(radarDome1Geo, wireMat);
    radarDome1.position.set(0, 1.45, -0.2);
    shipGroup.add(radarDome1);

    // Radar dish - parabolic
    const radarDishGeo = new THREE.SphereGeometry(0.1, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2);
    const radarDish = new THREE.Mesh(radarDishGeo, wireMat);
    radarDish.position.set(0, 1.0, -0.5);
    radarDish.rotation.x = Math.PI / 4;
    shipGroup.add(radarDish);

    // Secondary radar dome
    const radarDome2Geo = new THREE.SphereGeometry(0.09, 18, 18);
    const radarDome2 = new THREE.Mesh(radarDome2Geo, wireMat);
    radarDome2.position.set(0.2, 0.75, -0.4);
    shipGroup.add(radarDome2);

    // Forward gun turret - detailed
    const turretBaseGeo = new THREE.CylinderGeometry(0.18, 0.2, 0.12, 24, 4);
    const turretBase = new THREE.Mesh(turretBaseGeo, wireMat);
    turretBase.position.set(0, 0.21, 1.0);
    shipGroup.add(turretBase);

    // Gun turret dome
    const turretDomeGeo = new THREE.SphereGeometry(0.12, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const turretDome = new THREE.Mesh(turretDomeGeo, wireMat);
    turretDome.position.set(0, 0.27, 1.0);
    shipGroup.add(turretDome);

    // Gun barrel with detail
    const gunGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.5, 12, 6);
    gunGeo.rotateX(-Math.PI / 2);
    const gun = new THREE.Mesh(gunGeo, wireMat);
    gun.position.set(0, 0.32, 1.3);
    shipGroup.add(gun);

    // VLS cells - grid pattern
    const vlsGeo = new THREE.BoxGeometry(0.35, 0.1, 0.5, 6, 2, 8);
    const vls = new THREE.Mesh(vlsGeo, wireMat);
    vls.position.set(0, 0.22, 0.5);
    shipGroup.add(vls);


    // Helipad circle marking
    const heliCircleGeo = new THREE.TorusGeometry(0.2, 0.01, 8, 32);
    heliCircleGeo.rotateX(Math.PI / 2);
    const heliCircle = new THREE.Mesh(heliCircleGeo, wireMat);
    heliCircle.position.set(0, 0.17, -1.3);
    shipGroup.add(heliCircle);

    // Hangar - curved roof
    const hangarGeo = new THREE.BoxGeometry(0.5, 0.3, 0.35, 8, 6, 6);
    const hangar = new THREE.Mesh(hangarGeo, wireMat);
    hangar.position.set(0, 0.32, -0.85);
    shipGroup.add(hangar);

    // Hangar roof curve
    const hangarRoofGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.35, 16, 4, true, 0, Math.PI);
    hangarRoofGeo.rotateZ(Math.PI / 2);
    const hangarRoof = new THREE.Mesh(hangarRoofGeo, wireMat);
    hangarRoof.position.set(0, 0.47, -0.85);
    shipGroup.add(hangarRoof);

    // CIWS domes
    const ciwsGeo = new THREE.SphereGeometry(0.07, 16, 16);
    const ciws1 = new THREE.Mesh(ciwsGeo, wireMat);
    ciws1.position.set(0.25, 0.5, -0.5);
    shipGroup.add(ciws1);

    const ciws2 = new THREE.Mesh(ciwsGeo, wireMat);
    ciws2.position.set(-0.25, 0.5, -0.5);
    shipGroup.add(ciws2);

    // Exhaust stacks - tapered with detail
    const stackGeo = new THREE.CylinderGeometry(0.05, 0.07, 0.25, 16, 6);
    const stack1 = new THREE.Mesh(stackGeo, wireMat);
    stack1.position.set(0.18, 0.52, 0.05);
    shipGroup.add(stack1);

    const stack2 = new THREE.Mesh(stackGeo, wireMat);
    stack2.position.set(-0.18, 0.52, 0.05);
    shipGroup.add(stack2);

    // Missile launchers on sides
    const missileTubeGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 12, 4);
    missileTubeGeo.rotateZ(Math.PI / 2);
    for (let i = 0; i < 4; i++) {
      const tube1 = new THREE.Mesh(missileTubeGeo, wireMat);
      tube1.position.set(0.4, 0.25, 0.1 - i * 0.12);
      shipGroup.add(tube1);

      const tube2 = new THREE.Mesh(missileTubeGeo, wireMat);
      tube2.position.set(-0.4, 0.25, 0.1 - i * 0.12);
      shipGroup.add(tube2);
    }

    // Antennas - multiple
    const antennaGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.35, 8, 4);
    const antenna1 = new THREE.Mesh(antennaGeo, wireMat);
    antenna1.position.set(0.12, 0.95, -0.1);
    shipGroup.add(antenna1);

    const antenna2 = new THREE.Mesh(antennaGeo, wireMat);
    antenna2.position.set(-0.12, 0.95, -0.1);
    shipGroup.add(antenna2);

    const antenna3 = new THREE.Mesh(antennaGeo, wireMat);
    antenna3.position.set(0, 0.95, -0.35);
    shipGroup.add(antenna3);

    // Bow sonar dome
    const sonarGeo = new THREE.SphereGeometry(0.12, 20, 20);
    const sonar = new THREE.Mesh(sonarGeo, wireMat);
    sonar.position.set(0, -0.05, 1.7);
    sonar.scale.set(0.6, 0.5, 1);
    shipGroup.add(sonar);

    // Propeller shafts
    const shaftGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8, 4);
    shaftGeo.rotateX(Math.PI / 2);
    const shaft1 = new THREE.Mesh(shaftGeo, wireMat);
    shaft1.position.set(0.15, -0.05, -1.8);
    shipGroup.add(shaft1);

    const shaft2 = new THREE.Mesh(shaftGeo, wireMat);
    shaft2.position.set(-0.15, -0.05, -1.8);
    shipGroup.add(shaft2);

    // Propellers
    const propGeo = new THREE.TorusGeometry(0.08, 0.015, 8, 16);
    const prop1 = new THREE.Mesh(propGeo, wireMat);
    prop1.position.set(0.15, -0.05, -2.0);
    shipGroup.add(prop1);

    const prop2 = new THREE.Mesh(propGeo, wireMat);
    prop2.position.set(-0.15, -0.05, -2.0);
    shipGroup.add(prop2);

    // Initial rotation - bow towards bottom-left
    shipGroup.rotation.y = Math.PI / 4 + 0.2;

    // Create a pivot group for rotation into the page
    const pivotGroup = new THREE.Group();
    scene.add(pivotGroup);
    scene.remove(shipGroup);
    pivotGroup.add(shipGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    function animate() {
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    function onResize() {
      if (!container) return;
      const newAspect = container.clientWidth / container.clientHeight;
      camera.left = -frustumSize * newAspect / 2;
      camera.right = frustumSize * newAspect / 2;
      camera.top = frustumSize / 2;
      camera.bottom = -frustumSize / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);

      if (container && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className={className} style={{ width: "100%", height: "100%" }} />;
}
