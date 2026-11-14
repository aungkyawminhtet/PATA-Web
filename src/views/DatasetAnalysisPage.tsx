'use client';

import React, { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import {
  Users,
  Plane,
  Banknote,
  Wind,
  MapPin,
  Download,
  Info,
  Building2,
  Search,
  ArrowUpDown,
} from 'lucide-react';
import { LanguageCode, Place } from '../types/tourism';
import { CATEGORY_LIST } from '../data/maeSaiPlaces';
import { TRANSLATIONS } from '../data/translations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DatasetAnalysisPageProps {
  places: Place[];
  lang: LanguageCode;
  onSelectPlace: (placeId: string) => void;
  onExploreSubdistrict: () => void;
}

// Mae Sai District 2021–2026 Population Trend (Sample District Estimate aligned with DOPA Northern Thailand trends)
const POPULATION_TREND = [
  { year: '2021', population: 89240, households: 35410 },
  { year: '2022', population: 89050, households: 35620 },
  { year: '2023', population: 88890, households: 35850 },
  { year: '2024', population: 88720, households: 36080 },
  { year: '2025', population: 88580, households: 36290 },
  { year: '2026', population: 88450, households: 36480 },
];

const AGE_GROUPS = [
  { group: '0–14 yrs', sharePct: 16.4, count: 14505 },
  { group: '15–29 yrs', sharePct: 19.8, count: 17513 },
  { group: '30–49 yrs', sharePct: 30.2, count: 26712 },
  { group: '50–64 yrs', sharePct: 20.5, count: 18132 },
  { group: '65+ yrs', sharePct: 13.1, count: 11588 },
];

// Monthly Tourism Seasonality (Sample District Estimate calibrated to Chiang Rai peak winter / rainy trough)
const MONTHLY_TOURISM = [
  { month: 'Jan', domestic: 64200, international: 12800, occupancy: 84 },
  { month: 'Feb', domestic: 52800, international: 10900, occupancy: 76 },
  { month: 'Mar', domestic: 36500, international: 7200, occupancy: 54 },
  { month: 'Apr', domestic: 41200, international: 6800, occupancy: 58 },
  { month: 'May', domestic: 33400, international: 5100, occupancy: 49 },
  { month: 'Jun', domestic: 29800, international: 4600, occupancy: 46 },
  { month: 'Jul', domestic: 34600, international: 5900, occupancy: 53 },
  { month: 'Aug', domestic: 32900, international: 5400, occupancy: 51 },
  { month: 'Sep', domestic: 31200, international: 4900, occupancy: 48 },
  { month: 'Oct', domestic: 46500, international: 8100, occupancy: 67 },
  { month: 'Nov', domestic: 61800, international: 12400, occupancy: 82 },
  { month: 'Dec', domestic: 72400, international: 15200, occupancy: 91 },
];

// Mae Sai Monthly Air Quality (PM2.5 µg/m³) & Rainfall/Temp Profile (Sample Northern District Seasonal Pattern)
const MONTHLY_AIR_CLIMATE = [
  { month: 'Jan', pm25: 54, tempC: 21, status: 'moderate' },
  { month: 'Feb', pm25: 86, tempC: 23, status: 'unhealthy' },
  { month: 'Mar', pm25: 114, tempC: 26, status: 'unhealthy' },
  { month: 'Apr', pm25: 72, tempC: 29, status: 'moderate' },
  { month: 'May', pm25: 26, tempC: 28, status: 'clean' },
  { month: 'Jun', pm25: 16, tempC: 27, status: 'clean' },
  { month: 'Jul', pm25: 13, tempC: 27, status: 'clean' },
  { month: 'Aug', pm25: 12, tempC: 26, status: 'clean' },
  { month: 'Sep', pm25: 15, tempC: 26, status: 'clean' },
  { month: 'Oct', pm25: 22, tempC: 25, status: 'clean' },
  { month: 'Nov', pm25: 29, tempC: 23, status: 'clean' },
  { month: 'Dec', pm25: 38, tempC: 20, status: 'moderate' },
];

