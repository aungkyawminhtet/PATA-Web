'use client';

import React from 'react';
import Link from 'next/link';
import { Bookmark, MapPin, Plus, Check } from 'lucide-react';
import { LanguageCode, Place } from '../../types/tourism';
import { TRANSLATIONS } from '../../data/translations';
import { PlaceImage } from './PlaceImage';
import { VerificationBadge } from './VerificationBadge';

interface PlaceCardProps {
  place: Place;
  lang: LanguageCode;
  isSaved: boolean;
  isInTrip: boolean;
  distanceKm?: number;
  onSelectPlace?: (placeId: string) => void;
  onToggleSave: (placeId: string) => void;
  onAddToTrip: (placeId: string) => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  lang,
  isSaved,
  isInTrip,
  distanceKm,
  onSelectPlace,
  onToggleSave,
  onAddToTrip,
}) => {
  const t = TRANSLATIONS[lang];
  const categoryLabel = t.categories[place.categoryId];

  const priceDisplay =
    place.priceMax === 0
      ? t.common.freeEntry
      : `${place.priceMin}–${place.priceMax} THB`;

  return (
    <article className="bg-white rounded-2xl border border-[#E5E9E2] overflow-hidden flex flex-col hover:shadow-lg hover:border-[#406246]/40 transition-all duration-300 group">
      {/* Image container with floating bookmark */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#E5E9E2]">
        <Link
          href={`/places/${place.placeId}`}
          onClick={() => onSelectPlace?.(place.placeId)}
          className="w-full h-full text-left cursor-pointer block"
          aria-label={`View details for ${place.name}`}
        >
          <PlaceImage
            src={place.mainImage}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-75"
          />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-medium">
            <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/95">
              {categoryLabel}
            </span>
            {distanceKm !== undefined && (
              <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md font-mono-tabular shrink-0">
                {distanceKm} km
              </span>
            )}
          </div>
        </Link>

        {/* Floating Bookmark Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(place.placeId);
          }}
          aria-label={isSaved ? t.common.savedPlace : t.common.savePlace}
          className={`absolute top-3 right-3 z-10 p-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-sm ${
            isSaved
              ? 'bg-[#406246] text-white hover:bg-[#26352A]'
              : 'bg-white/90 text-[#26352A] hover:bg-white hover:scale-105'
          }`}
          title={isSaved ? t.common.savedPlace : t.common.savePlace}
        >
          <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2">
          {/* Subdistrict & Price Range */}
          <div className="flex items-center justify-between gap-2 text-xs sm:text-sm text-[#6B7280]">
            <span className="inline-flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#406246] shrink-0" />
              <span className="truncate font-medium">{place.subdistrict}</span>
            </span>
            <span className="font-mono-tabular font-medium text-[#26352A] shrink-0">
              {priceDisplay}
            </span>
          </div>

          {/* Place Title */}
          <Link
            href={`/places/${place.placeId}`}
            onClick={() => onSelectPlace?.(place.placeId)}
            className="text-left block w-full cursor-pointer group/title"
          >
            <h3 className="font-display text-lg sm:text-xl font-normal text-[#26352A] group-hover/title:text-[#406246] transition-colors line-clamp-2 leading-snug">
              {place.name}
            </h3>
            <p className="text-xs sm:text-sm text-[#7D8C81] truncate mt-0.5">
              {lang === 'my' ? place.myanmarName : place.localName}
            </p>
          </Link>

          {/* Description */}
          <p className="text-sm sm:text-base text-[#4B5563] line-clamp-2 leading-[1.625] pt-1">
            {place.description}
          </p>
        </div>

        {/* Card Footer: Verification + Balanced Action Buttons */}
        <div className="pt-3.5 border-t border-[#E5E9E2] space-y-3">
          <div className="flex items-center justify-between gap-2 text-xs text-[#6B7280]">
            <div className="shrink-0">
              <VerificationBadge status={place.verificationStatus} lang={lang} compact />
            </div>
            <span className="font-mono-tabular shrink-0 text-[#7D8C81]">
              Checked {place.lastVerifiedAt}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href={`/places/${place.placeId}`}
              onClick={() => onSelectPlace?.(place.placeId)}
              className="w-full py-2.5 px-3 text-sm font-semibold text-white bg-[#406246] hover:bg-[#26352A] rounded-xl transition-colors text-center cursor-pointer shadow-xs whitespace-nowrap block"
            >
              {t.common.viewDetails}
            </Link>
            <button
              type="button"
              onClick={() => onAddToTrip(place.placeId)}
              className={`w-full py-2.5 px-3 text-sm font-medium rounded-xl border transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                isInTrip
                  ? 'bg-[#E5E9E2] border-[#406246] text-[#26352A] font-semibold'
                  : 'bg-white border-[#E5E9E2] text-[#26352A] hover:bg-[#f5f0de]'
              }`}
              title={t.common.addToTrip}
            >
              {isInTrip ? (
                <Check className="w-3.5 h-3.5 text-[#406246] shrink-0" />
              ) : (
                <Plus className="w-3.5 h-3.5 shrink-0" />
              )}
              <span className="truncate">{isInTrip ? 'In Trip' : t.common.addToTrip}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
