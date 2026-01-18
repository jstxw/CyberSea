'use client';

import { DEMO_MODELS } from '@/lib/demo-config';
import { TimelineEvent, ASSET_CONFIG } from '@/lib/simulation-data';

interface CommandDashboardProps {
  assetId: string;
  elapsedTime: number;
  progress: number;
  events: TimelineEvent[];
  currentEventIndex: number;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function CommandDashboard({
  assetId,
  elapsedTime,
  progress,
  events,
  currentEventIndex,
}: CommandDashboardProps) {
  const asset = DEMO_MODELS.find((m) => m.id === assetId);
  const fuelRemaining = Math.max(0, 100 - elapsedTime * ASSET_CONFIG.fuelBurnRate);
  const distanceCovered = Math.round(progress * 1200);
  const areaCovered = Math.round(progress * 100);
  const routesMonitored = Math.min(3, Math.floor(progress * 5) + 1);
  const heading = Math.round((progress * 360) % 360);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] text-[#E5E6DA] overflow-hidden">
      {/* Mission Clock */}
      <div className="p-4 border-b border-white/10">
        <div className="text-[10px] uppercase tracking-wider opacity-50 mb-1">Mission Clock</div>
        <div className="text-3xl font-mono font-bold text-[#3B82F6]">{formatTime(elapsedTime)}</div>
      </div>

      {/* Resource Tracking */}
      <div className="p-4 border-b border-white/10">
        <div className="text-[10px] uppercase tracking-wider opacity-50 mb-3">Resource Tracking</div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="opacity-70">Fuel</span>
              <span className={fuelRemaining < 30 ? 'text-red-400' : ''}>{Math.round(fuelRemaining)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded">
              <div
                className={`h-full rounded transition-all ${fuelRemaining < 30 ? 'bg-red-400' : 'bg-[#3B82F6]'}`}
                style={{ width: `${fuelRemaining}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs">
            <span className="opacity-70">Distance</span>
            <span>{distanceCovered} nm</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="opacity-70">Time on Station</span>
            <span>{formatTime(elapsedTime)}</span>
          </div>
        </div>
      </div>

      {/* Coverage Stats */}
      <div className="p-4 border-b border-white/10">
        <div className="text-[10px] uppercase tracking-wider opacity-50 mb-3">Coverage Stats</div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="opacity-70">Area Covered</span>
            <span>{areaCovered}%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="opacity-70">Detection Prob</span>
            <span>{Math.min(95, 60 + Math.round(progress * 35))}%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="opacity-70">Routes Monitored</span>
            <span>{routesMonitored}/3</span>
          </div>
        </div>
      </div>

      {/* Asset Status */}
      <div className="p-4 border-b border-white/10">
        <div className="text-[10px] uppercase tracking-wider opacity-50 mb-3">Asset Status</div>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-[#3B82F6]/20 border border-[#3B82F6]/50 rounded flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold">{asset?.name || 'Unknown Asset'}</div>
            <div className="text-[10px] text-[#10B981] uppercase">Active</div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="opacity-50">Heading</span>
            <div>{heading.toString().padStart(3, '0')}°</div>
          </div>
          <div>
            <span className="opacity-50">Speed</span>
            <div>{asset?.stats.maxSpeed || '350 kts'}</div>
          </div>
        </div>
      </div>

      {/* Event Log */}
      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        <div className="text-[10px] uppercase tracking-wider opacity-50 mb-3">Event Log</div>
        <div className="flex-1 overflow-y-auto space-y-2">
          {events.slice(0, currentEventIndex + 1).reverse().map((event, idx) => (
            <div
              key={idx}
              className={`text-xs flex gap-2 ${idx === 0 ? 'text-[#3B82F6]' : 'opacity-70'}`}
            >
              <span className="font-mono w-12 shrink-0">{formatTime(event.time)}</span>
              <span className="shrink-0">
                {event.type === 'contact' && '⚠'}
                {event.type === 'weather' && '☁'}
                {event.type === 'fuel_warning' && '⛽'}
                {event.type === 'mission_complete' && '✓'}
                {event.type === 'deploy' && '▶'}
                {event.type === 'route_start' && '→'}
                {event.type === 'return' && '↩'}
              </span>
              <span>{event.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
