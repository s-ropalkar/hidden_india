# Hidden India Explorer — Interview Guide

> Full-stack heritage crafts marketplace connecting explorers, artisans, and curators across India.

---

## 1. Elevator Pitch (30 seconds)

**Hidden India Explorer** is a web platform that preserves and promotes India’s traditional crafts. Users discover artisans and products by state/region on an interactive map, take a cultural-interest quiz for personalized recommendations, book heritage workshops, and buy authentic artifacts. Artisans manage their studio, products, and workshop bookings. Admins curate artisan applications and view heritage-focused analytics.

---

## 2. Problem Statement

- Heritage crafts are fragmented and hard to discover online.
- Artisans lack a unified digital storefront and workshop management.
- Tourists/explorers need region-aware, interest-based discovery—not generic e-commerce.
- Admin curators need tools to verify artisan authenticity (state–craft validation).

---

## 3. Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4 |
| **State / Auth** | React Context (`AuthContext`), JWT in `localStorage` |
| **Backend** | Python Flask, Flask-CORS |
| **Database** | MongoDB (PyMongo) |
| **Auth** | JWT (PyJWT), bcrypt passwords, Google OAuth |
| **File uploads** | Flask + local `uploads/` folder |
| **AI (optional)** | Craft identification from photo, heritage guide chat |
| **Dev tooling** | Single `npm start` script for full stack |

---

## 4. Project Structure

```
final_hidden_india/
├── backend/                 # Flask API
│   ├── app.py               # Flask app factory
│   ├── routes.py            # All REST endpoints (~50 routes)
│   ├── auth.py              # JWT, bcrypt, role decorators
│   ├── db.py                # MongoDB + indexes
│   ├── services.py          # Recommendations, hidden gems, quiz processing
│   ├── seed.py              # DB seed from google-images catalog
│   ├── google_images_catalog.py
│   ├── region_crafts.py     # State–craft validation (GI-style rules)
│   └── india_data.py        # State coords, zones, catalog metadata
├── final_hidden_india/      # React frontend
│   └── src/
│       ├── App.tsx          # Screen router (no React Router—ScreenId enum)
│       ├── api.ts           # Typed API client
│       ├── context/AuthContext.tsx
│       └── components/      # Dashboard, Map, Workshop, Admin, etc.
├── scripts/start.mjs        # Starts backend + frontend together
└── package.json
```

---

## 5. User Roles & Features

### Explorer (User)
- Register / Login / Google OAuth / Forgot password
- **Artistic Echoes Quiz** → stores interests, regions, budget in profile
- **Personalized Dashboard** — dynamic welcome, recommendations from quiz
- **Explore Map** — India states map, zoom, craft filters, nearby artisans
- **Workshop registration** — seat limits, duplicate prevention, status badges
- **Saved artifacts**, orders, notifications (bell + full page)
- Bottom nav: Home, Explore, Saved, Profile

### Artisan
- Apply with portfolio + government ID (region/craft validation)
- **Application status** page (pending / approved / rejected)
- **Artisan Dashboard** — products, workshops, bookings
- Approve workshop registrations → persisted in DB + customer notification
- Studio settings, portfolio upload, analytics (views, orders, registrations)

### Admin (Curator / Supervisor)
- Review artisan applications (approve/reject → role change + notification)
- **Heritage analytics**: most explored state/region, liked category, top workshop, insight cards, approved artisans list
- User/artisan status management

---

## 6. Architecture Flow

```
Browser (React :3000)
    │  /api/* proxied by Vite
    ▼
Flask API (:5000)
    │  JWT middleware (@login_required, @role_required)
    ▼
MongoDB (hidden_india)
    Collections: users, artisans, products, workshops,
                 orders, workshop_registrations, notifications,
                 artisan_applications, regions, saved_items, ...
```

**Screen navigation:** `App.tsx` uses a `ScreenId` union type and `useState`—not React Router. Profile deep-links use `localStorage` (e.g. `profileTab: Notifications`).

