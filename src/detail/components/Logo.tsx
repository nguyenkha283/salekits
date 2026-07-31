import React from 'react';
interface LogoProps {
  variant?: 'dark' | 'light';
  className?: string;
}

/**
 * Cenhomes.vn wordmark logo.
 * `dark` = dark text (for light header), `light` = white text (for dark footer).
 */
export function Logo({
  variant = 'dark',
  className = ''
}: LogoProps) {
  const textColor = variant === 'light' ? 'text-white' : 'text-[#4a3728]';
  const markDark = variant === 'light' ? '#ffffff' : '#4a3728';
  return <div className={`flex items-center gap-2 select-none ${className}`}>
      <span className="inline-flex h-8 w-8 items-center justify-center" aria-hidden="true">
        {/* Two-tone diamond mark: dark brown + orange, echoing the Cenhomes.vn logo */}
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
          <path d="M12 2L22 12L12 22L2 12Z" fill={markDark} />
          <path d="M12 22L22 12L12 12Z" fill="#f5921f" />
          <path d="M2 12L12 2L12 12Z" fill="#f5921f" fillOpacity="0.35" />
        </svg>
      </span>
      <span className={`text-lg font-bold tracking-tight ${textColor}`}>
        CENH<span className="text-[#f5921f]">O</span>MES<span className="font-semibold text-[#f5921f]">.VN</span>
      </span>
    </div>;
}