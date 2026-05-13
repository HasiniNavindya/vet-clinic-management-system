# Backend Summary

## Overview
The backend is an Express + PostgreSQL API (`backend/`) providing authentication, user dashboard data, pet and appointment management, and marketplace product/pet CRUD endpoints.

## Tech Stack
- Runtime: Node.js (CommonJS)
- Framework: Express `5.2.1`
- DB client: `pg`
- Security/auth: `bcrypt`, `jsonwebtoken`
- Middleware: `cors`, `express.json()`

## Core Files
- `backend/server.js`: API routes, JWT middleware, and app startup.
- `backend/db.js`: PostgreSQL connection pool.
- `backend/create-auth-tables.js`: creates auth/domain tables for users and owned pets.
- `backend/create-dashboard-tables.js`: creates doctors + appointments tables and seeds doctors.
- Utility scripts: `create-admin-user.js`, `create-test-user.js`, `update-user-role.js`, `add-doctor-notes.js`, `add-contact-column.js`, `update-doctors.js`.

## Database Model (from setup scripts)
### `auth_users`
- Stores identity and profile fields: `email`, `password_hash`, `full_name`, optional phone/address, `role`.

### `pets_owned`
- User-owned pet profiles linked to `auth_users` by `user_id`.

### `user_preferences`
- Per-user preferences (vaccination reminders, appointment updates), 1:1 with user.

### `doctors`
- Doctor master data: `name`, `specialization`, contact info, image URL, bio, available days.

### `appointments`
- Links user, pet, doctor with date/time, status, notes, and optional `doctor_notes`.

### Marketplace tables (used by API)
- `products`: expected by `/products` CRUD routes.
- `pets`: expected by marketplace `/pets` CRUD routes (separate from `pets_owned`).

## Authentication and Authorization
- JWT middleware (`authenticateToken`) reads `Authorization: Bearer <token>`.
- Token payload includes user `id`, `email`, and `role`.
- Token lifetime is `7d`.
- Protected endpoints include `/auth/me`, `/api/user/dashboard`, `/api/appointments`, `/api/pets`, and appointment status updates.

## Endpoint Inventory
### Health/basic
- `GET /` -> API status string.

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (protected)

### Legacy/basic users
- `GET /users`
- `POST /users`

### Dashboard domain
- `GET /api/user/dashboard` (protected)
- `GET /api/doctors`
- `GET /api/appointments` (protected)
- `POST /api/appointments` (protected)
- `DELETE /api/appointments/:id` (protected)
- `PUT /api/appointments/:id/status` (protected)
- `GET /api/pets` (protected)
- `POST /api/pets` (protected)

### Marketplace domain
- `GET /products`
- `POST /products`
- `PUT /products/:id`
- `DELETE /products/:id`
- `GET /pets`
- `POST /pets`
- `PUT /pets/:id`
- `DELETE /pets/:id`

## Data Flow Highlights
- Registration creates user, optional first owned pet, preference row, and returns JWT + normalized user payload.
- Login validates password hash and returns JWT + user payload.
- Dashboard aggregates user profile, owned pets, preferences, appointment stats, and upcoming appointments with doctor/pet joins.
- Appointment creation returns enriched appointment response with joined doctor/pet info.

## Operational/Code Notes
- DB credentials are hardcoded in `db.js` and several scripts (not environment-driven yet).
- CORS currently allows `http://localhost:3000` with credentials.
- `app.listen(5000)` appears before marketplace route declarations in `server.js`; route registration order should be reviewed for maintainability.
- No formal test suite is wired (`npm test` script is placeholder).

## Setup and Utility Scripts
Typical backend setup order:
1. Configure Postgres database (`test_db` expected by defaults).
2. Run table creation scripts:
   - `node create-auth-tables.js`
   - `node create-dashboard-tables.js`
3. Optional seed/admin utilities:
   - `node create-test-user.js`
   - `node create-admin-user.js`
   - `node update-doctors.js`
   - `node add-doctor-notes.js`
   - `node add-contact-column.js`

## Backend Run
From `backend/`:
- `npm install`
- `node server.js` (or project-specific dev runner if added later)
