'use client';

import React, { useEffect, useState } from 'react';
import {
  CategoryId,
  ContactSubmission,
  ItineraryStop,
  LanguageCode,
  PageRoute,
  Place,
  SavedItinerary,
  SuggestedRoute,
  VisitorReview,
} from './types/tourism';
import { INITIAL_PLACES, INITIAL_REVIEWS } from './data/maeSaiPlaces';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { SavedWorkspaceDrawer } from './components/common/SavedWorkspaceDrawer';
import { HomePage } from './views/HomePage';
import { ExplorePage } from './views/ExplorePage';
import { PlaceDetailPage } from './views/PlaceDetailPage';
import { InteractiveMapPage } from './views/InteractiveMapPage';
import { TripPlannerPage } from './views/TripPlannerPage';
import { TourismInsightsPage } from './views/TourismInsightsPage';
import { SuggestedRoutesPage } from './views/SuggestedRoutesPage';
import { LocalBusinessesPage } from './views/LocalBusinessesPage';
import { AboutContactPage } from './views/AboutContactPage';
import { DatasetAnalysisPage } from './views/DatasetAnalysisPage';

const STORAGE_KEYS = {
  savedPlaces: 'maesai_saved_places_v1',
  savedItineraries: 'maesai_saved_itineraries_v1',
  tripStops: 'maesai_trip_stops_v1',
  reviews: 'maesai_reviews_v1',
  submissions: 'maesai_submissions_v1',
};

const DEFAULT_SAVED_PLACES = ['ms-01', 'ms-06'];
const DEFAULT_TRIP_STOPS: ItineraryStop[] = [
  { placeId: 'ms-01', visitMinutes: 75 },
  { placeId: 'ms-03', visitMinutes: 80 },
  { placeId: 'ms-07', visitMinutes: 45 },
  { placeId: 'ms-04', visitMinutes: 90 },
];

