import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon } from 'lucide-react';
import { Header } from '../components/Header';

export function ProductDetailPage() {
  return (
    <div className="min-h-screen w-full bg-white font-sans text-neutral-900">
      <Header variant="light" />
      <main
        className="mx-auto w-3/4 py-[96px]"
        aria-label="Chi tiết sản phẩm">

        <h1 className="text-center text-[32px] font-semibold leading-tight text-[#333333]">
          Chi tiết sản phẩm
        </h1>
        <p className="mt-3 text-center text-[16px] leading-[26px] text-[#424843]">
          Nội dung trang Chi tiết sản phẩm sẽ được cập nhật sau.
        </p>
        <div className="mt-10 flex justify-center">
          <Link
            to="/hoan-tat"
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50">

            <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
            Quay lại trang chỉnh sửa
          </Link>
        </div>
      </main>
    </div>);

}