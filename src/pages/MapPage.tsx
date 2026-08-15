import React, { useState } from 'react';
import { ShieldCheck, Search, Footprints, Layers, Sparkles } from 'lucide-react';
import MapView from '../components/MapView';
import LocationList from '../components/LocationList';
import RoutePlanner from '../components/RoutePlanner';
import { LocationItem, RoutePoint, RouteSummary } from '../types';

interface MapPageProps {
  locations: LocationItem[];
  selectedLocation: LocationItem | null;
  onSelectLocation: (loc: LocationItem | null) => void;
  onNavigateToAdmin: () => void;
  isLoading: boolean;
}

const MapPage: React.FC<MapPageProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  onNavigateToAdmin,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'routes'>('directory');
  const [headerSearch, setHeaderSearch] = useState('');

  // Routing State
  const [startPoint, setStartPoint] = useState<RoutePoint | null>(null);
  const [endPoint, setEndPoint] = useState<RoutePoint | null>(null);
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
  const [isPickingMapFor, setIsPickingMapFor] = useState<'start' | 'end' | null>(null);

  const filteredQuickLocations = headerSearch
    ? locations.filter((loc) =>
        loc.name.toLowerCase().includes(headerSearch.toLowerCase())
      )
    : [];

  const handleStartPoint = (point: RoutePoint | null) => {
    setStartPoint(point);
    setIsPickingMapFor(null);
  };

  const handleEndPoint = (point: RoutePoint | null) => {
    setEndPoint(point);
    setIsPickingMapFor(null);
  };

  const handleSwapPoints = () => {
    const temp = startPoint;
    setStartPoint(endPoint);
    setEndPoint(temp);
  };

  const handleClearRoute = () => {
    setStartPoint(null);
    setEndPoint(null);
    setRouteSummary(null);
    setIsPickingMapFor(null);
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (isPickingMapFor === 'start') {
      setStartPoint({
        lat,
        lng,
        name: `Map Point (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`,
      });
      setIsPickingMapFor(null);
    } else if (isPickingMapFor === 'end') {
      setEndPoint({
        lat,
        lng,
        name: `Map Point (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`,
      });
      setIsPickingMapFor(null);
    }
  };

  return (
    <div className="h-full w-full flex flex-col font-sans bg-slate-50 text-slate-800 antialiased overflow-hidden select-none">
      {/* Top Navigation Bar */}
      <header className="h-16 flex-none bg-indigo-900 text-white flex items-center justify-between px-4 sm:px-6 border-b border-indigo-800 shadow-sm z-20">
        {/* Brand & Emblem */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-indigo-900 font-black text-xl shadow-sm tracking-tighter">
            W
          </div>
          <div>
            <h1 className="font-bold text-base sm:text-lg leading-tight text-white flex items-center gap-1.5">
              <span>NITW Campus Navigator</span>
              <span className="hidden md:inline-block text-[10px] font-bold px-1.5 py-0.5 bg-indigo-800 text-indigo-200 rounded border border-indigo-700">
                CAMPUS MAP
              </span>
            </h1>
            <p className="text-[11px] text-indigo-200">National Institute of Technology Warangal</p>
          </div>
        </div>

        {/* Center Mode Switcher Tabs */}
        <div className="flex items-center bg-indigo-950/60 p-1 rounded-xl border border-indigo-700/60">
          <button
            id="tab-btn-directory"
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-indigo-700 text-white shadow-sm'
                : 'text-indigo-200 hover:text-white hover:bg-indigo-900/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Campus Directory</span>
          </button>

          <button
            id="tab-btn-routes"
            onClick={() => setActiveTab('routes')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'routes'
                ? 'bg-indigo-700 text-white shadow-sm'
                : 'text-indigo-200 hover:text-white hover:bg-indigo-900/50'
            }`}
          >
            <Footprints className="w-3.5 h-3.5 text-emerald-400" />
            <span>Walking Routes</span>
            {startPoint && endPoint && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
          </button>
        </div>

        {/* Center Quick Search (Desktop) */}
        <div className="hidden xl:block relative max-w-xs w-full">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300" />
            <input
              type="text"
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              placeholder="Quick search..."
              className="w-full bg-indigo-800/50 border border-indigo-700 text-xs py-1.5 pl-9 pr-3 rounded-full text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all"
            />
          </div>

          {headerSearch && filteredQuickLocations.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 text-slate-800 max-h-60 overflow-y-auto z-50 p-2 space-y-1">
              {filteredQuickLocations.slice(0, 5).map((loc) => (
                <div
                  key={loc._id || loc.id}
                  onClick={() => {
                    onSelectLocation(loc);
                    setHeaderSearch('');
                  }}
                  className="px-3 py-2 hover:bg-indigo-50 rounded-lg cursor-pointer flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-slate-800">{loc.name}</span>
                  <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase">
                    {loc.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            id="btn-admin-nav"
            onClick={onNavigateToAdmin}
            className="flex items-center gap-1.5 bg-indigo-700 hover:bg-indigo-600 px-3.5 py-2 rounded-lg text-xs font-bold border border-indigo-500 shadow-sm transition-all text-white cursor-pointer active:scale-95"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-200" />
            <span>Admin Portal</span>
          </button>
        </div>
      </header>

      {/* Main Content: Split View */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar Panel (Directory or Route Planner) */}
        <div className="w-80 md:w-96 flex-none h-full z-10">
          {activeTab === 'directory' ? (
            <LocationList
              locations={locations}
              selectedLocation={selectedLocation}
              onSelectLocation={onSelectLocation}
              isLoading={isLoading}
              onResetView={() => onSelectLocation(null)}
            />
          ) : (
            <RoutePlanner
              locations={locations}
              startPoint={startPoint}
              endPoint={endPoint}
              onSetStartPoint={handleStartPoint}
              onSetEndPoint={handleEndPoint}
              onSwapPoints={handleSwapPoints}
              onClearRoute={handleClearRoute}
              routeSummary={routeSummary}
              onStartMapPick={(target) => setIsPickingMapFor(target)}
              isPickingMapFor={isPickingMapFor}
              onBackToDirectory={() => setActiveTab('directory')}
            />
          )}
        </div>

        {/* Right Interactive Leaflet Canvas */}
        <main className="flex-1 h-full relative bg-slate-100">
          <MapView
            locations={locations}
            selectedLocation={selectedLocation}
            onSelectLocation={onSelectLocation}
            startPoint={startPoint}
            endPoint={endPoint}
            onSetStartPoint={handleStartPoint}
            onSetEndPoint={handleEndPoint}
            onRouteCalculated={setRouteSummary}
            routeSummary={routeSummary}
            isPickerMode={Boolean(isPickingMapFor)}
            onMapClick={handleMapClick}
            onSwitchToRouteMode={() => setActiveTab('routes')}
          />
        </main>
      </div>

      {/* Footer Bar */}
      <footer className="h-8 flex-none bg-white border-t border-slate-200 px-4 sm:px-6 flex items-center justify-between text-[11px] text-slate-500 z-20">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">NIT Warangal Campus Navigator</span>
          <span className="text-slate-300">•</span>
          <span>Leaflet Routing Machine &amp; OpenStreetMap</span>
        </div>
        <div className="flex items-center gap-2 text-indigo-700 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>
            {startPoint && endPoint && routeSummary
              ? `Route Active: ${Math.round(routeSummary.totalDistance)}m (~${Math.ceil(
                  routeSummary.totalTime / 60
                )} min walk)`
              : 'Live Coordinate Matrix: 17.9806° N, 79.5307° E'}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default MapPage;
