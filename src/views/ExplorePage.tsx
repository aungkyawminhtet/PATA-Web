'use client';

import React, { useMemo, useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Map as MapIcon,
  LayoutGrid,
  X,
  Clock,
  Sparkles,
  MapPin,
  RotateCcw,
  Check,
  Navigation,
} from 'lucide-react';
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

  // Primary filters
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>(initialCategory);
  const [selectedSubdistrict, setSelectedSubdistrict] = useState<string>('all');
  const [selectedBudget, setSelectedBudget] = useState<BudgetTier | 'all'>('all');
  const [openNowOnly, setOpenNowOnly] = useState<boolean>(false);

  // Secondary filters
  const [distanceRadiusKm, setDistanceRadiusKm] = useState<number>(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [timePeriod, setTimePeriod] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [verificationFilter, setVerificationFilter] = useState<VerificationStatus | 'all'>('all');

  // UI state
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const subdistricts = useMemo(
    () => Array.from(new Set(places.map((p) => p.subdistrict))),
    [places]
  );

  const refOrigin = userLocation || { lat: MAE_SAI_CENTER.lat, lng: MAE_SAI_CENTER.lng };

  // Count active secondary filters for badge
  const secondaryFilterCount = useMemo(() => {
    let count = 0;
    if (distanceRadiusKm > 0) count++;
    if (selectedInterests.length > 0) count += selectedInterests.length;
    if (selectedFacilities.length > 0) count += selectedFacilities.length;
    if (timePeriod !== 'all') count++;
    if (verificationFilter !== 'all') count++;
    return count;
  }, [distanceRadiusKm, selectedInterests, selectedFacilities, timePeriod, verificationFilter]);

  const hasAnyFilterActive = useMemo(() => {
    return (
      query.trim() !== '' ||
      selectedCategory !== 'all' ||
      selectedSubdistrict !== 'all' ||
      selectedBudget !== 'all' ||
      openNowOnly ||
      secondaryFilterCount > 0
    );
  }, [query, selectedCategory, selectedSubdistrict, selectedBudget, openNowOnly, secondaryFilterCount]);

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
        if (selectedBudget !== 'all' && place.budgetTier !== selectedBudget) return false;
        if (openNowOnly && !isPlaceOpenNow(place)) return false;
        if (distanceRadiusKm > 0 && distKm > distanceRadiusKm) return false;
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
        if (timePeriod !== 'all' && !place.openPeriods.includes(timePeriod)) {
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
      // Recommended: verified first
      const rank = { verified: 0, partially_verified: 1, not_yet_verified: 2, needs_updating: 3 };
      return rank[a.place.verificationStatus] - rank[b.place.verificationStatus];
    });

    return list;
  }, [
    places,
    query,
    selectedCategory,
    selectedSubdistrict,
    selectedBudget,
    openNowOnly,
    distanceRadiusKm,
    verificationFilter,
    selectedInterests,
    selectedFacilities,
    timePeriod,
    sortBy,
    refOrigin.lat,
    refOrigin.lng,
  ]);

  const toggleArrayItem = (list: string[], value: string, setter: (next: string[]) => void) => {
    setter(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  };

  const resetAllFilters = () => {
    setQuery('');
    setSelectedCategory('all');
    setSelectedSubdistrict('all');
    setSelectedBudget('all');
    setOpenNowOnly(false);
    setDistanceRadiusKm(0);
    setSelectedInterests([]);
    setSelectedFacilities([]);
    setTimePeriod('all');
    setVerificationFilter('all');
  };

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#26352A]">
            Explore Mae Sai
          </h1>
          <p className="text-base sm:text-lg text-[#6B7280] mt-1.5 max-w-2xl">
            Discover verified cultural landmarks, mountain coffee viewpoints, local eateries, homestays, and community artisans.
          </p>
        </div>

        {/* View Mode Toggle: Grid vs Map */}
        <div className="inline-flex rounded-xl border border-[#E5E9E2] bg-white p-1 self-start md:self-auto shadow-sm">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[#406246] text-white shadow-xs'
                : 'text-[#4B5563] hover:text-[#26352A] hover:bg-[#fafaf8]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'map'
                ? 'bg-[#406246] text-white shadow-xs'
                : 'text-[#4B5563] hover:text-[#26352A] hover:bg-[#fafaf8]'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Main Controls Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E9E2] p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative flex items-center bg-[#fafaf8] border border-[#E5E9E2] rounded-xl px-4 py-2.5 focus-within:border-[#406246] focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-[#406246] shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, local dish, village, or keyword..."
              className="w-full ml-3 text-sm text-[#26352A] placeholder-[#9CA3AF] focus:outline-none bg-transparent"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 rounded-full text-[#9CA3AF] hover:text-[#26352A] hover:bg-[#E5E9E2] cursor-pointer transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Dropdowns: Subdistrict & Sort */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
            {/* Subdistrict Selector */}
            <Select
              value={selectedSubdistrict}
              onValueChange={(val) => val && setSelectedSubdistrict(val)}
            >
              <SelectTrigger
                aria-label="Filter by Subdistrict"
                className="rounded-xl border border-[#E5E9E2] bg-[#fafaf8] px-3.5 py-2 text-xs font-semibold text-[#26352A] h-10 min-w-[150px] hover:bg-white transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-[#406246] mr-1.5 shrink-0" />
                <SelectValue placeholder="All Areas" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-[#E5E9E2] shadow-xl rounded-xl">
                <SelectItem value="all">All Subdistricts</SelectItem>
                {subdistricts.map((sd) => (
                  <SelectItem key={sd} value={sd}>
                    {sd}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort Selector */}
            <Select
              value={sortBy}
              onValueChange={(val) => val && setSortBy(val as SortOption)}
            >
              <SelectTrigger
                aria-label="Sort listings"
                className="rounded-xl border border-[#E5E9E2] bg-[#fafaf8] px-3.5 py-2 text-xs font-semibold text-[#26352A] h-10 min-w-[170px] hover:bg-white transition-colors"
              >
                <SelectValue placeholder="Sort: Recommended" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-[#E5E9E2] shadow-xl rounded-xl">
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="nearest">Nearest First</SelectItem>
                <SelectItem value="name_asc">Name (A–Z)</SelectItem>
                <SelectItem value="price_low">Lowest Price</SelectItem>
                <SelectItem value="recently_verified">Recently Checked</SelectItem>
              </SelectContent>
            </Select>

            {/* More Filters Modal Trigger */}
            <button
              type="button"
              onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border transition-all h-10 cursor-pointer whitespace-nowrap ${
                secondaryFilterCount > 0 || filterDrawerOpen
                  ? 'bg-[#406246] text-white border-[#406246] shadow-xs'
                  : 'bg-[#fafaf8] text-[#26352A] border-[#E5E9E2] hover:bg-white hover:border-[#406246]/40'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {secondaryFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-[#406246] text-[11px] font-bold flex items-center justify-center">
                  {secondaryFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-[#E5E9E2]/60">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#406246] text-white shadow-xs'
                : 'bg-[#fafaf8] text-[#4B5563] hover:bg-[#f5f0de] hover:text-[#26352A] border border-[#E5E9E2]'
            }`}
          >
            {t.common.all} ({places.length})
          </button>
          {CATEGORY_LIST.map((cat) => {
            const count = places.filter((p) => p.categoryId === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#406246] text-white shadow-xs'
                    : 'bg-[#fafaf8] text-[#4B5563] hover:bg-[#f5f0de] hover:text-[#26352A] border border-[#E5E9E2]'
                }`}
              >
                {t.categories[cat.id]} ({count})
              </button>
            );
          })}
        </div>

        {/* Quick Pills: Budget + Open Now Toggle */}
        <div className="flex items-center justify-between gap-4 flex-wrap pt-2 border-t border-[#E5E9E2]/60 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#6B7280] font-medium mr-1">Budget:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'free', label: 'Free' },
              { id: 'low', label: 'Low (<150฿)' },
              { id: 'medium', label: 'Mid (150–500฿)' },
              { id: 'premium', label: 'High (>500฿)' },
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBudget(b.id as BudgetTier | 'all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer border ${
                  selectedBudget === b.id
                    ? 'bg-[#26352A] text-white border-[#26352A]'
                    : 'bg-white text-[#4B5563] border-[#E5E9E2] hover:bg-[#f5f0de]'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Open Now Live Toggle */}
          <button
            type="button"
            onClick={() => setOpenNowOnly(!openNowOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
              openNowOnly
                ? 'bg-[#EBF7EE] text-[#2E7D32] border-[#A5D6A7]'
                : 'bg-white text-[#4B5563] border-[#E5E9E2] hover:bg-[#fafaf8]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                openNowOnly ? 'bg-[#2E7D32] animate-pulse' : 'bg-[#9CA3AF]'
              }`}
            />
            <span>Open Now</span>
          </button>
        </div>
      </div>

      {/* 3. Expandable Secondary Filters Panel */}
      {filterDrawerOpen && (
        <div className="bg-white rounded-2xl border border-[#406246]/30 p-6 shadow-md space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E9E2]">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#406246]" />
              <h2 className="font-display text-base font-bold text-[#26352A]">
                Additional Filters
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs font-semibold text-[#406246] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset all</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(false)}
                className="p-1 rounded-lg text-[#6B7280] hover:text-[#26352A] hover:bg-[#fafaf8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Distance Radius */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#26352A]">Distance Radius</span>
                <button
                  type="button"
                  onClick={onRequestLocation}
                  className="text-[11px] font-medium text-[#406246] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Navigation className="w-3 h-3" />
                  <span>{userLocation ? 'Using GPS' : 'Use GPS'}</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { val: 0, label: 'Any' },
                  { val: 2, label: '≤ 2 km' },
                  { val: 5, label: '≤ 5 km' },
                  { val: 10, label: '≤ 10 km' },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setDistanceRadiusKm(opt.val)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer text-center ${
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

            {/* Opening Time Period */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#26352A]">Preferred Time</span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'all', label: 'Any time' },
                  { id: 'morning', label: 'Morning' },
                  { id: 'afternoon', label: 'Afternoon' },
                  { id: 'evening', label: 'Evening' },
                ].map((tp) => (
                  <button
                    key={tp.id}
                    type="button"
                    onClick={() => setTimePeriod(tp.id as typeof timePeriod)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer text-center ${
                      timePeriod === tp.id
                        ? 'bg-[#406246] text-white border-[#406246]'
                        : 'bg-white text-[#4B5563] border-[#E5E9E2] hover:bg-[#f5f0de]'
                    }`}
                  >
                    {tp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Verification Status */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#26352A]">Verification Quality</span>
              <Select
                value={verificationFilter}
                onValueChange={(val) => val && setVerificationFilter(val as VerificationStatus | 'all')}
              >
                <SelectTrigger className="w-full rounded-lg border border-[#E5E9E2] bg-white px-3 py-2 text-xs font-medium text-[#26352A] h-9">
                  <SelectValue placeholder="All records" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-[#E5E9E2] shadow-xl rounded-xl">
                  <SelectItem value="all">All records</SelectItem>
                  <SelectItem value="verified">{t.verification.verified}</SelectItem>
                  <SelectItem value="partially_verified">{t.verification.partially_verified}</SelectItem>
                  <SelectItem value="not_yet_verified">{t.verification.not_yet_verified}</SelectItem>
                  <SelectItem value="needs_updating">{t.verification.needs_updating}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Facility Pills */}
            <div className="space-y-2 lg:col-span-1">
              <span className="text-xs font-semibold text-[#26352A]">Facilities</span>
              <div className="flex flex-wrap gap-1.5">
                {FACILITY_FILTERS.slice(0, 5).map((fac) => {
                  const isChecked = selectedFacilities.includes(fac);
                  return (
                    <button
                      key={fac}
                      type="button"
                      onClick={() => toggleArrayItem(selectedFacilities, fac, setSelectedFacilities)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-[#406246] text-white border-[#406246]'
                          : 'bg-white text-[#4B5563] border-[#E5E9E2] hover:bg-[#fafaf8]'
                      }`}
                    >
                      {fac}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interests & Themes */}
          <div className="space-y-2 pt-3 border-t border-[#E5E9E2]">
            <span className="text-xs font-semibold text-[#26352A]">Themes & Interests:</span>
            <div className="flex flex-wrap gap-1.5">
              {INTEREST_TAGS.map((tag) => {
                const isChecked = selectedInterests.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleArrayItem(selectedInterests, tag, setSelectedInterests)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                      isChecked
                        ? 'bg-[#26352A] text-white border-[#26352A]'
                        : 'bg-[#fafaf8] text-[#4B5563] border-[#E5E9E2] hover:bg-[#f5f0de]'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setFilterDrawerOpen(false)}
              className="px-5 py-2 text-xs font-bold text-white bg-[#406246] hover:bg-[#26352A] rounded-xl transition-colors cursor-pointer"
            >
              Show {filteredPlaces.length} Destinations
            </button>
          </div>
        </div>
      )}

      {/* 4. Active Filters Badges & Result Summary */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[#6B7280]">
            Showing <strong className="font-mono-tabular text-[#26352A] font-bold">{filteredPlaces.length}</strong>{' '}
            {filteredPlaces.length === 1 ? 'place' : 'places'}
          </span>

          {hasAnyFilterActive && (
            <div className="flex items-center gap-1.5 flex-wrap ml-2">
              {query && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f5f0de] text-[#26352A] text-xs font-medium border border-[#E5E9E2]">
                  "{query}"
                  <button type="button" onClick={() => setQuery('')} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f5f0de] text-[#26352A] text-xs font-medium border border-[#E5E9E2]">
                  {t.categories[selectedCategory]}
                  <button type="button" onClick={() => setSelectedCategory('all')} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedSubdistrict !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f5f0de] text-[#26352A] text-xs font-medium border border-[#E5E9E2]">
                  {selectedSubdistrict}
                  <button type="button" onClick={() => setSelectedSubdistrict('all')} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedBudget !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f5f0de] text-[#26352A] text-xs font-medium border border-[#E5E9E2]">
                  Budget: {selectedBudget}
                  <button type="button" onClick={() => setSelectedBudget('all')} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {openNowOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EBF7EE] text-[#2E7D32] text-xs font-medium border border-[#A5D6A7]">
                  Open Now
                  <button type="button" onClick={() => setOpenNowOnly(false)} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {distanceRadiusKm > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f5f0de] text-[#26352A] text-xs font-medium border border-[#E5E9E2]">
                  Within {distanceRadiusKm} km
                  <button type="button" onClick={() => setDistanceRadiusKm(0)} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs font-semibold text-[#406246] hover:underline ml-1 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. Destination Presentation (Grid vs Map) */}
      {filteredPlaces.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E9E2] p-16 text-center space-y-4 max-w-xl mx-auto my-12 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#f5f0de] text-[#406246] flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="font-display text-xl font-bold text-[#26352A]">
            No matching places found
          </h2>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            We couldn't find any places in Mae Sai matching your current filter combination. Try adjusting or clearing your filters to view more destinations.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={resetAllFilters}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#406246] hover:bg-[#26352A] rounded-xl transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      ) : viewMode === 'map' ? (
        <div className="bg-white rounded-2xl border border-[#E5E9E2] overflow-hidden h-[680px] shadow-sm">
          <MaeSaiLeafletMap
            places={filteredPlaces.map((x) => x.place)}
            onSelectPlace={(id) => onSelectPlace(id)}
            userLocation={userLocation}
            heightClass="h-full w-full"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
  );
};
