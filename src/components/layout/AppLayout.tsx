'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TourismProvider, useTourism } from '../../context/TourismContext';
import { Header } from '../common/Header';
import { Footer } from '../common/Footer';
import { SavedWorkspaceDrawer } from '../common/SavedWorkspaceDrawer';
import { SavedItinerary } from '../../types/tourism';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const {
    places,
    savedPlaceIds,
    savedItineraries,
    toggleSavePlace,
    deleteSavedItinerary,
    setTripStops,
    savedDrawerOpen,
    setSavedDrawerOpen,
  } = useTourism();

  const handleSelectPlace = (placeId: string) => {
    setSavedDrawerOpen(false);
    router.push(`/places/${placeId}`);
  };

  const handleLoadSavedItinerary = (itinerary: SavedItinerary) => {
    setTripStops(itinerary.stops);
    setSavedDrawerOpen(false);
    router.push('/planner');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf8] text-[#26352A]">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <SavedWorkspaceDrawer
        open={savedDrawerOpen}
        onClose={() => setSavedDrawerOpen(false)}
        places={places}
        savedPlaceIds={savedPlaceIds}
        savedItineraries={savedItineraries}
        onSelectPlace={handleSelectPlace}
        onRemoveSavedPlace={toggleSavePlace}
        onLoadSavedItinerary={handleLoadSavedItinerary}
        onDeleteSavedItinerary={deleteSavedItinerary}
      />
    </div>
  );
}

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <TourismProvider>
      <LayoutContent>{children}</LayoutContent>
    </TourismProvider>
  );
};

