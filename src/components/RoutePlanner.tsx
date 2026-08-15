import React, { useState } from 'react';
import {
  Navigation,
  ArrowUpDown,
  Footprints,
  Clock,
  MapPin,
  Sparkles,
  RotateCcw,
  Key,
  Info,
  ChevronDown,
  ChevronUp,
  Flame,
  Milestone,
  CheckCircle,
} from 'lucide-react';
import { LocationItem, RoutePoint, RouteSummary } from '../types';

interface RoutePlannerProps {
  locations: LocationItem[];
  startPoint: RoutePoint | null;
  endPoint: RoutePoint | null;
  onSetStartPoint: (point: RoutePoint | null) => void;
  onSetEndPoint: (point: RoutePoint | null) => void;
  onSwapPoints: () => void;
  onClearRoute: () => void;
  routeSummary: RouteSummary | null;
  onStartMapPick: (target: 'start' | 'end') => void;
  isPickingMapFor: 'start' | 'end' | null;
  onBackToDirectory: () => void;
}

const POPULAR_NITW_ROUTES = [
  {
    title: 'Mega Hostel to CSE Dept',
    from: '1.8K Ultra Mega Hostel',
    to: 'Department of Computer Science & Engineering',
  },
  {
    title: 'Main Gate to Library (LRC)',
    from: 'Main Entrance Gate',
    to: 'Dr. B.R. Ambedkar Learning Resource Centre',
  },
  {
    title: '1K Hostel to Central Mess',
    from: '1K Boys Hostel',
    to: 'Central Mess & Food Court',
  },
  {
    title: 'Admin Block to Sports Complex',
    from: 'Main Administrative Building',
    to: 'Student Activity Centre (SAC) & Sports Complex',
  },
];