// Mae Sai Economic Sector Breakdown & Border Trade Index (Sample District Estimate)
const ECONOMIC_SECTORS = [
  { sector: 'Cross-Border Trade & Retail', sharePct: 38, estValueB: 4.18, color: '#406246' },
  { sector: 'Agriculture (Coffee, Tea, Rice)', sharePct: 24, estValueB: 2.64, color: '#26352A' },
  { sector: 'Tourism & Hospitality', sharePct: 22, estValueB: 2.42, color: '#D97706' },
  { sector: 'Crafts, Services & Logistics', sharePct: 16, estValueB: 1.76, color: '#6B7280' },
];

const BORDER_TRADE_SERIES = [
  { year: '2021', valueBillionThb: 7.4 },
  { year: '2022', valueBillionThb: 8.9 },
  { year: '2023', valueBillionThb: 10.2 },
  { year: '2024', valueBillionThb: 10.8 },
  { year: '2025', valueBillionThb: 11.4 },
  { year: '2026', valueBillionThb: 11.9 },
];

// Official 8 Subdistricts (Tambons) of Mae Sai District with sample demographic & tourism profile
const MAE_SAI_SUBDISTRICTS = [
  {
    name: 'Wiang Phang Kham',
    thai: 'เวียงพางคำ',
    areaKm2: 34.2,
    estPopulation: 24850,
    focus: 'Border commercial core, Doi Wao heritage hill, Doi Pha Mee coffee slope, District hospital',
  },
  {
    name: 'Mae Sai',
    thai: 'แม่สาย',
    areaKm2: 18.6,
    estPopulation: 18420,
    focus: 'Urban retail corridor, Friendship Bridge gateway, town cafés & restaurants',
  },
  {
    name: 'Pong Pha',
    thai: 'โป่งผา',
    areaKm2: 46.5,
    estPopulation: 11680,
    focus: 'Tham Luang–Khun Nam Nang Non National Park, organic dining & garden homestays',
  },
  {
    name: 'Pong Ngam',
    thai: 'โป่งงาม',
    areaKm2: 52.8,
    estPopulation: 9420,
    focus: 'Doi Pha Hee highland Akha coffee village, ridge viewpoints & tea slopes',
  },
  {
    name: 'Ko Chang',
    thai: 'เกาะช้าง',
    areaKm2: 39.4,
    estPopulation: 8640,
    focus: 'Ban Pang Ha community tourism, handmade mulberry saa paper & Tai Lue homestays',
  },
  {
    name: 'Huai Khrai',
    thai: 'ห้วยไคร้',
    areaKm2: 38.1,
    estPopulation: 6950,
    focus: 'Southern Highway 1 gateway toward Mae Chan & Doi Tung junction',
  },
  {
    name: 'Si Mueang Chum',
    thai: 'ศรีเมืองชุม',
    areaKm2: 26.8,
    estPopulation: 4680,
    focus: 'Eastern Ruak–Sai river basin agriculture & rural village trails',
  },
  {
    name: 'Ban Dai',
    thai: 'บ้านด้าย',
    areaKm2: 28.6,
    estPopulation: 3810,
    focus: 'Paddy fields, quiet local Buddhist temples & bicycle countryside routes',
  },
];

type SubdistrictSortKey = 'name' | 'estPopulation' | 'areaKm2' | 'listedCount';

