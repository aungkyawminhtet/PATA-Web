'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Clock,
  ExternalLink,
  MapPin,
  Navigation,
  Phone,
  Plus,
  Check,
  ShieldCheck,
  Star,
  Info,
  Landmark,
  Coffee,
  Bed,
  Store,
  Car,
} from 'lucide-react';
import { LanguageCode, Place, VisitorReview } from '../types/tourism';
import { TRANSLATIONS } from '../data/translations';
import { haversineKm } from '../utils/geo';
import { PlaceImage } from '../components/common/PlaceImage';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { MaeSaiLeafletMap } from '../components/map/MaeSaiLeafletMap';
import { PlaceCard } from '../components/common/PlaceCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PlaceDetailPageProps {
  place: Place;
  allPlaces: Place[];
  reviews: VisitorReview[];
  lang: LanguageCode;
  isSaved: boolean;
  isInTrip: boolean;
  savedPlaceIds: string[];
  tripStopIds: string[];
  onBack: () => void;
  onSelectPlace: (placeId: string) => void;
  onToggleSave: (placeId: string) => void;
  onAddToTrip: (placeId: string) => void;
  onGetDirections: (placeId: string) => void;
  onSubmitReview: (placeId: string, authorName: string, rating: number, comment: string) => void;
}

export const PlaceDetailPage: React.FC<PlaceDetailPageProps> = ({
  place,
  allPlaces,
  reviews,
  lang,
  isSaved,
  isInTrip,
  savedPlaceIds,
  tripStopIds,
  onBack,
  onSelectPlace,
  onToggleSave,
  onAddToTrip,
  onGetDirections,
  onSubmitReview,
}) => {
  const t = TRANSLATIONS[lang];
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const photos = useMemo(() => {
    if (place.gallery.length > 0) return place.gallery;
    return [
      {
        url: place.mainImage,
        caption: place.name,
        source: place.sourceName,
      },
    ];
  }, [place]);

  const activePhoto = photos[activePhotoIndex] || photos[0];

  // Nearby places sorted by real Haversine road distance
  const nearbyPlaces = useMemo(() => {
    return allPlaces
      .filter((p) => p.placeId !== place.placeId)
      .map((p) => ({
        place: p,
        distanceKm: haversineKm(place.latitude, place.longitude, p.latitude, p.longitude),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 6);
  }, [allPlaces, place]);

  const placeReviews = reviews.filter(
    (r) => r.placeId === place.placeId && r.status === 'approved'
  );
  const avgPlatformRating =
    placeReviews.length > 0
      ? (placeReviews.reduce((s, r) => s + r.rating, 0) / placeReviews.length).toFixed(1)
      : null;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onSubmitReview(
      place.placeId,
      authorName.trim() || 'Mae Sai Visitor',
      rating,
      comment.trim()
    );
    setAuthorName('');
    setComment('');
    setRating(5);
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3500);
  };

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb & Back */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#406246] hover:text-[#26352A] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore Mae Sai</span>
        </button>

        <div className="text-xs text-[#6B7280] font-mono-tabular">
          {place.latitude.toFixed(4)}° N, {place.longitude.toFixed(4)}° E
        </div>
      </div>

      {/* Header & Photo Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Gallery */}
        <div className="lg:col-span-7 space-y-3">
          <div className="aspect-[16/10] w-full rounded-xl overflow-hidden border border-[#E5E9E2] bg-[#E5E9E2]">
            <PlaceImage
              src={activePhoto.url}
              alt={activePhoto.caption || place.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-[#6B7280] px-1">
            <span>{activePhoto.caption}</span>
            <span>Source: {activePhoto.source}</span>
          </div>

          {photos.length > 1 && (
            <div className="flex items-center gap-3 pt-1">
              {photos.map((photo, idx) => (
                <button
                  key={`${photo.url}-${idx}`}
                  type="button"
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`w-24 h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    idx === activePhotoIndex
                      ? 'border-[#406246]'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <PlaceImage
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Title, Verification, Key Facts, Actions */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E5E9E2] p-6 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 text-xs text-[#6B7280]">
              <span>
                {t.categories[place.categoryId]} · {place.subcategory}
              </span>
              <VerificationBadge status={place.verificationStatus} lang={lang} compact />
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#26352A] leading-tight">
              {place.name}
            </h1>
            <p className="text-sm text-[#4B5563]">
              {place.localName} · {place.myanmarName}
            </p>
          </div>

          <p className="text-sm sm:text-base text-[#374151] leading-relaxed">
            {place.description}
          </p>

          {/* Key Metadata Table */}
          <dl className="space-y-3 pt-4 border-t border-[#E5E9E2] text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#406246] mt-0.5 shrink-0" />
              <div>
                <dt className="text-xs font-semibold text-[#6B7280]">Location &amp; Address</dt>
                <dd className="text-[#26352A]">{place.address}</dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-[#406246] mt-0.5 shrink-0" />
              <div>
                <dt className="text-xs font-semibold text-[#6B7280]">Opening Hours</dt>
                <dd className="text-[#26352A]">
                  {place.openingHours} · Est. visit {place.estimatedVisitMinutes} min
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-[#406246] mt-0.5 shrink-0" />
              <div>
                <dt className="text-xs font-semibold text-[#6B7280]">Estimated Price Range</dt>
                <dd className="text-[#26352A] font-medium">{place.priceNote}</dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#406246] mt-0.5 shrink-0" />
              <div>
                <dt className="text-xs font-semibold text-[#6B7280]">Contact Information</dt>
                <dd className="text-[#26352A]">{place.contactInfo}</dd>
              </div>
            </div>
          </dl>

          {/* Primary Actions */}
          <div className="pt-4 border-t border-[#E5E9E2] grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => onGetDirections(place.placeId)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#406246] hover:bg-[#26352A] rounded-lg transition-colors cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{t.common.getDirections}</span>
            </button>

            <button
              type="button"
              onClick={() => onAddToTrip(place.placeId)}
              className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                isInTrip
                  ? 'bg-[#E5E9E2] border-[#406246] text-[#26352A]'
                  : 'bg-[#f5f0de] border-[#E5E9E2] text-[#26352A] hover:bg-[#ebe3c8]'
              }`}
            >
              {isInTrip ? <Check className="w-3.5 h-3.5 text-[#406246]" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isInTrip ? 'Added to Trip' : t.common.addToTrip}</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleSave(place.placeId)}
              className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-[#26352A] border-[#26352A] text-white'
                  : 'bg-white border-[#E5E9E2] text-[#26352A] hover:bg-[#f5f0de]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
              <span>{isSaved ? t.common.savedPlace : t.common.savePlace}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category-Specific Intelligence & Facilities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          {/* Historical Profile */}
          {place.historicalInfo && (
            <section className="bg-white rounded-xl border border-[#E5E9E2] p-6 space-y-5">
              <div className="flex items-center gap-2.5">
                <Landmark className="w-5 h-5 text-[#406246]" />
                <h2 className="font-display text-xl font-bold text-[#26352A]">
                  Historical &amp; Cultural Background
                </h2>
              </div>

              <div className="space-y-4 text-sm text-[#374151] leading-relaxed">
                <div>
                  <h3 className="font-semibold text-[#26352A] mb-1">Historical Context</h3>
                  <p>{place.historicalInfo.background}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-[#fafaf8] rounded-lg p-4 border border-[#E5E9E2]">
                    <h4 className="font-semibold text-[#26352A] mb-2 text-xs">
                      Cultural Significance
                    </h4>
                    <p className="text-xs text-[#4B5563] leading-relaxed">
                      {place.historicalInfo.culturalSignificance}
                    </p>
                  </div>
                  <div className="bg-[#fafaf8] rounded-lg p-4 border border-[#E5E9E2]">
                    <h4 className="font-semibold text-[#26352A] mb-2 text-xs">
                      Architecture &amp; Characteristics
                    </h4>
                    <p className="text-xs text-[#4B5563] leading-relaxed">
                      {place.historicalInfo.architecture}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-[#26352A] mb-1.5">Key Milestones</h3>
                  <ul className="list-disc pl-5 space-y-1 text-[#4B5563]">
                    {place.historicalInfo.importantEvents.map((ev) => (
                      <li key={ev}>{ev}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#f5f0de]/70 rounded-lg p-4 space-y-1.5">
                  <h3 className="font-semibold text-[#26352A] text-xs">Visitor Guidelines</h3>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-[#374151]">
                    {place.historicalInfo.visitorGuidelines.map((g) => (
                      <li key={g}>{g}</li>
                    ))}
                  </ul>
                </div>

                <div className="text-xs text-[#6B7280] pt-1">
                  <span className="font-semibold text-[#26352A]">References: </span>
                  {place.historicalInfo.references.join(' · ')}
                </div>
              </div>
            </section>
          )}

          {/* Restaurant & Café Profile */}
          {place.foodInfo && (
            <section className="bg-white rounded-xl border border-[#E5E9E2] p-6 space-y-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <Coffee className="w-5 h-5 text-[#406246]" />
                  <h2 className="font-display text-xl font-bold text-[#26352A]">
                    Menu Highlights &amp; Estimated Prices
                  </h2>
                </div>
                {place.foodInfo.halalVerified && (
                  <span className="text-xs font-semibold text-[#406246]">
                    Halal Option (Verify Certificate Onsite)
                  </span>
                )}
              </div>

              <div className="text-xs text-[#6B7280]">
                Categories: {place.foodInfo.foodCategories.join(' · ')}
              </div>

              <div>
                <h3 className="text-xs font-semibold text-[#26352A] mb-2">Popular Items</h3>
                <p className="text-sm text-[#4B5563]">{place.foodInfo.popularItems.join(' · ')}</p>
              </div>

              <div className="border-t border-[#E5E9E2] pt-4">
                <h3 className="text-xs font-semibold text-[#26352A] mb-3">
                  Sample Menu (Estimated Local Prices)
                </h3>
                <div className="divide-y divide-[#E5E9E2]">
                  {place.foodInfo.sampleMenu.map((item) => (
                    <div
                      key={item.name}
                      className="py-2.5 flex items-center justify-between gap-4 text-sm"
                    >
                      <span className="text-[#26352A]">{item.name}</span>
                      <span className="font-mono-tabular text-[#406246] font-medium shrink-0">
                        {item.priceRange}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Hotel & Accommodation Profile */}
          {place.accommodationInfo && (
            <section className="bg-white rounded-xl border border-[#E5E9E2] p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <Bed className="w-5 h-5 text-[#406246]" />
                <h2 className="font-display text-xl font-bold text-[#26352A]">
                  Accommodation &amp; Room Overview
                </h2>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-[#fafaf8] p-4 rounded-lg border border-[#E5E9E2]">
                  <dt className="text-xs font-semibold text-[#6B7280]">Available Room Types</dt>
                  <dd className="text-[#26352A] mt-1">
                    {place.accommodationInfo.roomTypes.join(', ')}
                  </dd>
                </div>
                <div className="bg-[#fafaf8] p-4 rounded-lg border border-[#E5E9E2]">
                  <dt className="text-xs font-semibold text-[#6B7280]">Estimated Nightly Rate</dt>
                  <dd className="font-mono-tabular text-[#406246] font-semibold mt-1">
                    {place.accommodationInfo.estimatedRoomRate}
                  </dd>
                </div>
                <div className="bg-[#fafaf8] p-4 rounded-lg border border-[#E5E9E2]">
                  <dt className="text-xs font-semibold text-[#6B7280]">Check-in / Check-out</dt>
                  <dd className="text-[#26352A] mt-1">{place.accommodationInfo.checkInOut}</dd>
                </div>
                <div className="bg-[#fafaf8] p-4 rounded-lg border border-[#E5E9E2]">
                  <dt className="text-xs font-semibold text-[#6B7280]">Booking Guidance</dt>
                  <dd className="text-[#4B5563] mt-1">{place.accommodationInfo.bookingNote}</dd>
                </div>
              </dl>
            </section>
          )}

          {/* Local Business & Community Profile */}
          {place.localBusinessInfo && (
            <section className="bg-white rounded-xl border border-[#E5E9E2] p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <Store className="w-5 h-5 text-[#406246]" />
                <h2 className="font-display text-xl font-bold text-[#26352A]">
                  Local Products &amp; Community Heritage
                </h2>
              </div>
              <p className="text-sm text-[#374151] leading-relaxed">
                {place.localBusinessInfo.communityBackground}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="text-xs font-semibold text-[#26352A] mb-2">
                    Products &amp; Experiences
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-[#4B5563]">
                    {place.localBusinessInfo.productsAndServices.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-[#26352A] mb-2">
                    Handmade &amp; Local Crafts
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-[#4B5563]">
                    {place.localBusinessInfo.handmadeItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* Rental Service Profile */}
          {place.rentalInfo && (
            <section className="bg-white rounded-xl border border-[#E5E9E2] p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <Car className="w-5 h-5 text-[#406246]" />
                <h2 className="font-display text-xl font-bold text-[#26352A]">
                  Rental Service Conditions &amp; Requirements
                </h2>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs font-semibold text-[#6B7280]">Vehicle Types</dt>
                  <dd className="text-[#26352A] mt-0.5">
                    {place.rentalInfo.vehicleTypes.join(' · ')}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-[#6B7280]">Estimated Rental Rate</dt>
                  <dd className="font-mono-tabular text-[#406246] font-semibold mt-0.5">
                    {place.rentalInfo.estimatedDailyRate}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-[#6B7280]">Deposit Requirement</dt>
                  <dd className="text-[#26352A] mt-0.5">{place.rentalInfo.depositRequirement}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-[#6B7280]">Driving Licence Rules</dt>
                  <dd className="text-[#26352A] mt-0.5">{place.rentalInfo.licenseRequirement}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold text-[#6B7280]">Pickup Location</dt>
                  <dd className="text-[#26352A] mt-0.5">{place.rentalInfo.pickupLocation}</dd>
                </div>
              </dl>
            </section>
          )}

          {/* Facilities & Tags */}
          <section className="bg-white rounded-xl border border-[#E5E9E2] p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-[#26352A]">
              Available Visitor Facilities
            </h2>
            {place.facilities.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-sm text-[#26352A]">
                {place.facilities.map((fac) => (
                  <div
                    key={fac}
                    className="flex items-center gap-2 bg-[#fafaf8] px-3 py-2 rounded-lg border border-[#E5E9E2]"
                  >
                    <Check className="w-4 h-4 text-[#406246] shrink-0" />
                    <span className="truncate text-xs font-medium">{fac}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#6B7280]">
                No verified facility details recorded yet.
              </p>
            )}
          </section>

          {/* Ratings & Visitor Feedback (Strictly Separated External vs Platform) */}
          <section className="bg-white rounded-xl border border-[#E5E9E2] p-6 space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-[#26352A]">
                Visitor Feedback &amp; Rating Sources
              </h2>
              <p className="text-xs text-[#6B7280] mt-1">
                External rating references are kept strictly separate from direct platform visitor notes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#fafaf8] p-4 rounded-lg border border-[#E5E9E2]">
                <div className="text-xs font-semibold text-[#6B7280]">
                  Platform Visitor Feedback
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-mono-tabular text-2xl font-bold text-[#26352A]">
                    {avgPlatformRating ? `${avgPlatformRating} / 5` : 'No ratings yet'}
                  </span>
                  <span className="text-xs text-[#6B7280]">
                    ({placeReviews.length} {placeReviews.length === 1 ? 'note' : 'notes'})
                  </span>
                </div>
              </div>

              <div className="bg-[#f5f0de]/50 p-4 rounded-lg border border-[#E5E9E2]">
                <div className="text-xs font-semibold text-[#6B7280]">
                  External Directory Reference
                </div>
                <div className="text-sm font-medium text-[#26352A] mt-1">
                  {place.externalRating?.provider || place.sourceName}
                </div>
                <div className="text-xs text-[#6B7280] mt-0.5">
                  {place.externalRating?.note ||
                    'No external numerical rating imported; sample record for prototype.'}
                </div>
              </div>
            </div>

            {/* Existing Platform Notes */}
            {placeReviews.length > 0 && (
              <div className="divide-y divide-[#E5E9E2]">
                {placeReviews.map((rev) => (
                  <div key={rev.reviewId} className="py-3 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#26352A]">{rev.authorName}</span>
                      <span className="font-mono-tabular text-[#6B7280]">{rev.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#D97706]">
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-[#374151]">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Feedback Form */}
            <form onSubmit={handleReviewSubmit} className="pt-4 border-t border-[#E5E9E2] space-y-3">
              <h3 className="text-sm font-semibold text-[#26352A]">
                Share a Visitor Observation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="rounded-lg border border-[#E5E9E2] px-3 py-2 text-sm focus:border-[#406246] focus:outline-none"
                />
                <Select
                  value={String(rating)}
                  onValueChange={(val) => val && setRating(Number(val))}
                >
                  <SelectTrigger
                    aria-label="Select rating"
                    className="rounded-lg border border-[#E5E9E2] px-3 py-2 text-sm bg-white h-10"
                  >
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-[#E5E9E2] shadow-lg rounded-lg">
                    <SelectItem value="5">5 Stars · Excellent</SelectItem>
                    <SelectItem value="4">4 Stars · Very Good</SelectItem>
                    <SelectItem value="3">3 Stars · Good</SelectItem>
                    <SelectItem value="2">2 Stars · Fair</SelectItem>
                    <SelectItem value="1">1 Star · Needs Improvement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share helpful tips on parking, road access, or opening hours..."
                required
                className="w-full rounded-lg border border-[#E5E9E2] px-3 py-2 text-sm focus:border-[#406246] focus:outline-none"
              />
              <div className="flex items-center justify-between gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#406246] hover:bg-[#26352A] rounded-lg transition-colors cursor-pointer"
                >
                  Submit Feedback
                </button>
                {reviewSubmitted && (
                  <span className="text-xs font-medium text-[#406246]">
                    Thank you! Your visitor note has been added.
                  </span>
                )}
              </div>
            </form>
          </section>
        </div>

        {/* Right Column: Interactive Mini Map + Verification Source Panel */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-[#E5E9E2] overflow-hidden">
            <div className="p-4 border-b border-[#E5E9E2] flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-[#26352A]">Location Map</h2>
              <button
                type="button"
                onClick={() => onGetDirections(place.placeId)}
                className="text-xs font-semibold text-[#406246] hover:underline cursor-pointer"
              >
                Open Route View
              </button>
            </div>
            <div className="h-[280px] w-full">
              <MaeSaiLeafletMap
                places={[place]}
                selectedPlaceId={place.placeId}
                heightClass="h-full w-full"
              />
            </div>
          </div>

          <div className="bg-[#f5f0de]/70 rounded-xl border border-[#E5E9E2] p-5 space-y-3">
            <div className="flex items-center gap-2 text-[#26352A] font-display font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-[#406246]" />
              <span>Data Source &amp; Verification</span>
            </div>
            <VerificationBadge status={place.verificationStatus} lang={lang} />
            <dl className="space-y-2 text-xs text-[#4B5563] pt-2 border-t border-[#E5E9E2]">
              <div>
                <dt className="font-semibold text-[#26352A]">Primary Source</dt>
                <dd>{place.sourceName}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#26352A]">Last Verified Date</dt>
                <dd className="font-mono-tabular">{place.lastVerifiedAt}</dd>
              </div>
              {place.sourceUrl && (
                <div>
                  <a
                    href={place.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#406246] font-semibold hover:underline pt-1"
                  >
                    <span>Visit Reference Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </dl>
          </div>
        </aside>
      </div>

      {/* Nearby Discovery */}
      <section className="pt-8 border-t border-[#E5E9E2] space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#26352A]">
            Nearby Places Around {place.name}
          </h2>
          <p className="text-sm text-[#6B7280] mt-1">
            Closest cafés, restaurants, attractions, and visitor services calculated by road-adjusted distance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nearbyPlaces.map(({ place: np, distanceKm }) => (
            <PlaceCard
              key={np.placeId}
              place={np}
              lang={lang}
              distanceKm={distanceKm}
              isSaved={savedPlaceIds.includes(np.placeId)}
              isInTrip={tripStopIds.includes(np.placeId)}
              onSelectPlace={onSelectPlace}
              onToggleSave={onToggleSave}
              onAddToTrip={onAddToTrip}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
