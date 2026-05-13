# Frontend Summary

## Overview
The frontend is a Next.js App Router project (`frontend/`) using React 19 + TypeScript + Tailwind CSS v4. It is organized by route-level pages in `app/`, reusable UI blocks in `components/`, and auth/session state in `context/AuthContext.tsx`.

## Tech Stack
- Framework: Next.js `16.0.7` (App Router)
- UI: React `19.2.0`
- Language: TypeScript
- Styling: Tailwind CSS v4 + utility-first classes in component/page files
- Linting: ESLint with Next config 

## Core Structure
- `frontend/app/`: route pages (`/`, `/login`, `/register`, `/dashboard`, `/marketplace`, `/services`, etc.)
- `frontend/components/`: feature components split by domain (`home`, `dashboard`, `marketplace`, `about`, `layout`, etc.)
- `frontend/context/AuthContext.tsx`: login/register/logout + user/token state
- `frontend/app/layout.tsx`: global layout, fonts, and `AuthProvider` wiring
- `frontend/public/images/`: static assets

## Route-Level Feature Summary
- `/` (`app/page.tsx`): Landing composition using header, hero, service blocks, stats, blog preview, and footer.
- `/login`: Auth form that calls backend `/auth/login`, then redirects to `/dashboard`.
- `/register`: Multi-step registration flow collecting account, owner, pet, and preference data; submits to `/auth/register`.
- `/dashboard`: Auth-gated main panel; fetches `/azzpi/user/dashboard`; supports add-pet, book-appointment, and appointment status actions.
- `/dashboard/calendar`: Monthly calendar UI with appointment listing and booking modal.
- `/dashboard/doctors`: Doctor directory with specialty filtering and booking entry point.
- `/dashboard/payments`: Currently UI-driven/mock payment history and upcoming payments (no backend persistence yet).
- `/dashboard/settings`: Profile/preferences/password settings UI; currently simulated save behavior.
- `/marketplace`: Product + pet marketplace tabs, filtering, cart, checkout modal, add/edit/delete modals.
- `/marketplace/add-product` and `/marketplace/add-pet`: standalone add forms/components.
- `/services` + `/services/[slug]`: service catalog and rich service detail pages.
- `/about`, `/blog`, `/contact`: content-heavy marketing pages with reusable layout components.

## Data and API Integration
### Auth/session
- Auth state lives in `AuthContext` and persists `token` + `user` in localStorage.
- Exposes `login`, `register`, `logout`, `isAuthenticated`, and `isLoading`.

### Backend usage patterns
- Hardcoded URLs are common (`http://localhost:5000`) in auth and dashboard flows.
- Marketplace feature often uses `NEXT_PUBLIC_API_BASE_URL` fallback to `http://localhost:5000`.

### Main backend calls from frontend
- Auth: `POST /auth/login`, `POST /auth/register`
- Dashboard: `GET /api/user/dashboard`
- Doctors: `GET /api/doctors`
- Pets (owner): `GET /api/pets`, `POST /api/pets`
- Appointments: `GET /api/appointments`, `POST /api/appointments`, `PUT /api/appointments/:id/status`
- Marketplace: `GET/POST/PUT/DELETE /products`, `GET/POST/PUT/DELETE /pets`

## UI/State Characteristics
- Most pages are client components (`'use client'`) with local state hooks.
- Dashboard and marketplace are modal-heavy and event-driven.
- Cart is localStorage-backed and client-only.
- Styling uses a consistent orange brand accent (`#ec6d13`) and gray neutrals.

## Current Implementation Notes
- Token key mismatch exists: Auth context stores `token`, while doctors/calendar pages read `authToken`. This can break authenticated calls on those pages unless both keys are set.
- API base handling is inconsistent: some pages are env-based, others are hardcoded to localhost.
- Some sections are presentational/mock only (not yet wired to backend persistence), especially payments and parts of settings/contact/blog content behavior.
- The local build output directory `.next/` exists and mirrors some source strings; source of truth remains files under `app/`, `components/`, and `context/`.

## Frontend Run Commands
From `frontend/`:
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
