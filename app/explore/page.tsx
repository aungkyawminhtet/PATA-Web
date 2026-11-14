'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTourism } from '@/src/context/TourismContext';
import { ExplorePage as ExploreView } from '@/src/views/ExplorePage';
import { CategoryId } from '@/src/types/tourism';

function ExploreInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = (searchParams.get('cat') as CategoryId | 'all') || 'all';

  const {
    places,
    lang,
    savedPlaceIds,
    tripStops,
    toggleSavePlace,
    addToTrip,
    userLocation,
    requestLocation,
  } = useTourism();

  const tripStopIds = tripStops.map((s) => s.placeId);

  return (
    <ExploreView
      places={places}
      lang={lang}
      initialQuery={query}
      initialCategory={category}
      savedPlaceIds={savedPlaceIds}
      tripStopIds={tripStopIds}
      userLocation={userLocation}
      onSelectPlace={(id) => router.push(`/places/${id}`)}
      onToggleSave={toggleSavePlace}
      onAddToTrip={addToTrip}
      onRequestLocation={requestLocation}
    />
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#6B7280]">Loading Explore...</div>}>
      <ExploreInner />
    </Suspense>
  );
}
