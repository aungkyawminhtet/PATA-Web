'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTourism } from '@/src/context/TourismContext';
import { SuggestedRoutesPage as SuggestedRoutesView } from '@/src/views/SuggestedRoutesPage';
import { SuggestedRoute } from '@/src/types/tourism';

export default function RoutesPage() {
  const router = useRouter();
  const { places, lang, setTripStops } = useTourism();

  const handleLoadRoute = (route: SuggestedRoute) => {
    const newStops = route.stopIds.map((placeId) => {
      const p = places.find((item) => item.placeId === placeId);
      return { placeId, visitMinutes: p?.estimatedVisitMinutes || 60 };
    });
    setTripStops(newStops);
    router.push('/planner');
  };

  const handleViewRouteOnMap = (stopIds: string[]) => {
    router.push(`/map?places=${stopIds.join(',')}`);
  };

  return (
    <SuggestedRoutesView
      places={places}
      lang={lang}
      onLoadRoute={handleLoadRoute}
      onViewRouteOnMap={handleViewRouteOnMap}
      onSelectPlace={(id) => router.push(`/places/${id}`)}
    />
  );
}
