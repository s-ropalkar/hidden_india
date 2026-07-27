/**
 * Hidden India Explorer — API client
 * Proxied via CRA proxy to Flask backend (localhost:5000)
 */

const TOKEN_KEY = 'hi_token';

export const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDkJmlDO0tp_E6MEEiK_rmOWTXX-eU4YVNjGeIERa4ufp3Uht0ELZUdF4WDzMBHWej6VbPeQwl7IvJGGPCdkil7V7Z1GZKiSjBz3cph9IYuDFZiUAfXz6qNxwrtR6Ah10Xs5Ot1iltMRWHksTrQfLUt27HgOY2WkUQQTHQ_xobqH7KrfiJZNaLZJY5XyJ9Lf-SsHrerZU9Y09pPeU0WJZTraAjoKt2T18-w8hS8nTePmsAc5YMUwBjWVD7-tcAaNaAEA4m1PCSXPdY';

export const LOGO_SRC = '/images/logo/app-logo.jpeg';
export const LOGO_FALLBACK = '/images/hidden-india-logo.png';
export const AUTH_HERO_SRC = '/images/auth-hero.png';

function quizSrc(filename) {
  return `/images/quiz/${encodeURIComponent(filename)}`;
}

export const QUIZ_INTEREST_IMAGES = {
  'Traditional Crafts': quizSrc('q2. craft.webp'),
  'Handmade Products': quizSrc('q2. handmade product.jpg'),
  'Folk Music & Dance': quizSrc('q2. dance.jpg'),
  'Heritage Architecture': quizSrc('q2. heritage.jpg'),
  'Food & Cuisine': quizSrc('q2. food.jpg'),
};

export const QUIZ_CRAFT_IMAGES = {
  Pottery: quizSrc('q3 pottery.avif'),
  'Handloom Weaving': quizSrc('q3 weaving.jpg'),
  'Wood Carving': quizSrc('q3 wood carving.jpg'),
  'Warli paintings': quizSrc('q3 warli.jpg'),
  'Bamboo Craft': quizSrc('q3 bamboo.webp'),
  'Textile Art': quizSrc('q3textile art.jpg'),
  Painting: quizSrc('q3 painting.jpg'),
  'Jewelry Making': quizSrc('q3 jewelry.avif'),
};

// State map positions — fallback to lat/lng calculation
const STATE_MAP_POSITIONS = {
  "Andhra Pradesh": { x: 58, y: 68 },
  "Arunachal Pradesh": { x: 90, y: 22 },
  "Assam": { x: 87, y: 28 },
  "Bihar": { x: 67, y: 38 },
  "Chhattisgarh": { x: 60, y: 52 },
  "Delhi": { x: 45, y: 30 },
  "Goa": { x: 38, y: 70 },
  "Gujarat": { x: 27, y: 46 },
  "Haryana": { x: 43, y: 28 },
  "Himachal Pradesh": { x: 46, y: 18 },
  "Jharkhand": { x: 67, y: 46 },
  "Karnataka": { x: 46, y: 74 },
  "Kerala": { x: 45, y: 82 },
  "Madhya Pradesh": { x: 51, y: 48 },
  "Maharashtra": { x: 44, y: 60 },
  "Manipur": { x: 90, y: 34 },
  "Meghalaya": { x: 84, y: 30 },
  "Mizoram": { x: 89, y: 38 },
  "Nagaland": { x: 91, y: 28 },
  "Odisha": { x: 66, y: 56 },
  "Punjab": { x: 39, y: 22 },
  "Rajasthan": { x: 33, y: 36 },
  "Sikkim": { x: 78, y: 28 },
  "Tamil Nadu": { x: 52, y: 82 },
  "Telangana": { x: 55, y: 64 },
  "Tripura": { x: 87, y: 36 },
  "Uttar Pradesh": { x: 57, y: 34 },
  "Uttarakhand": { x: 51, y: 22 },
  "West Bengal": { x: 74, y: 42 },
};

export function stateMapPosition(state, lat, lng) {
  const pos = STATE_MAP_POSITIONS[state] || STATE_MAP_POSITIONS[state.replace(' and ', ' & ')];
  if (pos) return { x: `${pos.x}%`, y: `${pos.y}%` };
  const xPct = Math.min(92, Math.max(8, ((lng - 68) / 29) * 100));
  const yPct = Math.min(88, Math.max(12, ((35 - lat) / 27) * 100));
  return { x: `${xPct.toFixed(1)}%`, y: `${yPct.toFixed(1)}%` };
}

