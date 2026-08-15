import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin, Compass, RotateCcw } from 'lucide-react';

// Default center coordinates for NIT Warangal Campus
export const NITW_CENTER = [17.9806, 79.5307];
export const DEFAULT_ZOOM = 16;

// Helper to create category-colored SVG icons for Leaflet
const createCustomIcon = (category, isSelected = false) => {
  let color = '#2563eb'; // blue for Departments
  let bgGradient = 'linear-gradient(135deg, #3b82f6, #1d4ed8)';

  if (category === 'Hostels') {
    color = '#8b5cf6'; // purple/indigo
    bgGradient = 'linear-gradient(135deg, #8b5cf6, #6d28d9)';
  } else if (category === 'Mess') {
    color = '#10b981'; // emerald green
    bgGradient = 'linear-gradient(135deg, #10b981, #047857)';
  } else if (category === 'Others') {
    color = '#f59e0b'; // amber/orange
    bgGradient = 'linear-gradient(135deg, #f59e0b, #d97706)';
  }

  if (isSelected) {
    color = '#ef4444'; // red for active
    bgGradient = 'linear-gradient(135deg, #ef4444, #b91c1c)';
  }

  const iconHtml = `
    <div style="
      position: relative;
      width: ${isSelected ? '38px' : '30px'};
      height: ${isSelected ? '38px' : '30px'};
      background: ${bgGradient};
      border: ${isSelected ? '3px solid #ffffff' : '2px solid #ffffff'};
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      cursor: pointer;
      transition: all 0.2s ease-in-out;
    ">
      <div style="
        width: ${isSelected ? '12px' : '10px'};
        height: ${isSelected ? '12px' : '10px'};
        background: #ffffff;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-marker',
    iconSize: isSelected ? [38, 38] : [30, 30],
    iconAnchor: isSelected ? [19, 38] : [15, 30],
    popupAnchor: [0, -32],
  });
};

/**
 * Controller to handle flyTo when selected location changes
 */
function MapController({ selectedLocation, onResetView }) {
  const map = useMap();

  useEffect(() => {
    if (selectedLocation && selectedLocation.lat && selectedLocation.lng) {
      map.flyTo([selectedLocation.lat, selectedLocation.lng], 18, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [selectedLocation, map]);

  return null;
}

/**
 * Handler for user clicking on map in picker mode
 */
function MapClickHandler({ onMapClick, isPickerMode }) {
  useMapEvents({
    click(e) {
      if (isPickerMode && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

/**
 * Main MapView Component
 */
const MapView = ({
  locations = [],
  selectedLocation = null,
  onSelectLocation = () => {},
  isPickerMode = false,
  pickerCoords = null,
  onMapClick = null,
  className = '',
}) => {
  const [mapInstance, setMapInstance] = React.useState(null);

  const handleReset = () => {
    if (mapInstance) {
      mapInstance.flyTo(NITW_CENTER, DEFAULT_ZOOM, {
        duration: 1.0,
      });
      onSelectLocation(null);
    }
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Floating Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          id="btn-reset-map-view"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white/95 backdrop-blur-md text-slate-700 hover:text-blue-600 font-medium text-xs rounded-xl shadow-md border border-slate-200/80 hover:bg-slate-50 transition-all active:scale-95"
          title="Reset to Full Campus View"
        >
          <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
          <span>Reset View</span>
        </button>
      </div>

      {isPickerMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg border border-blue-400/30 flex items-center gap-2 animate-bounce">
          <MapPin className="w-4 h-4" />
          <span>Click anywhere on the map to set coordinates</span>
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

        {/* Render Locations */}
        {locations.map((loc) => {
          const isSelected = selectedLocation && (selectedLocation._id === loc._id || selectedLocation.id === loc.id);
          const icon = createCustomIcon(loc.category, isSelected);

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
                <div className="p-3.5 max-w-[240px]">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        loc.category === 'Hostels'
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : loc.category === 'Mess'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : loc.category === 'Departments'
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {loc.category}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm leading-snug">{loc.name}</h4>
                  {loc.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-3">{loc.description}</p>
                  )}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{loc.lat.toFixed(4)}° N, {loc.lng.toFixed(4)}° E</span>
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
              <div className="p-2 text-xs font-medium text-slate-800">
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
