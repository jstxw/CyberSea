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

              {/* Import Button - Centered below */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={onImport}
                  className="flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 hover:bg-[#3B82F6] hover:border-[#3B82F6] transition-all duration-300 rounded-xl"
                >
                  <div className="w-8 h-8 bg-[#E5E6DA]/10 flex items-center justify-center border border-[#E5E6DA]/20 rounded-lg">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#E5E6DA]/60">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-[12px] font-mono uppercase tracking-wide text-[#E5E6DA]">IMPORT CUSTOM ASSET</div>
                    <div className="text-[10px] text-[#E5E6DA]/50 font-mono uppercase">GLB / GLTF FORMAT</div>
                  </div>
                </button>
              </div>

              {/* Sketchfab Search */}
              <div className="flex justify-center pt-4" data-no-cursor>
                <div className="flex flex-col items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-xl w-full max-w-md">
                  <div className="flex items-center gap-2 w-full">
                    <div className="w-8 h-8 bg-[#E5E6DA]/10 flex items-center justify-center border border-[#E5E6DA]/20 rounded-lg shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#E5E6DA]/60">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={sketchfabQuery}
                      onChange={(e) => setSketchfabQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSketchfabSearch()}
                      placeholder="Search Sketchfab (e.g., car, robot)"
                      className="flex-1 bg-white/5 border border-white/10 text-[#E5E6DA] text-[12px] font-mono px-3 py-2 uppercase tracking-wide outline-none hover:bg-white/10 focus:bg-white/10 focus:border-white/30 transition-colors rounded-lg placeholder:text-[#E5E6DA]/30 placeholder:normal-case"
                    />
                    <button
                      onClick={handleSketchfabSearch}
                      disabled={isSearching || !sketchfabQuery.trim()}
                      className="px-4 py-2 bg-white/20 hover:bg-white/40 disabled:bg-white/10 disabled:text-[#E5E6DA]/30 text-white text-[10px] font-mono uppercase tracking-wide rounded-lg transition-colors"
                    >
                      {isSearching ? 'LOADING...' : 'SEARCH'}
                    </button>
                  </div>
                  {searchError && (
                    <div className="text-[10px] text-red-400 font-mono">{searchError}</div>
                  )}
                  <div className="text-[10px] text-[#E5E6DA]/40 font-mono uppercase">SEARCH SKETCHFAB 3D MODELS</div>
                </div>
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