export function matchesCraftFilter(selectedCrafts, fields) {
  if (!selectedCrafts || selectedCrafts.length === 0) return true;
  const hay = `${fields.craft || ''} ${fields.category || ''} ${fields.name || fields.title || ''}`.toLowerCase();
  return selectedCrafts.some(
    c => hay.includes(c.toLowerCase()) ||
      c.toLowerCase().split(/\s+/).some(t => t.length > 3 && hay.includes(t))
  );
}

// ── Token helpers ──────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return !!getToken();
}

// ── HTTP helper ────────────────────────────────────────────────────────────────

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  let res;
  try {
    res = await fetch(`/api${path}`, { ...options, headers });
  } catch {
    throw new Error('Cannot reach server — make sure the backend is running (python app.py)');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed (${res.status})`);
  }
  return data;
}

// ── Data mappers ───────────────────────────────────────────────────────────────

function mapArtisan(doc) {
  return {
    id: String(doc.id),
    name: String(doc.name || ''),
    region: String(doc.region || ''),
    category: String(doc.category || ''),
    avatar: String(doc.avatar || ''),
    bio: String(doc.bio || ''),
    rating: typeof doc.rating === 'number' ? doc.rating : undefined,
    highlightImage: String(doc.highlight_image || doc.highlightImage || doc.avatar || ''),
    tag: doc.tag || 'Next Gen',
  };
}

function mapProduct(doc) {
  const priceRaw = doc.price_display || doc.price || doc.price_num || '';
  const priceStr = String(priceRaw).replace(/[₹,]/g, '').trim();
  return {
    id: String(doc.id),
    name: String(doc.name || ''),
    price: priceStr || '0',
    category: doc.category || 'Decor',
    image: String(doc.image || ''),
    status: doc.status || 'In Stock',
    state: String(doc.state || ''),
    description: String(doc.description || ''),
    artisan: String(
      doc.artisan_name ||
      (typeof doc.artisan === 'object' && doc.artisan ? doc.artisan.name : doc.artisan) ||
      ''
    ),
    material: String(doc.material || ''),
    priceDisplay: String(doc.price_display || `₹${priceStr}`),
  };
}

function mapWorkshop(doc) {
  const modeRaw = String(doc.mode || 'offline').toLowerCase();
  return {
    id: String(doc.id),
    title: String(doc.title || ''),
    instructor: String(doc.instructor || ''),
    instructorAvatar: String(doc.instructor_avatar || doc.instructorAvatar || ''),
    date: String(doc.date || ''),
    time: String(doc.time || ''),
    price: String(doc.price_display || doc.price || ''),
    category: doc.category || 'Hands-on',
    thumbnail: String(doc.thumbnail || ''),
    venue: String(doc.venue || ''),
    mode: modeRaw === 'online' ? 'online' : 'offline',
    state: String(doc.state || ''),
  };
}

function mapApplicant(doc) {
  return {
    id: String(doc.id),
    name: String(doc.name || ''),
    email: String(doc.email || ''),
    category: String(doc.category || ''),
    crafts: Array.isArray(doc.crafts) ? doc.crafts.map(String) : [],
    state: String(doc.state || ''),
    region: String(doc.region || ''),
    craftIcon: String(doc.craftIcon || doc.craft_icon || 'brush'),
    date: String(doc.date || ''),
    status: doc.status || 'pending',
    govtIdUrl: String(doc.govtIdUrl || doc.govt_id_url || ''),
    certUrl: String(doc.certUrl || doc.cert_url || ''),
    portfolio: Array.isArray(doc.portfolio) ? doc.portfolio.map(String) : [],
    regionValidation: doc.regionValidation || null,
  };
}

// ── Auth ───────────────────────────────────────────────────────────────────────

export async function register(name, email, password) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  setToken(data.token);
  return data;
}

export async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data;
}

export async function forgotPassword(email) {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token, password) {
  return request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

export async function getMe() {
  const data = await request('/auth/me');
  return data.user;
}

export function logout() {
  setToken(null);
}

export function homeScreenForUser(user) {
  if (user.role === 'admin') return 'supervisor-dashboard';
  if (user.role === 'artisan') return 'artisan-dashboard';
  if (user.applicationStatus === 'pending' || user.applicationStatus === 'rejected') {
    return 'artisan-application-status';
  }
  return user.quizCompleted ? 'personalized-dashboard' : 'artistic-echoes';
}

// ── User ───────────────────────────────────────────────────────────────────────

export async function saveQuiz(quiz) {
  return request('/users/me/quiz', {
    method: 'POST',
    body: JSON.stringify(quiz),
  });
}

export async function updateProfile(payload) {
  return request('/users/me', { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function getRecommendations() {
  const data = await request('/users/me/recommendations');
  return {
    artisans: (data.artisans || []).map(mapArtisan),
    products: (data.products || []).map(mapProduct),
    workshops: (data.workshops || []).map(mapWorkshop),
    regions: (data.regions || []).map(r => ({
      id: String(r.id),
      name: String(r.name),
      state: String(r.state),
      highlight_craft: String(r.highlight_craft || ''),
    })),
  };
}

export async function getSavedItems() {
  const data = await request('/users/me/saved');
  return data.map(item => ({
    id: String(item.id),
    name: String(item.name || ''),
    craft: String(item.craft || item.category || ''),
    origin: String(item.state || item.region || ''),
    price: String(item.price_display || item.price || ''),
    img: String(item.image || item.avatar || ''),
    savedType: String(item.savedType || 'product'),
  }));
}

export async function saveItem(itemType, itemId) {
  return request('/users/me/saved', {
    method: 'POST',
    body: JSON.stringify({ itemType, itemId }),
  });
}

export async function unsaveItem(itemType, itemId) {
  return request(`/users/me/saved/${itemType}/${itemId}`, { method: 'DELETE' });
}

export async function placeOrder(productId, quantity = 1, buyNow = true) {
  return request('/orders', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity, buyNow }),
  });
}

export async function getMyOrders() {
  const data = await request('/users/me/orders');
  return data.map(o => {
    const product = o.product || null;
    return {
      id: String(o.id),
      status: String(o.status || 'Placed'),
      quantity: Number(o.quantity || 1),
      total: Number(o.total || 0),
      createdAt: String(o.createdAt || ''),
      product: product ? {
        id: String(product.id),
        name: String(product.name || ''),
        image: String(product.image || ''),
        price: String(product.price_display || product.price || ''),
        category: String(product.category || ''),
        state: String(product.state || ''),
      } : null,
    };
  });
}

export async function getMyWorkshops() {
  const data = await request('/users/me/workshops');
  const mapWs = ws => ({
    id: String(ws.id || ws.registrationId || ''),
    workshopId: String(ws.workshopId || ''),
    name: String(ws.name || ''),
    host: String(ws.host || ''),
    date: String(ws.date || ''),
    time: String(ws.time || ''),
    price: String(ws.price || ''),
    status: String(ws.status || ''),
    mode: String(ws.mode || 'offline').toLowerCase() === 'online' ? 'online' : 'offline',
    venue: String(ws.venue || ''),
  });
  return {
    upcoming: (data.upcoming || []).map(mapWs),
    attended: (data.attended || []).map(mapWs),
  };
}

// ── Discovery ──────────────────────────────────────────────────────────────────

export async function getProducts(params) {
  const qs = new URLSearchParams();
  if (params?.category) qs.set('category', params.category);
  if (params?.state) qs.set('state', params.state);
  const data = await request(`/products?${qs}`);
  return data.map(mapProduct);
}

export async function getWorkshops(params) {
  const qs = new URLSearchParams();
  if (params?.category) qs.set('category', params.category);
  if (params?.state) qs.set('state', params.state);
  const suffix = qs.toString() ? `?${qs}` : '';
  const data = await request(`/workshops${suffix}`);
  return data.map(mapWorkshop);
}

export async function getCatalogStates() {
  return request('/catalog/states');
}

export async function getCatalogCrafts() {
  const data = await request('/catalog/crafts');
  return data.crafts;
}

export async function validateApplicationCrafts(state, crafts) {
  return request('/catalog/validate-crafts', {
    method: 'POST',
    body: JSON.stringify({ state, crafts }),
  });
}

export async function getWorkshop(id) {
  const data = await request(`/workshops/${id}`);
  return {
    ...mapWorkshop(data),
    seatsAvailable: Number(data.seatsAvailable ?? 0),
    seatsTotal: Number(data.seatsTotal ?? 20),
    seatsRegistered: Number(data.seatsRegistered ?? 0),
    isRegistered: Boolean(data.isRegistered),
  };
}

export async function registerWorkshop(workshopId, sessionId = 'session-1') {
  return request(`/workshops/${workshopId}/register`, {
    method: 'POST',
    body: JSON.stringify({ sessionId }),
  });
}

export async function getMapRegions() {
  const data = await request('/map/regions');
  return data.map(r => {
    const lat = Number(r.lat) || 20;
    const lng = Number(r.lng) || 78;
    const pos = stateMapPosition(String(r.state || ''), lat, lng);
    return {
      id: String(r.id),
      name: String(r.name),
      state: String(r.state),
      category: String(r.category || r.craft || ''),
      craft: String(r.craft || r.category || ''),
      info: String(r.info || ''),
      image: String(r.image || ''),
      count: Number(r.count) || 0,
      artisan: String(r.artisan || ''),
      lng,
      lat,
      x: pos.x,
      y: pos.y,
      color: '#ac4425',
    };
  });
}

export async function getNearbyArtisans(lat, lng, km = 25) {
  const data = await request(`/map/nearby?lat=${lat}&lng=${lng}&km=${km}&type=artisan`);
  return data.map(a => ({
    id: String(a.id),
    name: String(a.name || ''),
    craft: String(a.craft || a.category || ''),
    state: String(a.state || ''),
    category: String(a.category || ''),
    distance: String(a.distance || ''),
    rating: Number(a.rating) || 4.5,
    snippet: String(a.snippet || a.bio || '').slice(0, 120),
    avatar: String(a.avatar || ''),
  }));
}

export async function getRegion(state) {
  const data = await request(`/regions/${encodeURIComponent(state)}`);
  return {
    products: (Array.isArray(data.products) ? data.products : []).map(mapProduct),
    workshops: (Array.isArray(data.workshops) ? data.workshops : []).map(mapWorkshop),
    artisans: (Array.isArray(data.artisans) ? data.artisans : []).map(mapArtisan),
    region: data.region || null,
  };
}

// ── Artisan application ────────────────────────────────────────────────────────

export async function submitArtisanApplication(form) {
  return request('/artisan/apply', { method: 'POST', body: form });
}

export async function getApplicationStatus() {
  return request('/artisan/application/status');
}

// ── Artisan dashboard ──────────────────────────────────────────────────────────

export async function getArtisanProfile() {
  const data = await request('/artisan/profile');
  return {
    ...data,
    approvedCrafts: Array.isArray(data.approved_crafts)
      ? data.approved_crafts
      : Array.isArray(data.approvedCrafts)
        ? data.approvedCrafts
        : data.category
          ? String(data.category).split(',').map(s => s.trim()).filter(Boolean)
          : [],
    state: String(data.state || ''),
    highlightImage: String(data.highlight_image || data.highlightImage || data.portfolio_image || ''),
    bio: String(data.bio || ''),
    name: String(data.name || ''),
  };
}

export async function updateArtisanProfile(payload) {
  return request('/artisan/profile', { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function getArtisanProducts() {
  const data = await request('/artisan/products');
  return data.map(mapProduct);
}

export async function createArtisanProduct(payload) {
  const data = await request('/artisan/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return mapProduct(data);
}

export async function updateArtisanProduct(id, payload) {
  const data = await request(`/artisan/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return mapProduct(data);
}

