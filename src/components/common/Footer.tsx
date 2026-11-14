'use client';

import React from 'react';
import { ExternalLink, MapPin, Globe } from 'lucide-react';
import { LanguageCode, PageRoute } from '../../types/tourism';
import { TRANSLATIONS } from '../../data/translations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FooterProps {
  lang: LanguageCode;
  onNavigate: (route: PageRoute) => void;
  totalPlaces: number;
  onChangeLang?: (lang: LanguageCode) => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, onNavigate, totalPlaces, onChangeLang }) => {
  const t = TRANSLATIONS[lang];

  return (
    <footer className="bg-[#26352A] text-[#E5E9E2] border-t border-[#406246]/40 mt-16">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand & Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-display font-bold text-lg">
              <MapPin className="w-5 h-5 text-[#f5f0de]" />
              <span>Mae Sai Tourism Intelligence &amp; Discovery</span>
            </div>
            <p className="text-sm text-[#E5E9E2]/80 leading-relaxed">
              A centralized civic &amp; community tourism discovery platform for Mae Sai District,
              Chiang Rai, Thailand — connecting visitors with real attractions, highland cafés,
              local businesses, and transparent geographic data.
            </p>
            <p className="text-xs text-[#f5f0de]/80">
              Prototype dataset: <span className="font-mono-tabular">{totalPlaces}</span> sample
              Mae Sai records. Not an exhaustive directory of all operating businesses.
            </p>
          </div>

          {/* Explore Links */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white mb-4">
              Visitor Platform
            </h3>
            <ul className="space-y-2.5 text-sm text-[#E5E9E2]/80">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('explore')}
                  className="hover:text-[#f5f0de] transition-colors cursor-pointer"
                >
                  {t.nav.explore}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('map')}
                  className="hover:text-[#f5f0de] transition-colors cursor-pointer"
                >
                  {t.nav.map}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('planner')}
                  className="hover:text-[#f5f0de] transition-colors cursor-pointer"
                >
                  {t.nav.planner}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('insights')}
                  className="hover:text-[#f5f0de] transition-colors cursor-pointer"
                >
                  {t.nav.insights}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('routes')}
                  className="hover:text-[#f5f0de] transition-colors cursor-pointer"
                >
                  {t.nav.routes}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('businesses')}
                  className="hover:text-[#f5f0de] transition-colors cursor-pointer"
                >
                  {t.nav.businesses}
                </button>
              </li>
            </ul>
          </div>

          {/* Governance & Support */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white mb-4">
              Project &amp; Governance
            </h3>
            <ul className="space-y-2.5 text-sm text-[#E5E9E2]/80">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#f5f0de] transition-colors cursor-pointer"
                >
                  About the Project &amp; Data Ethics
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#f5f0de] transition-colors cursor-pointer"
                >
                  Contact, Suggest Place &amp; Help
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('dataset')}
                  className="hover:text-[#f5f0de] transition-colors cursor-pointer"
                >
                  Mae Sai District Dataset Analysis
                </button>
              </li>
            </ul>
          </div>

          {/* Official Reference Sources */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white mb-4">
              Official Reference Sources
            </h3>
            <ul className="space-y-2.5 text-sm text-[#E5E9E2]/80">
              <li>
                <a
                  href="https://www.tourismthailand.org/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-[#f5f0de] transition-colors"
                >
                  <span>Tourism Authority of Thailand</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.chiangraiguide.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-[#f5f0de] transition-colors"
                >
                  <span>Chiang Rai Digital Tourism Directory</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.tourismchiangrai-phayao.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-[#f5f0de] transition-colors"
                >
                  <span>TAT Chiang Rai Regional Office</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#E5E9E2]/70">
          <p>
            Mae Sai Tourism Intelligence &amp; Discovery Platform · Prototype Edition · OpenStreetMap
            attribution &copy; OpenStreetMap contributors
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {onChangeLang && (
              <Select
                value={lang}
                onValueChange={(val) => val && onChangeLang(val as LanguageCode)}
              >
                <SelectTrigger
                  aria-label="Select language"
                  className="h-8 px-2.5 text-xs font-bold bg-white/10 border border-white/20 text-[#f5f0de] rounded-lg hover:bg-white/15 transition-colors gap-1.5 min-w-[76px]"
                >
                  <Globe className="w-3.5 h-3.5 text-[#f5f0de] shrink-0" />
                  <SelectValue>
                    {lang === 'my' ? 'MM' : lang.toUpperCase()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="min-w-[80px] bg-[#26352A] text-white border border-[#406246] shadow-md rounded-lg p-1">
                  <SelectItem value="en" className="text-xs font-bold cursor-pointer hover:bg-white/10 focus:bg-white/10">
                    EN
                  </SelectItem>
                  <SelectItem value="th" className="text-xs font-bold cursor-pointer hover:bg-white/10 focus:bg-white/10">
                    TH
                  </SelectItem>
                  <SelectItem value="my" className="text-xs font-bold cursor-pointer hover:bg-white/10 focus:bg-white/10">
                    MM
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
            <p>All prices and travel durations are labeled estimates for visitor planning.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
