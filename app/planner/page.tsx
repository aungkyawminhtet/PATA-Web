'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTourism } from '@/src/context/TourismContext';
import { TripPlannerPage as TripPlannerView } from '@/src/views/TripPlannerPage';

export default function PlannerPage() {
  const router = useRouter();
  const {
    places,
    lang,
    tripStops,
    setTripStops,
    saveItinerary,
  } = useTourism();

  return (
    <TripPlannerView
      places={places}
      lang={lang}
      stops={tripStops}
      onChangeStops={setTripStops}
      onSaveItinerary={saveItinerary}
      onSelectPlace={(id) => router.push(`/places/${id}`)}
      onOpenRouteOnFullMap={(stopIds: string[]) => {
        router.push(`/map?places=${stopIds.join(',')}`);
      }}
    />
  );
}
