"use client";

import { useEffect, useRef } from "react";

export default function AnimatedWave() {
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
      canvas.height = 120;
    };

    resize();
    window.addEventListener("resize", resize);

    // Wave configuration - multiple layers for depth
    const waves = [
      { amplitude: 20, frequency: 0.008, speed: 0.015, opacity: 0.15, yOffset: 40 },
      { amplitude: 25, frequency: 0.012, speed: 0.02, opacity: 0.2, yOffset: 50 },
      { amplitude: 18, frequency: 0.006, speed: 0.025, opacity: 0.25, yOffset: 35 },
      { amplitude: 30, frequency: 0.01, speed: 0.018, opacity: 0.4, yOffset: 55 },
      { amplitude: 22, frequency: 0.015, speed: 0.022, opacity: 0.6, yOffset: 45 },
      { amplitude: 35, frequency: 0.009, speed: 0.012, opacity: 1, yOffset: 60 },
    ];

    const drawWave = (
      wave: typeof waves[0],
      timeOffset: number
    ) => {
      const { amplitude, frequency, speed, opacity, yOffset } = wave;

      ctx.beginPath();
      ctx.moveTo(0, canvas.height);

      // Draw wave using sine with multiple harmonics for organic feel
      for (let x = 0; x <= canvas.width; x += 2) {
        const y = yOffset +
          Math.sin(x * frequency + time * speed + timeOffset) * amplitude +
          Math.sin(x * frequency * 0.5 + time * speed * 1.3) * (amplitude * 0.3) +
          Math.sin(x * frequency * 2 + time * speed * 0.7) * (amplitude * 0.15);

        ctx.lineTo(x, y);
      }

      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();

      // Fill with dark color matching the background
      ctx.fillStyle = `rgba(10, 10, 10, ${opacity})`;
      ctx.fill();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw waves from back to front
      waves.forEach((wave, index) => {
        drawWave(wave, index * 0.5);
      });

      time += 1;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden" style={{ lineHeight: 0, height: '120px' }}>
      <canvas
        ref={canvasRef}
        className="absolute bottom-0 w-full"
        style={{ height: '120px' }}
      />
    </div>
  );
}
