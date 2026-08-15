import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { RotateCcw, MapPin, Navigation, Footprints, Clock, Sparkles } from 'lucide-react';
import { LocationItem, LocationCategory, RoutePoint, RouteSummary } from '../types';
import RoutingControl from './RoutingControl';

export const NITW_CENTER: [number, number] = [17.9806, 79.5307];
export const DEFAULT_ZOOM = 16;

const createCustomIcon = (category: LocationCategory, isSelected = false) => {
  let bgGradient = 'linear-gradient(135deg, #4338ca, #312e81)'; // Indigo 700 to 900 for Departments

  if (category === 'Hostels') {
    bgGradient = 'linear-gradient(135deg, #7c3aed, #5b21b6)'; // Purple
  } else if (category === 'Mess') {
    bgGradient = 'linear-gradient(135deg, #059669, #065f46)'; // Emerald
  } else if (category === 'Others') {
    bgGradient = 'linear-gradient(135deg, #d97706, #92400e)'; // Amber
  }

  if (isSelected) {
    bgGradient = 'linear-gradient(135deg, #ef4444, #991b1b)'; // Crimson Red active
  }

  const size = isSelected ? 38 : 32;
  const dotSize = isSelected ? 12 : 10;

  const iconHtml = `
    <div style="
      position: relative;
      width: ${size}px;
      height: ${size}px;
      background: ${bgGradient};
      border: ${isSelected ? '3px solid #ffffff' : '2.5px solid #ffffff'};
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 16px rgba(15, 23, 42, 0.35);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    ">
      <div style="
        width: ${dotSize}px;
        height: ${dotSize}px;
        background: #ffffff;
        border-radius: 50%;
        transform: rotate(45deg);
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      "></div>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 4],
  });
};

function MapController({ selectedLocation }: { selectedLocation: LocationItem | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedLocation && typeof selectedLocation.lat === 'number' && typeof selectedLocation.lng === 'number') {
      map.flyTo([selectedLocation.lat, selectedLocation.lng], 18, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [selectedLocation, map]);

  return null;
}

function MapClickHandler({
  onMapClick,
  isPickerMode,
}: {
  onMapClick?: (lat: number, lng: number) => void;
  isPickerMode: boolean;
}) {
  useMapEvents({
    click(e) {
      if (isPickerMode && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

interface MapViewProps {
  locations?: LocationItem[];
  selectedLocation?: LocationItem | null;
  onSelectLocation?: (location: LocationItem | null) => void;
  isPickerMode?: boolean;
  pickerCoords?: { lat: number; lng: number } | null;
  onMapClick?: (lat: number, lng: number) => void;
  startPoint?: RoutePoint | null;
  endPoint?: RoutePoint | null;
  onSetStartPoint?: (point: RoutePoint | null) => void;
  onSetEndPoint?: (point: RoutePoint | null) => void;
  onRouteCalculated?: (summary: RouteSummary | null) => void;
  routeSummary?: RouteSummary | null;
  onSwitchToRouteMode?: () => void;
  className?: string;
}

const MapView: React.FC<MapViewProps> = ({
  locations = [],
  selectedLocation = null,
  onSelectLocation = (_loc?: LocationItem | null) => {},
  isPickerMode = false,
  pickerCoords = null,
  onMapClick,
  startPoint = null,
  endPoint = null,
  onSetStartPoint,
  onSetEndPoint,
  onRouteCalculated,
  routeSummary = null,
  onSwitchToRouteMode,
  className = '',
}) => {
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  const handleReset = () => {
    if (mapInstance) {
      mapInstance.flyTo(NITW_CENTER, DEFAULT_ZOOM, {
        duration: 1.0,
      });
      onSelectLocation(null);
    }
  };

  const getBadgeCategoryStyle = (category: LocationCategory) => {
    switch (category) {
      case 'Departments':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'Hostels':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'Mess':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      default:
        return 'text-amber-700 bg-amber-50 border-amber-200';
    }
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Floating Status & Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2.5 pointer-events-none">
        {/* Active Route Floating Card if route is loaded */}
        {startPoint && endPoint && routeSummary && (
          <div className="bg-indigo-950/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-indigo-700/80 pointer-events-auto flex items-center gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-lg bg-indigo-700/80 flex items-center justify-center text-emerald-400">
              <Footprints className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-white">Walking Path Active</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                  OSRM
                </span>
              </div>
              <p className="text-[10px] text-indigo-200 font-medium">
                {Math.round(routeSummary.totalDistance)} m • ~{Math.ceil(routeSummary.totalTime / 60)} mins walk
              </p>
            </div>
          </div>
        )}

        {/* Live Campus Status badge in theme style */}
        <div className="hidden sm:flex items-center gap-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-slate-200/80 pointer-events-auto transition-all">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-800 flex items-center justify-center font-bold text-xs border border-indigo-100">
            {locations.length}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 leading-tight">Live Campus Map</p>
            <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Leaflet Routing active
            </p>
          </div>
        </div>

        {/* Reset View Button */}
        <button
          id="btn-reset-map-view"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white/95 backdrop-blur-md text-slate-700 hover:text-indigo-900 hover:bg-slate-50 font-semibold text-xs rounded-xl shadow-md border border-slate-200/90 transition-all active:scale-95 cursor-pointer pointer-events-auto"
          title="Reset to Full Campus View"
        >
          <RotateCcw className="w-3.5 h-3.5 text-indigo-700" />
          <span>Reset Campus View</span>
        </button>
      </div>

      {isPickerMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-indigo-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xl border border-indigo-500/50 flex items-center gap-2 animate-bounce pointer-events-none">
          <MapPin className="w-4 h-4 text-indigo-300" />
          <span>Click anywhere on the campus map to pick coordinates</span>
        </div>
      )}

      <MapContainer
        center={NITW_CENTER}
        zoom={DEFAULT_ZOOM}
        minZoom={14}
        maxZoom={19}
        scrollWheelZoom={true}
        className="w-full h-full"
        ref={setMapInstance}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxNativeZoom={19}
          maxZoom={19}
        />

        <MapController selectedLocation={selectedLocation} />
        <MapClickHandler isPickerMode={isPickerMode} onMapClick={onMapClick} />

        {/* Leaflet Routing Machine Engine Component */}
        <RoutingControl
          startPoint={startPoint}
          endPoint={endPoint}
          onRouteCalculated={onRouteCalculated}
          showLrmInstructions={false}
        />

        {/* Render Locations */}
        {locations.map((loc) => {
          const isSelected =
            selectedLocation &&
            ((selectedLocation._id && loc._id && selectedLocation._id === loc._id) ||
              (selectedLocation.id && loc.id && selectedLocation.id === loc.id));

          const isStartRoute = startPoint && startPoint.name === loc.name;
          const isEndRoute = endPoint && endPoint.name === loc.name;

          const icon = createCustomIcon(loc.category, Boolean(isSelected || isStartRoute || isEndRoute));

          return (
            <Marker
              key={loc._id || loc.id || `${loc.lat}-${loc.lng}`}
              position={[loc.lat, loc.lng]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  onSelectLocation(loc);
                },
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-4 max-w-[280px] bg-white rounded-xl">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${getBadgeCategoryStyle(
                        loc.category
                      )}`}
                    >
                      {loc.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">NITW</span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm leading-snug">
                    {loc.name}
                  </h4>

                  {loc.description && (
                    <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-3 leading-relaxed">
                      {loc.description}
                    </p>
                  )}

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{loc.lat.toFixed(4)}° N</span>
                    <span>{loc.lng.toFixed(4)}° E</span>
                  </div>

                  {/* Action Controls & Routing Triggers */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-2 gap-1.5">
                    {onSetStartPoint && (
                      <button
                        onClick={() => {
                          onSetStartPoint({
                            lat: loc.lat,
                            lng: loc.lng,
                            name: loc.name,
                            category: loc.category,
                          });
                          if (onSwitchToRouteMode) onSwitchToRouteMode();
                        }}
                        className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg border border-emerald-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        title="Set as Starting Point (A)"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        <span>Route From (A)</span>
                      </button>
                    )}

                    {onSetEndPoint && (
                      <button
                        onClick={() => {
                          onSetEndPoint({
                            lat: loc.lat,
                            lng: loc.lng,
                            name: loc.name,
                            category: loc.category,
                          });
                          if (onSwitchToRouteMode) onSwitchToRouteMode();
                        }}
                        className="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-800 text-[10px] font-bold rounded-lg border border-red-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        title="Set as Destination Point (B)"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                        <span>Route To (B)</span>
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Temporary Picker Marker */}
        {isPickerMode && pickerCoords && (
          <Marker
            position={[pickerCoords.lat, pickerCoords.lng]}
            icon={createCustomIcon('Others', true)}
          >
            <Popup>
              <div className="p-2.5 text-xs font-semibold text-slate-800">
                Selected Point: {pickerCoords.lat.toFixed(5)}, {pickerCoords.lng.toFixed(5)}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
