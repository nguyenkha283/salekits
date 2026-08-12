import React from 'react';
import {
  Building2Icon,
  CalendarIcon,
  LayersIcon,
  MapPinIcon,
  RulerIcon,
  UserRoundIcon } from
'lucide-react';
import { ImageSlider } from './ImageSlider';
import { EmptySlot, EmptyText } from './EmptySlot';

interface ProjectContentProps {
  images?: {src: string;alt: string;}[];
  overviewParagraphs?: string[];
  amenities?: string[];
  facts?: Partial<Record<
  'investor' | 'location' | 'scale' | 'unitArea' | 'handover' | 'unitCount',
  string>>;
}

const FACT_META: {key: keyof NonNullable<ProjectContentProps['facts']>;label: string;icon: React.ComponentType<{className?: string;}>;}[] =
[
{ key: 'investor', label: 'Chủ đầu tư', icon: Building2Icon },
{ key: 'location', label: 'Vị trí', icon: MapPinIcon },
{ key: 'scale', label: 'Quy mô', icon: LayersIcon },
{ key: 'unitArea', label: 'Diện tích căn', icon: RulerIcon },
{ key: 'handover', label: 'Bàn giao', icon: CalendarIcon },
{ key: 'unitCount', label: 'Số căn hộ', icon: UserRoundIcon }];


export function ProjectContent({
  images = [],
  overviewParagraphs = [],
  amenities = [],
  facts = {}
}: ProjectContentProps = {}) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {images.length > 0 ?
        <ImageSlider images={images} /> :

        <EmptySlot
          source="01. Tổng quan"
          className="aspect-[16/9] w-full rounded-lg" />
        }

        <section className="mt-8">
          <h2 className="text-xl font-bold text-stone-900">Tổng quan dự án</h2>
          <div className="mt-3 space-y-4 text-[15px] leading-7 text-stone-700">
            {overviewParagraphs.length > 0 ?
            overviewParagraphs.map((paragraph, index) =>
            <p key={index}>{paragraph}</p>
            ) :

            <EmptyText source="01. Tổng quan" />
            }
          </div>
        </section>

        <section className="mt-8">
          <h3 className="text-lg font-semibold text-stone-900">
            Tiện ích nổi bật
          </h3>
          {amenities.length > 0 ?
          <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-[15px] text-stone-700 sm:grid-cols-2">
              {amenities.map((item) =>
            <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f5921f]" />
                  {item}
                </li>
            )}
            </ul> :

          <div className="mt-3">
              <EmptyText source="01. Tổng quan" />
            </div>
          }
        </section>
      </div>

      {/* Thông tin nhanh */}
      <aside className="lg:col-span-1">
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-stone-900">
            Thông tin nhanh
          </h3>
          <dl className="mt-4 space-y-4">
            {FACT_META.map((fact) => {
              const Icon = fact.icon;
              const value = facts[fact.key];
              return (
                <div key={fact.key} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f5921f]/10 text-[#f5921f]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs text-stone-500">{fact.label}</dt>
                    <dd
                      className={`text-sm ${value ? 'font-medium text-stone-900' : 'text-stone-400'}`}>
                      
                      {value || 'Chưa có thông tin'}
                    </dd>
                  </div>
                </div>);

            })}
          </dl>
          <button className="mt-5 w-full rounded-md bg-[#f5921f] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e08315]">
            Đăng ký tư vấn
          </button>
        </div>
      </aside>
    </div>);

}