export const DatasetAnalysisPage: React.FC<DatasetAnalysisPageProps> = ({
  places,
  lang,
  onSelectPlace,
  onExploreSubdistrict,
}) => {
  const t = TRANSLATIONS[lang];
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [subdistrictQuery, setSubdistrictQuery] = useState('');
  const [subSortKey, setSubSortKey] = useState<SubdistrictSortKey>('estPopulation');
  const [subSortAsc, setSubSortAsc] = useState(false);
  const [datasetFilterCat, setDatasetFilterCat] = useState<string>('all');

  const subdistrictRows = useMemo(() => {
    const q = subdistrictQuery.trim().toLowerCase();
    const rows = MAE_SAI_SUBDISTRICTS.map((sd) => {
      const listedCount = places.filter((p) => p.subdistrict === sd.name).length;
      const density = Math.round(sd.estPopulation / sd.areaKm2);
      return { ...sd, listedCount, density };
    }).filter((sd) => {
      if (!q) return true;
      return `${sd.name} ${sd.thai} ${sd.focus}`.toLowerCase().includes(q);
    });

    rows.sort((a, b) => {
      const valA = a[subSortKey];
      const valB = b[subSortKey];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return subSortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return subSortAsc ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
    });
    return rows;
  }, [places, subdistrictQuery, subSortKey, subSortAsc]);

  const categoryPricingSummary = useMemo(() => {
    return CATEGORY_LIST.map((cat) => {
      const items = places.filter((p) => p.categoryId === cat.id);
      const avgMin =
        items.length > 0
          ? Math.round(items.reduce((s, p) => s + p.priceMin, 0) / items.length)
          : 0;
      const avgMax =
        items.length > 0
          ? Math.round(items.reduce((s, p) => s + p.priceMax, 0) / items.length)
          : 0;
      const verified = items.filter((p) => p.verificationStatus === 'verified').length;
      return {
        id: cat.id,
        label: cat.label,
        count: items.length,
        verified,
        avgMin,
        avgMax,
        color: cat.color,
      };
    });
  }, [places]);

  const datasetTablePlaces = useMemo(() => {
    if (datasetFilterCat === 'all') return places;
    return places.filter((p) => p.categoryId === datasetFilterCat);
  }, [places, datasetFilterCat]);

  const handleSortSubdistrict = (key: SubdistrictSortKey) => {
    if (subSortKey === key) setSubSortAsc(!subSortAsc);
    else {
      setSubSortKey(key);
      setSubSortAsc(false);
    }
  };

  const handleDownloadCsv = () => {
    const header = [
      'place_id',
      'name',
      'local_name',
      'category',
      'subdistrict',
      'latitude',
      'longitude',
      'price_min_thb',
      'price_max_thb',
      'verification_status',
      'last_verified_at',
      'source_name',
    ];
    const rows = places.map((p) => [
      p.placeId,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.localName.replace(/"/g, '""')}"`,
      p.categoryId,
      `"${p.subdistrict}"`,
      p.latitude,
      p.longitude,
      p.priceMin,
      p.priceMax,
      p.verificationStatus,
      p.lastVerifiedAt,
      `"${p.sourceName.replace(/"/g, '""')}"`,
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mae-sai-district-dataset.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(`sec-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const annualVisitorsTotal = MONTHLY_TOURISM.reduce(
    (sum, m) => sum + m.domestic + m.international,
    0
  );
  const avgOccupancy = Math.round(
    MONTHLY_TOURISM.reduce((sum, m) => sum + m.occupancy, 0) / MONTHLY_TOURISM.length
  );

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header & ThailandStats-style District Profile Banner */}
      <section className="space-y-5 pb-6 border-b border-[#E5E9E2]">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#406246]">
              <MapPin className="w-4 h-4" />
              <span>Amphoe Mae Sai (อำเภอแม่สาย) · Chiang Rai Province · Northern Thailand</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#26352A] tracking-tight">
              Mae Sai District Dataset &amp; Statistical Profile
            </h1>
            <p className="text-sm sm:text-base text-[#4B5563] max-w-3xl">
              District-level demographic, tourism seasonality, cross-border economy, air quality,
              and subdistrict analytics for Mae Sai — modeled after regional statistical dossiers.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#406246] hover:bg-[#26352A] rounded-lg transition-colors whitespace-nowrap self-start lg:self-auto cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Mae Sai CSV ({places.length} places)</span>
          </button>
        </div>

        {/* Data Source & Sample Attribution Bar */}
        <div className="bg-[#f5f0de] rounded-xl border border-[#E5E9E2] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-[#26352A]">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#406246] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Dataset Attribution:</strong> Administrative geography (8 Tambons, ~285 km²)
              and provincial wage baseline (THB 352/day) reflect public Chiang Rai references;
              sub-district time-series (population, visitor arrivals, trade, PM2.5) are clearly
              labeled <strong>Sample District Estimates</strong> where official Amphoe-level tables
              are unavailable.
            </p>
          </div>
          <span className="font-mono-tabular text-[11px] text-[#4B5563] shrink-0">
            Scope: Mae Sai District · 2021–2026
          </span>
        </div>

        {/* Section Jump Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          {[
            { id: 'overview', label: 'Overview KPIs' },
            { id: 'population', label: 'Population' },
            { id: 'tourism', label: 'Tourism & Occupancy' },
            { id: 'economy', label: 'Economy & Wages' },
            { id: 'air', label: 'Air Quality & Climate' },
            { id: 'subdistricts', label: '8 Subdistricts (Tambons)' },
            { id: 'dataset', label: 'Listed Places Dataset' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => scrollToSection(tab.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                activeSection === tab.id
                  ? 'bg-[#406246] text-white'
                  : 'bg-white border border-[#E5E9E2] text-[#4B5563] hover:bg-[#f5f0de] hover:text-[#26352A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* SECTION 0: TOP 4 OVERVIEW KPI CARDS */}
      <section id="sec-overview" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl border border-[#E5E9E2] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span>Est. District Population</span>
            <Users className="w-4 h-4 text-[#406246]" />
          </div>
          <div className="font-mono-tabular text-3xl font-extrabold text-[#26352A]">
            88,450
          </div>
          <div className="text-xs text-[#4B5563]">
            <span className="font-mono-tabular text-[#B84040] font-semibold">-0.15%</span> YoY ·
            Sample District Estimate
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E9E2] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span>Est. Annual Visitors</span>
            <Plane className="w-4 h-4 text-[#406246]" />
          </div>
          <div className="font-mono-tabular text-3xl font-extrabold text-[#406246]">
            {annualVisitorsTotal.toLocaleString()}
          </div>
          <div className="text-xs text-[#4B5563]">
            ~84% Domestic · ~16% International (Sample)
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E9E2] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span>Chiang Rai Daily Min. Wage</span>
            <Banknote className="w-4 h-4 text-[#406246]" />
          </div>
          <div className="font-mono-tabular text-3xl font-extrabold text-[#26352A]">
            ฿352
          </div>
          <div className="text-xs text-[#4B5563]">
            Official provincial rate · Est. Spend ฿1,650/day
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E9E2] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span>Subdistricts &amp; Avg Occupancy</span>
            <Building2 className="w-4 h-4 text-[#406246]" />
          </div>
          <div className="font-mono-tabular text-3xl font-extrabold text-[#26352A]">
            8 Tambons
          </div>
          <div className="text-xs text-[#4B5563]">
            ~285 km² area · <span className="font-mono-tabular">{avgOccupancy}%</span> avg lodging
            occ. (Sample)
          </div>
        </div>
      </section>

      {/* SECTION 1: POPULATION & DEMOGRAPHICS */}
      <section id="sec-population" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#26352A]">
              01. Population &amp; Demographic Structure
            </h2>
            <p className="text-sm text-[#6B7280]">
              Sample registered population trend (2021–2026) and age distribution across Mae Sai
              District.
            </p>
          </div>
          <span className="text-xs text-[#6B7280]">Sample District Series · DOPA-aligned</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-xl border border-[#E5E9E2] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-[#26352A]">
                Mae Sai Population &amp; Households (2021–2026)
              </h3>
              <span className="text-xs font-mono-tabular text-[#406246] font-semibold">
                36,480 est. households
              </span>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={POPULATION_TREND} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E9E2" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#26352A' }} />
                  <YAxis domain={[87500, 90000]} tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <Tooltip
                    formatter={(value) => [Number(value ?? 0).toLocaleString(), 'Est. Residents']}
                  />
                  <Area
                    type="monotone"
                    dataKey="population"
                    stroke="#406246"
                    strokeWidth={2.5}
                    fill="#E5E9E2"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white rounded-xl border border-[#E5E9E2] p-5 space-y-4">
            <h3 className="font-display text-sm font-bold text-[#26352A]">
              Age Group Distribution (Sample 2026)
            </h3>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={AGE_GROUPS} layout="vertical" margin={{ top: 4, right: 20, left: 10, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E9E2" horizontal={false} />
                  <XAxis type="number" unit="%" tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis type="category" dataKey="group" width={72} tick={{ fontSize: 11, fill: '#26352A' }} />
                  <Tooltip
                    formatter={(value) => [`${value ?? 0}%`, 'Share of District']}
                  />
                  <Bar dataKey="sharePct" fill="#26352A" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: TOURISM ARRIVALS & SEASONALITY */}
      <section id="sec-tourism" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#26352A]">
              02. Tourism Volume, Origin &amp; Lodging Occupancy
            </h2>
            <p className="text-sm text-[#6B7280]">
              Monthly visitor seasonality across Mae Sai’s cool winter peak (Nov–Feb) and green
              monsoon season (Jun–Sep).
            </p>
          </div>
          <span className="text-xs text-[#6B7280]">Sample District Tourism Estimate</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E9E2] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="font-display text-sm font-bold text-[#26352A]">
              Monthly Domestic vs. International Arrivals &amp; Occupancy Rate (%)
            </h3>
            <div className="flex items-center gap-5 text-xs text-[#4B5563]">
              <span>
                Est. Total Revenue: <strong className="font-mono-tabular text-[#26352A]">฿2.85B / yr</strong>
              </span>
              <span>
                Avg Stay: <strong className="font-mono-tabular text-[#26352A]">1.8 nights</strong>
              </span>
            </div>
          </div>

          <div className="h-[310px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={MONTHLY_TOURISM} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E9E2" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#26352A' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  unit="%"
                  tick={{ fontSize: 11, fill: '#D97706' }}
                />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                  yAxisId="left"
                  dataKey="domestic"
                  name="Domestic Visitors (est.)"
                  stackId="vis"
                  fill="#406246"
                />
                <Bar
                  yAxisId="left"
                  dataKey="international"
                  name="International & Border Visitors (est.)"
                  stackId="vis"
                  fill="#94a897"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="occupancy"
                  name="Lodging Occupancy (%)"
                  stroke="#D97706"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* SECTION 3: ECONOMY, BORDER TRADE & VISITOR COST BENCHMARKS */}
      <section id="sec-economy" className="space-y-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#26352A]">
            03. Cross-Border Economy, Wages &amp; Local Cost Benchmarks
          </h2>
          <p className="text-sm text-[#6B7280]">
            Mae Sai serves as Thailand’s northernmost land trade gateway alongside highland Arabica
            coffee farming and community tourism.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sector Mix & Trade Trend */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-[#E5E9E2] p-5 space-y-5">
            <h3 className="font-display text-sm font-bold text-[#26352A]">
              Estimated Mae Sai District Economic Mix (Sample)
            </h3>
            <div className="space-y-3">
              {ECONOMIC_SECTORS.map((sec) => (
                <div key={sec.sector} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#26352A]">{sec.sector}</span>
                    <span className="font-mono-tabular text-[#4B5563]">
                      {sec.sharePct}% (~฿{sec.estValueB}B est.)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#E5E9E2] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${sec.sharePct}%`, backgroundColor: sec.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#E5E9E2]">
              <h4 className="text-xs font-semibold text-[#26352A] mb-3">
                Estimated Border Trade Activity Index (Billion THB, Sample)
              </h4>
              <div className="h-[170px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={BORDER_TRADE_SERIES}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E9E2" vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#26352A' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <Tooltip formatter={(v) => [`฿${v ?? 0}B`, 'Est. Trade Volume']} />
                    <Bar dataKey="valueBillionThb" fill="#406246" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Wage & Local Cost Benchmarks */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-[#E5E9E2] p-5 space-y-4">
            <h3 className="font-display text-sm font-bold text-[#26352A]">
              Wages &amp; Visitor Price Benchmarks (Mae Sai)
            </h3>
            <div className="divide-y divide-[#E5E9E2] text-sm">
              {[
                {
                  item: 'Chiang Rai Provincial Minimum Daily Wage',
                  val: '฿352 / day',
                  note: 'Official provincial labor benchmark',
                },
                {
                  item: 'Local Meal (Somtam / Khao Soi / Noodle Bowl)',
                  val: '฿50 – ฿140',
                  note: 'Sample range across listed Mae Sai kitchens',
                },
                {
                  item: 'Highland Specialty Pour-Over Coffee',
                  val: '฿65 – ฿140',
                  note: 'Doi Pha Mee, Doi Pha Hee & town roasters',
                },
                {
                  item: 'Community Homestay (Ban Pang Ha / Pong Pha)',
                  val: '฿550 – ฿1,400 / night',
                  note: 'Estimated sample rate per room',
                },
                {
                  item: 'Town Hotel / Residence',
                  val: '฿650 – ฿1,600 / night',
                  note: 'Wiang Phang Kham & Phahonyothin Rd',
                },
                {
                  item: 'Scooter Rental (110–125cc)',
                  val: '฿250 – ฿350 / day',
                  note: 'Plus fuel (~฿45–฿90/day est.)',
                },
                {
                  item: 'Saa Mulberry Paper Craft Workshop',
                  val: '฿150 – ฿350 / person',
                  note: 'Ban Pang Ha Community Tourism',
                },
              ].map((row) => (
                <div key={row.item} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium text-[#26352A]">{row.item}</div>
                    <div className="text-xs text-[#6B7280]">{row.note}</div>
                  </div>
                  <div className="font-mono-tabular font-bold text-[#406246] whitespace-nowrap">
                    {row.val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: AIR QUALITY (PM2.5) & CLIMATE SEASONALITY */}
      <section id="sec-air" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#26352A]">
              04. Air Quality (PM2.5) &amp; Seasonal Travel Window
            </h2>
            <p className="text-sm text-[#6B7280]">
              Northern Thailand border valleys experience crisp air from May to December and
              elevated regional smoke haze between February and April.
            </p>
          </div>
          <span className="text-xs text-[#6B7280]">Sample Seasonal PM2.5 Profile (µg/m³)</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8 bg-white rounded-xl border border-[#E5E9E2] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-sm font-bold text-[#26352A] inline-flex items-center gap-2">
                <Wind className="w-4 h-4 text-[#406246]" />
                <span>Monthly Average PM2.5 Concentration (µg/m³)</span>
              </h3>
              <div className="flex items-center gap-4 text-[11px] text-[#4B5563]">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#406246]" /> Clean (&le;35)
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#D97706]" /> Moderate (36–75)
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#B84040]" /> Elevated (&gt;75)
                </span>
              </div>
            </div>

            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MONTHLY_AIR_CLIMATE}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E9E2" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#26352A' }} />
                  <YAxis unit=" µg" tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <Tooltip
                    formatter={(val) => [`${val ?? 0} µg/m³`, 'Est. Monthly PM2.5']}
                  />
                  <Bar dataKey="pm25" radius={[4, 4, 0, 0]}>
                    {MONTHLY_AIR_CLIMATE.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={
                          entry.status === 'clean'
                            ? '#406246'
                            : entry.status === 'moderate'
                              ? '#D97706'
                              : '#B84040'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-[#f5f0de]/80 rounded-xl border border-[#E5E9E2] p-6 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <h3 className="font-display text-base font-bold text-[#26352A]">
                Visitor Travel Guidance by Season
              </h3>
              <div className="space-y-3 text-xs leading-relaxed text-[#374151]">
                <div className="bg-white rounded-lg p-3 border border-[#E5E9E2]">
                  <div className="font-bold text-[#406246]">Nov – Jan · Peak Cool Mist</div>
                  <p className="mt-0.5">
                    Cool mornings (18–23°C) ideal for Doi Pha Mee &amp; Doi Pha Hee cloud-sea
                    viewpoints and Wat Phra That Doi Wao.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-[#E5E9E2]">
                  <div className="font-bold text-[#B84040]">Feb – Apr · Dry &amp; Haze Watch</div>
                  <p className="mt-0.5">
                    Regional agricultural burning peaks in March. Check live PCD/Air4Thai AQI before
                    planning outdoor mountain treks.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-[#E5E9E2]">
                  <div className="font-bold text-[#26352A]">May – Oct · Emerald Green Season</div>
                  <p className="mt-0.5">
                    Cleanest air quality (12–26 µg/m³) and lush terraced hills; note deep Tham Luang
                    cave chambers close during heavy monsoon rains.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: 8 SUBDISTRICTS (TAMBONS) OF MAE SAI */}
      <section id="sec-subdistricts" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#26352A]">
              05. Administrative Subdistricts (8 Tambons of Mae Sai)
            </h2>
            <p className="text-sm text-[#6B7280]">
              All 8 subdistricts in Amphoe Mae Sai with sample population estimates paired with live
              platform place counts.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-[#E5E9E2] rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-[#406246]" />
            <input
              type="text"
              value={subdistrictQuery}
              onChange={(e) => setSubdistrictQuery(e.target.value)}
              placeholder="Filter Tambon..."
              className="text-xs focus:outline-none bg-transparent"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E9E2] overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#f5f0de]/80 border-b border-[#E5E9E2] text-xs text-[#26352A]">
                <th className="py-3 px-4 font-semibold">
                  <button
                    type="button"
                    onClick={() => handleSortSubdistrict('name')}
                    className="inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Subdistrict (Tambon)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 font-semibold text-right">
                  <button
                    type="button"
                    onClick={() => handleSortSubdistrict('areaKm2')}
                    className="inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Area (km²)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 font-semibold text-right">
                  <button
                    type="button"
                    onClick={() => handleSortSubdistrict('estPopulation')}
                    className="inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Est. Population</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 font-semibold text-right">Density / km²</th>
                <th className="py-3 px-4 font-semibold text-right">
                  <button
                    type="button"
                    onClick={() => handleSortSubdistrict('listedCount')}
                    className="inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Platform Places</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 font-semibold">Primary Tourism &amp; Economic Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9E2] text-xs sm:text-sm">
              {subdistrictRows.map((sd) => (
                <tr key={sd.name} className="hover:bg-[#fafaf8]">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#26352A]">{sd.name}</div>
                    <div className="text-xs text-[#6B7280]">{sd.thai}</div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono-tabular text-[#4B5563]">
                    {sd.areaKm2.toFixed(1)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono-tabular font-semibold text-[#26352A]">
                    {sd.estPopulation.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono-tabular text-[#6B7280]">
                    {sd.density.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono-tabular font-bold text-[#406246]">
                    {sd.listedCount}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-[#4B5563] max-w-md">{sd.focus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 6: LIVE PLATFORM TOURISM DATASET EXPLORER */}
      <section id="sec-dataset" className="space-y-5 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#26352A]">
              06. Live Platform Tourism Dataset ({places.length} Records)
            </h2>
            <p className="text-sm text-[#6B7280]">
              Category-level verification coverage, average estimated price ranges, and full
              searchable record table.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={datasetFilterCat}
              onValueChange={(val) => val && setDatasetFilterCat(val)}
            >
              <SelectTrigger
                aria-label="Filter dataset category"
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
            <button
              type="button"
              onClick={onExploreSubdistrict}
              className="px-3 py-2 text-xs font-semibold text-[#406246] bg-[#f5f0de] hover:bg-[#ebe3c8] rounded-lg cursor-pointer whitespace-nowrap"
            >
              Open Directory
            </button>
          </div>
        </div>

        {/* Category Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryPricingSummary.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-xl border border-[#E5E9E2] p-4 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#26352A] truncate">{cat.label}</span>
                <span className="font-mono-tabular font-bold text-[#406246]">
                  {cat.count}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                <span>Verified: {cat.verified}/{cat.count}</span>
                <span className="font-mono-tabular">
                  Avg ฿{cat.avgMin}–฿{cat.avgMax}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Complete Dataset Table */}
        <div className="bg-white rounded-xl border border-[#E5E9E2] overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f5f0de]/80 border-b border-[#E5E9E2] text-[#26352A]">
                <th className="py-3 px-4 font-semibold">ID</th>
                <th className="py-3 px-4 font-semibold">Place Name</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Subdistrict</th>
                <th className="py-3 px-4 font-semibold text-right">Est. Range (THB)</th>
                <th className="py-3 px-4 font-semibold">Verification</th>
                <th className="py-3 px-4 font-semibold text-right">Checked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9E2]">
              {datasetTablePlaces.map((p) => (
                <tr key={p.placeId} className="hover:bg-[#fafaf8]">
                  <td className="py-2.5 px-4 font-mono-tabular text-[#6B7280]">{p.placeId}</td>
                  <td className="py-2.5 px-4">
                    <button
                      type="button"
                      onClick={() => onSelectPlace(p.placeId)}
                      className="font-semibold text-[#26352A] hover:text-[#406246] text-left cursor-pointer"
                    >
                      {p.name}
                    </button>
                    <div className="text-[11px] text-[#6B7280]">{p.localName}</div>
                  </td>
                  <td className="py-2.5 px-4 text-[#4B5563]">{t.categories[p.categoryId]}</td>
                  <td className="py-2.5 px-4 text-[#4B5563]">{p.subdistrict}</td>
                  <td className="py-2.5 px-4 text-right font-mono-tabular text-[#26352A]">
                    {p.priceMax === 0 ? 'Free' : `฿${p.priceMin}–฿${p.priceMax}`}
                  </td>
                  <td className="py-2.5 px-4 text-[#406246] font-medium">
                    {t.verification[p.verificationStatus]}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono-tabular text-[#6B7280]">
                    {p.lastVerifiedAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