export async function deleteArtisanProduct(id) {
  return request(`/artisan/products/${id}`, { method: 'DELETE' });
}

export async function getArtisanWorkshops() {
  const data = await request('/artisan/workshops');
  return data.map(mapWorkshop);
}

export async function createArtisanWorkshop(payload) {
  const data = await request('/artisan/workshops', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return mapWorkshop(data);
}

export async function updateArtisanWorkshop(id, payload) {
  return request(`/artisan/workshops/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteArtisanWorkshop(id) {
  return request(`/artisan/workshops/${id}`, { method: 'DELETE' });
}

export async function getArtisanAnalytics() {
  return request('/artisan/analytics');
}

export async function getArtisanRegistrations() {
  return request('/artisan/registrations');
}

export async function updateArtisanRegistration(id, status) {
  return request(`/artisan/registrations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function uploadArtisanPortfolio(file) {
  const form = new FormData();
  form.append('portfolio', file);
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch('/api/artisan/profile/portfolio', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data;
}

export async function getNotifications() {
  return request('/users/me/notifications');
}

export async function markNotificationsRead() {
  return request('/users/me/notifications/read', { method: 'PATCH' });
}

export async function trackProductView(productId) {
  return request(`/products/${productId}/view`, { method: 'POST' });
}

// ── Admin ──────────────────────────────────────────────────────────────────────

export async function getAdminAnalytics() {
  return request('/admin/analytics');
}

export async function getAdminApplications(status = 'pending') {
  const data = await request(`/admin/applications?status=${status}`);
  return data.map(mapApplicant);
}

export async function reviewApplication(appId, status, curatorNotes) {
  return request(`/admin/applications/${appId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, curatorNotes }),
  });
}

export async function getAdminUsers() {
  return request('/admin/users');
}

export async function setUserStatus(userId, status) {
  return request(`/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function getAdminArtisans() {
  return request('/admin/artisans');
}

export async function setArtisanStatus(artisanId, status) {
  return request(`/admin/artisans/${artisanId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
