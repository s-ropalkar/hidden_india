/** Shared frontend helpers and static paths. */

export const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDkJmlDO0tp_E6MEEiK_rmOWTXX-eU4YVNjGeIERa4ufp3Uht0ELZUdF4WDzMBHWej6VbPeQwl7IvJGGPCdkil7V7Z1GZKiSjBz3cph9IYuDFZiUAfXz6qNxwrtR6Ah10Xs5Ot1iltMRWHksTrQfLUt27HgOY2WkUQQTHQ_xobqH7KrfiJZNaLZJY5XyJ9Lf-SsHrerZU9Y09pPeU0WJZTraAjoKt2T18-w8hS8nTePmsAc5YMUwBjWVD7-tcAaNaAEA4m1PCSXPdY';

export const LOGO_SRC = '/images/logo/app-logo.jpeg';
export const LOGO_FALLBACK = '/images/hidden-india-logo.png';
export const AUTH_HERO_SRC = '/images/auth-hero.png';

function quizSrc(filename: string): string {
  return `/images/quiz/${encodeURIComponent(filename)}`;
}

export const QUIZ_INTEREST_IMAGES: Record<string, string> = {
  'Traditional Crafts': quizSrc('q2. craft.webp'),
  'Handmade Products': quizSrc('q2. handmade product.jpg'),
  'Folk Music & Dance': quizSrc('q2. dance.jpg'),
  'Heritage Architecture': quizSrc('q2. heritage.jpg'),
  'Food & Cuisine': quizSrc('q2. food.jpg'),
};

export const QUIZ_CRAFT_IMAGES: Record<string, string> = {
  Pottery: quizSrc('q3 pottery.avif'),
  'Handloom Weaving': quizSrc('q3 weaving.jpg'),
  'Wood Carving': quizSrc('q3 wood carving.jpg'),
  'Warli paintings': quizSrc('q3 warli.jpg'),
  'Bamboo Craft': quizSrc('q3 bamboo.webp'),
  'Textile Art': quizSrc('q3textile art.jpg'),
  Painting: quizSrc('q3 painting.jpg'),
  'Jewelry Making': quizSrc('q3 jewelry.avif'),
};

export function matchesCraftFilter(
  selectedCrafts: string[],
  fields: { craft?: string; category?: string; name?: string; title?: string },
): boolean {
  if (selectedCrafts.length === 0) return true;
  const hay = `${fields.craft || ''} ${fields.category || ''} ${fields.name || fields.title || ''}`.toLowerCase();
  return selectedCrafts.some(
    (c) =>
      hay.includes(c.toLowerCase()) ||
      c.toLowerCase().split(/\s+/).some((t) => t.length > 3 && hay.includes(t)),
  );
}

import stateMapPositions from '../data/state-map-positions.json';

const STATE_MAP_POSITIONS = stateMapPositions as Record<string, { x: number; y: number }>;

export function stateMapPosition(state: string, lat: number, lng: number): { x: string; y: string } {
  const pos = STATE_MAP_POSITIONS[state] || STATE_MAP_POSITIONS[state.replace(' and ', ' & ')];
  if (pos) return { x: `${pos.x}%`, y: `${pos.y}%` };
  const xPct = Math.min(92, Math.max(8, ((lng - 68) / 29) * 100));
  const yPct = Math.min(88, Math.max(12, ((35 - lat) / 27) * 100));
  return { x: `${xPct.toFixed(1)}%`, y: `${yPct.toFixed(1)}%` };
}
