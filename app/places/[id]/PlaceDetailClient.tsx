'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTourism } from '@/src/context/TourismContext';
import { PlaceDetailPage as PlaceDetailView } from '@/src/views/PlaceDetailPage';

export function PlaceDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const {
    places,
    reviews,
    lang,
    savedPlaceIds,
    tripStops,
    toggleSavePlace,
    addToTrip,
    addReview,
  } = useTourism();

  const place = places.find((p) => p.placeId === id);

  if (!place) {
    return (
      <div className="max-w-[1360px] mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-display font-bold text-[#26352A]">Place Not Found</h2>
        <p className="text-sm text-[#6B7280] mt-2">
          Could not find destination with ID: &quot;{id}&quot;.
        </p>
        <Link
          href="/explore"
          className="inline-block mt-6 px-4 py-2 bg-[#406246] hover:bg-[#26352A] text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Back to Explore
        </Link>
      </div>
    );
  }

  const isSaved = savedPlaceIds.includes(place.placeId);
  const isInTrip = tripStops.some((s) => s.placeId === place.placeId);
  const tripStopIds = tripStops.map((s) => s.placeId);

  const handleGetDirections = (placeId: string) => {
    const target = places.find((p) => p.placeId === placeId) || place;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${target.latitude},${target.longitude}`,
      '_blank'
    );
  };

  return (
    <PlaceDetailView
      place={place}
      allPlaces={places}
      reviews={reviews}
      lang={lang}
      isSaved={isSaved}
      isInTrip={isInTrip}
      savedPlaceIds={savedPlaceIds}
      tripStopIds={tripStopIds}
      onBack={() => router.back()}
      onSelectPlace={(placeId) => router.push(`/places/${placeId}`)}
      onToggleSave={toggleSavePlace}
      onAddToTrip={addToTrip}
      onGetDirections={handleGetDirections}
      onSubmitReview={addReview}
    />
  );
}
