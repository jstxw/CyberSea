'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import OnboardingOverlay from '@/components/OnboardingOverlay';
import { DEMO_MODELS } from '@/lib/demo-config';

// Dynamically import ModelViewer to prevent SSR issues and multiple Three.js instances
const ModelViewer = dynamic(() => import('@/components/ModelViewer'), {
  ssr: false,
  loading: () => null,
});

const IS_PRODUCTION_DEMO = process.env.NEXT_PUBLIC_PRODUCTION_DEMO === "true";

export default function DashboardPage() {
  const [showBanner, setShowBanner] = useState(IS_PRODUCTION_DEMO);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);

  const handleSelectDemo = (id: string) => {
    setSelectedModelId(id);
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-black font-mono flex flex-col overflow-hidden" style={{
      backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
      backgroundSize: '30px 30px'
    }}>
      {/* Onboarding Overlay - Show immediately */}
      {showOnboarding && (
        <OnboardingOverlay
          isDemoMode={IS_PRODUCTION_DEMO}
          onGenerate={(prompt) => {
            setShowOnboarding(false);
          }}
          onSelectDemo={handleSelectDemo}
          onImport={() => {
            setShowOnboarding(false);
          }}
          onDismiss={() => setShowOnboarding(false)}
        />
      )}

      {/* Demo Banner */}
      {showBanner && (
        <div className="bg-[#3B82F6] border-b border-[#1D1E15] px-4 py-2 flex items-center justify-between z-50">
          <div className="flex items-center gap-3 flex-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-white text-[10px] md:text-xs font-medium">
              <span className="font-bold">Demo Mode:</span> This version uses preloaded models. To use your own API keys and custom models, visit our{' '}
              <a
                href="https://github.com/jstxw/Mesh"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#E5E6DA] transition-colors font-bold"
              >
                GitHub repository
              </a>
              {' '}for setup instructions.
            </p>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="ml-4 w-6 h-6 flex items-center justify-center text-white hover:bg-[#1D1E15] transition-colors shrink-0"
            aria-label="Close banner"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Header */}
      <nav className="px-0 h-12 flex justify-between items-center bg-black z-50">
        <div className="flex items-center h-full flex-1">
          <Link
            href="/"
            className="px-4 h-full flex items-center gap-2 text-[10px] font-medium uppercase tracking-wide text-[#E5E6DA]/60 hover:text-[#E5E6DA] hover:bg-[#3B82F6] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </Link>
          <div className="w-px h-6 bg-[#E5E6DA]/20"></div>
          <div className="px-4 text-[10px] font-medium uppercase tracking-wide text-[#E5E6DA]">
            Dashboard / Model Viewer
          </div>
        </div>

        <div className="flex items-center gap-4 px-4">
          <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse"></div>
          <div className="text-[10px] uppercase tracking-widest opacity-50 text-[#E5E6DA]">Connected</div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 relative">
        <ModelViewer selectedModelId={selectedModelId} skipOnboarding={true} />
      </div>
    </div>
  );
}
