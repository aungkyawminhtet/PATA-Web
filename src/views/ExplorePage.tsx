'use client';

import React, { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Map as MapIcon, LayoutGrid, X } from 'lucide-react';
import {
  BudgetTier,
  CategoryId,
  LanguageCode,
  Place,
  VerificationStatus,
} from '../types/tourism';
import { CATEGORY_LIST } from '../data/maeSaiPlaces';
import { TRANSLATIONS } from '../data/translations';
import { haversineKm, isPlaceOpenNow, MAE_SAI_CENTER } from '../utils/geo';
import { PlaceCard } from '../components/common/PlaceCard';
import { MaeSaiLeafletMap } from '../components/map/MaeSaiLeafletMap';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ExplorePageProps {
  places: Place[];
  lang: LanguageCode;
  initialQuery: string;
  initialCategory: CategoryId | 'all';
  savedPlaceIds: string[];
  tripStopIds: string[];
  userLocation: { lat: number; lng: number } | null;
  onSelectPlace: (placeId: string) => void;
  onToggleSave: (placeId: string) => void;
  onAddToTrip: (placeId: string) => void;
  onRequestLocation: () => void;
}

type SortOption = 'recommended' | 'name_asc' | 'nearest' | 'price_low' | 'recently_verified';

const INTEREST_TAGS = [
  'Historical',
  'Cultural',
  'Nature',
  'Adventure',
  'Shopping',
  'Food',
  'Coffee',
  'Family-friendly',
  'Community tourism',
];

const FACILITY_FILTERS = [
  'Parking',
  'Wi-Fi',
  'Restrooms',
  'Wheelchair accessibility',
  'Outdoor seating',
  'Family-friendly facilities',
  'Pet-friendly (where verified)',
];

