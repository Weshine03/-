/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Square, RotateCcw } from 'lucide-react';
import { soundEngine } from '../utils/audioSynthesizer.ts';

interface AudioPlayerProps {
  soundType?: 'rain' | 'bell' | 'wind' | 'bird' | 'water_kettle';
  label?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  soundType = 'rain',
  label = '點擊播放並仔細聆聽聲音',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      soundEngine.stopSound();
    };
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      soundEngine.stopSound();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      soundEngine.playSound(soundType, () => {
        setIsPlaying(false);
      });
    }
  };

  const soundNameMap: Record<string, string> = {
    rain: '雨水落在石磚與街道上的聲音',
    bell: '校園悠揚清脆的鐘聲',
    wind: '微風拂過大樹樹葉的沙沙聲',
    bird: '清晨枝頭小鳥清脆的啾啾叫聲',
    water_kettle: '熱水壺燒開時的哨聲',
  };

  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-blue-200/80 rounded-2xl space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-blue-900 flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-blue-600" />
          <span>聽覺專屬素材：{soundNameMap[soundType] || '情境聲音'}</span>
        </span>
        <span className="text-[11px] text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full font-medium">
          可重複播放聆聽
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleTogglePlay}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
            isPlaying
              ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 active:scale-98'
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>停止播放</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>播放聲音素材</span>
            </>
          )}
        </button>

        {/* Audio Waveform Animation when playing */}
        <div className="flex-1 flex items-center gap-1 h-6 px-3 bg-white/70 rounded-xl border border-blue-100 overflow-hidden">
          {isPlaying ? (
            <div className="flex items-center gap-1 w-full justify-center">
              {[40, 70, 100, 60, 30, 80, 50, 90, 60, 40].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-blue-500 rounded-full animate-pulse"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${i * 80}ms`,
                    animationDuration: '600ms',
                  }}
                />
              ))}
            </div>
          ) : (
            <span className="text-[11px] text-slate-400">點擊左側按鈕開始播放音訊</span>
          )}
        </div>
      </div>

      <p className="text-[11px] text-slate-500 leading-normal">
        💡 建議：戴上耳機或把音量調到適中，閉上眼睛聽兩遍，注意聲音是清脆還是低沉？節奏是快是慢？
      </p>
    </div>
  );
};
