import React, { useState } from 'react';
import { DEMO_MODELS } from '@/lib/demo-config';

interface OnboardingOverlayProps {
  isDemoMode: boolean;
  onGenerate: (prompt: string) => void;
  onSelectDemo: (id: string) => void;
  onImport: () => void; // Triggers the hidden file input
  onDismiss: () => void;
  onSketchfabLoad?: (url: string) => void; // Load model from Sketchfab URL
}

export default function OnboardingOverlay({
  isDemoMode,
  onGenerate,
  onSelectDemo,
  onImport,
  onDismiss,
  onSketchfabLoad
}: OnboardingOverlayProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedDemo, setSelectedDemo] = useState("");
  const [sketchfabQuery, setSketchfabQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const handleSketchfabSearch = async () => {
    if (!sketchfabQuery.trim()) return;

    setIsSearching(true);
    setSearchError("");

    try {
      // Search for model
      const searchRes = await fetch(`/api/search?q=${encodeURIComponent(sketchfabQuery)}`);
      if (!searchRes.ok) {
        const err = await searchRes.json();
        throw new Error(err.error || 'Search failed');
      }
      const searchData = await searchRes.json();

      if (!searchData.uid) {
        throw new Error('No model found');
      }

      // Get download URL
      const downloadRes = await fetch(`/api/download?uid=${searchData.uid}`);
      const downloadData = await downloadRes.json();

      if (downloadData.data?.glb?.url) {
        onSketchfabLoad?.(downloadData.data.glb.url);
      } else if (downloadData.data?.gltf?.url) {
        onSketchfabLoad?.(downloadData.data.gltf.url);
      } else {
        throw new Error('No downloadable format available');
      }
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleGenerateSubmit = () => {
    if (prompt.trim()) {
      onGenerate(prompt);
    }
  };

  const handleDemoSelect = (id: string, name: string) => {
    setSelectedDemo(name);
    if (id) {
      onSelectDemo(id);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-sm animate-in fade-in duration-500" style={{
      backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
      backgroundSize: '30px 30px'
    }}>
      {/* Status Bar */}
      <div className="w-full border-b border-[#E5E6DA]/20 bg-[#0a0a0a] px-6 py-2 flex items-center gap-6 text-[10px] font-mono uppercase tracking-wider text-[#E5E6DA]/80">
        <span>SYSTEM STATUS: <span className="text-[#00ff00]">READY</span></span>
        <span>MODEL: <span className="text-[#E5E6DA]/60">NOT LOADED</span></span>
        <span>MODE: <span className="text-[#E5E6DA]/60">INSPECTION</span></span>
      </div>

      <div className="flex flex-col h-[calc(100vh-40px)] items-center justify-center p-8">
        {/* Center Content */}
        <div className="w-full max-w-5xl space-y-8">
          {/* Demo Mode: Holographic Cards Grid */}
          {isDemoMode ? (
            <div className="space-y-6">
              <div className="text-center">
                <label className="text-[11px] font-mono uppercase text-[#E5E6DA]/60 tracking-widest block">
                  SELECT PLATFORM
                </label>
              </div>

              {/* Cards Grid - 3 columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DEMO_MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleDemoSelect(m.id, m.name)}
                    className={`text-left p-6 rounded-xl backdrop-blur-md transition-all duration-300 border h-40 flex flex-col justify-between ${
                      selectedDemo === m.name
                        ? "bg-white/15 border-[#3B82F6]/60 shadow-[0_0_30px_rgba(59,130,246,0.4)]"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="text-[14px] font-mono uppercase tracking-wide text-[#E5E6DA] font-medium">
                          {m.name}
                        </div>
                        <div className="text-[10px] font-mono text-[#E5E6DA]/40 uppercase">
                          Military Platform
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        selectedDemo === m.name ? "bg-[#00ff00] shadow-[0_0_10px_#00ff00]" : "bg-[#E5E6DA]/30"
                      }`}></div>
                    </div>
                    {/* Holographic line effect */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-[#3B82F6]/40 to-transparent"></div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Normal Mode: Model Selection */
            <div className="space-y-6 max-w-md mx-auto">
              <div className="space-y-3">
                <label className="text-[11px] font-mono uppercase text-[#E5E6DA]/60 tracking-widest block text-center">
                  SELECT VEHICLE MODEL
                </label>
                <div className="flex flex-col">
                  {DEMO_MODELS.map((m, index) => (
                    <button
                      key={m.id}
                      onClick={() => handleDemoSelect(m.id, m.name)}
                      className={`w-full bg-white/5 border border-white/10 text-[#E5E6DA] text-[12px] font-mono p-4 uppercase tracking-wide outline-none hover:bg-[#3B82F6]/30 hover:border-[#3B82F6] transition-colors cursor-pointer text-left ${index > 0 ? '-mt-px' : ''}`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
