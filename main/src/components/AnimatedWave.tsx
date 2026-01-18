"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function AnimatedWave() {
  const waveRef = useRef<SVGPathElement>(null);
  const wave2Ref = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!waveRef.current || !wave2Ref.current) return;

    // Front wave - smooth rolling
    const tl1 = gsap.timeline({ repeat: -1, yoyo: true });
    tl1.to(waveRef.current, {
      attr: {
        d: "M0,60 C150,100 350,10 600,80 C850,120 1050,30 1200,90 L1200,120 L0,120 Z"
      },
      duration: 3,
      ease: "sine.inOut"
    });

    // Back wave - offset timing
    const tl2 = gsap.timeline({ repeat: -1, yoyo: true, delay: 0.5 });
    tl2.to(wave2Ref.current, {
      attr: {
        d: "M0,80 C150,20 350,90 600,30 C850,0 1050,70 1200,20 L1200,120 L0,120 Z"
      },
      duration: 3.5,
      ease: "sine.inOut"
    });

    return () => {
      gsap.killTweensOf(waveRef.current);
      gsap.killTweensOf(wave2Ref.current);
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden" style={{ lineHeight: 0, height: '100px' }}>
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="absolute bottom-0 w-full h-24 md:h-28"
      >
        {/* Back wave layer */}
        <path
          ref={wave2Ref}
          d="M0,40 C150,70 350,30 600,55 C850,80 1050,45 1200,65 L1200,120 L0,120 Z"
          fill="#0a0a0a"
          opacity="0.5"
        />
        {/* Front wave layer */}
        <path
          ref={waveRef}
          d="M0,20 C150,60 350,10 600,45 C850,80 1050,30 1200,55 L1200,120 L0,120 Z"
          fill="#0a0a0a"
        />
      </svg>
    </div>
  );
}