---

## 7. MongoDB Collections (Key Fields)

| Collection | Purpose |
|------------|---------|
| `users` | email, password_hash, role (`user`/`artisan`/`admin`), interests, quiz_answers |
| `artisans` | user_id, name, state, category, crafts, location (GeoJSON), status |
| `products` | artisan_id, state, craft, category, price, image, view/save counts |
| `workshops` | artisan_id, seats, registration_count, date, venue |
| `workshop_registrations` | user_id, workshop_id, status (`Registration Submitted` → `Confirmed`) |
| `orders` | user_id, product_id, status |
| `notifications` | user_id, type, title, message, read |
| `artisan_applications` | user_id, status, crafts, region_validation |
| `regions` | state, craft highlight, GeoJSON point for map |

**Indexes:** unique email, 2dsphere on artisan/workshop locations, unique (user_id + workshop_id) for registrations.

---

## 8. Important API Endpoints (Interview Favorites)

### Auth
- `POST /api/auth/register`, `/login`, `/google`, `/forgot-password`, `/reset-password`
- `GET /api/auth/me`

### User
- `POST /api/users/me/quiz` — save cultural DNA
- `GET /api/users/me/recommendations`
- `GET /api/users/me/notifications`
- `POST /api/workshops/:id/register` — with seat + duplicate checks

### Artisan
- `POST /api/artisan/apply`
- `GET /api/artisan/application/status`
- `PATCH /api/artisan/registrations/:id` — approve booking + notify customer

### Admin
- `GET /api/admin/analytics` — heritage KPIs + insight cards
- `PATCH /api/admin/applications/:id` — approve/reject artisan

### Discovery
- `GET /api/map/regions`, `/map/nearby?lat=&lng=&radius=`
- `GET /api/discover/hidden-gems`
- `POST /api/ai/identify-craft` — photo → craft/state match

---

## 9. Core Business Logic (Explain in Interview)

### Cultural DNA / Quiz (`services.process_cultural_dna`)
Quiz answers (crafts, regions, workshop interest, budget) are normalized into:
- `interests[]`
- `geographic_focus`
- `preferred_states[]`

Used for dashboard recommendations and map personalization.

### Recommendations (`services.recommend_for_user`)
Scores products by matching user interests/crafts against product craft, category, and state—with boosts for preferred regions.

### Hidden Gem Score (`services.hidden_gem_score`)
```
score = low_popularity×0.35 + rating×0.45 + regional_uniqueness×0.20
```
Surfaces lesser-known artisans with high quality.

### Region–Craft Validation (`region_crafts.py`)
When artisans apply or upload products, crafts are validated against the state’s known heritage catalog (from `google-images` folder structure). Prevents mislabeled crafts (e.g., Warli listed under wrong state).

### Catalog Seeding (`google_images_catalog.py` + `seed.py`)
- Scans `google-images/google-images/{State}/{Product folders}/`
- **N images in folder → N products + N artisans**
- Workshops only seeded when workshop images exist
- Image paths copied to `public/images/catalog/`

### Workshop Registration Flow
1. User registers → status `Registration Submitted`, seat count incremented
2. Notification: "Workshop Registration Successful"
3. Artisan approves → `PATCH` sets status `Confirmed` in MongoDB
4. Customer notification: "Workshop Seat Confirmed"
5. UI disables re-registration; shows Total / Registered / Remaining seats

---

## 10. Security (What to Say)

- Passwords hashed with **bcrypt** (never stored plain)
- **JWT** in `Authorization: Bearer` header; 24h expiry
- **Role-based access**: `@role_required("artisan")`, `@role_required("admin")`
- Google OAuth verified via Google tokeninfo endpoint
- Unique index prevents duplicate workshop registration per user
- File upload type/size limits (16 MB)
- CORS restricted to configured origins

**Production improvements you'd mention:** HTTPS, refresh tokens, rate limiting, input sanitization, secrets in vault, not default JWT secret.

