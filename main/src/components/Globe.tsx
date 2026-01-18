"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import getStarfield from "../utils/getStarfield";

interface GlobeProps {
  className?: string;
}

export default function Globe({ className }: GlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    container.appendChild(renderer.domElement);

    const raycaster = new THREE.Raycaster();
    const pointerPos = new THREE.Vector2();
    const globeUV = new THREE.Vector2();

    const textureLoader = new THREE.TextureLoader();
    const starSprite = textureLoader.load("/circle.png");
    const otherMap = textureLoader.load("/04_rainbow1k.jpg");
    const colorMap = textureLoader.load("/00_earthmap1k.jpg");
    const elevMap = textureLoader.load("/01_earthbump1k.jpg");
    const alphaMap = textureLoader.load("/02_earthspec1k.jpg");

    // Globe group for rotation
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    camera.lookAt(0, 0, 0);

    // Wireframe globe geometry
    const geo = new THREE.IcosahedronGeometry(1, 12);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x0099ff,
      wireframe: true,
      displacementMap: elevMap,
      displacementScale: 0.04,
      transparent: true,
      opacity: 0.8,
      metalness: 0.3,
      roughness: 0.7,
    });
    const globe = new THREE.Mesh(geo, mat);
    globeGroup.add(globe);

    // Interactive points layer with shader
    const detail = 50;
    const pointsGeo = new THREE.IcosahedronGeometry(1.01, detail);

    const vertexShader = `
      uniform float size;
      uniform sampler2D elevTexture;
      uniform vec2 mouseUV;

      varying vec2 vUv;
      varying float vVisible;
      varying float vDist;

      void main() {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        float elv = texture2D(elevTexture, vUv).r;
        vec3 vNormal = normalMatrix * normal;
        vVisible = step(0.0, dot( -normalize(mvPosition.xyz), normalize(vNormal)));
        mvPosition.z += 0.35 * elv;

        float dist = distance(mouseUV, vUv);
        float zDisp = 0.0;
        float thresh = 0.03;
        if (dist < thresh) {
          zDisp = (thresh - dist) * 4.0;
        }
        vDist = dist;
        mvPosition.z += zDisp;

        gl_PointSize = size;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      uniform sampler2D colorTexture;
      uniform sampler2D alphaTexture;
      uniform sampler2D otherTexture;

      varying vec2 vUv;
      varying float vVisible;
      varying float vDist;

      void main() {
        if (floor(vVisible + 0.1) == 0.0) discard;
        float alpha = (1.0 - texture2D(alphaTexture, vUv).r) * 0.6;
        vec3 color = texture2D(otherTexture, vUv).rgb;
        vec3 other = texture2D(colorTexture, vUv).rgb;
        float thresh = 0.03;
        if (vDist < thresh) {
          color = mix(color, other, (thresh - vDist) * 30.0);
        }
        gl_FragColor = vec4(color, alpha);
      }
    `;

    const uniforms = {
      size: { type: "f", value: 5.0 },
      colorTexture: { type: "t", value: colorMap },
      otherTexture: { type: "t", value: otherMap },
      elevTexture: { type: "t", value: elevMap },
      alphaTexture: { type: "t", value: alphaMap },
      mouseUV: { type: "v2", value: new THREE.Vector2(0.0, 0.0) },
    };

    const pointsMat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.NormalBlending,
    });

    const points = new THREE.Points(pointsGeo, pointsMat);
    globeGroup.add(points);

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x080820, 2);
    scene.add(hemiLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
    scene.add(ambientLight);

    // Stars background
    const stars = getStarfield({ numStars: 1500, sprite: starSprite });
    scene.add(stars);

    let frameCount = 0;
    function handleRaycast() {
      raycaster.setFromCamera(pointerPos, camera);
      globe.updateMatrixWorld(true);
      const intersects = raycaster.intersectObject(globe, false);
      if (intersects.length > 0 && intersects[0].uv) {
        globeUV.copy(intersects[0].uv);
        uniforms.mouseUV.value.copy(globeUV);
      }
    }

    function animate() {
      frameCount++;

      if (frameCount % 3 === 0) {
        handleRaycast();
      }

      // Passive rotation
      stars.rotation.y += 0.0002;
      stars.rotation.x += 0.0001;
      globeGroup.rotation.y += 0.002;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    function onMouseMove(evt: MouseEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = evt.clientX - rect.left;
      const y = evt.clientY - rect.top;

      pointerPos.set(
        (x / rect.width) * 2 - 1,
        -(y / rect.height) * 2 + 1
      );
    }

    function onResize() {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);

      if (container && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className={className} style={{ width: "100%", height: "100%" }} />;
}
