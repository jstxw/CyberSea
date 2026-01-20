"use client";

import { useEffect, useRef } from "react";

export default function MeshWave() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    // Grid configuration
    const gridSpacing = 40;
    const waveAmplitude = 8;
    const waveFrequency = 0.015;
    const waveSpeed = 0.02;

    interface Particle {
      baseX: number;
      baseY: number;
      x: number;
      y: number;
      size: number;
      opacity: number;
    }

    const createParticles = (): Particle[] => {
      const particles: Particle[] = [];
      const cols = Math.ceil(canvas.width / gridSpacing) + 2;
      const rows = Math.ceil(canvas.height / gridSpacing) + 2;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          particles.push({
            baseX: col * gridSpacing,
            baseY: row * gridSpacing,
            x: col * gridSpacing,
            y: row * gridSpacing,
            size: 2,
            opacity: 0.4,
          });
        }
      }
      return particles;
    };

    let particles = createParticles();

    const drawPlus = (x: number, y: number, size: number, opacity: number) => {
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Horizontal line
      ctx.moveTo(x - size, y);
      ctx.lineTo(x + size, y);
      // Vertical line
      ctx.moveTo(x, y - size);
      ctx.lineTo(x, y + size);
      ctx.stroke();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      for (const particle of particles) {
        // Multiple wave layers for organic motion
        const wave1 = Math.sin(particle.baseX * waveFrequency + time * waveSpeed) * waveAmplitude;
        const wave2 = Math.sin(particle.baseY * waveFrequency * 0.8 + time * waveSpeed * 1.3) * (waveAmplitude * 0.6);
        const wave3 = Math.sin((particle.baseX + particle.baseY) * waveFrequency * 0.5 + time * waveSpeed * 0.7) * (waveAmplitude * 0.4);

        // Diagonal wave for ripple effect
        const ripple = Math.sin((particle.baseX - particle.baseY) * waveFrequency * 0.3 + time * waveSpeed * 1.5) * (waveAmplitude * 0.3);

        // Apply wave displacement
        particle.x = particle.baseX + wave1 * 0.3 + ripple * 0.2;
        particle.y = particle.baseY + wave2 * 0.3 + wave3 * 0.2;

        // Calculate dynamic opacity based on wave height
        const totalWave = wave1 + wave2 + wave3;
        const normalizedWave = (totalWave + waveAmplitude * 2) / (waveAmplitude * 4);
        particle.opacity = 0.15 + normalizedWave * 0.35;
        particle.size = 3 + normalizedWave * 2;

        // Draw plus sign
        drawPlus(particle.x, particle.y, particle.size, particle.opacity);
      }

      // Draw subtle connecting lines between nearby particles (grid effect)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 0.5;

      const cols = Math.ceil(canvas.width / gridSpacing) + 2;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Connect to right neighbor
        if ((i + 1) % cols !== 0 && i + 1 < particles.length) {
          const pRight = particles[i + 1];
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(pRight.x, pRight.y);
          ctx.stroke();
        }

        // Connect to bottom neighbor
        if (i + cols < particles.length) {
          const pBottom = particles[i + cols];
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(pBottom.x, pBottom.y);
          ctx.stroke();
        }
      }

      time += 1;
      animationId = requestAnimationFrame(animate);
    };

    // Recreate particles on resize
    const handleResize = () => {
      resize();
      particles = createParticles();
    };

    window.removeEventListener("resize", resize);
    window.addEventListener("resize", handleResize);

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
