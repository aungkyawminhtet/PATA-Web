'use client';

import React, { useEffect, useRef, useState } from 'react';
import type * as LeafletType from 'leaflet';
import { CategoryId, Place, TourismCluster } from '../../types/tourism';
import { CATEGORY_LIST } from '../../data/maeSaiPlaces';
import { MAE_SAI_CENTER, StartingPointOption } from '../../utils/geo';

interface MaeSaiLeafletMapProps {
  places: Place[];
  selectedPlaceId?: string | null;
  onSelectPlace?: (placeId: string) => void;
  routeStops?: Place[];
  startPoint?: StartingPointOption | null;
  clusters?: TourismCluster[];
  showClusters?: boolean;
  userLocation?: { lat: number; lng: number } | null;
  zoomControlPosition?: 'inside' | 'none';
  externalZoomTrigger?: { type: 'in' | 'out' | 'reset' | 'locate'; seq: number } | null;
  heightClass?: string;
}

const CATEGORY_COLORS: Record<CategoryId, string> = CATEGORY_LIST.reduce(
  (acc, item) => ({ ...acc, [item.id]: item.markerBg }),
  {} as Record<CategoryId, string>
);

function getCategorySvgIcon(categoryId: CategoryId): string {
  switch (categoryId) {
    case 'attractions':
      return '<path d="M12 3l8 16H4L12 3z" stroke="white" stroke-width="2" fill="none" stroke-linejoin="round"/>';
    case 'cafes':
      return '<path d="M5 8h10v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8zm10 1h2a2 2 0 0 1 0 4h-2" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>';
    case 'restaurants':
      return '<path d="M7 3v18M11 3v6a2 2 0 0 1-4 0V3M16 3v18M16 3c2 2 2 6 0 8" stroke="white" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
    case 'accommodation':
      return '<path d="M3 16v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5M3 14h18M7 9V7h4v2" stroke="white" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
    case 'local_experiences':
      return '<circle cx="12" cy="12" r="6" stroke="white" stroke-width="2" fill="none"/><path d="M12 6v12M6 12h12" stroke="white" stroke-width="1.5"/>';
    case 'shopping':
      return '<path d="M6 8h12l-1 11H7L6 8zm3 0V6a3 3 0 0 1 6 0v2" stroke="white" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
    case 'transportation':
      return '<rect x="5" y="6" width="14" height="10" rx="2" stroke="white" stroke-width="1.8" fill="none"/><circle cx="8" cy="18" r="1.5" fill="white"/><circle cx="16" cy="18" r="1.5" fill="white"/>';
    case 'facilities':
      return '<path d="M12 5v14M5 12h14" stroke="white" stroke-width="2.4" stroke-linecap="round"/>';
  }
}

