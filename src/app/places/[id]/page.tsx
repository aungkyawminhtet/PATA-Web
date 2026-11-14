import { INITIAL_PLACES } from '@/data/maeSaiPlaces';
import { PlaceDetailClient } from './PlaceDetailClient';

export function generateStaticParams() {
  return INITIAL_PLACES.map((place) => ({
    id: place.placeId,
  }));
}

export default async function PlaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PlaceDetailClient id={id} />;
}

