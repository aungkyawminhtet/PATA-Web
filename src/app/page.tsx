'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTourism } from '@/context/TourismContext';
import { HomePage as HomeView } from '@/views/HomePage';
import { CategoryId, PageRoute, SuggestedRoute } from '@/types/tourism';

export default function HomePage() {
  const router = useRouter();
  const {
    places,
    lang,
    savedPlaceIds,
    tripStops,
    toggleSavePlace,
    addToTrip,
    setTripStops,
  } = useTourism();

  const tripStopIds = tripStops.map((s) => s.placeId);

  const handleSearchExplore = (query: string, category?: CategoryId) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('cat', category);
    const queryString = params.toString();
    router.push(queryString ? `/explore?${queryString}` : '/explore');
  };

  const handleSelectPlace = (placeId: string) => {
    router.push(`/places/${placeId}`);
  };

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

  const handleLoadSuggestedRoute = (route: SuggestedRoute) => {
    const newStops = route.stopIds.map((placeId) => {
      const p = places.find((item) => item.placeId === placeId);
      return { placeId, visitMinutes: p?.estimatedVisitMinutes || 60 };
    });
    setTripStops(newStops);
    router.push('/planner');
  };

  return (
    <HomeView
      places={places}
      lang={lang}
      savedPlaceIds={savedPlaceIds}
      tripStopIds={tripStopIds}
      onSearchExplore={handleSearchExplore}
      onSelectPlace={handleSelectPlace}
      onToggleSave={toggleSavePlace}
      onAddToTrip={addToTrip}
      onNavigate={handleNavigate}
      onLoadSuggestedRoute={handleLoadSuggestedRoute}
    />
  );
}
