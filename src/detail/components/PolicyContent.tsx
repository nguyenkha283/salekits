import React from 'react';
import { ExternalLinkIcon, FileTextIcon } from 'lucide-react';

/** Ảnh chính sách bán hàng mẫu — dùng khi Drive chưa có nội dung. */
const POLICY_IMAGE = '/bc3b6fbd-aac1-4c49-be3b-976b35aa7a67.jpg';

interface PolicyGroup {
  id: string;
  label: string;
  items: {id: string;name: string;url: string;}[];
}

interface PolicyContentProps {
  /** Ảnh bìa lấy từ "05. Chính sách bán hàng". */
  coverImage?: string;
  /** Mỗi thư mục con là một nhóm chính sách. */
  groups?: PolicyGroup[];
}

export function PolicyContent({ coverImage, groups = [] }: PolicyContentProps = {}) {
  return (
    <section data-cms-section="policy" data-cms-label="Chính sách bán hàng" aria-label="Chính sách bán hàng" className="w-full space-y-8">
      <img
        src={coverImage || POLICY_IMAGE}
        alt="Chính sách bán hàng dự án"
        className="block w-full rounded-lg border border-stone-200" />

      {groups.map((group) =>
      <div key={group.id}>
          <h3 className="mb-3 text-[15px] font-bold text-[#4a3728]">{group.label}</h3>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {group.items.map((item) =>
          <li key={item.id}>
                <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-lg border border-stone-200 bg-white p-3 transition-colors hover:bg-[#faf6ef]">

                  <FileTextIcon className="h-4 w-4 shrink-0 text-[#b08e5c]" />
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-stone-700">
                    {item.name}
                  </span>
                  <ExternalLinkIcon className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                </a>
              </li>
          )}
          </ul>
        </div>
      )}
    </section>);

}
