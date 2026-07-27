import React from 'react';
import { LOGO_SRC, LOGO_FALLBACK } from '../api';

const sizes = {
  sm:   { height: '36px' },
  md:   { height: '44px' },
  lg:   { height: '64px' },
  hero: { height: '96px' },
};

export default function BrandLogo({ size = 'md', showTagline = false, className = '' }) {
  const s = sizes[size] || sizes.md;
  return (
    <div className={`brand-logo ${className}`}>
      <img
        src={LOGO_SRC}
        alt="Hidden India"
        style={{ height: s.height, width: 'auto', objectFit: 'contain' }}
        onError={(e) => {
          if (!e.currentTarget.src.includes(LOGO_FALLBACK)) {
            e.currentTarget.src = LOGO_FALLBACK;
          }
        }}
      />
      {showTagline && (
        <p className="brand-tagline">Explore · Discover · Preserve</p>
      )}
    </div>
  );
}