function loadJson<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined') return fallback;
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App({ initialRoute = 'home' }: { initialRoute?: PageRoute } = {}) {
  const [route, setRoute] = useState<PageRoute>(initialRoute);
  const [lang, setLang] = useState<LanguageCode>('en');

  const [places] = useState<Place[]>(INITIAL_PLACES);
  const [savedPlaceIds, setSavedPlaceIds] = useState<string[]>(DEFAULT_SAVED_PLACES);
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);
  const [tripStops, setTripStops] = useState<ItineraryStop[]>(DEFAULT_TRIP_STOPS);
  const [reviews, setReviews] = useState<VisitorReview[]>(INITIAL_REVIEWS);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Sync state from client localStorage after initial hydration
  useEffect(() => {
    setSavedPlaceIds(loadJson(STORAGE_KEYS.savedPlaces, DEFAULT_SAVED_PLACES));
    setSavedItineraries(loadJson(STORAGE_KEYS.savedItineraries, []));
    setTripStops(loadJson(STORAGE_KEYS.tripStops, DEFAULT_TRIP_STOPS));
    setReviews(loadJson(STORAGE_KEYS.reviews, INITIAL_REVIEWS));
    setSubmissions(loadJson(STORAGE_KEYS.submissions, []));
    setIsHydrated(true);
  }, []);

  // Contextual navigation states
  const [exploreQuery, setExploreQuery] = useState('');
  const [exploreCategory, setExploreCategory] = useState<CategoryId | 'all'>('all');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('ms-01');
  const [mapFocusPlaceId, setMapFocusPlaceId] = useState<string | null>(null);
  const [mapRouteStopIds, setMapRouteStopIds] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [savedDrawerOpen, setSavedDrawerOpen] = useState(false);

  // Persist visitor state to localStorage only after client-side hydration
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEYS.savedPlaces, JSON.stringify(savedPlaceIds));
  }, [savedPlaceIds, isHydrated]);
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEYS.savedItineraries, JSON.stringify(savedItineraries));
  }, [savedItineraries, isHydrated]);
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEYS.tripStops, JSON.stringify(tripStops));
  }, [tripStops, isHydrated]);
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(reviews));
  }, [reviews, isHydrated]);
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEYS.submissions, JSON.stringify(submissions));
  }, [submissions, isHydrated]);

  const navigateTo = (nextRoute: PageRoute) => {
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchExplore = (query: string, category?: CategoryId) => {
    setExploreQuery(query);
    setExploreCategory(category || 'all');
    navigateTo('explore');
  };

  const handleSelectPlace = (placeId: string) => {
    setSelectedPlaceId(placeId);
    navigateTo('place_detail');
  };

  const handleToggleSavePlace = (placeId: string) => {
    setSavedPlaceIds((prev) =>
      prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [...prev, placeId]
    );
  };

  const handleAddToTrip = (placeId: string) => {
    setTripStops((prev) => {
      if (prev.some((s) => s.placeId === placeId)) return prev;
      const p = places.find((item) => item.placeId === placeId);
      return [...prev, { placeId, visitMinutes: p?.estimatedVisitMinutes || 60 }];
    });
  };

  const handleGetDirections = (placeId: string) => {
    setMapFocusPlaceId(placeId);
    setMapRouteStopIds([placeId]);
    navigateTo('map');
  };

  const handleLoadSuggestedRoute = (suggested: SuggestedRoute) => {
    setTripStops(
      suggested.stopIds.map((id) => {
        const p = places.find((item) => item.placeId === id);
        return { placeId: id, visitMinutes: p?.estimatedVisitMinutes || 60 };
      })
    );
    navigateTo('planner');
  };

  const handleViewRouteOnMap = (stopIds: string[]) => {
    setMapRouteStopIds(stopIds);
    setMapFocusPlaceId(stopIds[0] || null);
    navigateTo('map');
  };

  const handleRequestLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        // Fallback gently to Mae Sai Border Center if user declines permission
        setUserLocation({ lat: 20.4328, lng: 99.8832 });
      }
    );
  };

  const handleSubmitReview = (
    placeId: string,
    authorName: string,
    rating: number,
    comment: string
  ) => {
    const newRev: VisitorReview = {
      reviewId: `rev-${Date.now()}`,
      placeId,
      authorName,
      rating,
      comment,
      createdAt: new Date().toISOString().slice(0, 10),
      status: 'approved',
    };
    setReviews((prev) => [newRev, ...prev]);
  };

  const handleSaveItinerary = (itinerary: SavedItinerary) => {
    setSavedItineraries((prev) => [itinerary, ...prev]);
  };

  const handleLoadSavedItinerary = (itinerary: SavedItinerary) => {
    setTripStops(itinerary.stops);
    navigateTo('planner');
  };

  const activePlace = places.find((p) => p.placeId === selectedPlaceId) || places[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf8] text-[#1c241e]">
      <Header
        activeRoute={route}
        onNavigate={navigateTo}
        lang={lang}
        onChangeLang={setLang}
        savedCount={savedPlaceIds.length + savedItineraries.length}
        tripStopsCount={tripStops.length}
        onOpenSaved={() => setSavedDrawerOpen(true)}
      />

      <main className="flex-1">
        {route === 'home' && (
          <HomePage
            places={places}
            lang={lang}
            savedPlaceIds={savedPlaceIds}
            tripStopIds={tripStops.map((s) => s.placeId)}
            onSearchExplore={handleSearchExplore}
            onSelectPlace={handleSelectPlace}
            onToggleSave={handleToggleSavePlace}
            onAddToTrip={handleAddToTrip}
            onNavigate={navigateTo}
            onLoadSuggestedRoute={handleLoadSuggestedRoute}
          />
        )}

        {route === 'explore' && (
          <ExplorePage
            key={`${exploreQuery}-${exploreCategory}`}
            places={places}
            lang={lang}
            initialQuery={exploreQuery}
            initialCategory={exploreCategory}
            savedPlaceIds={savedPlaceIds}
            tripStopIds={tripStops.map((s) => s.placeId)}
            userLocation={userLocation}
            onSelectPlace={handleSelectPlace}
            onToggleSave={handleToggleSavePlace}
            onAddToTrip={handleAddToTrip}
            onRequestLocation={handleRequestLocation}
          />
        )}

        {route === 'place_detail' && activePlace && (
          <PlaceDetailPage
            place={activePlace}
            allPlaces={places}
            reviews={reviews}
            lang={lang}
            isSaved={savedPlaceIds.includes(activePlace.placeId)}
            isInTrip={tripStops.some((s) => s.placeId === activePlace.placeId)}
            savedPlaceIds={savedPlaceIds}
            tripStopIds={tripStops.map((s) => s.placeId)}
            onBack={() => navigateTo('explore')}
            onSelectPlace={handleSelectPlace}
            onToggleSave={handleToggleSavePlace}
            onAddToTrip={handleAddToTrip}
            onGetDirections={handleGetDirections}
            onSubmitReview={handleSubmitReview}
          />
        )}

        {route === 'map' && (
          <InteractiveMapPage
            places={places}
            lang={lang}
            initialSelectedPlaceId={mapFocusPlaceId}
            tripStopIds={tripStops.map((s) => s.placeId)}
            routePreviewStopIds={mapRouteStopIds}
            userLocation={userLocation}
            onSelectPlaceDetails={handleSelectPlace}
            onAddToTrip={handleAddToTrip}
            onRequestLocation={handleRequestLocation}
            onNavigateToPlanner={() => navigateTo('planner')}
          />
        )}

        {route === 'planner' && (
          <TripPlannerPage
            places={places}
            lang={lang}
            stops={tripStops}
            onChangeStops={setTripStops}
            onSaveItinerary={handleSaveItinerary}
            onSelectPlace={handleSelectPlace}
            onOpenRouteOnFullMap={handleViewRouteOnMap}
          />
        )}

        {route === 'insights' && (
          <TourismInsightsPage
            places={places}
            lang={lang}
            onSelectPlace={handleSelectPlace}
          />
        )}

        {route === 'routes' && (
          <SuggestedRoutesPage
            places={places}
            lang={lang}
            onLoadRoute={handleLoadSuggestedRoute}
            onViewRouteOnMap={handleViewRouteOnMap}
            onSelectPlace={handleSelectPlace}
          />
        )}

        {route === 'businesses' && (
          <LocalBusinessesPage
            places={places}
            lang={lang}
            savedPlaceIds={savedPlaceIds}
            tripStopIds={tripStops.map((s) => s.placeId)}
            onSelectPlace={handleSelectPlace}
            onToggleSave={handleToggleSavePlace}
            onAddToTrip={handleAddToTrip}
            onNavigate={navigateTo}
          />
        )}

        {(route === 'about' || route === 'contact') && (
          <AboutContactPage
            mode={route}
            totalPlaces={places.length}
            onSubmitContact={(sub) =>
              setSubmissions((prev) => [
                {
                  ...sub,
                  id: `sub-${Date.now()}`,
                  createdAt: new Date().toISOString().slice(0, 10),
                  resolved: false,
                },
                ...prev,
              ])
            }
          />
        )}

        {route === 'dataset' && (
          <DatasetAnalysisPage
            places={places}
            lang={lang}
            onSelectPlace={handleSelectPlace}
            onExploreSubdistrict={() => navigateTo('explore')}
          />
        )}
      </main>

      {route !== 'map' && (
        <Footer
          lang={lang}
          onNavigate={navigateTo}
          totalPlaces={places.length}
          onChangeLang={setLang}
        />
      )}

      <SavedWorkspaceDrawer
        open={savedDrawerOpen}
        onClose={() => setSavedDrawerOpen(false)}
        places={places}
        savedPlaceIds={savedPlaceIds}
        savedItineraries={savedItineraries}
        onSelectPlace={handleSelectPlace}
        onRemoveSavedPlace={handleToggleSavePlace}
        onLoadSavedItinerary={handleLoadSavedItinerary}
        onDeleteSavedItinerary={(id) =>
          setSavedItineraries((prev) => prev.filter((i) => i.itineraryId !== id))
        }
      />
    </div>
  );
}