export const MaeSaiLeafletMap: React.FC<MaeSaiLeafletMapProps> = ({
  places,
  selectedPlaceId,
  onSelectPlace,
  routeStops,
  startPoint,
  clusters,
  showClusters = false,
  userLocation,
  zoomControlPosition = 'inside',
  externalZoomTrigger,
  heightClass = 'h-full w-full',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletType.Map | null>(null);
  const layerGroupRef = useRef<LeafletType.LayerGroup | null>(null);
  const leafletLibRef = useRef<typeof LeafletType | null>(null);
  const [isLeafletReady, setIsLeafletReady] = useState(false);

  // Load leaflet dynamically on client
  useEffect(() => {
    let active = true;
    import('leaflet').then((mod) => {
      if (!active) return;
      // @ts-expect-error handle default / commonjs export
      const L = (mod.default?.map ? mod.default : mod) as typeof LeafletType;
      leafletLibRef.current = L;
      setIsLeafletReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  // Initialize Leaflet map once library is ready
  useEffect(() => {
    const L = leafletLibRef.current;
    if (!L || !containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [MAE_SAI_CENTER.lat, MAE_SAI_CENTER.lng],
      zoom: 12,
      zoomControl: zoomControlPosition === 'inside',
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    const group = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerGroupRef.current = group;

    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
    };
  }, [isLeafletReady, zoomControlPosition]);

  // Handle external zoom / reset / locate triggers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !externalZoomTrigger) return;
    if (externalZoomTrigger.type === 'in') map.zoomIn();
    if (externalZoomTrigger.type === 'out') map.zoomOut();
    if (externalZoomTrigger.type === 'reset') {
      map.setView([MAE_SAI_CENTER.lat, MAE_SAI_CENTER.lng], 12, { animate: true });
    }
    if (externalZoomTrigger.type === 'locate' && userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 14, { animate: true });
    }
  }, [externalZoomTrigger, userLocation]);

  // Update markers, clusters, and route layers
  useEffect(() => {
    const L = leafletLibRef.current;
    const map = mapRef.current;
    const group = layerGroupRef.current;
    if (!L || !map || !group) return;

    group.clearLayers();

    // 1. Cluster circles if enabled
    if (showClusters && clusters && clusters.length > 0) {
      clusters.forEach((cluster) => {
        L.circle([cluster.centerLat, cluster.centerLng], {
          radius: cluster.radiusMeters,
          color: '#406246',
          weight: 1.5,
          fillColor: '#406246',
          fillOpacity: 0.12,
        })
          .bindPopup(
            `<div style="padding:10px;font-family:DM Sans,sans-serif;">
              <div style="font-weight:700;color:#26352A;font-size:13px;">${cluster.name}</div>
              <div style="color:#6B7280;font-size:11px;margin-top:2px;">${cluster.subdistrict}</div>
              <div style="color:#374151;font-size:12px;margin-top:6px;line-height:1.4;">${cluster.summary}</div>
            </div>`
          )
          .addTo(group);
      });
    }

    // 2. Route polyline if routeStops provided
    if (routeStops && routeStops.length > 0) {
      const coords: [number, number][] = [];
      if (startPoint) {
        coords.push([startPoint.lat, startPoint.lng]);
        const startIcon = L.divIcon({
          className: 'maesai-custom-marker',
          html: `<div style="width:28px;height:28px;border-radius:9999px;background:#26352A;color:#f5f0de;border:2px solid white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px;box-shadow:0 2px 6px rgba(0,0,0,0.3);">S</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        L.marker([startPoint.lat, startPoint.lng], { icon: startIcon })
          .bindPopup(`<div style="padding:8px 10px;font-size:12px;font-weight:600;">Start: ${startPoint.name}</div>`)
          .addTo(group);
      }

      routeStops.forEach((stop, index) => {
        coords.push([stop.latitude, stop.longitude]);
        const stopIcon = L.divIcon({
          className: 'maesai-custom-marker',
          html: `<div style="width:30px;height:30px;border-radius:9999px;background:#406246;color:white;border:2.5px solid #f5f0de;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;box-shadow:0 3px 8px rgba(0,0,0,0.3);">${index + 1}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });
        const m = L.marker([stop.latitude, stop.longitude], { icon: stopIcon }).addTo(group);
        m.bindPopup(
          `<div style="padding:8px 10px;">
            <div style="font-size:11px;color:#406246;font-weight:600;">Stop ${index + 1}</div>
            <div style="font-size:13px;font-weight:700;color:#26352A;">${stop.name}</div>
          </div>`
        );
        m.on('click', () => {
          onSelectPlace?.(stop.placeId);
        });
      });

      if (coords.length >= 2) {
        const line = L.polyline(coords, {
          color: '#406246',
          weight: 4,
          opacity: 0.9,
          dashArray: '8, 6',
        }).addTo(group);
        map.fitBounds(line.getBounds(), { padding: [40, 40], maxZoom: 14 });
      } else if (coords.length === 1) {
        map.setView(coords[0], 13);
      }
    } else {
      // 3. Standard category markers for places
      places.forEach((place) => {
        const isSelected = place.placeId === selectedPlaceId;
        const bg = CATEGORY_COLORS[place.categoryId] || '#406246';
        const size = isSelected ? 38 : 30;
        const ring = isSelected ? '3px solid #f5f0de; box-shadow: 0 0 0 3px #406246, 0 4px 12px rgba(0,0,0,0.35);' : '2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.28);';

        const icon = L.divIcon({
          className: 'maesai-custom-marker',
          html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${bg};border:${ring}display:flex;align-items:center;justify-content:center;transition:transform 0.15s ease;">
            <svg width="${isSelected ? 18 : 15}" height="${isSelected ? 18 : 15}" viewBox="0 0 24 24">${getCategorySvgIcon(place.categoryId)}</svg>
          </div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const marker = L.marker([place.latitude, place.longitude], { icon }).addTo(group);
        marker.bindTooltip(`${place.name}`, { direction: 'top', offset: [0, -14] });
        marker.on('click', () => {
          onSelectPlace?.(place.placeId);
        });
      });
    }

    // 4. User location blue dot
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'maesai-custom-marker',
        html: `<div style="width:16px;height:16px;border-radius:9999px;background:#2563eb;border:3px solid white;box-shadow:0 0 0 4px rgba(37,99,235,0.25);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .bindTooltip('Your Current Location')
        .addTo(group);
    }
  }, [places, selectedPlaceId, routeStops, startPoint, clusters, showClusters, userLocation, onSelectPlace, isLeafletReady]);

  // Pan smoothly to selected place if not in full route fit mode
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedPlaceId || (routeStops && routeStops.length > 1)) return;
    const target = places.find((p) => p.placeId === selectedPlaceId);
    if (target) {
      map.panTo([target.latitude, target.longitude], { animate: true });
    }
  }, [selectedPlaceId, places, routeStops]);

  return (
    <div
      ref={containerRef}
      className={heightClass}
      style={{ minHeight: '280px', zIndex: 1 }}
      aria-label="Interactive OpenStreetMap of Mae Sai District, Chiang Rai"
    />
  );
};
