'use client';

import React, { useMemo, useState } from 'react';
import {
  Search,
  LocateFixed,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Route,
  List,
  Map as MapIcon,
  Plus,
  Check,
  ArrowRight,
  X,
} from 'lucide-react';
import { CategoryId, LanguageCode, Place } from '../types/tourism';
import { CATEGORY_LIST, TOURISM_CLUSTERS } from '../data/maeSaiPlaces';
import { TRANSLATIONS } from '../data/translations';
import { haversineKm, MAE_SAI_CENTER, STARTING_POINTS } from '../utils/geo';
import { MaeSaiLeafletMap } from '../components/map/MaeSaiLeafletMap';
import { PlaceImage } from '../components/common/PlaceImage';
import { VerificationBadge } from '../components/common/VerificationBadge';

interface InteractiveMapPageProps {
  places: Place[];
  lang: LanguageCode;
  initialSelectedPlaceId: string | null;
  tripStopIds: string[];
  routePreviewStopIds: string[];
  userLocation: { lat: number; lng: number } | null;
  onSelectPlaceDetails: (placeId: string) => void;
  onAddToTrip: (placeId: string) => void;
  onRequestLocation: () => void;
  onNavigateToPlanner: () => void;
}

export const InteractiveMapPage: React.FC<InteractiveMapPageProps> = ({
  places,
  lang,
  initialSelectedPlaceId,
  tripStopIds,
  routePreviewStopIds,
  userLocation,
  onSelectPlaceDetails,
  onAddToTrip,
  onRequestLocation,
  onNavigateToPlanner,
}) => {
  const t = TRANSLATIONS[lang];
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSelectedPlaceId || places[0]?.placeId || null
  );
  const [showClusters, setShowClusters] = useState(false);
  const [showRouteOverlay, setShowRouteOverlay] = useState(routePreviewStopIds.length > 0);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [zoomTrigger, setZoomTrigger] = useState<{
    type: 'in' | 'out' | 'reset' | 'locate';
    seq: number;
  } | null>(null);

  const origin = userLocation || { lat: MAE_SAI_CENTER.lat, lng: MAE_SAI_CENTER.lng };

  const filteredPlaces = useMemo(() => {
    const q = search.trim().toLowerCase();
    return places.filter((p) => {
      if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
      if (q) {
        const text = `${p.name} ${p.localName} ${p.subdistrict} ${p.subcategory}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [places, search, selectedCategory]);

  const selectedPlace = places.find((p) => p.placeId === selectedId) || null;

  const nearbyAroundSelected = useMemo(() => {
    const baseLat = selectedPlace ? selectedPlace.latitude : origin.lat;
    const baseLng = selectedPlace ? selectedPlace.longitude : origin.lng;
    return filteredPlaces
      .filter((p) => !selectedPlace || p.placeId !== selectedPlace.placeId)
      .map((p) => ({
        place: p,
        distKm: haversineKm(baseLat, baseLng, p.latitude, p.longitude),
      }))
      .sort((a, b) => a.distKm - b.distKm)
      .slice(0, 6);
  }, [filteredPlaces, selectedPlace, origin.lat, origin.lng]);

  const activeRoutePlaces = useMemo(() => {
    if (!showRouteOverlay) return undefined;
    const ids = routePreviewStopIds.length > 0 ? routePreviewStopIds : tripStopIds;
    if (ids.length === 0) return undefined;
    return ids
      .map((id) => places.find((p) => p.placeId === id))
      .filter((p): p is Place => Boolean(p));
  }, [showRouteOverlay, routePreviewStopIds, tripStopIds, places]);

  const triggerZoom = (type: 'in' | 'out' | 'reset' | 'locate') => {
    if (type === 'locate') onRequestLocation();
    setZoomTrigger((prev) => ({ type, seq: (prev?.seq || 0) + 1 }));
  };

  return (
    <div className="max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-6 py-4">
      <div className="bg-white rounded-xl border border-[#E5E9E2] overflow-hidden flex flex-col lg:flex-row min-h-[760px] lg:h-[calc(100vh-110px)]">
        {/* Left Sidebar: Search, Category Filters & Nearby Places */}
        <aside className="w-full lg:w-[340px] xl:w-[360px] border-b lg:border-b-0 lg:border-r border-[#E5E9E2] flex flex-col bg-white shrink-0">
          <div className="p-4 border-b border-[#E5E9E2] space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h1 className="font-display text-lg font-bold text-[#26352A]">
                Interactive Tourism Map
              </h1>
              <div className="inline-flex rounded-lg border border-[#E5E9E2] p-0.5 bg-[#fafaf8]">
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md inline-flex items-center gap-1 cursor-pointer ${
                    viewMode === 'map' ? 'bg-[#406246] text-white' : 'text-[#4B5563]'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Map</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md inline-flex items-center gap-1 cursor-pointer ${
                    viewMode === 'list' ? 'bg-[#406246] text-white' : 'text-[#4B5563]'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2 border border-[#E5E9E2] rounded-lg px-3 py-2 bg-[#fafaf8] focus-within:border-[#406246]">
              <Search className="w-4 h-4 text-[#406246] shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Mae Sai destinations..."
                className="w-full text-sm bg-transparent focus:outline-none text-[#1c241e]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-[#6B7280] hover:text-[#26352A] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#406246] text-white'
                    : 'bg-[#f5f0de] text-[#26352A] hover:bg-[#ebe3c8]'
                }`}
              >
                All ({places.length})
              </button>
              {CATEGORY_LIST.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#406246] text-white border-[#406246]'
                      : 'bg-white text-[#4B5563] border-[#E5E9E2] hover:bg-[#f5f0de]'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: selectedCategory === cat.id ? '#fff' : cat.markerBg }}
                  />
                  <span>{cat.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Nearby Places List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-[#6B7280]">
              <span className="font-semibold text-[#26352A]">
                {selectedPlace ? `Near ${selectedPlace.name}` : 'Nearest to Mae Sai Center'}
              </span>
              <span className="font-mono-tabular">{filteredPlaces.length} shown</span>
            </div>

            <div className="space-y-2">
              {nearbyAroundSelected.map(({ place, distKm }) => (
                <button
                  key={place.placeId}
                  type="button"
                  onClick={() => {
                    setSelectedId(place.placeId);
                    setViewMode('map');
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer flex items-start gap-3 ${
                    selectedId === place.placeId
                      ? 'bg-[#f5f0de] border-[#406246]'
                      : 'bg-[#fafaf8] border-[#E5E9E2] hover:bg-white'
                  }`}
                >
                  <div className="w-12 h-12 rounded-md overflow-hidden shrink-0 bg-[#E5E9E2]">
                    <PlaceImage
                      src={place.mainImage}
                      alt={place.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#26352A] truncate">
                        {place.name}
                      </span>
                      <span className="font-mono-tabular text-[11px] text-[#406246] shrink-0">
                        {distKm} km
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6B7280] truncate mt-0.5">
                      {t.categories[place.categoryId]} · {place.subdistrict}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main 75%+ Map Canvas or Full List Mode */}
        <div className="relative flex-1 bg-[#E5E9E2] min-h-[460px]">
          {viewMode === 'list' ? (
            <div className="h-full overflow-y-auto bg-[#fafaf8] p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredPlaces.map((p) => {
                  const dist = haversineKm(origin.lat, origin.lng, p.latitude, p.longitude);
                  return (
                    <div
                      key={p.placeId}
                      className="bg-white rounded-xl border border-[#E5E9E2] p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs text-[#6B7280]">
                        <span>{t.categories[p.categoryId]}</span>
                        <span className="font-mono-tabular">{dist} km</span>
                      </div>
                      <h3 className="font-display font-bold text-[#26352A]">{p.name}</h3>
                      <p className="text-xs text-[#4B5563] line-clamp-2">{p.description}</p>
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectPlaceDetails(p.placeId)}
                          className="text-xs font-semibold text-[#406246] hover:underline cursor-pointer"
                        >
                          View Details
                        </button>
                        <span className="text-[#E5E9E2]">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(p.placeId);
                            setViewMode('map');
                          }}
                          className="text-xs font-medium text-[#26352A] hover:underline cursor-pointer"
                        >
                          Locate on Map
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              <MaeSaiLeafletMap
                places={filteredPlaces}
                selectedPlaceId={selectedId}
                onSelectPlace={(id) => setSelectedId(id)}
                routeStops={activeRoutePlaces}
                startPoint={activeRoutePlaces ? STARTING_POINTS[0] : null}
                clusters={TOURISM_CLUSTERS}
                showClusters={showClusters}
                userLocation={userLocation}
                zoomControlPosition="none"
                externalZoomTrigger={zoomTrigger}
                heightClass="h-full w-full"
              />

              {/* Top-Right Floating Map Controls */}
              <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
                <div className="bg-white rounded-xl border border-[#E5E9E2] shadow-md p-1 flex flex-col">
                  <button
                    type="button"
                    onClick={() => triggerZoom('in')}
                    className="p-2 text-[#26352A] hover:bg-[#f5f0de] rounded-lg cursor-pointer"
                    title="Zoom in"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerZoom('out')}
                    className="p-2 text-[#26352A] hover:bg-[#f5f0de] rounded-lg cursor-pointer"
                    title="Zoom out"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerZoom('locate')}
                    className="p-2 text-[#406246] hover:bg-[#f5f0de] rounded-lg cursor-pointer"
                    title="My current location"
                    aria-label="My current location"
                  >
                    <LocateFixed className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerZoom('reset')}
                    className="p-2 text-[#26352A] hover:bg-[#f5f0de] rounded-lg cursor-pointer"
                    title="Reset Mae Sai view"
                    aria-label="Reset map view"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Layer Toggles */}
                <div className="bg-white rounded-xl border border-[#E5E9E2] shadow-md p-1.5 flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => setShowClusters(!showClusters)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                      showClusters
                        ? 'bg-[#406246] text-white'
                        : 'text-[#26352A] hover:bg-[#f5f0de]'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Clusters</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRouteOverlay(!showRouteOverlay)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                      showRouteOverlay
                        ? 'bg-[#406246] text-white'
                        : 'text-[#26352A] hover:bg-[#f5f0de]'
                    }`}
                  >
                    <Route className="w-3.5 h-3.5" />
                    <span>Trip Route</span>
                  </button>
                </div>
              </div>

              {/* Selected Marker Preview Card */}
              {selectedPlace && (
                <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:w-[370px] z-[400] bg-white rounded-xl border border-[#E5E9E2] shadow-xl overflow-hidden">
                  <div className="flex gap-3.5 p-3.5">
                    <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-[#E5E9E2]">
                      <PlaceImage
                        src={selectedPlace.mainImage}
                        alt={selectedPlace.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-medium text-[#406246] truncate">
                          {t.categories[selectedPlace.categoryId]}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedId(null)}
                          className="text-[#6B7280] hover:text-[#26352A] cursor-pointer"
                          aria-label="Close preview"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <h2 className="font-display text-sm font-bold text-[#26352A] truncate">
                        {selectedPlace.name}
                      </h2>
                      <p className="text-xs text-[#6B7280] truncate">
                        {selectedPlace.subdistrict} ·{' '}
                        <span className="font-mono-tabular">
                          {haversineKm(
                            origin.lat,
                            origin.lng,
                            selectedPlace.latitude,
                            selectedPlace.longitude
                          )}{' '}
                          km
                        </span>
                      </p>
                      <VerificationBadge
                        status={selectedPlace.verificationStatus}
                        lang={lang}
                        compact
                      />
                    </div>
                  </div>

                  <div className="px-3.5 pb-3.5 pt-2 border-t border-[#E5E9E2] flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectPlaceDetails(selectedPlace.placeId)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#406246] hover:bg-[#26352A] rounded-lg transition-colors cursor-pointer"
                    >
                      <span>{t.common.viewDetails}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddToTrip(selectedPlace.placeId)}
                      className={`inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        tripStopIds.includes(selectedPlace.placeId)
                          ? 'bg-[#E5E9E2] border-[#406246] text-[#26352A]'
                          : 'bg-[#f5f0de] border-[#E5E9E2] text-[#26352A] hover:bg-[#ebe3c8]'
                      }`}
                    >
                      {tripStopIds.includes(selectedPlace.placeId) ? (
                        <Check className="w-3.5 h-3.5 text-[#406246]" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                      <span>{tripStopIds.includes(selectedPlace.placeId) ? 'In Trip' : 'Add to Trip'}</span>
                    </button>
                    {showRouteOverlay && (
                      <button
                        type="button"
                        onClick={onNavigateToPlanner}
                        className="px-2.5 py-2 text-xs font-semibold text-[#406246] hover:underline cursor-pointer"
                      >
                        Plan
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
