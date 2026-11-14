export type LanguageCode = 'en' | 'th' | 'my';

export type CategoryId =
  | 'attractions'
  | 'cafes'
  | 'restaurants'
  | 'accommodation'
  | 'local_experiences'
  | 'shopping'
  | 'transportation'
  | 'facilities';

export type VerificationStatus =
  | 'verified'
  | 'partially_verified'
  | 'not_yet_verified'
  | 'needs_updating';

export type BudgetTier = 'free' | 'low' | 'medium' | 'premium';

export type TransportMode =
  | 'walking'
  | 'bicycle'
  | 'motorcycle'
  | 'private_car'
  | 'rental_car'
  | 'local_taxi'
  | 'community_transport'
  | 'tour_guide';

export type PageRoute =
  | 'home'
  | 'explore'
  | 'place_detail'
  | 'map'
  | 'planner'
  | 'insights'
  | 'businesses'
  | 'routes'
  | 'about'
  | 'contact'
  | 'dataset';

export interface PlaceMenuOrItem {
  name: string;
  priceRange: string;
  note?: string;
}

export interface PlaceHistoricalInfo {
  background: string;
  importantEvents: string[];
  culturalSignificance: string;
  architecture: string;
  visitorGuidelines: string[];
  entranceFee: string;
  references: string[];
}

export interface PlaceFoodInfo {
  foodCategories: string[];
  popularItems: string[];
  sampleMenu: PlaceMenuOrItem[];
  halalVerified?: boolean;
}

export interface PlaceAccommodationInfo {
  roomTypes: string[];
  estimatedRoomRate: string;
  checkInOut: string;
  bookingNote: string;
}

export interface PlaceLocalBusinessInfo {
  productsAndServices: string[];
  handmadeItems: string[];
  communityBackground: string;
}

export interface PlaceRentalInfo {
  rentalType: string;
  vehicleTypes: string[];
  estimatedDailyRate: string;
  depositRequirement: string;
  licenseRequirement: string;
  pickupLocation: string;
}

export interface ExternalRatingSource {
  provider: string;
  rating: number | null;
  reviewCount: number | null;
  note: string;
  sourceUrl: string;
  collectedAt: string;
}

export interface VisitorReview {
  reviewId: string;
  placeId: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: 'approved' | 'pending' | 'flagged';
}

export interface Place {
  placeId: string;
  name: string;
  localName: string;
  myanmarName: string;
  slug: string;
  description: string;
  categoryId: CategoryId;
  subcategory: string;
  latitude: number;
  longitude: number;
  address: string;
  subdistrict: string;
  openingHours: string;
  openPeriods: ('morning' | 'afternoon' | 'evening')[];
  estimatedVisitMinutes: number;
  priceMin: number;
  priceMax: number;
  budgetTier: BudgetTier;
  priceNote: string;
  contactInfo: string;
  websiteOrSocial: string;
  sourceName: string;
  sourceUrl: string;
  verificationStatus: VerificationStatus;
  lastVerifiedAt: string;
  isSampleRecord: boolean;
  facilities: string[];
  tags: string[];
  mainImage: string;
  gallery: { url: string; caption: string; source: string }[];
  externalRating?: ExternalRatingSource;
  historicalInfo?: PlaceHistoricalInfo;
  foodInfo?: PlaceFoodInfo;
  accommodationInfo?: PlaceAccommodationInfo;
  localBusinessInfo?: PlaceLocalBusinessInfo;
  rentalInfo?: PlaceRentalInfo;
}

export interface ItineraryStop {
  placeId: string;
  visitMinutes: number;
}

export interface SavedItinerary {
  itineraryId: string;
  title: string;
  startLocationId: string;
  travelDate: string;
  visitors: number;
  transportMode: TransportMode;
  budgetPreference: 'budget' | 'balanced' | 'comfort';
  stops: ItineraryStop[];
  estimatedTotalCost: number;
  estimatedPerPerson: number;
  estimatedDurationMinutes: number;
  estimatedDistanceKm: number;
  createdAt: string;
}

export interface SuggestedRoute {
  routeId: string;
  title: string;
  theme: 'historical' | 'cafe' | 'nature' | 'food' | 'community';
  durationLabel: string;
  tripLengthType: 'half_day' | 'one_day' | 'weekend';
  description: string;
  recommendedTransport: TransportMode;
  stopIds: string[];
  estimatedBudgetPerPerson: string;
}

export interface TourismCluster {
  clusterId: string;
  name: string;
  subdistrict: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  summary: string;
  highlights: string[];
}

export interface ContactSubmission {
  id: string;
  type: 'inquiry' | 'suggest_place' | 'report_update';
  name: string;
  email: string;
  placeName?: string;
  message: string;
  createdAt: string;
  resolved: boolean;
}
