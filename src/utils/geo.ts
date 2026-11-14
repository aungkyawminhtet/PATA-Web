import { Place, TransportMode } from '../types/tourism';

export const MAE_SAI_CENTER = {
  lat: 20.4328,
  lng: 99.8832,
  label: 'Mae Sai Border Town Center',
};

export interface StartingPointOption {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export const STARTING_POINTS: StartingPointOption[] = [
  { id: 'border_checkpoint', name: 'Mae Sai Border Checkpoint (Thai-Myanmar Bridge)', lat: 20.4439, lng: 99.8808 },
  { id: 'maesai_bus_terminal', name: 'Mae Sai Bus Terminal (Phahonyothin Rd)', lat: 20.4158, lng: 99.8872 },
  { id: 'doi_wao_gate', name: 'Wat Phra That Doi Wao Base Gate', lat: 20.4422, lng: 99.8781 },
  { id: 'pong_pha_junction', name: 'Tham Luang / Pong Pha Highway Junction', lat: 20.3821, lng: 99.8935 },
  { id: 'chiang_rai_town', name: 'Chiang Rai Town (Highway 1 Southbound)', lat: 20.3450, lng: 99.8890 },
];

export const TRANSPORT_CONFIG: Record<
  TransportMode,
  {
    label: string;
    speedKmh: number;
    baseDailyRentalThb: number;
    fuelPerKmThb: number;
    perTripOrGuideThb: number;
    description: string;
  }
> = {
  walking: {
    label: 'Walking',
    speedKmh: 4.2,
    baseDailyRentalThb: 0,
    fuelPerKmThb: 0,
    perTripOrGuideThb: 0,
    description: 'Best for Mae Sai Market, Doi Wao hill & town cafés',
  },
  bicycle: {
    label: 'Bicycle',
    speedKmh: 13,
    baseDailyRentalThb: 120,
    fuelPerKmThb: 0,
    perTripOrGuideThb: 0,
    description: 'Flat town & Ban Pang Ha village lanes (~100–150 THB/day est.)',
  },
  motorcycle: {
    label: 'Motorcycle Rental',
    speedKmh: 34,
    baseDailyRentalThb: 300,
    fuelPerKmThb: 1.5,
    perTripOrGuideThb: 0,
    description: 'Flexible for Doi Pha Mee & Tham Luang (~250–350 THB/day est.)',
  },
  private_car: {
    label: 'Private Car',
    speedKmh: 38,
    baseDailyRentalThb: 0,
    fuelPerKmThb: 4.2,
    perTripOrGuideThb: 0,
    description: 'Own vehicle; fuel estimated at ~4.2 THB/km',
  },
  rental_car: {
    label: 'Rental Car',
    speedKmh: 38,
    baseDailyRentalThb: 1100,
    fuelPerKmThb: 4.2,
    perTripOrGuideThb: 0,
    description: 'Sedan/compact rental (~900–1,400 THB/day est. + fuel)',
  },
  local_taxi: {
    label: 'Local Taxi / Tuk-Tuk',
    speedKmh: 32,
    baseDailyRentalThb: 0,
    fuelPerKmThb: 0,
    perTripOrGuideThb: 85,
    description: 'Point-to-point fare estimate (~60–150 THB/leg)',
  },
  community_transport: {
    label: 'Community Songthaew',
    speedKmh: 28,
    baseDailyRentalThb: 0,
    fuelPerKmThb: 0,
    perTripOrGuideThb: 60,
    description: 'Shared local songthaew & hill pickup (~40–100 THB/leg)',
  },
  tour_guide: {
    label: 'Tour Agency / Local Guide',
    speedKmh: 36,
    baseDailyRentalThb: 0,
    fuelPerKmThb: 4.0,
    perTripOrGuideThb: 1500,
    description: 'Half/full-day guided transport (~1,200–2,000 THB est.)',
  },
};

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // Multiply straight-line distance by 1.28 road-winding factor for Mae Sai mountain/town roads
  return Number((R * c * 1.28).toFixed(2));
}

export function estimateTravelMinutes(distanceKm: number, mode: TransportMode): number {
  const speed = TRANSPORT_CONFIG[mode].speedKmh;
  return Math.max(3, Math.round((distanceKm / speed) * 60));
}

export function formatDuration(totalMinutes: number): string {
  const hrs = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  if (hrs === 0) return `${mins} min`;
  if (mins === 0) return `${hrs} hr`;
  return `${hrs} hr ${mins} min`;
}

export function isPlaceOpenNow(place: Place): boolean {
  const hour = new Date().getHours();
  if (place.openingHours.toLowerCase().includes('24 hours')) return true;
  if (hour >= 6 && hour < 12 && place.openPeriods.includes('morning')) return true;
  if (hour >= 12 && hour < 17 && place.openPeriods.includes('afternoon')) return true;
  if (hour >= 17 && hour <= 22 && place.openPeriods.includes('evening')) return true;
  return false;
}

