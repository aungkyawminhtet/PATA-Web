'use client';

import React, { useState } from 'react';
import { Clock, MapPin, Route as RouteIcon, Map as MapIcon } from 'lucide-react';
import { LanguageCode, Place, SuggestedRoute } from '../types/tourism';
import { SUGGESTED_ROUTES } from '../data/maeSaiPlaces';
import { TRANSPORT_CONFIG } from '../utils/geo';
import { PlaceImage } from '../components/common/PlaceImage';

interface SuggestedRoutesPageProps {
  places: Place[];
  lang: LanguageCode;
  onLoadRoute: (route: SuggestedRoute) => void;
  onViewRouteOnMap: (stopIds: string[]) => void;
  onSelectPlace: (placeId: string) => void;
}

export const SuggestedRoutesPage: React.FC<SuggestedRoutesPageProps> = ({
  places,
  onLoadRoute,
  onViewRouteOnMap,
  onSelectPlace,
}) => {
  const [lengthFilter, setLengthFilter] = useState<'all' | 'half_day' | 'one_day' | 'weekend'>('all');

  const filtered = SUGGESTED_ROUTES.filter(
    (r) => lengthFilter === 'all' || r.tripLengthType === lengthFilter
  );

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E5E9E2]">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#26352A]">
            Suggested Mae Sai Travel Routes
          </h1>
          <p className="text-sm sm:text-base text-[#6B7280] mt-1">
            Themed itineraries designed around real Mae Sai attractions, highland cafés, local food,
            and community tourism.
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-[#E5E9E2] bg-white p-1 self-start">
          {[
            { id: 'all', label: 'All Routes' },
            { id: 'half_day', label: 'Half-Day' },
            { id: 'one_day', label: 'One-Day' },
            { id: 'weekend', label: 'Weekend' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setLengthFilter(tab.id as typeof lengthFilter)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                lengthFilter === tab.id
                  ? 'bg-[#406246] text-white'
                  : 'text-[#4B5563] hover:text-[#26352A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {filtered.map((route) => {
          const stopObjects = route.stopIds
            .map((id) => places.find((p) => p.placeId === id))
            .filter((p): p is Place => Boolean(p));

          return (
            <article
              key={route.routeId}
              className="bg-white rounded-xl border border-[#E5E9E2] p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            >
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between text-xs text-[#406246] font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{route.durationLabel}</span>
                  </span>
                  <span className="text-[#6B7280]">
                    Suggested: {TRANSPORT_CONFIG[route.recommendedTransport].label}
                  </span>
                </div>

                <h2 className="font-display text-2xl font-bold text-[#26352A]">{route.title}</h2>
                <p className="text-sm text-[#4B5563] leading-relaxed">{route.description}</p>

                <div className="bg-[#f5f0de]/70 rounded-lg p-3.5 flex items-center justify-between text-xs">
                  <span className="text-[#4B5563] font-medium">Estimated Budget / Person</span>
                  <span className="font-mono-tabular font-bold text-[#26352A]">
                    {route.estimatedBudgetPerPerson}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => onLoadRoute(route)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#406246] hover:bg-[#26352A] rounded-lg transition-colors cursor-pointer"
                  >
                    <RouteIcon className="w-3.5 h-3.5" />
                    <span>Load into Trip Planner</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onViewRouteOnMap(route.stopIds)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#26352A] bg-[#fafaf8] hover:bg-[#f5f0de] border border-[#E5E9E2] rounded-lg transition-colors cursor-pointer"
                  >
                    <MapIcon className="w-3.5 h-3.5 text-[#406246]" />
                    <span>View Route on Map</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stopObjects.map((stop, idx) => (
                  <button
                    key={stop.placeId}
                    type="button"
                    onClick={() => onSelectPlace(stop.placeId)}
                    className="text-left bg-[#fafaf8] hover:bg-[#f5f0de]/60 border border-[#E5E9E2] rounded-xl p-3 flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-[#E5E9E2]">
                      <PlaceImage
                        src={stop.mainImage}
                        alt={stop.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-[#406246] text-white text-[10px] font-bold flex items-center justify-center font-mono-tabular">
                        {idx + 1}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#26352A] truncate">{stop.name}</div>
                      <div className="text-[11px] text-[#6B7280] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#406246] shrink-0" />
                        <span className="truncate">{stop.subdistrict}</span>
                      </div>
                      <div className="text-[11px] text-[#406246] font-mono-tabular mt-0.5">
                        ~{stop.estimatedVisitMinutes} min stop
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
