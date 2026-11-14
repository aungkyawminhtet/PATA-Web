'use client';

import React from 'react';
import { useTourism } from '@/context/TourismContext';
import { AboutContactPage as AboutContactView } from '@/views/AboutContactPage';

export default function AboutPage() {
  const { places, addSubmission } = useTourism();

  return (
    <AboutContactView
      mode="about"
      totalPlaces={places.length}
      onSubmitContact={addSubmission}
    />
  );
}