const RoutePlanner: React.FC<RoutePlannerProps> = ({
  locations,
  startPoint,
  endPoint,
  onSetStartPoint,
  onSetEndPoint,
  onSwapPoints,
  onClearRoute,
  routeSummary,
  onStartMapPick,
  isPickingMapFor,
  onBackToDirectory,
}) => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [showApiKeyInfo, setShowApiKeyInfo] = useState(false);

  const handleLocationSelect = (idOrName: string, target: 'start' | 'end') => {
    if (!idOrName) {
      if (target === 'start') onSetStartPoint(null);
      else onSetEndPoint(null);
      return;
    }

    const loc = locations.find((l) => (l._id === idOrName || l.id === idOrName || l.name === idOrName));
    if (loc) {
      const point: RoutePoint = {
        lat: loc.lat,
        lng: loc.lng,
        name: loc.name,
        category: loc.category,
      };
      if (target === 'start') onSetStartPoint(point);
      else onSetEndPoint(point);
    }
  };

  const handleSelectPopularRoute = (fromName: string, toName: string) => {
    const fromLoc = locations.find((l) => l.name === fromName);
    const toLoc = locations.find((l) => l.name === toName);

    if (fromLoc) {
      onSetStartPoint({
        lat: fromLoc.lat,
        lng: fromLoc.lng,
        name: fromLoc.name,
        category: fromLoc.category,
      });
    }
    if (toLoc) {
      onSetEndPoint({
        lat: toLoc.lat,
        lng: toLoc.lng,
        name: toLoc.name,
        category: toLoc.category,
      });
    }
  };

  // Format distance
  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  // Format time (in seconds to mins)
  const formatTime = (seconds: number) => {
    const mins = Math.ceil(seconds / 60);
    if (mins < 1) return '1 min';
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hrs} hr ${remainingMins} min`;
    }
    return `${mins} min${mins > 1 ? 's' : ''}`;
  };

  // Step count estimate (~0.75m per step)
  const stepCount = routeSummary ? Math.round(routeSummary.totalDistance / 0.75) : 0;
  // Calorie burn estimate (~0.04 kcal per step)
  const calories = Math.round(stepCount * 0.04);

  return (
    <aside className="w-full h-full bg-white border-r border-slate-200 flex flex-col shadow-inner select-none">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-100 bg-indigo-50/40">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-900 text-white flex items-center justify-center shadow-xs">
              <Footprints className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-black text-slate-900 leading-tight">Campus Walking Routes</h2>
              <p className="text-[10px] text-indigo-700 font-medium">Leaflet Routing Machine Engine</p>
            </div>
          </div>

          <button
            onClick={onBackToDirectory}
            className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 hover:border-indigo-300 shadow-2xs transition-all cursor-pointer"
          >
            Directory View
          </button>
        </div>

        {/* Origin / Destination Input Cards */}
        <div className="space-y-2 mt-3 relative">
          {/* Start Point Input */}
          <div className={`p-2.5 rounded-xl border transition-all ${
            isPickingMapFor === 'start'
              ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-400/20'
              : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                Start Point (A)
              </span>
              <button
                type="button"
                onClick={() => onStartMapPick('start')}
                className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all flex items-center gap-1 cursor-pointer ${
                  isPickingMapFor === 'start'
                    ? 'bg-emerald-600 text-white animate-pulse'
                    : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                <MapPin className="w-2.5 h-2.5" />
                <span>{isPickingMapFor === 'start' ? 'Click Map...' : 'Pick on Map'}</span>
              </button>
            </div>

            <select
              value={startPoint ? startPoint.name : ''}
              onChange={(e) => handleLocationSelect(e.target.value, 'start')}
              className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">-- Choose Starting Point --</option>
              {locations.map((loc) => (
                <option key={loc._id || loc.id} value={loc.name}>
                  {loc.name} ({loc.category})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button In-Between */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
            <button
              onClick={onSwapPoints}
              title="Swap Start & Destination"
              disabled={!startPoint && !endPoint}
              className="w-7 h-7 rounded-full bg-white border border-slate-300 shadow-md text-indigo-800 hover:bg-indigo-50 hover:border-indigo-400 flex items-center justify-center transition-all cursor-pointer disabled:opacity-40"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* End Point Input */}
          <div className={`p-2.5 rounded-xl border transition-all ${
            isPickingMapFor === 'end'
              ? 'bg-red-50/70 border-red-400 ring-2 ring-red-400/20'
              : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-red-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                Destination (B)
              </span>
              <button
                type="button"
                onClick={() => onStartMapPick('end')}
                className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all flex items-center gap-1 cursor-pointer ${
                  isPickingMapFor === 'end'
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700'
                }`}
              >
                <MapPin className="w-2.5 h-2.5" />
                <span>{isPickingMapFor === 'end' ? 'Click Map...' : 'Pick on Map'}</span>
              </button>
            </div>

            <select
              value={endPoint ? endPoint.name : ''}
              onChange={(e) => handleLocationSelect(e.target.value, 'end')}
              className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="">-- Choose Destination --</option>
              {locations.map((loc) => (
                <option key={loc._id || loc.id} value={loc.name}>
                  {loc.name} ({loc.category})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Active Route Summary Card */}
        {startPoint && endPoint && routeSummary ? (
          <div className="bg-indigo-900 text-white rounded-2xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-indigo-800 pb-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                Active Walking Route
              </span>
              <button
                onClick={onClearRoute}
                className="text-[10px] text-indigo-200 hover:text-white bg-indigo-800 hover:bg-indigo-700 px-2 py-0.5 rounded transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Metrics Highlights */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-indigo-800/70 p-2.5 rounded-xl border border-indigo-700/50">
                <Clock className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <div className="text-sm font-black">{formatTime(routeSummary.totalTime)}</div>
                <div className="text-[9px] text-indigo-200 font-medium">Walk Time</div>
              </div>

              <div className="bg-indigo-800/70 p-2.5 rounded-xl border border-indigo-700/50">
                <Footprints className="w-4 h-4 text-indigo-300 mx-auto mb-1" />
                <div className="text-sm font-black">{formatDistance(routeSummary.totalDistance)}</div>
                <div className="text-[9px] text-indigo-200 font-medium">Distance</div>
              </div>

              <div className="bg-indigo-800/70 p-2.5 rounded-xl border border-indigo-700/50">
                <Flame className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <div className="text-sm font-black">~{stepCount}</div>
                <div className="text-[9px] text-indigo-200 font-medium">Steps ({calories} kcal)</div>
              </div>
            </div>

            {/* Turn-by-turn list */}
            {routeSummary.instructions && routeSummary.instructions.length > 0 && (
              <div className="pt-2">
                <button
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="w-full flex items-center justify-between text-xs font-bold text-indigo-200 hover:text-white py-1 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Milestone className="w-3.5 h-3.5" />
                    <span>Turn-by-Turn Guidance ({routeSummary.instructions.length})</span>
                  </span>
                  {showInstructions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showInstructions && (
                  <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1 text-slate-800">
                    {routeSummary.instructions.map((step, idx) => (
                      <div
                        key={idx}
                        className="bg-white/95 backdrop-blur-sm rounded-lg p-2 text-xs flex items-start gap-2 border border-slate-100"
                      >
                        <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800 text-[11px] leading-tight">
                            {step.text || 'Continue along the campus road'}
                          </p>
                          {step.distance > 0 && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              For {formatDistance(step.distance)} ({Math.ceil(step.time / 60)} min)
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (!startPoint || !endPoint) ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto mb-2 font-black text-sm">
              🚶
            </div>
            <h3 className="text-xs font-bold text-slate-800">Select Start &amp; Destination</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Choose any two buildings above or click directly on the campus map to calculate walking routes.
            </p>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center animate-pulse">
            <p className="text-xs font-bold text-indigo-900">Calculating shortest walking path...</p>
          </div>
        )}

        {/* Quick Popular Routes Suggestions */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
            Quick Route Presets
          </span>

          <div className="grid grid-cols-1 gap-1.5">
            {POPULAR_NITW_ROUTES.map((route, i) => (
              <button
                key={i}
                onClick={() => handleSelectPopularRoute(route.from, route.to)}
                className="text-left p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50/70 hover:border-indigo-300 transition-all text-xs group cursor-pointer shadow-2xs"
              >
                <div className="font-bold text-slate-800 group-hover:text-indigo-900 flex items-center justify-between">
                  <span>{route.title}</span>
                  <Navigation className="w-3 h-3 text-indigo-400 group-hover:text-indigo-700" />
                </div>
                <div className="text-[10px] text-slate-400 group-hover:text-slate-600 truncate mt-0.5">
                  {route.from} → {route.to}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* API Key Transparency Card */}
        <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-xl p-3 text-slate-700 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-indigo-700" />
              API Key Requirements
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded border border-emerald-200">
              0 Keys Needed
            </span>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed">
            This routing feature operates using <strong>Leaflet Routing Machine</strong> and the open <strong>OSRM Pedestrian Graph</strong> on OpenStreetMap.
          </p>

          <button
            type="button"
            onClick={() => setShowApiKeyInfo(!showApiKeyInfo)}
            className="text-[10px] font-bold text-indigo-700 hover:underline flex items-center gap-1 pt-1"
          >
            <Info className="w-3 h-3" />
            <span>{showApiKeyInfo ? 'Hide technical backend details' : 'View provider information'}</span>
          </button>

          {showApiKeyInfo && (
            <div className="text-[10px] text-slate-600 bg-white p-2.5 rounded-lg border border-indigo-100 space-y-1 mt-1 font-mono">
              <p>• <strong>Default Router:</strong> OSRM Public Foot Profile (Zero API key / Free)</p>
              <p>• <strong>Optional Alternates:</strong> If you ever wish to use Mapbox Directions or GraphHopper, you can configure an optional <code className="bg-slate-100 px-1 rounded">MAPBOX_API_KEY</code> or <code className="bg-slate-100 px-1 rounded">GRAPHHOPPER_API_KEY</code>, but none are required for full campus routing.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex gap-2">
        <button
          onClick={onClearRoute}
          disabled={!startPoint && !endPoint}
          className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Route</span>
        </button>
      </div>
    </aside>
  );
};

export default RoutePlanner;
