'use client';

import React, { useState } from 'react';
import { Store, Sparkles, Coffee, Utensils, Bed, ArrowRight } from 'lucide-react';
import { LanguageCode, PageRoute, Place } from '../types/tourism';
import { PlaceCard } from '../components/common/PlaceCard';

interface LocalBusinessesPageProps {
  places: Place[];
  lang: LanguageCode;
  savedPlaceIds: string[];
  tripStopIds: string[];
  onSelectPlace: (placeId: string) => void;
  onToggleSave: (placeId: string) => void;
  onAddToTrip: (placeId: string) => void;
  onNavigate: (route: PageRoute) => void;
}

export const LocalBusinessesPage: React.FC<LocalBusinessesPageProps> = ({
  places,
  lang,
  savedPlaceIds,
  tripStopIds,
  onSelectPlace,
  onToggleSave,
  onAddToTrip,
  onNavigate,
}) => {
  const [segment, setSegment] = useState<'all' | 'community' | 'food_cafe' | 'stays_transport'>('all');

  const localPlaces = places.filter((p) => {
    if (p.categoryId === 'facilities') return false;
    if (segment === 'community') {
      return p.categoryId === 'local_experiences' || p.categoryId === 'shopping';
    }
    if (segment === 'food_cafe') {
      return p.categoryId === 'cafes' || p.categoryId === 'restaurants';
    }
    if (segment === 'stays_transport') {
      return p.categoryId === 'accommodation' || p.categoryId === 'transportation';
    }
    return p.categoryId !== 'attractions';
  });

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Banner */}
      <section className="bg-[#f5f0de] rounded-xl border border-[#E5E9E2] p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#406246]">
            <Store className="w-4 h-4" />
            <span>Community-Oriented Tourism &amp; Small Enterprises</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#26352A]">
            Mae Sai Local Businesses &amp; Community Experiences
          </h1>
          <p className="text-sm sm:text-base text-[#374151] leading-relaxed max-w-2xl">
            Discover independent coffee roasters, handmade mulberry saa paper artisans in Ban Pang
            Ha, local food kitchens, halal dining options, family homestays, and community
            songthaew cooperatives across Mae Sai District.
          </p>
        </div>

        <div className="lg:col-span-4 bg-white rounded-xl border border-[#E5E9E2] p-5 space-y-3">
          <h2 className="font-display text-sm font-bold text-[#26352A]">
            Are you a local business or community group?
          </h2>
          <p className="text-xs text-[#4B5563] leading-relaxed">
            This prototype showcases sample Mae Sai enterprises. Future versions will enable
            verified business submissions and community profile updates.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('contact')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#406246] hover:underline cursor-pointer"
          >
            <span>Suggest a local business record</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Segment Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Local Businesses', icon: <Store className="w-3.5 h-3.5" /> },
            {
              id: 'community',
              label: 'Handmade Crafts & Markets',
              icon: <Sparkles className="w-3.5 h-3.5" />,
            },
            {
              id: 'food_cafe',
              label: 'Local Cafés & Food',
              icon: <Coffee className="w-3.5 h-3.5" />,
            },
            {
              id: 'stays_transport',
              label: 'Homestays & Local Transport',
              icon: <Bed className="w-3.5 h-3.5" />,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSegment(tab.id as typeof segment)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                segment === tab.id
                  ? 'bg-[#406246] text-white border-[#406246]'
                  : 'bg-white text-[#26352A] border-[#E5E9E2] hover:bg-[#f5f0de]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="text-xs text-[#6B7280] font-mono-tabular">
          Showing {localPlaces.length} sample listings
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {localPlaces.map((place) => (
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
  );
};
