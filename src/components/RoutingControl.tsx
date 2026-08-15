import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { RoutePoint, RouteSummary, RouteInstruction } from '../types';

interface RoutingControlProps {
  startPoint: RoutePoint | null;
  endPoint: RoutePoint | null;
  onRouteCalculated?: (summary: RouteSummary | null) => void;
  showLrmInstructions?: boolean;
}

const RoutingControl: React.FC<RoutingControlProps> = ({
  startPoint,
  endPoint,
  onRouteCalculated,
  showLrmInstructions = false,
}) => {
  const map = useMap();
  const routingControlRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    // Clean up previous control if exists
    if (routingControlRef.current) {
      try {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      } catch (e) {
        console.warn('Cleanup error:', e);
      }
    }

    if (!startPoint || !endPoint) {
      if (onRouteCalculated) {
        onRouteCalculated(null);
      }
      return;
    }

    // Verify L.Routing exists
    if (!(L as any).Routing || !(L as any).Routing.control) {
      console.warn('Leaflet Routing Machine is not loaded on L global');
      return;
    }

    try {
      // Standard OSRM public service with foot/walking profile
      const router = (L as any).Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'foot',
      });

      const control = (L as any).Routing.control({
        waypoints: [
          L.latLng(startPoint.lat, startPoint.lng),
          L.latLng(endPoint.lat, endPoint.lng),
        ],
        router: router,
        lineOptions: {
          styles: [
            { color: '#312e81', opacity: 0.85, weight: 6 }, // Deep indigo outline
            { color: '#6366f1', opacity: 0.95, weight: 4, dashArray: '8, 8' }, // Indigo walking dashes
          ],
          extendToWaypoints: true,
          missingRouteTolerance: 10,
        },
        show: showLrmInstructions,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        collapsible: true,
        createMarker: (i: number, waypoint: any) => {
          const isStart = i === 0;
          const label = isStart ? 'A' : 'B';
          const name = isStart ? startPoint.name : endPoint.name;
          const bg = isStart ? '#059669' : '#dc2626'; // Green for Start, Red for Destination

          return L.marker(waypoint.latLng, {
            icon: L.divIcon({
              className: 'custom-routing-marker',
              html: `
                <div style="
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  transform: translate(-50%, -100%);
                ">
                  <div style="
                    background: ${bg};
                    color: #ffffff;
                    width: 30px;
                    height: 30px;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2.5px solid #ffffff;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                  ">
                    <span style="transform: rotate(45deg); font-weight: 900; font-size: 12px; font-family: sans-serif;">
                      ${label}
                    </span>
                  </div>
                  <div style="
                    margin-top: 4px;
                    background: rgba(15, 23, 42, 0.9);
                    color: #ffffff;
                    font-size: 10px;
                    font-weight: 700;
                    padding: 2px 6px;
                    border-radius: 6px;
                    white-space: nowrap;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                    border: 1px solid rgba(255,255,255,0.2);
                  ">
                    ${name.length > 20 ? name.substring(0, 18) + '...' : name}
                  </div>
                </div>
              `,
              iconSize: [30, 30],
              iconAnchor: [0, 0],
            }),
          }).bindPopup(`
            <div style="padding: 6px; font-family: sans-serif;">
              <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: ${bg};">
                ${isStart ? '● Starting Point (A)' : '● Destination Point (B)'}
              </span>
              <h4 style="margin: 2px 0 0 0; font-size: 13px; font-weight: 800; color: #0f172a;">${name}</h4>
              <p style="margin: 4px 0 0 0; font-size: 10px; color: #64748b; font-family: monospace;">
                ${waypoint.latLng.lat.toFixed(5)}°, ${waypoint.latLng.lng.toFixed(5)}°
              </p>
            </div>
          `);
        },
      }).addTo(map);

      control.on('routesfound', (e: any) => {
        const routes = e.routes;
        if (routes && routes.length > 0) {
          const selectedRoute = routes[0];
          const summary = selectedRoute.summary;

          const instructions: RouteInstruction[] = (selectedRoute.instructions || []).map(
            (inst: any) => ({
              text: inst.text || '',
              distance: inst.distance || 0,
              time: inst.time || 0,
              type: inst.type || '',
            })
          );

          if (onRouteCalculated) {
            onRouteCalculated({
              totalDistance: summary.totalDistance || 0,
              totalTime: summary.totalTime || Math.round((summary.totalDistance || 0) / 1.3), // walking speed fallback (~1.3 m/s)
              instructions,
            });
          }
        }
      });

      control.on('routingerror', (err: any) => {
        console.warn('Routing calculation error (falling back to straight line distance):', err);
        // Fallback distance calculation if OSRM server is temporarily slow
        const dLat = (endPoint.lat - startPoint.lat) * (Math.PI / 180);
        const dLng = (endPoint.lng - startPoint.lng) * (Math.PI / 180);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(startPoint.lat * (Math.PI / 180)) *
            Math.cos(endPoint.lat * (Math.PI / 180)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const directDist = Math.round(6371000 * c); // meters
        const walkTime = Math.round(directDist / 1.3); // ~5 km/h walking

        if (onRouteCalculated) {
          onRouteCalculated({
            totalDistance: directDist,
            totalTime: walkTime,
            instructions: [
              {
                text: `Walk along campus pathways from ${startPoint.name} to ${endPoint.name}`,
                distance: directDist,
                time: walkTime,
              },
            ],
          });
        }
      });

      routingControlRef.current = control;
    } catch (err) {
      console.error('Failed to initialize Leaflet Routing Machine:', err);
    }

    return () => {
      if (routingControlRef.current) {
        try {
          map.removeControl(routingControlRef.current);
          routingControlRef.current = null;
        } catch (e) {
          // ignore
        }
      }
    };
  }, [map, startPoint, endPoint, showLrmInstructions]);

  return null;
};

export default RoutingControl;
