'use client';

import React from 'react';
import { X, Bookmark, Route, Trash2, ArrowRight } from 'lucide-react';
import { Place, SavedItinerary } from '../../types/tourism';
import { formatDuration, TRANSPORT_CONFIG } from '../../utils/geo';
import { PlaceImage } from './PlaceImage';

interface SavedWorkspaceDrawerProps {
  open: boolean;
  onClose: () => void;
  places: Place[];
  savedPlaceIds: string[];
  savedItineraries: SavedItinerary[];
  onSelectPlace: (placeId: string) => void;
  onRemoveSavedPlace: (placeId: string) => void;
  onLoadSavedItinerary: (itinerary: SavedItinerary) => void;
  onDeleteSavedItinerary: (itineraryId: string) => void;
}

export const SavedWorkspaceDrawer: React.FC<SavedWorkspaceDrawerProps> = ({
  open,
  onClose,
  places,
  savedPlaceIds,
  savedItineraries,
  onSelectPlace,
  onRemoveSavedPlace,
  onLoadSavedItinerary,
  onDeleteSavedItinerary,
}) => {
  if (!open) return null;

  const savedPlaces = savedPlaceIds
    .map((id) => places.find((p) => p.placeId === id))
    .filter((p): p is Place => Boolean(p));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl border-l border-[#E5E9E2] flex flex-col"
        role="dialog"
        aria-label="Saved Places and Itineraries"
      >
        <div className="p-5 border-b border-[#E5E9E2] flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-[#26352A]">
            Saved Places &amp; Itineraries
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#6B7280] hover:bg-[#f5f0de] hover:text-[#26352A] cursor-pointer"
            aria-label="Close saved drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-8">
          {/* Saved Places */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-[#26352A] inline-flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-[#406246]" />
                <span>Saved Places ({savedPlaces.length})</span>
              </h3>
            </div>

            {savedPlaces.length === 0 ? (
              <p className="text-xs text-[#6B7280] bg-[#fafaf8] p-4 rounded-lg border border-[#E5E9E2]">
                No places bookmarked yet. Click the bookmark icon on any destination to save it here.
              </p>
            ) : (
              <div className="space-y-2.5">
                {savedPlaces.map((p) => (
                  <div
                    key={p.placeId}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-[#E5E9E2] bg-[#fafaf8]"
                  >
                    <div className="w-12 h-12 rounded-md overflow-hidden shrink-0 bg-[#E5E9E2]">
                      <PlaceImage
                        src={p.mainImage}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectPlace(p.placeId);
                          onClose();
                        }}
                        className="text-xs font-bold text-[#26352A] hover:text-[#406246] truncate block text-left cursor-pointer"
                      >
                        {p.name}
                      </button>
                      <div className="text-[11px] text-[#6B7280] truncate">{p.subdistrict}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveSavedPlace(p.placeId)}
                      aria-label={`Remove ${p.name}`}
                      className="p-1.5 text-[#B84040] hover:bg-red-50 rounded cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Saved Itineraries */}
          <section className="space-y-3 pt-4 border-t border-[#E5E9E2]">
            <h3 className="font-display text-sm font-bold text-[#26352A] inline-flex items-center gap-1.5">
              <Route className="w-4 h-4 text-[#406246]" />
              <span>Saved Itineraries ({savedItineraries.length})</span>
            </h3>

            {savedItineraries.length === 0 ? (
              <p className="text-xs text-[#6B7280] bg-[#fafaf8] p-4 rounded-lg border border-[#E5E9E2]">
                No saved trip itineraries yet. Build a trip in the Trip Planner and click “Save
                Itinerary”.
              </p>
            ) : (
              <div className="space-y-3">
                {savedItineraries.map((itin) => (
                  <div
                    key={itin.itineraryId}
                    className="p-4 rounded-xl border border-[#E5E9E2] bg-[#f5f0de]/50 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-display text-sm font-bold text-[#26352A]">
                          {itin.title}
                        </h4>
                        <p className="text-[11px] text-[#6B7280]">
                          {itin.travelDate} · {itin.visitors} visitors ·{' '}
                          {TRANSPORT_CONFIG[itin.transportMode].label}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteSavedItinerary(itin.itineraryId)}
                        aria-label={`Delete ${itin.title}`}
                        className="p-1 text-[#B84040] hover:bg-red-50 rounded cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E5E9E2]">
                      <span className="font-mono-tabular text-[#26352A]">
                        {itin.stops.length} stops · {itin.estimatedDistanceKm} km ·{' '}
                        {formatDuration(itin.estimatedDurationMinutes)}
                      </span>
                      <span className="font-mono-tabular font-bold text-[#406246]">
                        ~฿{itin.estimatedTotalCost.toLocaleString()}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onLoadSavedItinerary(itin);
                        onClose();
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#406246] hover:bg-[#26352A] rounded-lg transition-colors cursor-pointer"
                    >
                      <span>Reopen in Trip Planner</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
