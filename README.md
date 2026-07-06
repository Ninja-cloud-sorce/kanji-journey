# Kairo — Japanese Learning Platform

> Structured JLPT preparation from N5 to N1. Adaptive lessons, spaced-repetition flashcards, AI tutoring, and full mock exams.

[![Deploy status](https://img.shields.io/badge/frontend-Vercel-black?logo=vercel)](https://vercel.com)
[![Backend](https://img.shields.io/badge/backend-Render-46E3B7?logo=render)](https://render.com)
[![Database](https://img.shields.io/badge/database-MongoDB%20Atlas-47A248?logo=mongodb)](https://mongodb.com/atlas)
[![Auth](https://img.shields.io/badge/auth-Supabase-3ECF8E?logo=supabase)](https://supabase.com)

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 · TypeScript · Vite · Tailwind CSS |
| Routing | React Router v6 (lazy-loaded routes) |
| State | TanStack Query v5 · Zustand (UI only) |
| Backend | Node.js · Express · CommonJS |
| Database | MongoDB Atlas (Mongoose) |
| Auth | Supabase Auth + JWT verification |
| AI | Supabase Edge Function → Google Gemini Flash (SSE streaming) |
| SRS | SM-2 spaced repetition (server-side) |
| Animation | Framer Motion |

---

## Features

- **Structured curriculum** — JLPT N5 → N1 lessons organized by level and week
- **Spaced repetition** — SM-2 flashcard system; wrong answers auto-create cards
- **Exam simulator** — Full timed mock tests across vocabulary, grammar, reading, listening
- **Scholar AI** — Streaming AI tutor powered by Gemini Flash
- **Progress tracking** — XP, streaks, weak topics, quiz history, readiness score
- **Writing practice** — Hiragana, katakana, and kanji calligraphy sessions
- **Pronunciation scoring** — HuggingFace ASR (Whisper) with pitch accent feedback

---

## Getting started

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster
- Supabase project

### 1. Clone and install

```bash
git clone https://github.com/Ninja-cloud-sorce/kanji-journey.git
cd kanji-journey
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `.env`:

```env
# Frontend (build-time — Vite exposes these to the browser)
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon key>
VITE_API_BASE_URL=http://localhost:4000

# Backend (server-only — never expose to browser)
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/kairo
SUPABASE_JWT_SECRET=<from Supabase → Settings → API → JWT Secret>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase → Settings → API>
GUEST_JWT_SECRET=<random 32-byte hex: openssl rand -hex 32>
PORT=4000
```

### 3. Run in development

```bash
# Frontend + backend together
npm run dev:full

# Or separately
npm run dev        # Vite on :8080
npm run server     # Express on :4000
```

### 4. Build for production

```bash
npm run build      # outputs to dist/
```

---

## Project structure

```
kanji-journey/
├── src/
│   ├── components/       # UI components (lessons, flashcards, exam, chat…)
│   ├── hooks/data/       # TanStack Query hooks + queryKeys factory
│   ├── pages/            # Route-level pages (lazy loaded)
│   ├── store/            # Zustand store (ephemeral UI state only)
│   ├── integrations/     # Supabase client · Express API client
│   ├── data/             # Static mock data + Japanese content JSON
│   └── lib/              # Utilities, curriculum helpers
├── server/
│   ├── app.cjs           # Express app entry point
│   ├── db.cjs            # MongoDB connection
│   ├── routes/           # REST API route handlers
│   ├── models/           # Mongoose models
│   ├── middleware/        # JWT auth middleware
│   ├── services/         # SM-2 SRS algorithm
│   └── data/             # Lesson catalog (static)
├── supabase/
│   ├── migrations/       # PostgreSQL schema migrations
│   └── functions/chat/   # Gemini AI edge function
└── public/               # Static assets + SVG logo
```

---

## API reference

All routes require `Authorization: Bearer <supabase_jwt>` except `/health`.

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Server health check |
| GET/PUT | `/api/profiles/:userId` | User profile |
| GET | `/api/collections` | Collections with progress |
| GET | `/api/lessons` | Lessons for a collection |
| GET | `/api/lessons/catalog` | Full lesson catalog by level |
| GET/POST | `/api/lesson-progress/:userId` | Lesson completion records |
| POST | `/api/complete-lesson` | Mark lesson done (XP + streak + flashcards) |
| GET/POST | `/api/flashcards` | Flashcard CRUD |
| GET | `/api/flashcards/:userId/due` | Cards due for SRS review today |
| POST | `/api/flashcards/:cardId/review` | Submit SM-2 grade (0–5) |
| GET | `/api/weak-topics/:userId` | Top weak areas |
| POST | `/api/weak-topics/batch` | Bulk upsert weak topics |
| GET | `/api/quiz-history/:userId` | Recent quiz results |
| GET/PUT | `/api/learning-paths/:userId` | Learning path preferences |
| GET/PUT | `/api/level-overrides/:userId` | Manual JLPT level override |
| POST | `/api/pronunciation/score` | ASR pronunciation scoring |

---

## Deployment

The app is split into two services:

### Frontend → Vercel

1. Import repo on [vercel.com](https://vercel.com)
2. Root directory: `kanji-journey` · Framework: Vite
3. Set environment variables:
   ```
   VITE_API_BASE_URL=https://<your-render-service>.onrender.com
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_PUBLISHABLE_KEY=...
   ```

### Backend → Render

1. New Web Service on [render.com](https://render.com)
2. Root directory: `kanji-journey`
3. Build command: `npm install` · Start command: `node server/app.cjs`
4. Set environment variables:
   ```
   NODE_ENV=production
   MONGODB_URI=...
   SUPABASE_JWT_SECRET=...
   SUPABASE_SERVICE_ROLE_KEY=...
   GUEST_JWT_SECRET=...
   FRONTEND_URL=https://<your-vercel-app>.vercel.app
   ```

### AI chat → Supabase Edge Function

```bash
npx supabase functions deploy chat --project-ref <project-ref>
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server (frontend only) |
| `npm run server` | Express server only |
| `npm run dev:full` | Frontend + backend concurrently |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm test` | Run Vitest unit tests |

---

## License

MIT
