'use client';

import React, { useState } from 'react';
import {
  Search,
  Compass,
  Coffee,
  Utensils,
  Bed,
  Sparkles,
  ShoppingBag,
  Bike,
  Stethoscope,
  Map as MapIcon,
  ArrowRight,
  Route,
  Clock,
} from 'lucide-react';
import {
  CategoryId,
  LanguageCode,
  PageRoute,
  Place,
  SuggestedRoute,
} from '../types/tourism';
import { MAE_SAI_IMAGES } from '../data/assets';
import { CATEGORY_LIST, SUGGESTED_ROUTES } from '../data/maeSaiPlaces';
import { TRANSLATIONS } from '../data/translations';
import { PlaceCard } from '../components/common/PlaceCard';
import { PlaceImage } from '../components/common/PlaceImage';
import { MaeSaiLeafletMap } from '../components/map/MaeSaiLeafletMap';

interface HomePageProps {
  places: Place[];
  lang: LanguageCode;
  savedPlaceIds: string[];
  tripStopIds: string[];
  onSearchExplore: (query: string, category?: CategoryId) => void;
  onSelectPlace: (placeId: string) => void;
  onToggleSave: (placeId: string) => void;
  onAddToTrip: (placeId: string) => void;
  onNavigate: (route: PageRoute) => void;
  onLoadSuggestedRoute: (route: SuggestedRoute) => void;
}

const CATEGORY_ICONS: Record<CategoryId, React.ReactNode> = {
  attractions: <Compass className="w-5 h-5 text-[#406246]" />,
  cafes: <Coffee className="w-5 h-5 text-[#406246]" />,
  restaurants: <Utensils className="w-5 h-5 text-[#406246]" />,
  accommodation: <Bed className="w-5 h-5 text-[#406246]" />,
  local_experiences: <Sparkles className="w-5 h-5 text-[#406246]" />,
  shopping: <ShoppingBag className="w-5 h-5 text-[#406246]" />,
  transportation: <Bike className="w-5 h-5 text-[#406246]" />,
  facilities: <Stethoscope className="w-5 h-5 text-[#406246]" />,
};

