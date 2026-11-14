'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTourism } from '@/context/TourismContext';
import { InteractiveMapPage as InteractiveMapView } from '@/views/InteractiveMapPage';

function MapInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlaceId = searchParams.get('placeId') || null;

  const {
    places,
    lang,
    tripStops,
    addToTrip,
    userLocation,
    requestLocation,
  } = useTourism();

  const tripStopIds = tripStops.map((s) => s.placeId);

  return (
    <InteractiveMapView
      places={places}
      lang={lang}
      initialSelectedPlaceId={selectedPlaceId}
      tripStopIds={tripStopIds}
      routePreviewStopIds={tripStopIds}
      userLocation={userLocation}
      onSelectPlaceDetails={(placeId) => router.push(`/places/${placeId}`)}
      onAddToTrip={addToTrip}
      onRequestLocation={requestLocation}
      onNavigateToPlanner={() => router.push('/planner')}
    />
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#6B7280]">Loading Interactive Map...</div>}>
      <MapInner />
    </Suspense>
  );
}