---

## 11. Frontend Highlights

- **Typed API client** (`api.ts`) — single place for all HTTP calls
- **AuthContext** — login, register, googleLogin, logout, refreshUser
- **NotificationBell** — polling every 15s, dropdown + link to full page
- **ExploreMap** — CSS transform zoom (0.75–2×), disabled at min/max
- **Material-inspired theme** — custom Tailwind `@theme` (primary terracotta `#8c2d0f`)

---

## 12. How to Run

**Prerequisites:** Node.js, Python 3.10+, MongoDB running locally (or Atlas URI in `backend/.env`)

```powershell
cd e:\final_hidden_india
npm start
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend health | http://localhost:5000/api/health |
| Re-seed (force) | `cd backend && venv\Scripts\python seed.py --force` |

### Demo Accounts (after seed)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hiddenindia.in | Admin@123 |
| Explorer | aryan@explorer.in | Explorer@123 |

### Optional env (`backend/.env`)
```
MONGO_URI=mongodb://localhost:27017/hidden_india
JWT_SECRET=your-secret
GOOGLE_CLIENT_ID=...
```
Frontend: `VITE_GOOGLE_CLIENT_ID=...` in `final_hidden_india/.env`

---

## 13. Common Interview Questions & Answers

**Q: Why MongoDB and not SQL?**  
A: Flexible schema for varied craft metadata, GeoJSON for map/nearby queries, easy nested documents for quiz answers and notifications. Trade-off: fewer joins; we use `$lookup` aggregations for analytics.

**Q: How does personalization work?**  
A: Quiz → `process_cultural_dna` → stored on user → `recommend_for_user` scores products by craft/state/interest overlap → dashboard shows dynamic welcome + filtered picks.

**Q: How do you prevent fake artisans?**  
A: Application workflow with document upload, admin review, and automated state–craft validation against a curated catalog derived from real regional craft data.

**Q: How is auth handled?**  
A: Stateless JWT. Token stored client-side; each protected route decodes JWT and loads user from DB. Role checked via decorator.

**Q: What happens when workshop is full?**  
A: Backend counts registrations vs `seats`; returns 409 if full. Frontend disables button and shows "Fully Booked".

**Q: Biggest challenge?**  
A: Building a data pipeline from folder-based craft images to structured catalog (states, artisans, products, workshops) while keeping region authenticity validation.

**Q: What would you improve next?**  
A: Payment gateway (Razorpay), email/SMS reminders, React Router for deep links, WebSocket notifications, mobile app, CDN for images, automated tests (pytest + Vitest).

**Q: Why no React Router?**  
A: Hackathon-style screen switching with `ScreenId` kept the app simple; trade-off is no shareable URLs per page—would migrate for production.

---

## 14. Metrics You Can Quote (After Seed)

- ~30 Indian states/regions in catalog
- ~191 products (image-driven, 1 product per catalog image)
- ~191 artisans (1:1 with products)
- ~43 workshops (only where workshop images exist)

*(Exact counts depend on `google-images` folder contents; run seed to see live numbers.)*

---

## 15. One-Line Descriptions for Resume

- Built full-stack heritage marketplace with Flask, MongoDB, React, and JWT auth supporting 3 roles (explorer, artisan, admin).
- Implemented geo-aware craft discovery, quiz-based recommendations, and admin curation with state–craft validation.
- Designed image-driven catalog seeding pipeline mapping regional craft folders to products, artisans, and workshops.

---

## 16. Quick Demo Script (2 minutes)

1. Login as explorer → complete/skip quiz → see personalized dashboard
2. Open Explore Map → filter craft → click state pin
3. Register for workshop → see seat counts → check notification
4. Login as artisan → Bookings → Approve → logout/login (status persists)
5. Login as admin → analytics cards + pending applications

---

*Last updated: June 2026 — matches current codebase including workshop approval persistence, notifications, Google OAuth, and heritage analytics.*
