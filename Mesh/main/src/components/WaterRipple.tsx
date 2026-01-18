'use client';

import { useEffect, useRef } from 'react';

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  speed: number;
}

interface Trail {
  x: number;
  y: number;
  opacity: number;
  radius: number;
}

export default function WaterRipple() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const trailsRef = useRef<Trail[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, isInside: false });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
        mouseRef.current = { x, y, isInside: true };

        // Add trail points
        trailsRef.current.push({
          x,
          y,
          opacity: 0.6,
          radius: 3
        });

        // Limit trail length
        if (trailsRef.current.length > 50) {
          trailsRef.current.shift();
        }
      } else {
        mouseRef.current.isInside = false;
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.isInside = false;
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
        // Add multiple ripples for more dramatic effect
        for (let i = 0; i < 3; i++) {
          ripplesRef.current.push({
            x,
            y,
            radius: i * 10,
            maxRadius: 150 + i * 50,
            opacity: 0.8 - i * 0.2,
            speed: 3 - i * 0.5
          });
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw and update trails
      trailsRef.current = trailsRef.current.filter(trail => {
        trail.opacity -= 0.02;
        trail.radius += 0.3;

        if (trail.opacity <= 0) return false;

        // Draw trail ripple
        ctx.beginPath();
        ctx.arc(trail.x, trail.y, trail.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${trail.opacity * 0.3})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Inner glow
        ctx.beginPath();
        ctx.arc(trail.x, trail.y, trail.radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${trail.opacity * 0.1})`;
        ctx.fill();

        return true;
      });

      // Draw and update click ripples
      ripplesRef.current = ripplesRef.current.filter(ripple => {
        ripple.radius += ripple.speed;
        ripple.opacity -= 0.01;

        if (ripple.opacity <= 0 || ripple.radius >= ripple.maxRadius) return false;

        // Outer ring
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${ripple.opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner ring
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius * 0.7, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${ripple.opacity * 0.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        return true;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleClick);
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleClick);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-20 pointer-events-auto"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
