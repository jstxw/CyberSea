// Arctic patrol simulation configuration

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PointOfInterest {
  id: string;
  name: string;
  type: 'base' | 'port' | 'resource';
  coordinates: Coordinates;
}

export interface TradeRoute {
  id: string;
  name: string;
  points: Coordinates[];
  color: string;
}

export interface TimelineEvent {
  time: number; // seconds from start
  type: 'deploy' | 'route_start' | 'contact' | 'weather' | 'fuel_warning' | 'route_complete' | 'return' | 'mission_complete';
  message: string;
  data?: {
    routeId?: string;
    fuelPercent?: number;
    contactType?: string;
    weatherType?: string;
  };
}

// Canadian Arctic points of interest
export const POINTS_OF_INTEREST: PointOfInterest[] = [
  { id: 'cfs-alert', name: 'CFS Alert', type: 'base', coordinates: { lat: 82.5, lng: -62.3 } },
  { id: 'resolute', name: 'Resolute Bay', type: 'port', coordinates: { lat: 74.7, lng: -94.8 } },
  { id: 'iqaluit', name: 'Iqaluit', type: 'port', coordinates: { lat: 63.7, lng: -68.5 } },
  { id: 'tuktoyaktuk', name: 'Tuktoyaktuk', type: 'port', coordinates: { lat: 69.4, lng: -133.0 } },
  { id: 'prudhoe', name: 'Prudhoe Bay', type: 'resource', coordinates: { lat: 70.3, lng: -148.4 } },
];

// Northwest Passage and Arctic trade routes
export const TRADE_ROUTES: TradeRoute[] = [
  {
    id: 'nwp-east',
    name: 'Northwest Passage - Eastern',
    points: [
      { lat: 63.7, lng: -68.5 },
      { lat: 66.5, lng: -61.0 },
      { lat: 70.0, lng: -65.0 },
      { lat: 74.7, lng: -80.0 },
      { lat: 74.7, lng: -94.8 },
    ],
    color: '#3B82F6',
  },
  {
    id: 'nwp-west',
    name: 'Northwest Passage - Western',
    points: [
      { lat: 74.7, lng: -94.8 },
      { lat: 72.0, lng: -110.0 },
      { lat: 70.5, lng: -120.0 },
      { lat: 69.4, lng: -133.0 },
    ],
    color: '#10B981',
  },
  {
    id: 'arctic-shipping',
    name: 'Arctic Shipping Lane',
    points: [
      { lat: 69.4, lng: -133.0 },
      { lat: 70.3, lng: -148.4 },
      { lat: 71.0, lng: -156.0 },
    ],
    color: '#F59E0B',
  },
];

// Patrol path for the asset (combines routes)
export const PATROL_PATH: Coordinates[] = [
  { lat: 74.7, lng: -94.8 },
  { lat: 72.0, lng: -85.0 },
  { lat: 70.0, lng: -75.0 },
  { lat: 68.0, lng: -70.0 },
  { lat: 66.5, lng: -68.5 },
  { lat: 68.0, lng: -80.0 },
  { lat: 70.0, lng: -95.0 },
  { lat: 72.0, lng: -110.0 },
  { lat: 70.5, lng: -120.0 },
  { lat: 69.4, lng: -133.0 },
  { lat: 71.0, lng: -120.0 },
  { lat: 74.7, lng: -94.8 },
];

// Pre-scripted timeline (total ~4:30)
export const SIMULATION_TIMELINE: TimelineEvent[] = [
  { time: 0, type: 'deploy', message: 'Asset deployed from Resolute Bay' },
  { time: 30, type: 'route_start', message: 'Beginning eastern patrol sector', data: { routeId: 'nwp-east' } },
  { time: 45, type: 'contact', message: 'Contact detected - cargo vessel on route', data: { contactType: 'vessel' } },
  { time: 75, type: 'weather', message: 'Weather system approaching - ice drift detected', data: { weatherType: 'ice' } },
  { time: 105, type: 'route_start', message: 'Proceeding to western patrol sector', data: { routeId: 'nwp-west' } },
  { time: 135, type: 'fuel_warning', message: 'Fuel status: 50% remaining', data: { fuelPercent: 50 } },
  { time: 165, type: 'weather', message: 'Weather clearing - visibility improved', data: { weatherType: 'clear' } },
  { time: 195, type: 'contact', message: 'Contact detected - fishing vessel', data: { contactType: 'vessel' } },
  { time: 225, type: 'return', message: 'Return to base initiated' },
  { time: 270, type: 'mission_complete', message: 'Mission complete - patrol successful' },
];

export const SIMULATION_DURATION = 270; // seconds

// Asset speed configuration (used for interpolation)
export const ASSET_CONFIG = {
  cruiseSpeed: 350, // knots (for display)
  fuelBurnRate: 0.35, // percent per second at cruise
  detectionRadius: 150, // nm (for display)
};
