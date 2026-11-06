/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, Sparkles } from 'lucide-react';

interface StampBadgeProps {
  name: string;
  icon: string;
  isFullStar?: boolean;
  earnedDate?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StampBadge: React.FC<StampBadgeProps> = ({
  name,
  icon,
  isFullStar = false,
  earnedDate,
  size = 'md',
}) => {
  const containerClasses = {
    sm: 'w-20 h-20 p-2 text-xs',
    md: 'w-28 h-28 p-3 text-xs',
    lg: 'w-36 h-36 p-4 text-sm',
  };

  const iconSizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl',
  };

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center rounded-2xl border-2 transition-transform hover:scale-105 ${
        containerClasses[size]
      } ${
        isFullStar
          ? 'border-amber-400 bg-gradient-to-b from-amber-50 to-orange-50 shadow-md shadow-amber-100 text-amber-900'
          : 'border-emerald-300 bg-gradient-to-b from-emerald-50 to-teal-50 shadow-md shadow-emerald-100 text-emerald-900'
      }`}
    >
      <div className="absolute top-1.5 right-1.5 opacity-80">
        {isFullStar ? (
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
        ) : (
          <Award className="w-4 h-4 text-emerald-600" />
        )}
      </div>

      <div className={`my-1 select-none ${iconSizes[size]}`}>{icon}</div>
      <div className="font-bold text-center leading-tight line-clamp-2 px-1">
        {name}
      </div>

      {earnedDate && (
        <span className="text-[10px] text-slate-500 mt-1 tabular-nums">
          {new Date(earnedDate).toLocaleDateString('zh-TW')}
        </span>
      )}
    </div>
  );
};
