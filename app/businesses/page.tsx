'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTourism } from '@/src/context/TourismContext';
import { LocalBusinessesPage as LocalBusinessesView } from '@/src/views/LocalBusinessesPage';
import { PageRoute } from '@/src/types/tourism';

export default function BusinessesPage() {
  const router = useRouter();
  const {
    places,
    lang,
    savedPlaceIds,
    tripStops,
    toggleSavePlace,
    addToTrip,
  } = useTourism();

  const tripStopIds = tripStops.map((s) => s.placeId);

  const handleNavigate = (route: PageRoute) => {
    const routeMap: Record<PageRoute, string> = {
      home: '/',
      explore: '/explore',
      place_detail: '/explore',
      map: '/map',
      planner: '/planner',
      insights: '/insights',
      businesses: '/businesses',
      routes: '/routes',
      about: '/about',
      contact: '/contact',
      dataset: '/dataset',
    };
    router.push(routeMap[route] || '/');
  };

  return (
    <LocalBusinessesView
      places={places}
      lang={lang}
      savedPlaceIds={savedPlaceIds}
      tripStopIds={tripStopIds}
      onSelectPlace={(id) => router.push(`/places/${id}`)}
      onToggleSave={toggleSavePlace}
      onAddToTrip={addToTrip}
      onNavigate={handleNavigate}
    />
  );
}
