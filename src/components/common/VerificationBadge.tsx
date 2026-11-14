'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Clock, HelpCircle } from 'lucide-react';
import { LanguageCode, VerificationStatus } from '../../types/tourism';
import { TRANSLATIONS } from '../../data/translations';

interface VerificationBadgeProps {
  status: VerificationStatus;
  lang: LanguageCode;
  compact?: boolean;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  lang,
  compact = false,
}) => {
  const label = TRANSLATIONS[lang].verification[status];

  const config: Record<
    VerificationStatus,
    { icon: React.ReactNode; textClass: string }
  > = {
    verified: {
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#406246] shrink-0" />,
      textClass: 'text-[#406246]',
    },
    partially_verified: {
      icon: <Clock className="w-3.5 h-3.5 text-[#D97706] shrink-0" />,
      textClass: 'text-[#B45309]',
    },
    not_yet_verified: {
      icon: <HelpCircle className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />,
      textClass: 'text-[#4B5563]',
    },
    needs_updating: {
      icon: <AlertCircle className="w-3.5 h-3.5 text-[#B84040] shrink-0" />,
      textClass: 'text-[#B84040]',
    },
  };

  const current = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium ${
        compact ? 'text-xs' : 'text-xs sm:text-sm'
      } ${current.textClass} whitespace-nowrap`}
    >
      {current.icon}
      <span>{label}</span>
    </span>
  );
};
