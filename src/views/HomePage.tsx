'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Compass,
  Coffee,
  Utensils,
  Bed,
  Sparkles,
  ShoppingBag,
  Bike,
  Stethoscope,
  Map as MapIcon,
  ArrowRight,
  Route,
  Clock,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Car,
} from 'lucide-react';
import {
  CategoryId,
  LanguageCode,
  PageRoute,
  Place,
  SuggestedRoute,
} from '../types/tourism';
import { MAE_SAI_IMAGES } from '../data/assets';
import { CATEGORY_LIST, SUGGESTED_ROUTES } from '../data/maeSaiPlaces';
import { TRANSLATIONS } from '../data/translations';
import { TRANSPORT_CONFIG } from '../utils/geo';
import { PlaceCard } from '../components/common/PlaceCard';
import { PlaceImage } from '../components/common/PlaceImage';
import { MaeSaiLeafletMap } from '../components/map/MaeSaiLeafletMap';

interface HomePageProps {
  places: Place[];
  lang: LanguageCode;
  savedPlaceIds: string[];
  tripStopIds: string[];
  onSearchExplore: (query: string, category?: CategoryId) => void;
  onSelectPlace: (placeId: string) => void;
  onToggleSave: (placeId: string) => void;
  onAddToTrip: (placeId: string) => void;
  onNavigate: (route: PageRoute) => void;
  onLoadSuggestedRoute: (route: SuggestedRoute) => void;
}

const HERO_SLIDES = [
  {
    image: MAE_SAI_IMAGES.heroMountains,
    alt: 'Misty mountains of Doi Pha Mee and terraced highlands in Mae Sai, Chiang Rai',
    caption: 'Doi Pha Mee & Highlands',
  },
  {
    image: MAE_SAI_IMAGES.templeDoiWao,
    alt: 'Wat Phra That Doi Wao golden temple overlooking the Thai-Myanmar border',
    caption: 'Wat Phra That Doi Wao',
  },
  {
    image: MAE_SAI_IMAGES.caveThamLuang,
    alt: 'Lush mountain landscape and Tham Luang-Khun Nam Nang Non National Park',
    caption: 'Tham Luang Cave & Park',
  },
  {
    image: MAE_SAI_IMAGES.cafePhaMee,
    alt: 'Highland artisan coffee roasters overlooking mist-covered valleys',
    caption: 'Pha Mee Coffee Roasters',
  },
];

const MARQUEE_HIGHLIGHTS = [
  { icon: '⛰️', label: 'Doi Pha Mee', desc: 'Highland Arabica & Mountain Mist' },
  { icon: '⛩️', label: 'Wat Phra That Doi Wao', desc: 'Northernmost Border Stupa' },
  { icon: '🌿', label: 'Tham Luang Cave', desc: 'Forest Park & Khun Nam Nang Non' },
  { icon: '☕', label: 'Doi Pha Hee', desc: 'Artisan Micro-Roasteries' },
  { icon: '📜', label: 'Ban Pang Ha', desc: 'Tai Lue Mulberry Saa Paper' },
  { icon: '🛍️', label: 'Mae Sai Border Market', desc: 'Cross-Border Culture & Gemstones' },
  { icon: '🏞️', label: 'Emerald Lagoon', desc: 'Pond & Bamboo Walking Trails' },
  { icon: '🏕️', label: 'Highland Homestays', desc: 'Authentic Village Hospitality' },
  { icon: '🍜', label: 'Northern Cuisine', desc: 'Khao Soi, Nam Ngiaw & Farm Dining' },
  { icon: '🗺️', label: 'Civic Verified Records', desc: 'Open Tourism Discovery Platform' },
];

const CATEGORY_ICONS: Record<CategoryId, React.ReactNode> = {
  attractions: <Compass className="w-5 h-5 text-[#406246]" />,
  cafes: <Coffee className="w-5 h-5 text-[#406246]" />,
  restaurants: <Utensils className="w-5 h-5 text-[#406246]" />,
  accommodation: <Bed className="w-5 h-5 text-[#406246]" />,
  local_experiences: <Sparkles className="w-5 h-5 text-[#406246]" />,
  shopping: <ShoppingBag className="w-5 h-5 text-[#406246]" />,
  transportation: <Bike className="w-5 h-5 text-[#406246]" />,
  facilities: <Stethoscope className="w-5 h-5 text-[#406246]" />,
};

