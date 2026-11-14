'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTourism } from '@/src/context/TourismContext';
import { DatasetAnalysisPage as DatasetAnalysisView } from '@/src/views/DatasetAnalysisPage';

export default function DatasetPage() {
  const router = useRouter();
  const { places, lang } = useTourism();

  return (
    <DatasetAnalysisView
      places={places}
      lang={lang}
      onSelectPlace={(id) => router.push(`/places/${id}`)}
      onExploreSubdistrict={() => router.push('/explore')}
    />
  );
}
