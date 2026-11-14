'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Calculator,
  Calendar,
  Car,
  Clock,
  Coffee,
  MapPin,
  Plus,
  Save,
  Search,
  Trash2,
  Users,
  Bed,
  CheckCircle2,
} from 'lucide-react';
import {
  ItineraryStop,
  LanguageCode,
  Place,
  SavedItinerary,
  TransportMode,
} from '../types/tourism';
import { SUGGESTED_ROUTES } from '../data/maeSaiPlaces';
import { TRANSLATIONS } from '../data/translations';
import {
  calculateTripEstimate,
  formatDuration,
  haversineKm,
  STARTING_POINTS,
  TRANSPORT_CONFIG,
} from '../utils/geo';
import { MaeSaiLeafletMap } from '../components/map/MaeSaiLeafletMap';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TripPlannerPageProps {
  places: Place[];
  lang: LanguageCode;
  stops: ItineraryStop[];
  onChangeStops: (stops: ItineraryStop[]) => void;
  onSaveItinerary: (itinerary: SavedItinerary) => void;
  onSelectPlace: (placeId: string) => void;
  onOpenRouteOnFullMap: (stopIds: string[]) => void;
}

export const TripPlannerPage: React.FC<TripPlannerPageProps> = ({
  places,
  lang,
  stops,
  onChangeStops,
  onSaveItinerary,
  onSelectPlace,
  onOpenRouteOnFullMap,
}) => {
  const t = TRANSLATIONS[lang];

  const [tripTitle, setTripTitle] = useState('My Mae Sai Discovery Trip');
  const [startLocationId, setStartLocationId] = useState(STARTING_POINTS[0].id);
  const [travelDate, setTravelDate] = useState('2026-11-20');
  const [visitors, setVisitors] = useState(2);
  const [transportMode, setTransportMode] = useState<TransportMode>('motorcycle');
  const [budgetPreference, setBudgetPreference] = useState<'budget' | 'balanced' | 'comfort'>(
    'balanced'
  );
  const [includeOvernight, setIncludeOvernight] = useState(false);
  const [destSearch, setDestSearch] = useState('');
  const [calculatedTick, setCalculatedTick] = useState(0);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const startPoint =
    STARTING_POINTS.find((sp) => sp.id === startLocationId) || STARTING_POINTS[0];

  const resolvedStops = useMemo(() => {
    return stops
      .map((s) => {
        const place = places.find((p) => p.placeId === s.placeId);
        return place ? { place, visitMinutes: s.visitMinutes } : null;
      })
      .filter((x): x is { place: Place; visitMinutes: number } => Boolean(x));
  }, [stops, places]);

  const estimate = useMemo(() => {
    return calculateTripEstimate({
      startPoint,
      stops: resolvedStops,
      mode: transportMode,
      visitors,
      budgetPreference,
      includeOvernight,
    });
  }, [startPoint, resolvedStops, transportMode, visitors, budgetPreference, includeOvernight]);

  const searchablePlaces = useMemo(() => {
    const q = destSearch.trim().toLowerCase();
    const stopIds = new Set(stops.map((s) => s.placeId));
    return places
      .filter((p) => !stopIds.has(p.placeId))
      .filter((p) => {
        if (!q) return true;
        return `${p.name} ${p.localName} ${p.subdistrict} ${p.subcategory}`
          .toLowerCase()
          .includes(q);
      })
      .slice(0, 8);
  }, [places, stops, destSearch]);

  // Nearby café/restaurant/accommodation recommendations based on current stops
  const smartSuggestions = useMemo(() => {
    if (resolvedStops.length === 0) return [];
    const lastStop = resolvedStops[resolvedStops.length - 1].place;
    const existingIds = new Set(stops.map((s) => s.placeId));
    return places
      .filter(
        (p) =>
          !existingIds.has(p.placeId) &&
          (p.categoryId === 'cafes' ||
            p.categoryId === 'restaurants' ||
            p.categoryId === 'accommodation')
      )
      .map((p) => ({
        place: p,
        distKm: haversineKm(lastStop.latitude, lastStop.longitude, p.latitude, p.longitude),
      }))
      .sort((a, b) => a.distKm - b.distKm)
      .slice(0, 3);
  }, [resolvedStops, places, stops]);

  const addStop = (place: Place) => {
    onChangeStops([
      ...stops,
      { placeId: place.placeId, visitMinutes: place.estimatedVisitMinutes || 60 },
    ]);
  };

  const removeStop = (index: number) => {
    onChangeStops(stops.filter((_, i) => i !== index));
  };

  const moveStop = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= stops.length) return;
    const copy = [...stops];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;
    onChangeStops(copy);
  };

  const updateVisitMinutes = (index: number, minutes: number) => {
    const copy = [...stops];
    copy[index] = { ...copy[index], visitMinutes: Math.max(15, minutes) };
    onChangeStops(copy);
  };

  const handleLoadPreset = (routeId: string) => {
    const route = SUGGESTED_ROUTES.find((r) => r.routeId === routeId);
    if (!route) return;
    setTripTitle(route.title);
    setTransportMode(route.recommendedTransport);
    setIncludeOvernight(route.tripLengthType === 'weekend');
    onChangeStops(
      route.stopIds.map((id) => {
        const p = places.find((item) => item.placeId === id);
        return { placeId: id, visitMinutes: p?.estimatedVisitMinutes || 60 };
      })
    );
  };

  const handleCalculate = () => {
    setCalculatedTick((c) => c + 1);
  };

  const handleSave = () => {
    if (resolvedStops.length === 0) return;
    const newItinerary: SavedItinerary = {
      itineraryId: `itin-${Date.now()}`,
      title: tripTitle.trim() || 'Mae Sai Trip Plan',
      startLocationId,
      travelDate,
      visitors,
      transportMode,
      budgetPreference,
      stops,
      estimatedTotalCost: estimate.totalCost,
      estimatedPerPerson: estimate.costPerPerson,
      estimatedDurationMinutes: estimate.totalDurationMinutes,
      estimatedDistanceKm: estimate.totalDistanceKm,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    onSaveItinerary(newItinerary);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const totalTransportCost =
    estimate.rentalCost +
    estimate.fuelCost +
    estimate.localTransportCost +
    estimate.tourGuideCost;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title & Quick Presets */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-[#E5E9E2]">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#26352A]">
            Plan Your Mae Sai Trip
          </h1>
          <p className="text-sm sm:text-base text-[#6B7280] mt-1">
            Configure destinations, transport mode, and group size to estimate distances, travel
            times, and itemized THB trip costs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#6B7280]">Quick Presets:</span>
          {SUGGESTED_ROUTES.map((r) => (
            <button
              key={r.routeId}
              type="button"
              onClick={() => handleLoadPreset(r.routeId)}
              className="px-3 py-1.5 text-xs font-medium bg-[#f5f0de] hover:bg-[#ebe3c8] text-[#26352A] rounded-lg transition-colors cursor-pointer"
            >
              {r.theme.charAt(0).toUpperCase() + r.theme.slice(1)} Trip
            </button>
          ))}
        </div>
      </div>

      {/* 3-Column Trip Planning Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT SECTION: Trip Configuration */}
        <section className="lg:col-span-4 bg-white rounded-xl border border-[#E5E9E2] p-5 space-y-5">
          <h2 className="font-display text-base font-bold text-[#26352A]">
            1. Trip Configuration
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="trip-title" className="block text-xs font-semibold text-[#26352A] mb-1">
                Itinerary Name
              </label>
              <input
                id="trip-title"
                type="text"
                value={tripTitle}
                onChange={(e) => setTripTitle(e.target.value)}
                className="w-full rounded-lg border border-[#E5E9E2] px-3 py-2 text-sm focus:border-[#406246] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="start-loc" className="block text-xs font-semibold text-[#26352A] mb-1">
                Starting Location
              </label>
              <Select
                value={startLocationId}
                onValueChange={(val) => val && setStartLocationId(val)}
              >
                <SelectTrigger
                  id="start-loc"
                  aria-label="Starting Location"
                  className="w-full rounded-lg border border-[#E5E9E2] bg-white px-3 py-2 text-sm h-10"
                >
                  <SelectValue placeholder="Select Starting Location" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-[#E5E9E2] shadow-lg rounded-lg">
                  {STARTING_POINTS.map((sp) => (
                    <SelectItem key={sp.id} value={sp.id}>
                      {sp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="travel-date" className="block text-xs font-semibold text-[#26352A] mb-1">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#406246]" />
                    <span>Travel Date</span>
                  </span>
                </label>
                <input
                  id="travel-date"
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E9E2] px-3 py-2 text-sm focus:border-[#406246] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="visitor-count" className="block text-xs font-semibold text-[#26352A] mb-1">
                  <span className="inline-flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#406246]" />
                    <span>Visitors</span>
                  </span>
                </label>
                <input
                  id="visitor-count"
                  type="number"
                  min={1}
                  max={20}
                  value={visitors}
                  onChange={(e) => setVisitors(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full font-mono-tabular rounded-lg border border-[#E5E9E2] px-3 py-2 text-sm focus:border-[#406246] focus:outline-none"
                />
              </div>
            </div>

            {/* Transportation Option */}
            <div>
              <label htmlFor="transport-mode" className="block text-xs font-semibold text-[#26352A] mb-1">
                <span className="inline-flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-[#406246]" />
                  <span>Transportation Option</span>
                </span>
              </label>
              <Select
                value={transportMode}
                onValueChange={(val) => val && setTransportMode(val as TransportMode)}
              >
                <SelectTrigger
                  id="transport-mode"
                  aria-label="Transportation Option"
                  className="w-full rounded-lg border border-[#E5E9E2] bg-white px-3 py-2 text-sm h-10"
                >
                  <SelectValue placeholder="Transportation Option" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-[#E5E9E2] shadow-lg rounded-lg">
                  {(Object.keys(TRANSPORT_CONFIG) as TransportMode[]).map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {TRANSPORT_CONFIG[mode].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-[#6B7280] mt-1">
                {TRANSPORT_CONFIG[transportMode].description}
              </p>
            </div>

            {/* Budget Preference */}
            <div>
              <span className="block text-xs font-semibold text-[#26352A] mb-1.5">
                Budget Preference
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['budget', 'balanced', 'comfort'] as const).map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => setBudgetPreference(pref)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium capitalize border transition-colors cursor-pointer ${
                      budgetPreference === pref
                        ? 'bg-[#406246] text-white border-[#406246]'
                        : 'bg-[#fafaf8] text-[#4B5563] border-[#E5E9E2] hover:bg-[#f5f0de]'
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-[#26352A] cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={includeOvernight}
                onChange={(e) => setIncludeOvernight(e.target.checked)}
                className="rounded border-[#E5E9E2] text-[#406246] focus:ring-[#406246]"
              />
              <span>Include 1-night estimated accommodation (if no hotel stop selected)</span>
            </label>
          </div>

          {/* Add Destinations Search */}
          <div className="pt-4 border-t border-[#E5E9E2] space-y-3">
            <h3 className="text-xs font-semibold text-[#26352A]">
              Add Destinations to Itinerary
            </h3>
            <div className="flex items-center gap-2 rounded-lg border border-[#E5E9E2] bg-[#fafaf8] px-3 py-2">
              <Search className="w-4 h-4 text-[#406246] shrink-0" />
              <input
                type="text"
                value={destSearch}
                onChange={(e) => setDestSearch(e.target.value)}
                placeholder="Search Mae Sai places to add..."
                className="w-full text-xs bg-transparent focus:outline-none"
              />
            </div>

            <div className="max-h-56 overflow-y-auto divide-y divide-[#E5E9E2] border border-[#E5E9E2] rounded-lg">
              {searchablePlaces.map((p) => (
                <div
                  key={p.placeId}
                  className="p-2.5 flex items-center justify-between gap-2 hover:bg-[#fafaf8]"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#26352A] truncate">{p.name}</div>
                    <div className="text-[11px] text-[#6B7280] truncate">
                      {t.categories[p.categoryId]} · {p.subdistrict}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => addStop(p)}
                    className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#406246] bg-[#E5E9E2]/70 hover:bg-[#406246] hover:text-white rounded-md transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CENTER SECTION: Reorderable Itinerary & Stops */}
        <section className="lg:col-span-4 bg-white rounded-xl border border-[#E5E9E2] p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-[#26352A]">
              2. Itinerary &amp; Stop Ordering
            </h2>
            <span className="font-mono-tabular text-xs text-[#406246] font-semibold">
              {resolvedStops.length} stops
            </span>
          </div>

          {/* Starting Point Banner */}
          <div className="bg-[#f5f0de]/80 rounded-lg p-3 border border-[#E5E9E2] flex items-center gap-2.5 text-xs">
            <MapPin className="w-4 h-4 text-[#406246] shrink-0" />
            <div>
              <span className="font-semibold text-[#26352A]">Start: </span>
              <span className="text-[#4B5563]">{startPoint.name}</span>
            </div>
          </div>

          {resolvedStops.length === 0 ? (
            <div className="py-10 px-4 text-center border border-dashed border-[#E5E9E2] rounded-xl space-y-2">
              <p className="text-sm font-semibold text-[#26352A]">Your itinerary is empty</p>
              <p className="text-xs text-[#6B7280]">
                Select places from the search list on the left or pick a Quick Preset above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {estimate.legs.map((leg, index) => (
                <div key={`${leg.toPlace.placeId}-${index}`} className="space-y-2">
                  {/* Leg Travel Indicator */}
                  <div className="flex items-center gap-2 pl-3 text-[11px] text-[#6B7280]">
                    <span className="w-0.5 h-4 bg-[#406246]/40 inline-block" />
                    <span className="font-mono-tabular">
                      Est. {leg.distanceKm} km · ~{leg.travelMinutes} min via{' '}
                      {TRANSPORT_CONFIG[transportMode].label}
                    </span>
                  </div>

                  {/* Stop Card */}
                  <div className="bg-[#fafaf8] rounded-xl border border-[#E5E9E2] p-3.5 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-[#406246] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono-tabular">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => onSelectPlace(leg.toPlace.placeId)}
                            className="font-display text-sm font-bold text-[#26352A] hover:text-[#406246] text-left truncate block cursor-pointer"
                          >
                            {leg.toPlace.name}
                          </button>
                          <div className="text-[11px] text-[#6B7280] truncate">
                            {t.categories[leg.toPlace.categoryId]} · {leg.toPlace.subdistrict}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveStop(index, -1)}
                          disabled={index === 0}
                          aria-label="Move stop up"
                          className="p-1 text-[#4B5563] hover:text-[#26352A] disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveStop(index, 1)}
                          disabled={index === resolvedStops.length - 1}
                          aria-label="Move stop down"
                          className="p-1 text-[#4B5563] hover:text-[#26352A] disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeStop(index)}
                          aria-label="Remove stop"
                          className="p-1 text-[#B84040] hover:bg-red-50 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E5E9E2] text-xs">
                      <span className="inline-flex items-center gap-1 text-[#6B7280]">
                        <Clock className="w-3.5 h-3.5 text-[#406246]" />
                        <span>Est. visit duration:</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={15}
                          step={15}
                          value={resolvedStops[index].visitMinutes}
                          onChange={(e) => updateVisitMinutes(index, Number(e.target.value) || 30)}
                          aria-label={`Visit duration for ${leg.toPlace.name}`}
                          className="w-16 font-mono-tabular text-right rounded border border-[#E5E9E2] bg-white px-2 py-1 text-xs"
                        />
                        <span className="text-[#6B7280]">min</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Smart Nearby Food / Café / Accommodation Suggestions */}
          {smartSuggestions.length > 0 && (
            <div className="pt-4 border-t border-[#E5E9E2] space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#26352A]">
                <Coffee className="w-3.5 h-3.5 text-[#406246]" />
                <span>Nearby Cafés, Food &amp; Stays Along Your Route</span>
              </div>
              <div className="space-y-2">
                {smartSuggestions.map(({ place, distKm }) => (
                  <div
                    key={place.placeId}
                    className="flex items-center justify-between gap-2 bg-[#f5f0de]/50 px-3 py-2 rounded-lg border border-[#E5E9E2]"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#26352A] truncate flex items-center gap-1">
                        {place.categoryId === 'accommodation' && (
                          <Bed className="w-3 h-3 text-[#406246] shrink-0" />
                        )}
                        <span className="truncate">{place.name}</span>
                      </div>
                      <div className="text-[11px] text-[#6B7280] font-mono-tabular">
                        {distKm} km from last stop
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => addStop(place)}
                      className="text-xs font-semibold text-[#406246] hover:underline shrink-0 cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* RIGHT SECTION: Route Map & Estimated Cost Summary */}
        <section className="lg:col-span-4 space-y-5">
          {/* Route Map */}
          <div className="bg-white rounded-xl border border-[#E5E9E2] overflow-hidden">
            <div className="p-4 border-b border-[#E5E9E2] flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-[#26352A]">
                3. Route Map Preview
              </h2>
              {resolvedStops.length > 0 && (
                <button
                  type="button"
                  onClick={() => onOpenRouteOnFullMap(resolvedStops.map((s) => s.place.placeId))}
                  className="text-xs font-semibold text-[#406246] hover:underline cursor-pointer"
                >
                  Open Full Map
                </button>
              )}
            </div>
            <div className="h-[260px] w-full">
              <MaeSaiLeafletMap
                places={places}
                routeStops={resolvedStops.map((s) => s.place)}
                startPoint={startPoint}
                heightClass="h-full w-full"
              />
            </div>
            <div className="p-4 bg-[#fafaf8] border-t border-[#E5E9E2] grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[11px] text-[#6B7280]">Est. Distance</div>
                <div className="font-mono-tabular text-sm font-bold text-[#26352A]">
                  {estimate.totalDistanceKm} km
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#6B7280]">Travel Time</div>
                <div className="font-mono-tabular text-sm font-bold text-[#26352A]">
                  {formatDuration(estimate.travelTimeMinutes)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#6B7280]">Total Duration</div>
                <div className="font-mono-tabular text-sm font-bold text-[#406246]">
                  {formatDuration(estimate.totalDurationMinutes)}
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Cost Estimation Panel */}
          <div className="bg-white rounded-xl border border-[#E5E9E2] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-[#26352A]">
                Estimated Travel Cost Breakdown
              </h2>
              <span className="text-[11px] text-[#6B7280] font-mono-tabular">
                {visitors} {visitors === 1 ? 'visitor' : 'visitors'}
              </span>
            </div>

            <dl className="divide-y divide-[#E5E9E2] text-sm">
              <div className="py-2 flex items-center justify-between">
                <dt className="text-[#4B5563]">Transportation (local / guide)</dt>
                <dd className="font-mono-tabular font-medium text-[#26352A]">
                  ฿{(estimate.localTransportCost + estimate.tourGuideCost).toLocaleString()}
                </dd>
              </div>
              <div className="py-2 flex items-center justify-between">
                <dt className="text-[#4B5563]">Vehicle Rental</dt>
                <dd className="font-mono-tabular font-medium text-[#26352A]">
                  ฿{estimate.rentalCost.toLocaleString()}
                </dd>
              </div>
              <div className="py-2 flex items-center justify-between">
                <dt className="text-[#4B5563]">Estimated Fuel</dt>
                <dd className="font-mono-tabular font-medium text-[#26352A]">
                  ฿{estimate.fuelCost.toLocaleString()}
                </dd>
              </div>
              <div className="py-2 flex items-center justify-between">
                <dt className="text-[#4B5563]">Entrance Fees (est.)</dt>
                <dd className="font-mono-tabular font-medium text-[#26352A]">
                  ฿{estimate.entranceFees.toLocaleString()}
                </dd>
              </div>
              <div className="py-2 flex items-center justify-between">
                <dt className="text-[#4B5563]">Food &amp; Drinks (est.)</dt>
                <dd className="font-mono-tabular font-medium text-[#26352A]">
                  ฿{estimate.foodAndDrinks.toLocaleString()}
                </dd>
              </div>
              <div className="py-2 flex items-center justify-between">
                <dt className="text-[#4B5563]">Accommodation (est.)</dt>
                <dd className="font-mono-tabular font-medium text-[#26352A]">
                  ฿{estimate.accommodationCost.toLocaleString()}
                </dd>
              </div>
              <div className="py-2 flex items-center justify-between">
                <dt className="text-[#4B5563]">Activities &amp; Crafts (est.)</dt>
                <dd className="font-mono-tabular font-medium text-[#26352A]">
                  ฿{estimate.activitiesCost.toLocaleString()}
                </dd>
              </div>
              <div className="py-2 flex items-center justify-between">
                <dt className="text-[#4B5563]">Other Expenses (parking/misc.)</dt>
                <dd className="font-mono-tabular font-medium text-[#26352A]">
                  ฿{estimate.otherExpenses.toLocaleString()}
                </dd>
              </div>
            </dl>

            {/* Total Box */}
            <div className="bg-[#f5f0de] rounded-xl p-4 space-y-2 border border-[#E5E9E2]">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-[#26352A]">
                  Total Estimated Trip Cost
                </span>
                <span className="font-mono-tabular text-2xl font-extrabold text-[#406246]">
                  ฿{estimate.totalCost.toLocaleString()}
                </span>
              </div>
              <div className="flex items-baseline justify-between text-xs text-[#4B5563] pt-1 border-t border-[#26352A]/10">
                <span>Estimated Cost per Person</span>
                <span className="font-mono-tabular font-bold text-[#26352A]">
                  ฿{estimate.costPerPerson.toLocaleString()} / person
                </span>
              </div>
              <div className="flex items-baseline justify-between text-[11px] text-[#6B7280]">
                <span>Transport subtotal</span>
                <span className="font-mono-tabular">฿{totalTransportCost.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              Estimates only: calculated from sample price ranges and road-adjusted Haversine
              distances. Prices are not guaranteed or confirmed bookings.
            </p>

            {/* Prominent Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleCalculate}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold text-white bg-[#406246] hover:bg-[#26352A] rounded-lg transition-colors cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
                <span>{t.common.calculateTrip}</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={resolvedStops.length === 0}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold text-[#26352A] bg-[#f5f0de] hover:bg-[#ebe3c8] border border-[#E5E9E2] rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
              >
                <Save className="w-4 h-4 text-[#406246]" />
                <span>{t.common.saveItinerary}</span>
              </button>
            </div>

            {calculatedTick > 0 && (
              <div className="text-xs text-[#406246] font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Updated estimate for {resolvedStops.length} stops ({estimate.totalDistanceKm} km).
                </span>
              </div>
            )}

            {savedSuccess && (
              <div className="text-xs text-[#406246] font-semibold bg-[#E5E9E2]/60 px-3 py-2 rounded-lg flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Itinerary saved! Open “Saved” in the header anytime to revisit it.</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
