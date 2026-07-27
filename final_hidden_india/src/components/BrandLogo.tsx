/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LOGO_FALLBACK, LOGO_SRC } from '../lib/utils';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showTagline?: boolean;
  className?: string;
}

const sizes = {
  sm: { img: 'h-9 w-auto max-w-[120px]', tag: 'text-[8px]' },
  md: { img: 'h-11 w-auto max-w-[150px]', tag: 'text-[9px]' },
  lg: { img: 'h-16 w-auto max-w-[200px]', tag: 'text-[10px]' },
  hero: { img: 'h-24 md:h-28 w-auto max-w-[280px]', tag: 'text-[11px]' },
};

export default function BrandLogo({ size = 'md', showTagline = false, className = '' }: BrandLogoProps) {
  const s = sizes[size];
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <img
        src={LOGO_SRC}
        alt="Hidden India"
        className={`${s.img} object-contain drop-shadow-md`}
        onError={(e) => {
          const img = e.currentTarget;
          if (img.src.includes(LOGO_FALLBACK)) return;
          img.src = LOGO_FALLBACK;
        }}
      />
      {showTagline && (
        <p className={`${s.tag} font-sans font-bold tracking-[0.25em] text-[#8c4a2f] uppercase`}>
          Explore · Discover · Preserve
        </p>
      )}
    </div>
  );
}
