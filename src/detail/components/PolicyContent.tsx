import React from 'react';

/** Ảnh chính sách bán hàng — thay bằng file thiết kế CSBH thật khi có. */
const POLICY_IMAGE = '/bc3b6fbd-aac1-4c49-be3b-976b35aa7a67.jpg';

export function PolicyContent() {
  return (
    <section aria-label="Chính sách bán hàng" className="w-full">
      <img
        src={POLICY_IMAGE}
        alt="Chính sách bán hàng dự án Imperia Sky Park"
        className="block w-full rounded-lg border border-stone-200" />

    </section>);

}