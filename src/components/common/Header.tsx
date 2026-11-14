'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Bookmark, Globe, BarChart3 } from 'lucide-react';
import { LanguageCode, PageRoute } from '../../types/tourism';
import { TRANSLATIONS } from '../../data/translations';
import { useTourism } from '../../context/TourismContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HeaderProps {
  activeRoute?: PageRoute;
  onNavigate?: (route: PageRoute) => void;
  lang?: LanguageCode;
  onChangeLang?: (lang: LanguageCode) => void;
  savedCount?: number;
  tripStopsCount?: number;
  onOpenSaved?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeRoute,
  onNavigate,
  lang: propLang,
  onChangeLang: propOnChangeLang,
  savedCount: propSavedCount,
  tripStopsCount: propTripStopsCount,
  onOpenSaved: propOnOpenSaved,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Consume context if props are omitted
  let contextLang: LanguageCode = 'en';
  let contextSetLang: (l: LanguageCode) => void = () => {};
  let contextSavedCount = 0;
  let contextTripStopsCount = 0;
  let contextOpenSaved = () => {};

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const tourism = useTourism();
    contextLang = tourism.lang;
    contextSetLang = tourism.setLang;
    contextSavedCount = tourism.savedPlaceIds.length;
    contextTripStopsCount = tourism.tripStops.length;
    contextOpenSaved = () => tourism.setSavedDrawerOpen(true);
  } catch {
    // Rendered outside of TourismProvider
  }

  const lang = propLang ?? contextLang;
  const onChangeLang = propOnChangeLang ?? contextSetLang;
  const savedCount = propSavedCount ?? contextSavedCount;
  const tripStopsCount = propTripStopsCount ?? contextTripStopsCount;
  const onOpenSaved = propOnOpenSaved ?? contextOpenSaved;

  const t = TRANSLATIONS[lang];

  const mainNav: { href: string; route: PageRoute; label: string }[] = [
    { href: '/', route: 'home', label: t.nav.home },
    { href: '/explore', route: 'explore', label: t.nav.explore },
    { href: '/map', route: 'map', label: t.nav.map },
    { href: '/planner', route: 'planner', label: t.nav.planner },
    { href: '/insights', route: 'insights', label: t.nav.insights },
    { href: '/businesses', route: 'businesses', label: t.nav.businesses },
  ];

  const isItemActive = (href: string, route: PageRoute) => {
    if (activeRoute) {
      return activeRoute === route || (route === 'explore' && activeRoute === 'place_detail');
    }
    if (href === '/') return pathname === '/';
    if (href === '/explore') return pathname.startsWith('/explore') || pathname.startsWith('/places');
    return pathname.startsWith(href);
  };

  const handleLinkClick = (route: PageRoute) => {
    onNavigate?.(route);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#E5E9E2]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Single-line Brand Wordmark */}
        <Link
          href="/"
          onClick={() => handleLinkClick('home')}
          className="font-display text-xl sm:text-2xl font-normal tracking-tight text-[#26352A] hover:text-[#406246] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#406246]"
        >
          {t.brandTitle}
        </Link>

        {/* Zone 2: Clean single-line Navigation Links */}
        <nav
          aria-label="Main navigation"
          className="hidden lg:flex items-center gap-6 text-base font-medium"
        >
          {mainNav.map((item) => {
            const isActive = isItemActive(item.href, item.route);
            return (
              <Link
                key={item.route}
                href={item.href}
                onClick={() => handleLinkClick(item.route)}
                className={`relative py-1 whitespace-nowrap shrink-0 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#406246] ${
                  isActive
                    ? 'text-[#406246] font-semibold'
                    : 'text-[#4B5563] hover:text-[#26352A]'
                }`}
              >
                {item.label}
                {item.route === 'planner' && tripStopsCount > 0 && (
                  <span className="ml-1.5 font-mono-tabular text-xs text-[#406246]">
                    ({tripStopsCount})
                  </span>
                )}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 -bottom-[21px] h-0.5 bg-[#406246]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Language Selector & Utility Action */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:block">
            <Select
              value={lang}
              onValueChange={(val) => val && onChangeLang(val as LanguageCode)}
            >
              <SelectTrigger
                aria-label="Select language"
                className="h-8 px-2.5 text-xs font-bold bg-[#fafaf8] border border-[#E5E9E2] text-[#26352A] rounded-lg hover:bg-[#f0f3ed] transition-colors gap-1.5 min-w-[76px]"
              >
                <Globe className="w-3.5 h-3.5 text-[#406246] shrink-0" />
                <SelectValue>
                  {lang === 'my' ? 'MM' : lang.toUpperCase()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="min-w-[80px] bg-white border border-[#E5E9E2] shadow-md rounded-lg p-1">
                <SelectItem value="en" className="text-xs font-bold cursor-pointer">
                  EN
                </SelectItem>
                <SelectItem value="th" className="text-xs font-bold cursor-pointer">
                  TH
                </SelectItem>
                <SelectItem value="my" className="text-xs font-bold cursor-pointer">
                  MM
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <button
            type="button"
            onClick={onOpenSaved}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#26352A] bg-[#f5f0de] hover:bg-[#ebe3c8] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            aria-label={t.nav.saved}
          >
            <Bookmark className="w-3.5 h-3.5 text-[#406246]" />
            <span>{t.nav.saved}</span>
            {savedCount > 0 && (
              <span className="font-mono-tabular text-[#406246] font-semibold">
                ({savedCount})
              </span>
            )}
          </button>

          <Link
            href="/dataset"
            onClick={() => handleLinkClick('dataset')}
            className={`hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              pathname.startsWith('/dataset')
                ? 'bg-[#26352A] text-white'
                : 'bg-[#406246] text-white hover:bg-[#26352A]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{t.nav.dataset}</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#E5E9E2] text-[#26352A] hover:bg-[#f5f0de] cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-b border-[#E5E9E2] px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {mainNav.map((item) => {
              const isActive = isItemActive(item.href, item.route);
              return (
                <Link
                  key={item.route}
                  href={item.href}
                  onClick={() => handleLinkClick(item.route)}
                  className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#406246] text-white'
                      : 'bg-[#fafaf8] text-[#26352A] hover:bg-[#f5f0de]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/routes"
              onClick={() => handleLinkClick('routes')}
              className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer ${
                pathname.startsWith('/routes')
                  ? 'bg-[#406246] text-white'
                  : 'bg-[#fafaf8] text-[#26352A] hover:bg-[#f5f0de]'
              }`}
            >
              {t.nav.routes}
            </Link>
            <Link
              href="/about"
              onClick={() => handleLinkClick('about')}
              className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer ${
                pathname.startsWith('/about')
                  ? 'bg-[#406246] text-white'
                  : 'bg-[#fafaf8] text-[#26352A] hover:bg-[#f5f0de]'
              }`}
            >
              {t.nav.about}
            </Link>
          </div>

          <div className="pt-3 border-t border-[#E5E9E2] flex flex-wrap items-center justify-between gap-2">
            <Select
              value={lang}
              onValueChange={(val) => val && onChangeLang(val as LanguageCode)}
            >
              <SelectTrigger
                aria-label="Select language"
                className="h-8 px-2.5 text-xs font-bold bg-[#fafaf8] border border-[#E5E9E2] text-[#26352A] rounded-lg gap-1.5 min-w-[80px]"
              >
                <Globe className="w-3.5 h-3.5 text-[#406246] shrink-0" />
                <SelectValue>
                  {lang === 'my' ? 'MM' : lang.toUpperCase()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="min-w-[80px] bg-white border border-[#E5E9E2] shadow-md rounded-lg p-1">
                <SelectItem value="en" className="text-xs font-bold cursor-pointer">
                  EN
                </SelectItem>
                <SelectItem value="th" className="text-xs font-bold cursor-pointer">
                  TH
                </SelectItem>
                <SelectItem value="my" className="text-xs font-bold cursor-pointer">
                  MM
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenSaved();
                }}
                className="px-3 py-2 text-xs font-medium bg-[#f5f0de] text-[#26352A] rounded-lg cursor-pointer"
              >
                {t.nav.saved} ({savedCount})
              </button>
              <Link
                href="/dataset"
                onClick={() => handleLinkClick('dataset')}
                className="px-3 py-2 text-xs font-semibold bg-[#406246] text-white rounded-lg cursor-pointer inline-flex items-center"
              >
                {t.nav.dataset}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
