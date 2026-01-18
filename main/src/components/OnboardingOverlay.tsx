import React, { useState, useRef, useEffect } from 'react';
import { DEMO_MODELS } from '@/lib/demo-config';

interface OnboardingOverlayProps {
  isDemoMode: boolean;
  onGenerate: (prompt: string) => void;
  onSelectDemo: (id: string) => void;
  onImport: () => void; // Triggers the hidden file input
  onDismiss: () => void;
}

export default function OnboardingOverlay({
  isDemoMode,
  onGenerate,
  onSelectDemo,
  onImport,
  onDismiss
}: OnboardingOverlayProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedDemo, setSelectedDemo] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGenerateSubmit = () => {
    if (prompt.trim()) {
      onGenerate(prompt);
    }
  };

  const handleDemoSelect = (id: string, name: string) => {
    setSelectedDemo(name);
    setIsDropdownOpen(false);
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

      <div className="flex h-[calc(100vh-40px)]">
        {/* Left Command Panel */}
        <div className="w-80 border-r border-[#E5E6DA]/20 bg-[#0a0a0a] p-6 space-y-6 overflow-y-auto">

          {/* Demo Mode: Custom Dropdown */}
          {isDemoMode ? (
            <div className="space-y-4">
              <div className="space-y-2 relative" ref={dropdownRef}>
                <label className="text-[9px] font-mono uppercase text-[#E5E6DA]/60 tracking-wider block">
                  SELECT PRELOADED PLATFORM
                </label>

                {/* Custom Dropdown Trigger */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-[#1D1E15] border border-[#E5E6DA]/20 text-[#E5E6DA] text-[10px] font-mono p-3 uppercase tracking-wide outline-none focus:border-[#E5E6DA]/40 transition-colors flex items-center justify-between hover:bg-[#1D1E15]/80"
                >
                  <span className={selectedDemo ? "text-[#E5E6DA]" : "text-[#E5E6DA]/40"}>
                    {selectedDemo || "SELECT PLATFORM"}
                  </span>
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#1D1E15] border border-[#E5E6DA]/20 shadow-lg overflow-hidden z-50 max-h-48 overflow-y-auto">
                    {DEMO_MODELS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleDemoSelect(m.id, m.name)}
                        className="w-full text-left px-3 py-2.5 text-[10px] font-mono uppercase tracking-wide text-[#E5E6DA] hover:bg-[#E5E6DA]/10 transition-colors border-b border-[#E5E6DA]/10 last:border-0"
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Normal Mode: Generate Input */
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-mono uppercase text-[#E5E6DA]/60 tracking-wider block">
                  GENERATE VEHICLE MODEL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="ENTER MODEL NAME"
                    className="flex-1 bg-[#1D1E15] border border-[#E5E6DA]/20 text-[#E5E6DA] text-[10px] font-mono p-3 uppercase tracking-wide outline-none focus:border-[#E5E6DA]/40 transition-colors placeholder:text-[#E5E6DA]/30"
                    onKeyDown={(e) => e.key === "Enter" && handleGenerateSubmit()}
                  />
                  <button
                    onClick={handleGenerateSubmit}
                    disabled={!prompt.trim()}
                    className="px-4 bg-[#1D1E15] border border-[#E5E6DA]/20 text-[#E5E6DA] text-[10px] font-mono uppercase tracking-wide hover:bg-[#1D1E15]/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    LOAD
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-[#E5E6DA]/10"></div>

          {/* Import Button */}
          <button
            onClick={onImport}
            className="w-full flex items-center gap-3 p-4 bg-[#1D1E15] border border-[#E5E6DA]/20 hover:bg-[#1D1E15]/80 transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 bg-[#E5E6DA]/10 flex items-center justify-center border border-[#E5E6DA]/20">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#E5E6DA]/60">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div className="text-left flex-1">
              <div className="text-[10px] font-mono uppercase tracking-wide text-[#E5E6DA]">IMPORT ASSET</div>
              <div className="text-[9px] text-[#E5E6DA]/50 font-mono uppercase">GLB / GLTF</div>
            </div>
          </button>
        </div>

        {/* Center Operational Space */}
        <div className="flex-1 flex items-center justify-center relative">
          {!selectedDemo && prompt.trim() === "" && (
            <div className="text-center space-y-2">
              <div className="text-[12px] font-mono uppercase tracking-widest text-[#E5E6DA]/20">
                NO VEHICLE LOADED
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wide text-[#E5E6DA]/15">
                LOAD A PLATFORM TO BEGIN ANALYSIS
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
