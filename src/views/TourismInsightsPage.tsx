'use client';

import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Info, MapPin, Compass, Stethoscope, Car } from 'lucide-react';
import { CategoryId, LanguageCode, Place } from '../types/tourism';
import { CATEGORY_LIST, TOURISM_CLUSTERS } from '../data/maeSaiPlaces';
import { TRANSLATIONS } from '../data/translations';
import { estimateTravelMinutes, haversineKm } from '../utils/geo';
import { MaeSaiLeafletMap } from '../components/map/MaeSaiLeafletMap';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TourismInsightsPageProps {
  places: Place[];
  lang: LanguageCode;
  onSelectPlace: (placeId: string) => void;
}

export const TourismInsightsPage: React.FC<TourismInsightsPageProps> = ({
  places,
  lang,
  onSelectPlace,
}) => {
  const t = TRANSLATIONS[lang];
  const [categoryFilter, setCategoryFilter] = useState<CategoryId | 'all'>('all');
  const [analysisAnchorId, setAnalysisAnchorId] = useState<string>('ms-01');

  const filteredPlaces = useMemo(() => {
    if (categoryFilter === 'all') return places;
    return places.filter((p) => p.categoryId === categoryFilter);
  }, [places, categoryFilter]);

  const categoryChartData = useMemo(() => {
    return CATEGORY_LIST.map((cat) => ({
      name: cat.label.split('&')[0].trim(),
      fullLabel: cat.label,
      count: places.filter((p) => p.categoryId === cat.id).length,
      color: cat.color,
    }));
  }, [places]);

  const subdistrictData = useMemo(() => {
    const map = new Map<string, number>();
    filteredPlaces.forEach((p) => {
      map.set(p.subdistrict, (map.get(p.subdistrict) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([subdistrict, count]) => ({ subdistrict, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredPlaces]);

  const anchorPlace = places.find((p) => p.placeId === analysisAnchorId) || places[0];

  // Nearby Services Analysis around selected anchor destination
  const nearbyServices = useMemo(() => {
    if (!anchorPlace) return [];
    return places
      .filter(
        (p) =>
          p.placeId !== anchorPlace.placeId &&
          (p.categoryId === 'facilities' ||
            p.categoryId === 'transportation' ||
            p.categoryId === 'accommodation' ||
            p.categoryId === 'restaurants')
      )
      .map((p) => ({
        place: p,
        distKm: haversineKm(
          anchorPlace.latitude,
          anchorPlace.longitude,
          p.latitude,
          p.longitude
        ),
      }))
      .sort((a, b) => a.distKm - b.distKm)
      .slice(0, 6);
  }, [anchorPlace, places]);

  // Travel Accessibility Matrix between major landmarks
  const keyLandmarks = useMemo(() => {
    const ids = ['ms-03', 'ms-01', 'ms-02', 'ms-04', 'ms-05', 'ms-06'];
    return ids.map((id) => places.find((p) => p.placeId === id)).filter((p): p is Place => Boolean(p));
  }, [places]);

  // Computed visitor-facing geographic insights from actual dataset
  const topCafeSubdistrict = useMemo(() => {
    const counts = new Map<string, number>();
    places
      .filter((p) => p.categoryId === 'cafes')
      .forEach((p) => counts.set(p.subdistrict, (counts.get(p.subdistrict) || 0) + 1));
    const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    return sorted[0] || ['Wiang Phang Kham', 0];
  }, [places]);

  const nearMarketCount = useMemo(() => {
    const market = places.find((p) => p.placeId === 'ms-03');
    if (!market) return 0;
    return places.filter(
      (p) =>
        p.placeId !== market.placeId &&
        haversineKm(market.latitude, market.longitude, p.latitude, p.longitude) <= 2.5
    ).length;
  }, [places]);

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Page Heading & Mandatory Data Rule Notice */}
      <div className="space-y-4 pb-6 border-b border-[#E5E9E2]">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#26352A]">
              Discover Mae Sai Through Data
            </h1>
            <p className="text-sm sm:text-base text-[#6B7280] mt-1">
              Visitor-facing geographic intelligence showing destination clusters, nearby support
              services, and travel accessibility across Mae Sai District.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="insight-cat" className="text-xs font-semibold text-[#26352A]">
              Filter Map &amp; Subdistricts:
            </label>
            <Select
              value={categoryFilter}
              onValueChange={(val) => val && setCategoryFilter(val as CategoryId | 'all')}
            >
              <SelectTrigger
                id="insight-cat"
                aria-label="Filter Map & Subdistricts"
                className="h-9 px-3 text-xs font-medium bg-white border border-[#E5E9E2] text-[#26352A] rounded-lg min-w-[180px]"
              >
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-[#E5E9E2] shadow-lg rounded-lg">
                <SelectItem value="all">All Categories ({places.length})</SelectItem>
                {CATEGORY_LIST.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {t.categories[c.id]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Strict Sample Size & Source Transparency Banner */}
        <div className="bg-[#f5f0de] rounded-xl border border-[#E5E9E2] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#26352A]">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#406246] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Data Scope Notice:</strong> Charts and maps reflect{' '}
              <span className="font-mono-tabular font-semibold">{places.length} sample records</span>{' '}
              currently listed on this prototype platform — not all businesses operating in Mae Sai,
              and not visitor demand or arrival statistics.
            </p>
          </div>
          <div className="font-mono-tabular text-[11px] text-[#4B5563] shrink-0">
            Source: Platform Prototype Dataset · Updated Sept 2026
          </div>
        </div>
      </div>

      {/* 1. Distribution Map + Category Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E5E9E2] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#E5E9E2] flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-[#26352A]">
                Geographic Distribution &amp; Tourism Clusters
              </h2>
              <p className="text-xs text-[#6B7280]">
                Shaded circles highlight areas where multiple listed places sit close together.
              </p>
            </div>
            <span className="font-mono-tabular text-xs text-[#406246] font-semibold">
              {filteredPlaces.length} markers
            </span>
          </div>
          <div className="flex-1 min-h-[380px]">
            <MaeSaiLeafletMap
              places={filteredPlaces}
              clusters={TOURISM_CLUSTERS}
              showClusters={true}
              onSelectPlace={(id) => onSelectPlace(id)}
              heightClass="h-[380px] lg:h-full w-full"
            />
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E5E9E2] p-5 flex flex-col justify-between gap-6">
          <div>
            <h2 className="font-display text-base font-bold text-[#26352A]">
              Listed Records by Category
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Distribution of the {places.length} sample places across 8 tourism categories.
            </p>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryChartData}
                layout="vertical"
                margin={{ top: 4, right: 20, left: 10, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E9E2" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 11, fill: '#26352A' }}
                />
                <Tooltip
                  formatter={(value) => [`${value ?? 0} listed records`, 'Platform Count']}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E5E9E2',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {categoryChartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Subdistrict count strip */}
          <div className="pt-4 border-t border-[#E5E9E2]">
            <h3 className="text-xs font-semibold text-[#26352A] mb-2">
              Listed Records by Subdistrict ({categoryFilter === 'all' ? 'All' : t.categories[categoryFilter]})
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {subdistrictData.map((sd) => (
                <div
                  key={sd.subdistrict}
                  className="flex items-center justify-between bg-[#fafaf8] px-3 py-2 rounded-lg border border-[#E5E9E2]"
                >
                  <span className="text-[#26352A] truncate">{sd.subdistrict}</span>
                  <span className="font-mono-tabular font-bold text-[#406246]">{sd.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tourism Clusters & Recommended Exploration Areas */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#26352A]">
            Tourism Clusters &amp; Recommended Exploration Areas
          </h2>
          <p className="text-sm text-[#6B7280] mt-1">
            Five geographic zones in Mae Sai where attractions, cafés, and visitor services group naturally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TOURISM_CLUSTERS.map((cluster) => (
            <div
              key={cluster.clusterId}
              className="bg-white rounded-xl border border-[#E5E9E2] p-5 space-y-3"
            >
              <div className="flex items-center justify-between gap-2 text-xs text-[#406246] font-medium">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{cluster.subdistrict}</span>
                </span>
                <span className="font-mono-tabular text-[#6B7280]">
                  ~{(cluster.radiusMeters / 1000).toFixed(1)} km radius
                </span>
              </div>
              <h3 className="font-display text-base font-bold text-[#26352A]">{cluster.name}</h3>
              <p className="text-sm text-[#4B5563] leading-relaxed">{cluster.summary}</p>
              <div className="pt-2 border-t border-[#E5E9E2] text-xs text-[#6B7280]">
                <span className="font-semibold text-[#26352A]">Key places: </span>
                {cluster.highlights.join(' · ')}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Nearby Services Analysis + Travel Accessibility */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Nearby Services */}
        <section className="lg:col-span-5 bg-white rounded-xl border border-[#E5E9E2] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-[#406246]" />
            <h2 className="font-display text-base font-bold text-[#26352A]">
              Nearby Services &amp; Support Analysis
            </h2>
          </div>

          <div>
            <label htmlFor="anchor-select" className="block text-xs font-semibold text-[#6B7280] mb-1">
              Select a Destination to Inspect Nearest Support Services
            </label>
            <Select
              value={analysisAnchorId}
              onValueChange={(val) => val && setAnalysisAnchorId(val)}
            >
              <SelectTrigger
                id="anchor-select"
                aria-label="Select Destination"
                className="w-full rounded-lg border border-[#E5E9E2] bg-[#fafaf8] px-3 py-2 text-sm text-[#26352A] h-10"
              >
                <SelectValue placeholder="Select Destination" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-[#E5E9E2] shadow-lg rounded-lg max-h-72">
                {places.map((p) => (
                  <SelectItem key={p.placeId} value={p.placeId}>
                    {p.name} ({p.subdistrict})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="divide-y divide-[#E5E9E2]">
            {nearbyServices.map(({ place, distKm }) => (
              <div key={place.placeId} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => onSelectPlace(place.placeId)}
                    className="text-sm font-semibold text-[#26352A] hover:text-[#406246] truncate block text-left cursor-pointer"
                  >
                    {place.name}
                  </button>
                  <div className="text-xs text-[#6B7280]">
                    {t.categories[place.categoryId]} · {place.openingHours}
                  </div>
                </div>
                <span className="font-mono-tabular text-xs font-bold text-[#406246] shrink-0">
                  {distKm} km
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Travel Accessibility Matrix */}
        <section className="lg:col-span-7 bg-white rounded-xl border border-[#E5E9E2] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-[#406246]" />
            <h2 className="font-display text-base font-bold text-[#26352A]">
              Travel Accessibility from Mae Sai Border Market
            </h2>
          </div>
          <p className="text-xs text-[#6B7280]">
            Road-adjusted distance and estimated travel time to key Mae Sai landmarks. Mountain
            villages (Doi Pha Mee, Doi Pha Hee) have steeper gradients best served by scooter, car,
            or community songthaew.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#E5E9E2] text-xs text-[#6B7280]">
                  <th className="py-2.5 pr-4 font-semibold">Destination</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Est. Distance</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Scooter / Car</th>
                  <th className="py-2.5 pl-3 font-semibold text-right">Access Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E9E2]">
                {keyLandmarks.slice(1).map((dest) => {
                  const origin = keyLandmarks[0];
                  const km = haversineKm(
                    origin.latitude,
                    origin.longitude,
                    dest.latitude,
                    dest.longitude
                  );
                  const minsCar = estimateTravelMinutes(km, 'rental_car');
                  const isHill = dest.placeId === 'ms-04' || dest.placeId === 'ms-05';
                  return (
                    <tr key={dest.placeId} className="hover:bg-[#fafaf8]">
                      <td className="py-3 pr-4">
                        <button
                          type="button"
                          onClick={() => onSelectPlace(dest.placeId)}
                          className="font-semibold text-[#26352A] hover:text-[#406246] text-left cursor-pointer"
                        >
                          {dest.name}
                        </button>
                        <div className="text-xs text-[#6B7280]">{dest.subdistrict}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono-tabular text-[#26352A]">
                        {km} km
                      </td>
                      <td className="py-3 px-3 text-right font-mono-tabular text-[#406246] font-medium">
                        ~{minsCar} min
                      </td>
                      <td className="py-3 pl-3 text-right text-xs text-[#4B5563]">
                        {isHill ? 'Mountain ridge road' : 'Paved town / highway'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* 4. Visitor-Facing Geographic Insights */}
      <section className="bg-[#f5f0de]/70 rounded-xl border border-[#E5E9E2] p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-[#406246]" />
          <h2 className="font-display text-xl font-bold text-[#26352A]">
            Key Geographic Insights for Visitors
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
          <div className="bg-white rounded-lg border border-[#E5E9E2] p-4 space-y-1.5">
            <h3 className="font-semibold text-[#26352A]">
              Which area has the most listed cafés?
            </h3>
            <p className="text-[#4B5563] text-xs leading-relaxed">
              <strong>{topCafeSubdistrict[0]}</strong> accounts for{' '}
              <span className="font-mono-tabular font-semibold">{topCafeSubdistrict[1]}</span> of the
              platform’s listed cafés and coffee roasters, clustered mainly along Phahonyothin Road
              and the Doi Pha Mee approach.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-[#E5E9E2] p-4 space-y-1.5">
            <h3 className="font-semibold text-[#26352A]">
              Which destinations are close to Mae Sai Market?
            </h3>
            <p className="text-[#4B5563] text-xs leading-relaxed">
              <span className="font-mono-tabular font-semibold">{nearMarketCount}</span> listed
              places sit within 2.5 km of Mae Sai Border Market, including Wat Phra That Doi Wao,
              Mandalay Coffee House, Somkid Somtam, and the Tourist Information Center.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-[#E5E9E2] p-4 space-y-1.5">
            <h3 className="font-semibold text-[#26352A]">
              Where can visitors find multiple attractions together?
            </h3>
            <p className="text-[#4B5563] text-xs leading-relaxed">
              The <strong>Border &amp; Doi Wao Heritage Core</strong> combines temples, markets, and
              dining on foot, while <strong>Tham Luang–Pong Pha</strong> pairs forest trails with
              organic dining at Chan Ka Pak and nearby homestays.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-[#E5E9E2] p-4 space-y-1.5">
            <h3 className="font-semibold text-[#26352A]">
              Which areas have limited nearby tourism services?
            </h3>
            <p className="text-[#4B5563] text-xs leading-relaxed">
              Highland ridges such as <strong>Doi Pha Hee</strong> (Pong Ngam) and eastern craft
              villages like <strong>Ban Pang Ha</strong> (Ko Chang) lie 6–12 km from town medical
              and rental hubs, so arranging transport and fuel in town beforehand is advised.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
