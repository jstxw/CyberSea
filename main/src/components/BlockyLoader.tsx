'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const STAGES = [
  'Initializing System',
  'Rendering Model',
  'Fetching Geospatial Scene',
  'Analyzing Topology',
  'Optimizing Meshes',
  'Computing Lightmaps',
  'Calibrating Sensors',
  'Finalizing Viewer',
];

interface BlockyLoaderProps {
  onFinished?: () => void;
}

export default function BlockyLoader({ onFinished }: BlockyLoaderProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 400);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (onFinished) {
            setTimeout(() => onFinished(), 0);
          }
          return 100;
        }
        return prev + Math.random() * 8;
      });
    }, 80);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
    };
  }, [onFinished]);

  return (
    <div className="fixed inset-0 bg-black backdrop-blur-md z-[60] flex flex-col items-center justify-center font-mono" style={{
      backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
      backgroundSize: '30px 30px'
    }}>
      {/* Center Status Box - Military Style */}
      <div className="bg-[#0a0a0a]/95 border border-[#3B82F6] p-8 max-w-md w-full mx-4 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
        {/* Status Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 bg-[#3B82F6] animate-pulse"></div>
          <div className="text-[10px] font-mono uppercase text-[#E5E6DA]/50 tracking-widest">
            SYSTEM LOADING
          </div>
        </div>

        {/* Current Step Display */}
        <div className="space-y-4">
          <div>
            <div className="text-[9px] font-mono uppercase text-[#E5E6DA]/40 tracking-widest mb-2">
              CURRENT OPERATION
            </div>
            <div className="h-8 relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStage}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "backOut" }}
                  className="text-xl font-mono text-[#3B82F6] font-bold uppercase tracking-wide leading-tight"
                >
                  {STAGES[currentStage]}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[9px] font-mono text-[#E5E6DA]/50 uppercase tracking-widest">
              <span>STAGE {currentStage + 1} OF {STAGES.length}</span>
              <span>{Math.min(100, Math.floor(progress))}%</span>
            </div>
            <div className="h-2 w-full bg-[#1D1E15] border border-[#E5E6DA]/10 overflow-hidden">
              <motion.div
                className="h-full bg-[#3B82F6]"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, progress)}%` }}
                transition={{ ease: "linear" }}
              />
            </div>
          </div>

          {/* Diagnostic Info */}
          <div className="pt-4 border-t border-[#E5E6DA]/10">
            <div className="text-[9px] font-mono uppercase text-[#E5E6DA]/30 tracking-widest mb-1">
              GEOSPATIAL ENGINE V.2.0.4
            </div>
            <div className="text-[9px] font-mono text-[#E5E6DA]/30 tracking-widest">
              RENDERING PIPELINE ACTIVE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
