import React, { useMemo, useState } from 'react';
import { ArrowRightIcon, CalendarIcon, ClockIcon } from 'lucide-react';

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

const FEATURED: Article = {
  id: 'featured',
  category: 'Tiến độ',
  title: 'Imperia Sky Park cất nóc tòa Sky 2, vượt tiến độ 3 tuần',
  excerpt:
  'Toàn bộ phần thô tòa Sky 2 đã hoàn thiện đến tầng 31, sớm hơn kế hoạch ba tuần. Nhà thầu bắt đầu thi công hạng mục hoàn thiện mặt ngoài và lắp đặt hệ thống kỹ thuật từ đầu tháng 8.',
  image: '/af90a9a2-cfa1-4e06-bf16-c3467b5c5fff.jpg',
  date: '18/07/2026',
  readingTime: '4 phút đọc'
};

const ARTICLES: Article[] = [
{
  id: 'a1',
  category: 'Chính sách',
  title: 'Cập nhật chính sách bán hàng quý III/2026',
  excerpt: 'Chiết khấu thanh toán sớm tăng lên 9%, bổ sung gói hỗ trợ lãi suất 24 tháng cho khách mua căn 3 phòng ngủ.',
  image: '/73dda9ab-a667-4bd9-a168-fc13267d6901.jpg',
  date: '12/07/2026',
  readingTime: '3 phút đọc'
},
{
  id: 'a2',
  category: 'Thị trường',
  title: 'Nguồn cung căn hộ phía Tây Hà Nội phục hồi rõ nét',
  excerpt: 'Lượng mở bán mới trong quý II tăng 27% so với cùng kỳ, giá sơ cấp trung bình đạt 78 triệu đồng mỗi m².',
  image: '/85bed7b1-ee07-4e5d-ae92-d9ea75fb82be.jpg',
  date: '08/07/2026',
  readingTime: '6 phút đọc'
},
{
  id: 'a3',
  category: 'Sự kiện',
  title: 'Lễ ra quân dự án quy tụ hơn 600 chuyên viên kinh doanh',
  excerpt: 'Sự kiện công bố giỏ hàng đợt 2 và trao thưởng cho các đơn vị phân phối dẫn đầu doanh số nửa đầu năm.',
  image: '/f757d0c2-1880-4786-9ade-d83bdf5ffd51.jpg',
  date: '02/07/2026',
  readingTime: '2 phút đọc'
},
{
  id: 'a4',
  category: 'Tiến độ',
  title: 'Hoàn thành hệ cảnh quan hồ điều hòa trung tâm',
  excerpt: 'Hạng mục cảnh quan 3.000 m² quanh hồ điều hòa đã bàn giao, chuẩn bị cho giai đoạn trồng cây hoàn thiện.',
  image: '/af1ffc9b-36a7-4608-9ff1-165cbcf660be.jpg',
  date: '28/06/2026',
  readingTime: '3 phút đọc'
},
{
  id: 'a5',
  category: 'Chính sách',
  title: 'Ngân hàng MBV nâng hạn mức cho vay lên 75% giá trị căn hộ',
  excerpt: 'Khách hàng được ân hạn nợ gốc 18 tháng, lãi suất cố định 7,5% trong hai năm đầu kể từ ngày giải ngân.',
  image: '/07cbf50c-5744-4f14-b5ff-5cc571eb8411.jpg',
  date: '21/06/2026',
  readingTime: '4 phút đọc'
},
{
  id: 'a6',
  category: 'Thị trường',
  title: 'Đại lộ Thăng Long mở rộng, rút ngắn 12 phút vào trung tâm',
  excerpt: 'Dự án mở rộng trục giao thông huyết mạch dự kiến thông xe cuối năm, tác động tích cực tới bất động sản khu vực.',
  image: '/ebd3240e-6608-4c50-8739-cfe41926dd74.jpg',
  date: '15/06/2026',
  readingTime: '5 phút đọc'
},
{
  id: 'a7',
  category: 'Sự kiện',
  title: 'Mở cửa nhà mẫu căn 2 phòng ngủ từ ngày 20/06',
  excerpt: 'Khách hàng có thể tham quan trực tiếp nhà mẫu tại sảnh Sky 1 hoặc đặt lịch trải nghiệm ảnh 360° trực tuyến.',
  image: '/fe21ba4f-5222-446a-beea-10c7a3640e0f.jpg',
  date: '10/06/2026',
  readingTime: '2 phút đọc'
},
{
  id: 'a8',
  category: 'Tiến độ',
  title: 'Lắp đặt hệ thống thang máy tốc độ cao cho tòa Sky 1',
  excerpt: 'Tám thang máy tiêu chuẩn châu Âu được lắp đặt, tốc độ 4 m/s, dự kiến chạy thử trong tháng 9.',
  image: '/ffbb15b7-c56b-4b5d-b7e3-ed3affc9fd36.jpg',
  date: '04/06/2026',
  readingTime: '3 phút đọc'
}];


const PAGE_STEP = 6;

export function NewsContent() {
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

      <p className="mt-8 rounded-lg border border-stone-200 bg-white px-4 py-16 text-center text-sm text-stone-500">
          Chưa có bài viết trong chuyên mục này.
        </p>}


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