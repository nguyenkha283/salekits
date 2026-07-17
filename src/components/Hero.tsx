import React from 'react';
import { PhoneIcon } from 'lucide-react';
import { SearchPanel } from './SearchPanel';
export function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-orange-400 to-orange-300">
      {/* Hero image (family / house) */}
      <div className="absolute inset-y-0 right-0 hidden w-1/2 lg:block">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
          alt="Gia đình hạnh phúc trước ngôi nhà mới"
          className="h-full w-full object-cover opacity-90" />
        
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-orange-300/20 to-orange-400" />
      </div>

      <div className="relative z-10 pt-28 lg:pt-32">
        {/* Headline block */}
        <div className="mx-auto max-w-[1180px] px-4 pb-4 text-center lg:text-left">
          <div className="lg:max-w-[52%]">
            <h1 className="font-sans text-white drop-shadow-sm">
              <span className="block text-6xl font-bold italic leading-none tracking-tight sm:text-7xl lg:text-8xl">
                Nhà ở
              </span>
              <span className="mt-2 block text-4xl font-semibold italic sm:text-5xl lg:text-6xl">
                là để ở
              </span>
            </h1>

            <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-white/25 px-6 py-3 ring-1 ring-white/40 backdrop-blur-sm">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-orange-600">
                <PhoneIcon className="h-4 w-4" />
              </span>
              <span className="text-lg font-bold tracking-wide text-white sm:text-2xl">
                1900 6088 - 0937 576 768
              </span>
            </div>
          </div>
        </div>

        {/* Search panel overlapping bottom */}
        <div className="relative z-20 mt-8 pb-10">
          <SearchPanel />
        </div>
      </div>
    </section>);

}