export const ExplorePage: React.FC<ExplorePageProps> = ({
  places,
  lang,
  initialQuery,
  initialCategory,
  savedPlaceIds,
  tripStopIds,
  userLocation,
  onSelectPlace,
  onToggleSave,
  onAddToTrip,
  onRequestLocation,
}) => {
  const t = TRANSLATIONS[lang];

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>(initialCategory);
  const [selectedSubdistrict, setSelectedSubdistrict] = useState<string>('all');
  const [distanceRadiusKm, setDistanceRadiusKm] = useState<number>(0); // 0 = any
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<BudgetTier | 'all'>('all');
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState<'all' | 'open_now' | 'morning' | 'afternoon' | 'evening'>('all');
  const [verificationFilter, setVerificationFilter] = useState<VerificationStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const subdistricts = useMemo(
    () => Array.from(new Set(places.map((p) => p.subdistrict))),
    [places]
  );

  const refOrigin = userLocation || { lat: MAE_SAI_CENTER.lat, lng: MAE_SAI_CENTER.lng };

  const filteredPlaces = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = places
      .map((place) => ({
        place,
        distKm: haversineKm(refOrigin.lat, refOrigin.lng, place.latitude, place.longitude),
      }))
      .filter(({ place, distKm }) => {
        if (q) {
          const hay = `${place.name} ${place.localName} ${place.description} ${place.subcategory} ${place.subdistrict} ${place.tags.join(' ')}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        if (selectedCategory !== 'all' && place.categoryId !== selectedCategory) return false;
        if (selectedSubdistrict !== 'all' && place.subdistrict !== selectedSubdistrict) return false;
        if (distanceRadiusKm > 0 && distKm > distanceRadiusKm) return false;
        if (selectedBudget !== 'all' && place.budgetTier !== selectedBudget) return false;
        if (verificationFilter !== 'all' && place.verificationStatus !== verificationFilter) return false;
        if (selectedInterests.length > 0 && !selectedInterests.some((tag) => place.tags.includes(tag))) {
          return false;
        }
        if (
          selectedFacilities.length > 0 &&
          !selectedFacilities.every((fac) => place.facilities.includes(fac))
        ) {
          return false;
        }
        if (timeFilter === 'open_now' && !isPlaceOpenNow(place)) return false;
        if (
          (timeFilter === 'morning' || timeFilter === 'afternoon' || timeFilter === 'evening') &&
          !place.openPeriods.includes(timeFilter)
        ) {
          return false;
        }
        return true;
      });

    list.sort((a, b) => {
      if (sortBy === 'name_asc') return a.place.name.localeCompare(b.place.name);
      if (sortBy === 'nearest') return a.distKm - b.distKm;
      if (sortBy === 'price_low') return a.place.priceMin - b.place.priceMin;
      if (sortBy === 'recently_verified') {
        return b.place.lastVerifiedAt.localeCompare(a.place.lastVerifiedAt);
      }
      // Recommended: verified first, then name
      const rank = { verified: 0, partially_verified: 1, not_yet_verified: 2, needs_updating: 3 };
      return rank[a.place.verificationStatus] - rank[b.place.verificationStatus];
    });

    return list;
  }, [
    places,
    query,
    selectedCategory,
    selectedSubdistrict,
    distanceRadiusKm,
    selectedBudget,
    verificationFilter,
    selectedInterests,
    selectedFacilities,
    timeFilter,
    sortBy,
    refOrigin.lat,
    refOrigin.lng,
  ]);

  const toggleItem = (list: string[], value: string, setter: (next: string[]) => void) => {
    setter(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  };

  const resetAllFilters = () => {
    setQuery('');
    setSelectedCategory('all');
    setSelectedSubdistrict('all');
    setDistanceRadiusKm(0);
    setSelectedInterests([]);
    setSelectedBudget('all');
    setSelectedFacilities([]);
    setTimeFilter('all');
    setVerificationFilter('all');
  };

  const SidebarContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-bold text-[#26352A]">Filter Directory</h2>
        <button
          type="button"
          onClick={resetAllFilters}
          className="text-xs font-medium text-[#406246] hover:underline cursor-pointer"
        >
          Reset all
        </button>
      </div>

      {/* Location / Subdistrict */}
      <div className="space-y-2">
        <label htmlFor="subdistrict-filter" className="block text-xs font-semibold text-[#26352A]">
          Subdistrict Area
        </label>
        <Select
          value={selectedSubdistrict}
          onValueChange={(val) => val && setSelectedSubdistrict(val)}
        >
          <SelectTrigger
            id="subdistrict-filter"
            className="w-full rounded-lg border border-[#E5E9E2] bg-white px-3 py-2 text-sm text-[#1c241e] h-10"
          >
            <SelectValue placeholder="All Subdistricts" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-[#E5E9E2] shadow-lg rounded-lg">
            <SelectItem value="all">All Subdistricts</SelectItem>
            {subdistricts.map((sd) => (
              <SelectItem key={sd} value={sd}>
                {sd}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Distance */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#26352A]">Distance Radius</span>
          <button
            type="button"
            onClick={onRequestLocation}
            className="text-[11px] font-medium text-[#406246] hover:underline cursor-pointer"
          >
            {userLocation ? 'Using GPS' : 'Use my location'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { val: 0, label: 'Any distance' },
            { val: 1, label: 'Within 1 km' },
            { val: 5, label: 'Within 5 km' },
            { val: 10, label: 'Within 10 km' },
          ].map((opt) => (
            <button
              key={opt.val}
              type="button"
              onClick={() => setDistanceRadiusKm(opt.val)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                distanceRadiusKm === opt.val
                  ? 'bg-[#406246] text-white border-[#406246]'
                  : 'bg-white text-[#4B5563] border-[#E5E9E2] hover:bg-[#f5f0de]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="space-y-2">
        <span className="block text-xs font-semibold text-[#26352A]">Estimated Budget</span>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'Any' },
            { id: 'free', label: 'Free' },
            { id: 'low', label: 'Low' },
            { id: 'medium', label: 'Medium' },
            { id: 'premium', label: 'Premium' },
          ].map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelectedBudget(b.id as BudgetTier | 'all')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                selectedBudget === b.id
                  ? 'bg-[#406246] text-white border-[#406246]'
                  : 'bg-white text-[#4B5563] border-[#E5E9E2] hover:bg-[#f5f0de]'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time-Based */}
      <div className="space-y-2">
        <label htmlFor="time-filter" className="block text-xs font-semibold text-[#26352A]">
          Opening Period
        </label>
        <Select
          value={timeFilter}
          onValueChange={(val) => val && setTimeFilter(val as typeof timeFilter)}
        >
          <SelectTrigger
            id="time-filter"
            className="w-full rounded-lg border border-[#E5E9E2] bg-white px-3 py-2 text-sm text-[#1c241e] h-10"
          >
            <SelectValue placeholder="Any time" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-[#E5E9E2] shadow-lg rounded-lg">
            <SelectItem value="all">Any time</SelectItem>
            <SelectItem value="open_now">Open now (estimated)</SelectItem>
            <SelectItem value="morning">Open in morning</SelectItem>
            <SelectItem value="afternoon">Open in afternoon</SelectItem>
            <SelectItem value="evening">Open in evening</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Verification Status */}
      <div className="space-y-2">
        <label htmlFor="verif-filter" className="block text-xs font-semibold text-[#26352A]">
          Verification Status
        </label>
        <Select
          value={verificationFilter}
          onValueChange={(val) => val && setVerificationFilter(val as VerificationStatus | 'all')}
        >
          <SelectTrigger
            id="verif-filter"
            className="w-full rounded-lg border border-[#E5E9E2] bg-white px-3 py-2 text-sm text-[#1c241e] h-10"
          >
            <SelectValue placeholder="All records" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-[#E5E9E2] shadow-lg rounded-lg">
            <SelectItem value="all">All records</SelectItem>
            <SelectItem value="verified">{t.verification.verified}</SelectItem>
            <SelectItem value="partially_verified">{t.verification.partially_verified}</SelectItem>
            <SelectItem value="not_yet_verified">{t.verification.not_yet_verified}</SelectItem>
            <SelectItem value="needs_updating">{t.verification.needs_updating}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Interests */}
      <div className="space-y-2">
        <span className="block text-xs font-semibold text-[#26352A]">Interests</span>
        <div className="space-y-1.5">
          {INTEREST_TAGS.map((tag) => (
            <label key={tag} className="flex items-center gap-2 text-xs text-[#4B5563] cursor-pointer">
              <input
                type="checkbox"
                checked={selectedInterests.includes(tag)}
                onChange={() => toggleItem(selectedInterests, tag, setSelectedInterests)}
                className="rounded border-[#E5E9E2] text-[#406246] focus:ring-[#406246]"
              />
              <span>{tag}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Facilities */}
      <div className="space-y-2">
        <span className="block text-xs font-semibold text-[#26352A]">Facilities</span>
        <div className="space-y-1.5">
          {FACILITY_FILTERS.map((fac) => (
            <label key={fac} className="flex items-center gap-2 text-xs text-[#4B5563] cursor-pointer">
              <input
                type="checkbox"
                checked={selectedFacilities.includes(fac)}
                onChange={() => toggleItem(selectedFacilities, fac, setSelectedFacilities)}
                className="rounded border-[#E5E9E2] text-[#406246] focus:ring-[#406246]"
              />
              <span>{fac}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Heading & Search */}
      <div className="space-y-5 pb-6 border-b border-[#E5E9E2]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-normal text-[#26352A]">
              Explore Mae Sai
            </h1>
            <p className="text-base sm:text-lg text-[#6B7280] leading-[1.625] mt-1">
              Browse sample Mae Sai destinations, cafés, restaurants, homestays, transport, and visitor facilities.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-[#E5E9E2] bg-white p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#406246] text-white'
                    : 'text-[#4B5563] hover:text-[#26352A]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-[#406246] text-white'
                    : 'text-[#4B5563] hover:text-[#26352A]'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search + Sort Bar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2.5 bg-white border border-[#E5E9E2] rounded-xl px-4 py-2.5 focus-within:border-[#406246]">
            <Search className="w-4 h-4 text-[#406246] shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by place name, Thai name, subdistrict, or keyword..."
              className="w-full text-sm text-[#1c241e] placeholder-[#6B7280] focus:outline-none bg-transparent"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-[#6B7280] hover:text-[#26352A] cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E9E2] bg-white text-sm font-medium text-[#26352A] cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#406246]" />
              <span>Filters</span>
            </button>

            <label htmlFor="sort-select" className="sr-only">
              Sort listings
            </label>
            <Select
              value={sortBy}
              onValueChange={(val) => val && setSortBy(val as SortOption)}
            >
              <SelectTrigger
                id="sort-select"
                aria-label="Sort listings"
                className="rounded-xl border border-[#E5E9E2] bg-white px-3 py-2 text-sm font-medium text-[#26352A] h-10 min-w-[190px]"
              >
                <SelectValue placeholder="Sort: Recommended" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-[#E5E9E2] shadow-lg rounded-xl">
                <SelectItem value="recommended">Sort: Recommended</SelectItem>
                <SelectItem value="nearest">Sort: Nearest First</SelectItem>
                <SelectItem value="name_asc">Sort: Name (A–Z)</SelectItem>
                <SelectItem value="price_low">Sort: Lowest Estimated Price</SelectItem>
                <SelectItem value="recently_verified">Sort: Recently Checked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#406246] text-white'
                : 'bg-[#f5f0de] text-[#26352A] hover:bg-[#ebe3c8]'
            }`}
          >
            {t.common.all} ({places.length})
          </button>
          {CATEGORY_LIST.map((cat) => {
            const count = places.filter((p) => p.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#406246] text-white'
                    : 'bg-white border border-[#E5E9E2] text-[#4B5563] hover:bg-[#f5f0de] hover:text-[#26352A]'
                }`}
              >
                {t.categories[cat.id]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Layout: Left Sidebar + Grid/Map */}
      <div className="pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 bg-white rounded-xl border border-[#E5E9E2] p-5 sticky top-20">
          {SidebarContent}
        </aside>

        {/* Mobile Filters Panel */}
        {mobileFiltersOpen && (
          <div className="lg:hidden bg-white rounded-xl border border-[#E5E9E2] p-5">
            {SidebarContent}
          </div>
        )}

        {/* Results */}
        <div className="lg:col-span-9 space-y-5">
          <div className="flex items-center justify-between text-sm text-[#4B5563]">
            <span>
              Showing <strong className="font-mono-tabular text-[#26352A]">{filteredPlaces.length}</strong>{' '}
              matching sample records
            </span>
            <span className="text-xs text-[#6B7280]">
              Distances measured from {userLocation ? 'your GPS location' : 'Mae Sai Border Center'}
            </span>
          </div>

          {filteredPlaces.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E5E9E2] p-12 text-center space-y-3">
              <p className="font-display text-lg font-bold text-[#26352A]">
                No matching Mae Sai places found
              </p>
              <p className="text-sm text-[#6B7280] max-w-md mx-auto">
                Try clearing a few facility or distance filters to view more destinations in the directory.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#406246] rounded-lg hover:bg-[#26352A] cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : viewMode === 'map' ? (
            <div className="bg-white rounded-xl border border-[#E5E9E2] overflow-hidden h-[620px]">
              <MaeSaiLeafletMap
                places={filteredPlaces.map((x) => x.place)}
                onSelectPlace={(id) => onSelectPlace(id)}
                userLocation={userLocation}
                heightClass="h-full w-full"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPlaces.map(({ place, distKm }) => (
                <PlaceCard
                  key={place.placeId}
                  place={place}
                  lang={lang}
                  distanceKm={distKm}
                  isSaved={savedPlaceIds.includes(place.placeId)}
                  isInTrip={tripStopIds.includes(place.placeId)}
                  onSelectPlace={onSelectPlace}
                  onToggleSave={onToggleSave}
                  onAddToTrip={onAddToTrip}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
