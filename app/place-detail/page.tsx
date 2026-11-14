'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PlaceDetailClient } from '../places/[id]/PlaceDetailClient';

function PlaceDetailQuery() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || 'ms-01';
  return <PlaceDetailClient id={id} />;
}

export default function PlaceDetailPageRoute() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#6B7280]">Loading place details...</div>}>
      <PlaceDetailQuery />
    </Suspense>
  );
}
