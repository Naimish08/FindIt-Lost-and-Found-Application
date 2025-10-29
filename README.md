# FindIt – Lost & Found Application

A full‑stack application to post, search, and claim lost and found items. It consists of a mobile/web frontend built with Expo (React Native + Expo Router) and a backend API built with Express and TypeScript. Supabase powers authentication and data storage.

## Monorepo Structure

```
FindIt-Lost-and-Found-Application/
  backend/        # Express + TypeScript REST API
  frontend/       # Expo (React Native + Web) app using Expo Router
```

## Tech Stack

- Frontend: Expo 54, React Native 0.81, React 19, Expo Router 6
- Backend: Node.js, Express 5, TypeScript, tsx, nodemon
- Auth/DB/Storage: Supabase (@supabase/supabase-js)

## Prerequisites

- Node.js 18+ and npm
- An existing Supabase project with URL and anon key
- Expo CLI (optional but recommended): `npm i -g expo`

## Environment Variables

Create the following files with your Supabase credentials.

- Backend: `backend/.env`

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=5000
```

- Frontend: `frontend/.env`

Expo automatically exposes vars starting with `EXPO_PUBLIC_` to the app.
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Installation

Run these in the project root (from two separate terminals is convenient):

```
# Backend deps
cd backend
npm install

# Frontend deps
cd ../frontend
npm install
```

## Running the Apps

- Backend API (Express):
```
cd backend
npm run dev   # hot reload with nodemon
# or
npm start     # plain start
```
Default port is `5000` unless `PORT` is set.

- Frontend (Expo):
```
cd frontend
npm run start       # open Expo dev tools
# or platform-specific
npm run android
npm run ios
npm run web
```

## API Overview

Base URL: `http://localhost:5000`

- `GET /` – Health info and metadata
- `GET /health` – Health check
- `/* under /api` routes:
  - `/api/users` – User operations
  - `/api/items` – Lost/Found item operations
  - `/api/claims` – Claim operations
  - `/api/notifications` – Notification operations

See `backend/routes/*.ts` for details.

## Useful Scripts

- Backend
  - `npm run dev` – Start dev server with nodemon and tsx
  - `npm start` – Start server
- Frontend
  - `npm run start` – Start Expo dev server
  - `npm run android` / `ios` / `web` – Launch platform
  - `npm run lint` – Lint source
  - `npm run reset-project` – Clean/reset Expo caches

## Troubleshooting

- Ensure `.env` files exist and contain valid Supabase credentials.
- If the frontend cannot authenticate, verify `EXPO_PUBLIC_*` variables and restart the Expo server after changes.
- If API requests fail from the app, confirm the backend is running and CORS is enabled (it is by default in `backend/server.ts`).

## License

ISC