export interface TripCostBreakdown {
  totalDistanceKm: number;
  travelTimeMinutes: number;
  visitTimeMinutes: number;
  totalDurationMinutes: number;
  rentalCost: number;
  fuelCost: number;
  localTransportCost: number;
  tourGuideCost: number;
  entranceFees: number;
  foodAndDrinks: number;
  accommodationCost: number;
  activitiesCost: number;
  otherExpenses: number;
  totalCost: number;
  costPerPerson: number;
  legs: {
    fromName: string;
    toPlace: Place;
    distanceKm: number;
    travelMinutes: number;
  }[];
}

export function calculateTripEstimate(params: {
  startPoint: StartingPointOption;
  stops: { place: Place; visitMinutes: number }[];
  mode: TransportMode;
  visitors: number;
  budgetPreference: 'budget' | 'balanced' | 'comfort';
  includeOvernight: boolean;
}): TripCostBreakdown {
  const { startPoint, stops, mode, visitors, budgetPreference, includeOvernight } = params;
  const safeVisitors = Math.max(1, visitors);
  const cfg = TRANSPORT_CONFIG[mode];

  let prevLat = startPoint.lat;
  let prevLng = startPoint.lng;
  let prevName = startPoint.name;

  let totalDistanceKm = 0;
  let travelTimeMinutes = 0;
  let visitTimeMinutes = 0;

  let entranceFees = 0;
  let foodAndDrinks = 0;
  let accommodationCost = 0;
  let activitiesCost = 0;

  const legs: TripCostBreakdown['legs'] = [];

  const prefMultiplier =
    budgetPreference === 'budget' ? 0.8 : budgetPreference === 'comfort' ? 1.35 : 1.0;

  stops.forEach(({ place, visitMinutes }) => {
    const dist = haversineKm(prevLat, prevLng, place.latitude, place.longitude);
    const mins = estimateTravelMinutes(dist, mode);
    totalDistanceKm += dist;
    travelTimeMinutes += mins;
    visitTimeMinutes += visitMinutes;

    legs.push({
      fromName: prevName,
      toPlace: place,
      distanceKm: dist,
      travelMinutes: mins,
    });

    prevLat = place.latitude;
    prevLng = place.longitude;
    prevName = place.name;

    const avgPrice = Math.round(((place.priceMin + place.priceMax) / 2) * prefMultiplier);

    if (place.categoryId === 'attractions') {
      entranceFees += avgPrice * safeVisitors;
    } else if (place.categoryId === 'cafes' || place.categoryId === 'restaurants') {
      foodAndDrinks += avgPrice * safeVisitors;
    } else if (place.categoryId === 'accommodation') {
      const rooms = Math.ceil(safeVisitors / 2);
      accommodationCost += avgPrice * rooms;
    } else if (place.categoryId === 'local_experiences' || place.categoryId === 'shopping') {
      activitiesCost += avgPrice * safeVisitors;
    }
  });

  if (includeOvernight && accommodationCost === 0) {
    const rooms = Math.ceil(safeVisitors / 2);
    const baseNight = budgetPreference === 'budget' ? 650 : budgetPreference === 'comfort' ? 1600 : 950;
    accommodationCost = baseNight * rooms;
  }

  // Ensure baseline food allowance if itinerary spans >3 hours and no food stops were explicitly picked
  const totalDurationMinutes = travelTimeMinutes + visitTimeMinutes;
  if (foodAndDrinks === 0 && totalDurationMinutes >= 180) {
    foodAndDrinks = Math.round(120 * prefMultiplier * safeVisitors);
  }

  const days = Math.max(1, Math.ceil(totalDurationMinutes / 480));
  const vehiclesNeeded =
    mode === 'motorcycle' || mode === 'bicycle' ? Math.max(1, Math.ceil(safeVisitors / 2)) : 1;

  const rentalCost = Math.round(cfg.baseDailyRentalThb * days * vehiclesNeeded);
  const fuelCost = Math.round(totalDistanceKm * cfg.fuelPerKmThb * vehiclesNeeded);
  const localTransportCost =
    mode === 'local_taxi' || mode === 'community_transport'
      ? Math.round(cfg.perTripOrGuideThb * Math.max(1, stops.length) * (mode === 'community_transport' ? safeVisitors : 1))
      : 0;
  const tourGuideCost = mode === 'tour_guide' ? Math.round(cfg.perTripOrGuideThb * days) : 0;
  const otherExpenses = Math.round(stops.length * 30 * safeVisitors);

  const totalCost =
    rentalCost +
    fuelCost +
    localTransportCost +
    tourGuideCost +
    entranceFees +
    foodAndDrinks +
    accommodationCost +
    activitiesCost +
    otherExpenses;

  return {
    totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
    travelTimeMinutes,
    visitTimeMinutes,
    totalDurationMinutes,
    rentalCost,
    fuelCost,
    localTransportCost,
    tourGuideCost,
    entranceFees,
    foodAndDrinks,
    accommodationCost,
    activitiesCost,
    otherExpenses,
    totalCost,
    costPerPerson: Math.round(totalCost / safeVisitors),
    legs,
  };
}
