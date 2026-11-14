'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTourism } from '@/context/TourismContext';
import { TourismInsightsPage as TourismInsightsView } from '@/views/TourismInsightsPage';

export default function InsightsPage() {
  const router = useRouter();
  const { places, lang } = useTourism();

  return (
    <TourismInsightsView
      places={places}
      lang={lang}
      onSelectPlace={(id) => router.push(`/places/${id}`)}
    />
  );
}