export const HomePage: React.FC<HomePageProps> = ({
  places,
  lang,
  savedPlaceIds,
  tripStopIds,
  onSearchExplore,
  onSelectPlace,
  onToggleSave,
  onAddToTrip,
  onNavigate,
  onLoadSuggestedRoute,
}) => {
  const [heroQuery, setHeroQuery] = useState('');
  const [previewSelectedId, setPreviewSelectedId] = useState<string | null>('ms-01');
  const t = TRANSLATIONS[lang];

  const popularPlaces = places.filter((p) =>
    ['ms-01', 'ms-02', 'ms-04', 'ms-03', 'ms-05', 'ms-06'].includes(p.placeId)
  );

  const featuredCafesAndFood = places
    .filter((p) => p.categoryId === 'cafes' || p.categoryId === 'restaurants')
    .slice(0, 6);

  const communityAndLocal = places.filter(
    (p) =>
      p.categoryId === 'local_experiences' ||
      p.categoryId === 'shopping' ||
      p.placeId === 'ms-20' ||
      p.placeId === 'ms-17'
  );

  const verifiedCount = places.filter((p) => p.verificationStatus === 'verified').length;
  const subdistrictsCount = new Set(places.map((p) => p.subdistrict)).size;
  const previewPlace = places.find((p) => p.placeId === previewSelectedId) || places[0];

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchExplore(heroQuery.trim());
  };

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="relative w-full min-h-[540px] lg:min-h-[600px] flex items-center overflow-hidden bg-[#26352A]">
        <PlaceImage
          src={MAE_SAI_IMAGES.heroMountains}
          alt="Misty mountains of Doi Pha Mee and terraced highlands in Mae Sai, Chiang Rai"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#17211a]/90 via-[#1d2a21]/75 to-[#1d2a21]/40"
        />

        <div className="relative z-10 max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl space-y-6">
            <p className="text-xs sm:text-sm font-semibold text-[#f5f0de] tracking-wider uppercase">
              {t.hero.kicker}
            </p>
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-[1.12]">
              {t.hero.headline}
            </h1>
            <p className="text-base sm:text-lg text-[#E5E9E2] leading-[1.625]">
              {t.hero.subheadline}
            </p>

            {/* Large Search Bar */}
            <form
              onSubmit={handleHeroSubmit}
              className="bg-white p-2 rounded-xl shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl"
            >
              <div className="flex items-center gap-2.5 flex-1 px-3 py-2">
                <Search className="w-5 h-5 text-[#406246] shrink-0" />
                <input
                  type="text"
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  placeholder={t.hero.searchPlaceholder}
                  aria-label={t.hero.searchPlaceholder}
                  className="w-full text-base text-[#1c241e] placeholder-[#6B7280] focus:outline-none bg-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 text-base font-semibold text-white bg-[#406246] hover:bg-[#26352A] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t.hero.ctaPrimary}
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('planner')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#f5f0de] hover:text-white transition-colors cursor-pointer"
              >
                <span>{t.hero.ctaSecondary}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-white/30" aria-hidden="true">
                |
              </span>
              <button
                type="button"
                onClick={() => onNavigate('map')}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#E5E9E2] hover:text-white transition-colors cursor-pointer"
              >
                <MapIcon className="w-4 h-4" />
                <span>{t.nav.map}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Dataset Transparency Summary Strip (derived strictly from actual platform records) */}
      <section className="bg-[#f5f0de] border-b border-[#E5E9E2]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <div className="font-mono-tabular text-2xl font-bold text-[#26352A]">
              {places.length}
            </div>
            <div className="text-xs sm:text-sm text-[#4B5563]">
              Sample Mae Sai places listed
            </div>
          </div>
          <div>
            <div className="font-mono-tabular text-2xl font-bold text-[#406246]">
              {verifiedCount}
            </div>
            <div className="text-xs sm:text-sm text-[#4B5563]">
              Verified prototype records
            </div>
          </div>
          <div>
            <div className="font-mono-tabular text-2xl font-bold text-[#26352A]">
              {subdistrictsCount}
            </div>
            <div className="text-xs sm:text-sm text-[#4B5563]">
              Mae Sai subdistricts covered
            </div>
          </div>
          <div>
            <div className="font-mono-tabular text-2xl font-bold text-[#26352A]">
              {SUGGESTED_ROUTES.length}
            </div>
            <div className="text-xs sm:text-sm text-[#4B5563]">
              Themed routes with cost estimates
            </div>
          </div>
        </div>
      </section>

      {/* 2. Tourism Categories */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-normal text-[#26352A]">
              {t.sections.categoriesTitle}
            </h2>
            <p className="text-base text-[#6B7280] leading-[1.625] mt-1">
              {t.sections.categoriesSub}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSearchExplore('')}
            className="inline-flex items-center gap-1.5 text-base font-semibold text-[#406246] hover:text-[#26352A] cursor-pointer whitespace-nowrap"
          >
            <span>Browse full directory</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORY_LIST.map((cat) => {
            const count = places.filter((p) => p.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSearchExplore('', cat.id)}
                className="text-left bg-white p-5 rounded-xl border border-[#E5E9E2] hover:border-[#406246] hover:shadow-sm transition-all cursor-pointer flex items-start gap-4 group"
              >
                <div className="w-11 h-11 rounded-lg bg-[#E5E9E2]/70 flex items-center justify-center shrink-0 group-hover:bg-[#f5f0de] transition-colors">
                  {CATEGORY_ICONS[cat.id]}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-base font-normal text-[#26352A] group-hover:text-[#406246] truncate">
                      {t.categories[cat.id]}
                    </h3>
                  </div>
                  <p className="text-sm text-[#6B7280] mt-1 line-clamp-2 leading-relaxed">{cat.shortDesc}</p>
                  <p className="text-sm font-mono-tabular font-medium text-[#406246] mt-2">
                    {count} {count === 1 ? 'listing' : 'listings'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Popular Destinations */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-normal text-[#26352A]">
              {t.sections.popularDestinations}
            </h2>
            <p className="text-base text-[#6B7280] leading-[1.625] mt-1">
              {t.sections.popularSub}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSearchExplore('', 'attractions')}
            className="inline-flex items-center gap-1.5 text-base font-semibold text-[#406246] hover:text-[#26352A] cursor-pointer whitespace-nowrap"
          >
            <span>All attractions</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularPlaces.map((place) => (
            <PlaceCard
              key={place.placeId}
              place={place}
              lang={lang}
              isSaved={savedPlaceIds.includes(place.placeId)}
              isInTrip={tripStopIds.includes(place.placeId)}
              onSelectPlace={onSelectPlace}
              onToggleSave={onToggleSave}
              onAddToTrip={onAddToTrip}
            />
          ))}
        </div>
      </section>

      {/* 4. Featured Coffee Shops & Restaurants */}
      <section className="bg-white border-y border-[#E5E9E2] py-16">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-normal text-[#26352A]">
                {t.sections.featuredFoodCafe}
              </h2>
              <p className="text-base text-[#6B7280] leading-[1.625] mt-1">
                {t.sections.featuredFoodCafeSub}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSearchExplore('', 'cafes')}
              className="inline-flex items-center gap-1.5 text-base font-semibold text-[#406246] hover:text-[#26352A] cursor-pointer whitespace-nowrap"
            >
              <span>Explore cafés &amp; dining</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCafesAndFood.map((place) => (
              <PlaceCard
                key={place.placeId}
                place={place}
                lang={lang}
                isSaved={savedPlaceIds.includes(place.placeId)}
                isInTrip={tripStopIds.includes(place.placeId)}
                onSelectPlace={onSelectPlace}
                onToggleSave={onToggleSave}
                onAddToTrip={onAddToTrip}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Discover Local Businesses & Community Experiences */}
      <section className="bg-[#f5f0de]/65 border-b border-[#E5E9E2] py-16">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-normal text-[#26352A]">
                {t.sections.localBusinessesTitle}
              </h2>
              <p className="text-base text-[#6B7280] leading-[1.625] mt-1">
                {t.sections.localBusinessesSub}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('businesses')}
              className="inline-flex items-center gap-1.5 text-base font-semibold text-[#406246] hover:text-[#26352A] cursor-pointer whitespace-nowrap"
            >
              <span>Visit Local Business Directory</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communityAndLocal.slice(0, 3).map((place) => (
              <PlaceCard
                key={place.placeId}
                place={place}
                lang={lang}
                isSaved={savedPlaceIds.includes(place.placeId)}
                isInTrip={tripStopIds.includes(place.placeId)}
                onSelectPlace={onSelectPlace}
                onToggleSave={onToggleSave}
                onAddToTrip={onAddToTrip}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Interactive Tourism Map Preview */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-5 flex flex-col justify-between bg-white rounded-xl border border-[#E5E9E2] p-6 sm:p-8">
            <div className="space-y-4">
              <h2 className="font-display text-2xl sm:text-3xl font-normal text-[#26352A]">
                {t.sections.mapPreviewTitle}
              </h2>
              <p className="text-base text-[#4B5563] leading-[1.625]">
                {t.sections.mapPreviewSub}
              </p>

              {previewPlace && (
                <div className="pt-4 border-t border-[#E5E9E2] space-y-3">
                  <div className="text-sm font-semibold text-[#406246]">
                    Selected Map Marker
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0 bg-[#E5E9E2]">
                      <PlaceImage
                        src={previewPlace.mainImage}
                        alt={previewPlace.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-normal text-[#26352A] text-base truncate">
                        {previewPlace.name}
                      </h3>
                      <p className="text-sm text-[#6B7280] mt-0.5">
                        {t.categories[previewPlace.categoryId]} · {previewPlace.subdistrict}
                      </p>
                      <button
                        type="button"
                        onClick={() => onSelectPlace(previewPlace.placeId)}
                        className="text-sm font-semibold text-[#406246] hover:underline mt-1.5 cursor-pointer"
                      >
                        {t.common.viewDetails} →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('map')}
                className="px-5 py-2.5 text-base font-semibold text-white bg-[#406246] hover:bg-[#26352A] rounded-lg transition-colors cursor-pointer"
              >
                {t.common.openMap}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('insights')}
                className="px-5 py-2.5 text-base font-semibold text-[#26352A] bg-[#f5f0de] hover:bg-[#ebe3c8] rounded-lg transition-colors cursor-pointer"
              >
                {t.nav.insights}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-xl overflow-hidden border border-[#E5E9E2] min-h-[380px] bg-[#E5E9E2]">
            <MaeSaiLeafletMap
              places={places}
              selectedPlaceId={previewSelectedId}
              onSelectPlace={(id) => setPreviewSelectedId(id)}
              heightClass="h-[380px] lg:h-full w-full"
            />
          </div>
        </div>
      </section>

      {/* 7. Suggested Travel Routes */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-normal text-[#26352A]">
              {t.sections.suggestedRoutesTitle}
            </h2>
            <p className="text-base text-[#6B7280] leading-[1.625] mt-1">
              {t.sections.suggestedRoutesSub}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('routes')}
            className="inline-flex items-center gap-1.5 text-base font-semibold text-[#406246] hover:text-[#26352A] cursor-pointer whitespace-nowrap"
          >
            <span>All suggested routes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUGGESTED_ROUTES.slice(0, 3).map((route) => {
            const stopNames = route.stopIds
              .map((id) => places.find((p) => p.placeId === id)?.name)
              .filter(Boolean);
            return (
              <div
                key={route.routeId}
                className="bg-white rounded-xl border border-[#E5E9E2] p-6 flex flex-col justify-between gap-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#406246] font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{route.durationLabel}</span>
                    </span>
                    <span className="font-mono-tabular text-[#6B7280]">
                      {route.stopIds.length} stops
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#26352A]">
                    {route.title}
                  </h3>
                  <p className="text-sm text-[#4B5563] leading-relaxed">
                    {route.description}
                  </p>
                  <div className="text-xs text-[#6B7280] pt-1">
                    <span className="font-semibold text-[#26352A]">Route stops: </span>
                    {stopNames.join(' → ')}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E5E9E2] flex items-center justify-between gap-3">
                  <span className="text-xs font-mono-tabular text-[#26352A] font-medium">
                    {route.estimatedBudgetPerPerson}
                  </span>
                  <button
                    type="button"
                    onClick={() => onLoadSuggestedRoute(route)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#406246] hover:bg-[#26352A] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Route className="w-3.5 h-3.5" />
                    <span>Load in Planner</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
