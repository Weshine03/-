/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star } from 'lucide-react';

interface StarDisplayProps {
  score: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const StarDisplay: React.FC<StarDisplayProps> = ({
  score,
  max = 5,
  size = 'md',
  showLabel = true,
}) => {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm font-semibold',
    lg: 'text-lg font-bold',
  };

  return (
    <div className="inline-flex items-center gap-1.5" aria-label={`得分：${score} / ${max} 顆星`}>
      <div className="flex items-center gap-1">
        {Array.from({ length: max }).map((_, index) => {
          const isFilled = index < score;
          return (
            <Star
              key={index}
              className={`${iconSizes[size]} transition-all duration-300 ${
                isFilled
                  ? 'fill-amber-400 text-amber-500 scale-105 drop-shadow-sm'
                  : 'fill-slate-100 text-slate-300'
              }`}
            />
          );
        })}
      </div>
      {showLabel && (
        <span className={`text-slate-700 ml-1.5 tabular-nums ${textSizes[size]}`}>
          {score} / {max} 星
        </span>
      )}
    </div>
  );
};
