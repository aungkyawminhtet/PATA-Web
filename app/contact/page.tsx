'use client';

import React from 'react';
import { useTourism } from '@/src/context/TourismContext';
import { AboutContactPage as AboutContactView } from '@/src/views/AboutContactPage';

export default function ContactPage() {
  const { places, addSubmission } = useTourism();

  return (
    <AboutContactView
      mode="contact"
      totalPlaces={places.length}
      onSubmitContact={addSubmission}
    />
  );
}
