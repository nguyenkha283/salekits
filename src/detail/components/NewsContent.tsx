import React, { useMemo, useState } from 'react';
import { ArrowRightIcon, CalendarIcon, ClockIcon } from 'lucide-react';
import { EmptySlot } from './EmptySlot';

interface Article {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  readingTime: string;
}

const CATEGORIES = ['Tất cả', 'Tiến độ', 'Chính sách', 'Thị trường', 'Sự kiện'];

const PAGE_STEP = 6;

interface NewsContentProps {
  /** Tin tức soạn tay trong CMS — tab này không lấy nội dung từ Drive. */
  articles?: Article[];
  featured?: Article;
}

export function NewsContent({ articles, featured }: NewsContentProps = {}) {
  const ARTICLES = articles ?? [];
  const FEATURED = featured;
  const [category, setCategory] = useState('Tất cả');
  const [visibleCount, setVisibleCount] = useState(PAGE_STEP);

  const filtered = useMemo(
    () => category === 'Tất cả' ? ARTICLES : ARTICLES.filter((article) => article.category === category),
    [category]
  );
  const visible = filtered.slice(0, visibleCount);

  function selectCategory(next: string) {
    setCategory(next);
    setVisibleCount(PAGE_STEP);
  }

  return (
    <div>
      {/* Tin nổi bật */}
      {!FEATURED &&
      <EmptySlot
        variant="content"
        label="Tải nội dung tin nổi bật lên"
        className="min-h-[240px] rounded-lg" />

      }

      {FEATURED &&
      <article className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        <a href="#" className="group block overflow-hidden rounded-lg bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5921f]">
          <img src={FEATURED.image} alt={FEATURED.title} className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-105" />
        </a>
        <div className="flex flex-col justify-center">
          <span className="inline-flex w-fit rounded bg-[#fdeed8] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#b56a10]">
            {FEATURED.category}
          </span>
          <h2 className="mt-4 text-2xl font-bold leading-snug tracking-[-0.02em] text-[#4a3728] sm:text-3xl">
            <a href="#" className="transition-colors hover:text-[#f5921f] focus:outline-none focus-visible:underline">{FEATURED.title}</a>
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-stone-600">{FEATURED.excerpt}</p>
          <ArticleMeta date={FEATURED.date} readingTime={FEATURED.readingTime} className="mt-4" />
          <a href="#" className="mt-6 inline-flex w-fit items-center gap-2 rounded-md bg-[#f5921f] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#e08315] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5921f] focus-visible:ring-offset-2">
            Đọc bài viết <ArrowRightIcon className="h-4 w-4" />
          </a>
        </div>
      </article>
      }

      {/* Bộ lọc chuyên mục */}
      <div className="mt-12 flex flex-wrap items-center gap-2 border-b border-stone-200 pb-4">
        {CATEGORIES.map((item) => {
          const isActive = item === category;
          return (
            <button
              key={item}
              type="button"
              onClick={() => selectCategory(item)}
              aria-pressed={isActive}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5921f] ${
              isActive ?
              'border-[#4a3728] bg-[#4a3728] text-white' :
              'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:text-[#4a3728]'}`
              }>
              {item}
            </button>);

        })}
      </div>

      {/* Lưới bài viết */}
      {visible.length > 0 ?
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((article) =>
        <article key={article.id} className="group flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white transition-shadow hover:shadow-md">
              <a href="#" className="block overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5921f]">
                <img src={article.image} alt={article.title} loading="lazy" className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-105" />
              </a>
              <div className="flex flex-1 flex-col p-5">
                <span className="inline-flex w-fit rounded bg-stone-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-stone-600">
                  {article.category}
                </span>
                <h3 className="mt-3 text-base font-bold leading-snug text-[#4a3728]">
                  <a href="#" className="transition-colors hover:text-[#f5921f] focus:outline-none focus-visible:underline">{article.title}</a>
                </h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-stone-600">{article.excerpt}</p>
                <ArticleMeta date={article.date} readingTime={article.readingTime} className="mt-4 border-t border-stone-100 pt-3" />
              </div>
            </article>
        )}
        </div> :

      <EmptySlot
        variant="content"
        label="Tải nội dung bài viết lên"
        className="mt-8 min-h-[280px] rounded-lg" />}


      {visibleCount < filtered.length &&
      <div className="mt-10 text-center">
          <button
          type="button"
          onClick={() => setVisibleCount((current) => current + PAGE_STEP)}
          className="inline-flex items-center gap-2 rounded-md border border-[#4a3728] px-6 py-3 text-sm font-semibold text-[#4a3728] transition-colors hover:bg-[#4a3728] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5921f] focus-visible:ring-offset-2">
            Xem thêm tin ({filtered.length - visibleCount})
          </button>
        </div>}

    </div>);

}

interface ArticleMetaProps {
  date: string;
  readingTime: string;
  className?: string;
}

function ArticleMeta({ date, readingTime, className = '' }: ArticleMetaProps) {
  return (
    <div className={`flex items-center gap-4 text-xs text-stone-500 ${className}`}>
      <span className="inline-flex items-center gap-1.5"><CalendarIcon className="h-3.5 w-3.5" />{date}</span>
      <span className="inline-flex items-center gap-1.5"><ClockIcon className="h-3.5 w-3.5" />{readingTime}</span>
    </div>);

}