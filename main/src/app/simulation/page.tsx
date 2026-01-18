'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const SimulationContent = dynamic(() => import('@/components/simulation/SimulationContent'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-white/50 text-sm">Loading simulation...</div>
    </div>
  ),
});

function SimulationPageContent() {
  const searchParams = useSearchParams();
  const assetId = searchParams.get('asset') || 'demo-2';

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-mono flex flex-col overflow-hidden">
      {/* Header */}
      <nav className="px-0 h-12 flex justify-between items-center bg-black z-50 border-b border-white/10">
        <div className="flex items-center h-full flex-1">
          <Link
            href="/dashboard"
            className="px-4 h-full flex items-center gap-2 text-[10px] font-medium uppercase tracking-wide text-[#E5E6DA]/60 hover:text-[#E5E6DA] hover:bg-white/5 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Viewer
          </Link>
          <div className="w-px h-6 bg-[#E5E6DA]/20"></div>
          <div className="px-4 text-[10px] font-medium uppercase tracking-wide text-[#E5E6DA]">
            Arctic Patrol Simulation
          </div>
        </div>
        <div className="flex items-center gap-4 px-4">
          <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse"></div>
          <div className="text-[10px] uppercase tracking-widest opacity-50 text-[#E5E6DA]">Simulation Active</div>
        </div>
      </nav>

      {/* Main Content - Split View */}
      <div className="flex-1 flex">
        <SimulationContent assetId={assetId} />
      </div>
    </div>
  );
}

export default function SimulationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/50">Loading...</div>}>
      <SimulationPageContent />
    </Suspense>
  );
}
