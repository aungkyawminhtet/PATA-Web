'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ContactSubmission,
  ItineraryStop,
  LanguageCode,
  Place,
  SavedItinerary,
  VisitorReview,
} from '../types/tourism';
import { INITIAL_PLACES, INITIAL_REVIEWS } from '../data/maeSaiPlaces';

const STORAGE_KEYS = {
  lang: 'maesai_lang_v1',
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

interface TourismContextType {
  places: Place[];
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  savedPlaceIds: string[];
  toggleSavePlace: (placeId: string) => void;
  savedItineraries: SavedItinerary[];
  saveItinerary: (itinerary: SavedItinerary) => void;
  deleteSavedItinerary: (id: string) => void;
  tripStops: ItineraryStop[];
  setTripStops: React.Dispatch<React.SetStateAction<ItineraryStop[]>>;
  addToTrip: (placeId: string) => void;
  removeFromTrip: (placeId: string) => void;
  reviews: VisitorReview[];
  addReview: (placeId: string, authorName: string, rating: number, comment: string) => void;
  submissions: ContactSubmission[];
  addSubmission: (sub: Omit<ContactSubmission, 'id' | 'createdAt' | 'resolved'>) => void;
  userLocation: { lat: number; lng: number } | null;
  requestLocation: () => void;
  savedDrawerOpen: boolean;
  setSavedDrawerOpen: (open: boolean) => void;
}

const TourismContext = createContext<TourismContextType | undefined>(undefined);

export const TourismProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [places] = useState<Place[]>(INITIAL_PLACES);
  const [lang, setLang] = useState<LanguageCode>('en');
  const [savedPlaceIds, setSavedPlaceIds] = useState<string[]>(DEFAULT_SAVED_PLACES);
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);
  const [tripStops, setTripStops] = useState<ItineraryStop[]>(DEFAULT_TRIP_STOPS);
  const [reviews, setReviews] = useState<VisitorReview[]>(INITIAL_REVIEWS);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [savedDrawerOpen, setSavedDrawerOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage once on client
  useEffect(() => {
    const savedLang = localStorage.getItem(STORAGE_KEYS.lang) as LanguageCode | null;
    if (savedLang === 'en' || savedLang === 'th' || savedLang === 'my') {
      setLang(savedLang);
    }
    setSavedPlaceIds(loadJson(STORAGE_KEYS.savedPlaces, DEFAULT_SAVED_PLACES));
    setSavedItineraries(loadJson(STORAGE_KEYS.savedItineraries, []));
    setTripStops(loadJson(STORAGE_KEYS.tripStops, DEFAULT_TRIP_STOPS));
    setReviews(loadJson(STORAGE_KEYS.reviews, INITIAL_REVIEWS));
    setSubmissions(loadJson(STORAGE_KEYS.submissions, []));
    setIsHydrated(true);
  }, []);

  // Persist updates
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEYS.lang, lang);
  }, [lang, isHydrated]);

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

  const toggleSavePlace = (placeId: string) => {
    setSavedPlaceIds((prev) =>
      prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [...prev, placeId]
    );
  };

  const addToTrip = (placeId: string) => {
    setTripStops((prev) => {
      if (prev.some((s) => s.placeId === placeId)) return prev;
      const p = places.find((item) => item.placeId === placeId);
      return [...prev, { placeId, visitMinutes: p?.estimatedVisitMinutes || 60 }];
    });
  };

  const removeFromTrip = (placeId: string) => {
    setTripStops((prev) => prev.filter((s) => s.placeId !== placeId));
  };

  const saveItinerary = (itinerary: SavedItinerary) => {
    setSavedItineraries((prev) => [itinerary, ...prev]);
  };

  const deleteSavedItinerary = (id: string) => {
    setSavedItineraries((prev) => prev.filter((i) => i.itineraryId !== id));
  };

  const addReview = (
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

  const addSubmission = (sub: Omit<ContactSubmission, 'id' | 'createdAt' | 'resolved'>) => {
    setSubmissions((prev) => [
      {
        ...sub,
        id: `sub-${Date.now()}`,
        createdAt: new Date().toISOString().slice(0, 10),
        resolved: false,
      },
      ...prev,
    ]);
  };

  const requestLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        // Fallback to Mae Sai Border Center
        setUserLocation({ lat: 20.4328, lng: 99.8832 });
      }
    );
  };

  return (
    <TourismContext.Provider
      value={{
        places,
        lang,
        setLang,
        savedPlaceIds,
        toggleSavePlace,
        savedItineraries,
        saveItinerary,
        deleteSavedItinerary,
        tripStops,
        setTripStops,
        addToTrip,
        removeFromTrip,
        reviews,
        addReview,
        submissions,
        addSubmission,
        userLocation,
        requestLocation,
        savedDrawerOpen,
        setSavedDrawerOpen,
      }}
    >
      {children}
    </TourismContext.Provider>
  );
};

export const useTourism = () => {
  const context = useContext(TourismContext);
  if (!context) {
    throw new Error('useTourism must be used within a TourismProvider');
  }
  return context;
};