export const HomePage: React.FC<HomePageProps> = ({
  places,
  lang,
  savedPlaceIds,
  tripStopIds,
  onSearchExplore,
  onSelectPlace,
  onToggleSave,
  onAddToTrip,
  onNavigate,
  onLoadSuggestedRoute,
}) => {
  const [heroQuery, setHeroQuery] = useState('');
  const [previewSelectedId, setPreviewSelectedId] = useState<string | null>('ms-01');
  const [currentSlide, setCurrentSlide] = useState(0);
  const t = TRANSLATIONS[lang];

  // Automatic carousel transition every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  // Category Carousel: Mouse drag & Auto-scroll controls
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [isCategoryDragging, setIsCategoryDragging] = useState(false);
  const [categoryStartX, setCategoryStartX] = useState(0);
  const [categoryScrollLeft, setCategoryScrollLeft] = useState(0);
  const [hasCategoryDragged, setHasCategoryDragged] = useState(false);
  const [isCategoryHovered, setIsCategoryHovered] = useState(false);
  const [activeCategoryDot, setActiveCategoryDot] = useState(0);

  // Continuous smooth auto-glide marquee (NO DELAY, relaxed and gentle pace)
  useEffect(() => {
    let animId: number;
    const speed = 0.35; // reduced smooth speed (gentle, relaxed glide)

    const step = () => {
      const el = categoryScrollRef.current;
      if (el && !isCategoryHovered && !isCategoryDragging) {
        el.scrollLeft += speed;
        // Seamless infinite loop when reaching middle of duplicated list
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft -= el.scrollWidth / 2;
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isCategoryHovered, isCategoryDragging]);

  const handleCategoryScroll = () => {
    const el = categoryScrollRef.current;
    if (!el) return;
    const cardWidth = 320;
    const index = Math.round(el.scrollLeft / cardWidth);
    setActiveCategoryDot(Math.min(Math.max(0, index), CATEGORY_LIST.length - 1));
  };

  const handleCategoryMouseDown = (e: React.MouseEvent) => {
    const el = categoryScrollRef.current;
    if (!el) return;
    setIsCategoryDragging(true);
    setHasCategoryDragged(false);
    setCategoryStartX(e.pageX - el.offsetLeft);
    setCategoryScrollLeft(el.scrollLeft);
  };

  const handleCategoryMouseMove = (e: React.MouseEvent) => {
    if (!isCategoryDragging) return;
    const el = categoryScrollRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - categoryStartX) * 1.5;
    if (Math.abs(walk) > 4) {
      setHasCategoryDragged(true);
    }
    el.scrollLeft = categoryScrollLeft - walk;
  };

  const handleCategoryMouseUp = () => {
    setIsCategoryDragging(false);
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    const el = categoryScrollRef.current;
    if (!el) return;
    const amount = 320;
    el.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  const scrollToCategoryIndex = (idx: number) => {
    const el = categoryScrollRef.current;
    if (!el) return;
    const amount = 320 * idx;
    el.scrollTo({ left: amount, behavior: 'smooth' });
  };

  // 1 row of popular destinations (3 cards)
  const popularPlaces = places
    .filter((p) => ['ms-01', 'ms-02', 'ms-04', 'ms-03', 'ms-05', 'ms-06'].includes(p.placeId))
    .slice(0, 3);

  // 1 row of featured cafes & food (3 cards)
  const featuredCafesAndFood = places
    .filter((p) => p.categoryId === 'cafes' || p.categoryId === 'restaurants')
    .slice(0, 3);

  // 1 row of community and local businesses (3 cards)
  const communityAndLocal = places.filter(
    (p) =>
      p.categoryId === 'local_experiences' ||
      p.categoryId === 'shopping' ||
      p.placeId === 'ms-20' ||
      p.placeId === 'ms-17'
  );

  const verifiedCount = places.filter((p) => p.verificationStatus === 'verified').length;
  const subdistrictsCount = new Set(places.map((p) => p.subdistrict)).size;
  const previewPlace = places.find((p) => p.placeId === previewSelectedId) || places[0];

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchExplore(heroQuery.trim());
  };

  return (
    <div>
      {/* 1. Hero Section with Automatic Carousel Background */}
      <section className="relative w-full min-h-[540px] lg:min-h-[620px] flex items-center overflow-hidden bg-[#26352A]">
        {/* Background Images Carousel */}
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <PlaceImage
              src={slide.image}
              alt={slide.alt}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#17211a]/92 via-[#1d2a21]/78 to-[#1d2a21]/45"
        />

        {/* Carousel Floating Controls & Indicators */}
        <div className="absolute bottom-6 right-6 z-20 hidden sm:flex items-center gap-2.5 bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/20 shadow-lg">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous background image"
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-1">
            {HERO_SLIDES.map((slide, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}: ${slide.caption}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  index === currentSlide
                    ? 'w-7 bg-[#f5f0de]'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next background image"
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono-tabular font-medium text-white/85 pl-1.5 border-l border-white/20">
            {HERO_SLIDES[currentSlide].caption}
          </span>
        </div>

        {/* Mobile slide indicator pills */}
        <div className="sm:hidden absolute bottom-3 left-0 right-0 z-20 flex justify-center items-center gap-1.5">
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-5 bg-[#f5f0de]' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl space-y-6">
            <p className="text-xs sm:text-sm font-semibold text-[#f5f0de] tracking-wider uppercase">
              {t.hero.kicker}
            </p>
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-[1.12]">
              {t.hero.headline}
            </h1>
            <p className="text-base sm:text-lg text-[#E5E9E2] leading-[1.625]">
              {t.hero.subheadline}
            </p>

            {/* Large Search Bar */}
            <form
              onSubmit={handleHeroSubmit}
              className="bg-white p-2 rounded-xl shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl"
            >
              <div className="flex items-center gap-2.5 flex-1 px-3 py-2">
                <Search className="w-5 h-5 text-[#406246] shrink-0" />
                <input
                  type="text"
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  placeholder={t.hero.searchPlaceholder}
                  aria-label={t.hero.searchPlaceholder}
                  className="w-full text-base text-[#1c241e] placeholder-[#6B7280] focus:outline-none bg-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 text-base font-semibold text-white bg-[#406246] hover:bg-[#26352A] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t.hero.ctaPrimary}
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('planner')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#f5f0de] hover:text-white transition-colors cursor-pointer"
              >
                <span>{t.hero.ctaSecondary}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-white/30" aria-hidden="true">
                |
              </span>
              <button
                type="button"
                onClick={() => onNavigate('map')}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#E5E9E2] hover:text-white transition-colors cursor-pointer"
              >
                <MapIcon className="w-4 h-4" />
                <span>{t.nav.map}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Live Tourism Highlights Marquee Ribbon */}
      <div className="bg-[#1b261e] border-y border-[#406246]/40 py-3 overflow-hidden shadow-inner select-none">
        <div className="animate-marquee flex items-center">
          {[...MARQUEE_HIGHLIGHTS, ...MARQUEE_HIGHLIGHTS].map((item, idx) => (
            <div
              key={idx}
              onClick={() => onSearchExplore(item.label)}
              className="inline-flex items-center gap-2.5 px-6 whitespace-nowrap cursor-pointer transition-colors text-xs sm:text-sm text-[#E5E9E2]/85 hover:text-white group"
            >
              <span className="text-base select-none">{item.icon}</span>
              <span className="font-semibold text-white tracking-wide group-hover:text-[#f5f0de] transition-colors">
                {item.label}
              </span>
              <span className="text-xs text-[#f5f0de]/70 font-normal">· {item.desc}</span>
              <span className="ml-4 text-white/20 select-none">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Popular Destinations */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-normal text-[#26352A]">
              {t.sections.popularDestinations}
            </h2>
            <p className="text-base text-[#6B7280] leading-[1.625] mt-1">
              {t.sections.popularSub}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSearchExplore('', 'attractions')}
            className="inline-flex items-center gap-1.5 text-base font-semibold text-[#406246] hover:text-[#26352A] cursor-pointer whitespace-nowrap"
          >
            <span>All attractions</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularPlaces.map((place) => (
            <PlaceCard
              key={place.placeId}
              place={place}
              lang={lang}
              isSaved={savedPlaceIds.includes(place.placeId)}
              isInTrip={tripStopIds.includes(place.placeId)}
              onSelectPlace={onSelectPlace}
              onToggleSave={onToggleSave}
              onAddToTrip={onAddToTrip}
            />
          ))}
        </div>
      </section>

      {/* 3. Explore by Category (Secondary Color with Continuous Marquee & Mouse Controls) */}
      <section className="bg-[#f5f0de] border-y border-[#E5E9E2] py-8 sm:py-10 overflow-hidden">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#406246]/10 text-xs font-semibold text-[#406246] mb-1.5 uppercase tracking-wider">
                Discover Mae Sai
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-normal text-[#26352A]">
                {t.sections.categoriesTitle}
              </h2>
              <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed mt-0.5 max-w-xl">
                {t.sections.categoriesSub}
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              {/* Carousel Mouse Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollCategories('left')}
                  aria-label="Previous category"
                  className="w-9 h-9 rounded-full border border-[#406246]/25 bg-white text-[#26352A] hover:bg-[#406246] hover:text-white hover:border-[#406246] transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCategories('right')}
                  aria-label="Next category"
                  className="w-9 h-9 rounded-full border border-[#406246]/25 bg-white text-[#26352A] hover:bg-[#406246] hover:text-white hover:border-[#406246] transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <span className="hidden sm:inline-block text-[#26352A]/20" aria-hidden="true">|</span>

              <button
                type="button"
                onClick={() => onSearchExplore('')}
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#406246] hover:text-[#26352A] cursor-pointer whitespace-nowrap"
              >
                <span>Browse full directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Mouse Drag & Continuous Smooth Auto-Glide Track */}
          <div
            ref={categoryScrollRef}
            onScroll={handleCategoryScroll}
            onMouseDown={handleCategoryMouseDown}
            onMouseMove={handleCategoryMouseMove}
            onMouseUp={handleCategoryMouseUp}
            onMouseLeave={() => {
              handleCategoryMouseUp();
              setIsCategoryHovered(false);
            }}
            onMouseEnter={() => setIsCategoryHovered(true)}
            className={`flex gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 select-none ${
              isCategoryDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {[...CATEGORY_LIST, ...CATEGORY_LIST].map((cat, idx) => {
              const count = places.filter((p) => p.categoryId === cat.id).length;
              return (
                <div
                  key={`${cat.id}-${idx}`}
                  onClick={() => {
                    if (!hasCategoryDragged) {
                      onSearchExplore('', cat.id);
                    }
                  }}
                  className="min-w-[240px] sm:min-w-[260px] max-w-[270px] shrink-0 bg-white p-4.5 rounded-2xl border border-[#E5E9E2] hover:border-[#406246] hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between group active:scale-[0.99]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2.5 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#f5f0de] flex items-center justify-center shrink-0 group-hover:bg-[#406246] group-hover:text-white transition-colors duration-300">
                        {CATEGORY_ICONS[cat.id]}
                      </div>
                      <span className="text-xs font-mono-tabular font-medium text-[#406246] bg-[#406246]/10 px-2.5 py-0.5 rounded-full">
                        {count} {count === 1 ? 'place' : 'places'}
                      </span>
                    </div>

                    <h3 className="font-display text-base font-normal text-[#26352A] group-hover:text-[#406246] transition-colors line-clamp-1">
                      {t.categories[cat.id]}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#6B7280] mt-1 line-clamp-2 leading-relaxed">
                      {cat.shortDesc}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#E5E9E2] flex items-center justify-between text-xs font-semibold text-[#406246] group-hover:translate-x-0.5 transition-transform">
                    <span>Explore category</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Compact Indicators */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {CATEGORY_LIST.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToCategoryIndex(idx)}
                aria-label={`Jump to category ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  activeCategoryDot === idx
                    ? 'w-5 bg-[#406246]'
                    : 'w-1.5 bg-[#406246]/25 hover:bg-[#406246]/50'
                }`}
              />
            ))}
          </div>

          <div className="sm:hidden text-center mt-3">
            <button
              type="button"
              onClick={() => onSearchExplore('')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#406246] hover:text-[#26352A] cursor-pointer"
            >
              <span>Browse full directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. Featured Coffee Shops & Restaurants */}
      <section className="bg-white border-y border-[#E5E9E2] py-16">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-normal text-[#26352A]">
                {t.sections.featuredFoodCafe}
              </h2>
              <p className="text-base text-[#6B7280] leading-[1.625] mt-1">
                {t.sections.featuredFoodCafeSub}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSearchExplore('', 'cafes')}
              className="inline-flex items-center gap-1.5 text-base font-semibold text-[#406246] hover:text-[#26352A] cursor-pointer whitespace-nowrap"
            >
              <span>Explore cafés &amp; dining</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCafesAndFood.map((place) => (
              <PlaceCard
                key={place.placeId}
                place={place}
                lang={lang}
                isSaved={savedPlaceIds.includes(place.placeId)}
                isInTrip={tripStopIds.includes(place.placeId)}
                onSelectPlace={onSelectPlace}
                onToggleSave={onToggleSave}
                onAddToTrip={onAddToTrip}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Discover Local Businesses & Community Experiences */}
      <section className="bg-[#f5f0de]/65 border-b border-[#E5E9E2] py-16">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-normal text-[#26352A]">
                {t.sections.localBusinessesTitle}
              </h2>
              <p className="text-base text-[#6B7280] leading-[1.625] mt-1">
                {t.sections.localBusinessesSub}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('businesses')}
              className="inline-flex items-center gap-1.5 text-base font-semibold text-[#406246] hover:text-[#26352A] cursor-pointer whitespace-nowrap"
            >
              <span>Visit Local Business Directory</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communityAndLocal.slice(0, 3).map((place) => (
              <PlaceCard
                key={place.placeId}
                place={place}
                lang={lang}
                isSaved={savedPlaceIds.includes(place.placeId)}
                isInTrip={tripStopIds.includes(place.placeId)}
                onSelectPlace={onSelectPlace}
                onToggleSave={onToggleSave}
                onAddToTrip={onAddToTrip}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Interactive Tourism Map Preview */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-5 flex flex-col justify-between bg-white rounded-xl border border-[#E5E9E2] p-6 sm:p-8">
            <div className="space-y-4">
              <h2 className="font-display text-2xl sm:text-3xl font-normal text-[#26352A]">
                {t.sections.mapPreviewTitle}
              </h2>
              <p className="text-base text-[#4B5563] leading-[1.625]">
                {t.sections.mapPreviewSub}
              </p>

              {previewPlace && (
                <div className="pt-4 border-t border-[#E5E9E2] space-y-3">
                  <div className="text-sm font-semibold text-[#406246]">
                    Selected Map Marker
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0 bg-[#E5E9E2]">
                      <PlaceImage
                        src={previewPlace.mainImage}
                        alt={previewPlace.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-normal text-[#26352A] text-base truncate">
                        {previewPlace.name}
                      </h3>
                      <p className="text-sm text-[#6B7280] mt-0.5">
                        {t.categories[previewPlace.categoryId]} · {previewPlace.subdistrict}
                      </p>
                      <button
                        type="button"
                        onClick={() => onSelectPlace(previewPlace.placeId)}
                        className="text-sm font-semibold text-[#406246] hover:underline mt-1.5 cursor-pointer"
                      >
                        {t.common.viewDetails} →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('map')}
                className="px-5 py-2.5 text-base font-semibold text-white bg-[#406246] hover:bg-[#26352A] rounded-lg transition-colors cursor-pointer"
              >
                {t.common.openMap}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('insights')}
                className="px-5 py-2.5 text-base font-semibold text-[#26352A] bg-[#f5f0de] hover:bg-[#ebe3c8] rounded-lg transition-colors cursor-pointer"
              >
                {t.nav.insights}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-xl overflow-hidden border border-[#E5E9E2] min-h-[380px] bg-[#E5E9E2]">
            <MaeSaiLeafletMap
              places={places}
              selectedPlaceId={previewSelectedId}
              onSelectPlace={(id) => setPreviewSelectedId(id)}
              heightClass="h-[380px] lg:h-full w-full"
            />
          </div>
        </div>
      </section>

      {/* 7. Suggested Travel Routes */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-normal text-[#26352A]">
              {t.sections.suggestedRoutesTitle}
            </h2>
            <p className="text-base text-[#6B7280] leading-[1.625] mt-1">
              {t.sections.suggestedRoutesSub}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('routes')}
            className="inline-flex items-center gap-1.5 text-base font-semibold text-[#406246] hover:text-[#26352A] cursor-pointer whitespace-nowrap"
          >
            <span>All suggested routes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUGGESTED_ROUTES.slice(0, 3).map((route) => {
            const stops = route.stopIds
              .map((id) => places.find((p) => p.placeId === id))
              .filter((p): p is Place => Boolean(p));
            const firstStop = stops[0];

            return (
              <article
                key={route.routeId}
                className="bg-white rounded-2xl border border-[#E5E9E2] overflow-hidden flex flex-col hover:shadow-xl hover:border-[#406246]/40 transition-all duration-300 group"
              >
                {/* Header Image Banner with Gradient & Badges */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#E5E9E2]">
                  <PlaceImage
                    src={firstStop?.mainImage || MAE_SAI_IMAGES.heroMountains}
                    alt={route.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-black/50 backdrop-blur-md text-white border border-white/20 inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#f5f0de]" />
                      <span>{route.durationLabel}</span>
                    </span>

                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#406246]/90 backdrop-blur-md text-white border border-white/20 capitalize tracking-wide">
                      {route.theme}
                    </span>
                  </div>

                  {/* Bottom Badges */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-medium">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/40 backdrop-blur-md text-white/95">
                      <Car className="w-3.5 h-3.5 text-[#f5f0de]" />
                      <span>{TRANSPORT_CONFIG[route.recommendedTransport]?.label || 'Vehicle'}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white/25 backdrop-blur-md font-mono-tabular">
                      {stops.length} curated stops
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    {/* Title */}
                    <h3 className="font-display text-lg sm:text-xl font-normal text-[#26352A] group-hover:text-[#406246] transition-colors leading-snug line-clamp-2">
                      {route.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-[#4B5563] line-clamp-2 leading-[1.6]">
                      {route.description}
                    </p>

                    {/* Step-by-Step Clean Timeline */}
                    <div className="pt-2">
                      <div className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#406246]" />
                        <span>Itinerary Stops</span>
                      </div>

                      <div className="space-y-1.5 bg-[#fafaf8] p-2.5 rounded-xl border border-[#E5E9E2]/80">
                        {stops.slice(0, 4).map((stop, i) => (
                          <div
                            key={stop.placeId}
                            onClick={() => onSelectPlace(stop.placeId)}
                            className="flex items-center gap-2.5 text-xs text-[#26352A] hover:text-[#406246] cursor-pointer group/stop p-1 rounded-md hover:bg-white transition-colors"
                          >
                            <span className="w-5 h-5 rounded-full bg-[#f5f0de] text-[#406246] group-hover/stop:bg-[#406246] group-hover/stop:text-white font-mono font-bold flex items-center justify-center shrink-0 text-[11px] transition-colors shadow-2xs">
                              {i + 1}
                            </span>
                            <span className="truncate font-medium flex-1">
                              {stop.name}
                            </span>
                            <span className="text-[11px] text-[#7D8C81] shrink-0 font-mono-tabular">
                              ~{stop.estimatedVisitMinutes}m
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3.5 border-t border-[#E5E9E2] flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] text-[#7D8C81] uppercase font-semibold">Est. Budget</div>
                      <div className="font-mono-tabular text-xs sm:text-sm font-bold text-[#26352A]">
                        {route.estimatedBudgetPerPerson}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onLoadSuggestedRoute(route)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#406246] hover:bg-[#26352A] rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer whitespace-nowrap active:scale-95"
                    >
                      <Route className="w-3.5 h-3.5" />
                      <span>Load in Planner</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};
