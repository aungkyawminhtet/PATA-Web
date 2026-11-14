'use client';

import React from 'react';
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
  onSelectPlace: (placeId: string) => void;
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
      : `${place.priceMin}–${place.priceMax} THB (est.)`;

  return (
    <article className="bg-white rounded-xl border border-[#E5E9E2] overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200">
      <button
        type="button"
        onClick={() => onSelectPlace(place.placeId)}
        className="relative aspect-[4/3] w-full overflow-hidden bg-[#E5E9E2] text-left cursor-pointer group"
      >
        <PlaceImage
          src={place.mainImage}
          alt={place.name}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"
        />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-medium">
          <span className="truncate">{categoryLabel}</span>
          {distanceKm !== undefined && (
            <span className="font-mono-tabular shrink-0 ml-2">{distanceKm} km</span>
          )}
        </div>
      </button>

      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-xs text-[#6B7280]">
            <span className="inline-flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#406246] shrink-0" />
              <span className="truncate">{place.subdistrict}</span>
            </span>
            <span className="font-mono-tabular shrink-0">{priceDisplay}</span>
          </div>

          <button
            type="button"
            onClick={() => onSelectPlace(place.placeId)}
            className="text-left block w-full cursor-pointer group"
          >
            <h3 className="font-display text-lg sm:text-xl font-normal text-[#26352A] group-hover:text-[#406246] transition-colors line-clamp-1">
              {place.name}
            </h3>
            <p className="text-sm text-[#6B7280] truncate">
              {lang === 'my' ? place.myanmarName : place.localName}
            </p>
          </button>

          <p className="text-base text-[#4B5563] line-clamp-2 leading-[1.625] pt-0.5">
            {place.description}
          </p>
        </div>

        <div className="pt-3 border-t border-[#E5E9E2] space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <VerificationBadge status={place.verificationStatus} lang={lang} compact />
            <span className="text-xs sm:text-sm text-[#6B7280] font-mono-tabular">
              Checked {place.lastVerifiedAt}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectPlace(place.placeId)}
              className="flex-1 px-3.5 py-2.5 text-sm sm:text-base font-semibold text-white bg-[#406246] hover:bg-[#26352A] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              {t.common.viewDetails}
            </button>
            <button
              type="button"
              onClick={() => onAddToTrip(place.placeId)}
              className={`px-3.5 py-2.5 text-sm sm:text-base font-medium rounded-lg border transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isInTrip
                  ? 'bg-[#E5E9E2] border-[#406246] text-[#26352A]'
                  : 'bg-white border-[#E5E9E2] text-[#26352A] hover:bg-[#f5f0de]'
              }`}
              title={t.common.addToTrip}
            >
              {isInTrip ? <Check className="w-3.5 h-3.5 text-[#406246]" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isInTrip ? 'In Trip' : t.common.addToTrip}</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleSave(place.placeId)}
              aria-label={isSaved ? t.common.savedPlace : t.common.savePlace}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-[#f5f0de] border-[#406246] text-[#406246]'
                  : 'bg-white border-[#E5E9E2] text-[#6B7280] hover:text-[#26352A] hover:bg-[#f5f0de]'
              }`}
            >
              <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
