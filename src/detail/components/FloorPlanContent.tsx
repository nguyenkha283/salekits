import React, { useState } from 'react';
import { ImageIcon, MapIcon, MapPinIcon } from 'lucide-react';

type MapMode = 'satellite' | 'static';

const STATIC_PLAN_URL = '/688da3c2-8d95-4650-9f33-bb0bfb6d4692.jpg';
const SATELLITE_MAP_URL = 'https://www.google.com/maps?q=21.010388308184133,105.72401667701425&z=18&t=k&output=embed';

export function FloorPlanContent() {
  const [mode, setMode] = useState<MapMode>('satellite');

  return (
    <section className="w-full bg-[#f7f4ef]" aria-label="Mặt bằng dự án">
      <div className={`relative bg-stone-200 ${mode === 'satellite' ? 'h-[100dvh] overflow-hidden' : 'min-h-[100dvh]'}`}>
        <div className="absolute left-4 top-4 z-20 flex flex-col gap-2 sm:left-6 sm:top-6">
          <MapControl active={mode === 'satellite'} label="Bản đồ vệ tinh" icon={MapIcon} onClick={() => setMode('satellite')} />
          <MapControl active={mode === 'static'} label="Bản đồ ảnh tĩnh" icon={ImageIcon} onClick={() => setMode('static')} />
        </div>

        {mode === 'satellite' ?
        <div className="absolute inset-0">
            <iframe title="Bản đồ vệ tinh Imperia Sky Park" src={SATELLITE_MAP_URL} className="h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            <div className="pointer-events-none absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-[#3b2c1d] shadow-lg backdrop-blur-sm">
              <MapPinIcon className="h-4 w-4 text-[#e35d43]" /> Imperia Sky Park
            </div>
          </div> :

        <div className="min-h-[100dvh] w-full bg-[#131b21]">
            <img src={STATIC_PLAN_URL} alt="Mặt bằng tổng thể dự án Imperia Sky Park" className="block h-auto w-full" />
          </div>
        }
      </div>
    </section>);

}

interface MapControlProps {
  active: boolean;
  label: string;
  icon: React.ComponentType<{className?: string;}>;
  onClick: () => void;
}

function MapControl({ active, label, icon: Icon, onClick }: MapControlProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`group flex h-11 items-center overflow-hidden rounded-md border shadow-md transition-all ${active ? 'border-[#f5921f] bg-[#f5921f] text-white' : 'border-stone-200 bg-white text-stone-700 hover:border-[#f5921f]'}`}>
      
      <span className="flex h-11 w-11 shrink-0 items-center justify-center"><Icon className="h-5 w-5" /></span>
      <span className="max-w-0 overflow-hidden whitespace-nowrap pr-0 text-xs font-semibold transition-all duration-300 group-hover:max-w-[9rem] group-hover:pr-3">{label}</span>
    </button>);

}