# God's Cake Backend

Production-oriented Express + MongoDB API for a location-based, multi-vendor cake ordering platform.

## Features
- JWT auth (`/api/register`, `/api/login`)
- Geospatial bakery search (`/api/bakeries/nearby`)
- External bakery provider integration (`maps-api.digitalleadpro.com`) with resilient retries and local sync
- Bakery geocoding endpoint (`/api/bakeries/geocode`)
- Bakery cakes endpoint (`/api/bakeries/:id/cakes`)
- Order placement + tracking (`/api/orders`, `/api/orders/:id`)
- CSV/JSON bakery ingestion with coordinate fallback geocoding

## Setup
1. Copy `.env.example` to `.env` and set values.
2. Install dependencies:
   - `npm install`
3. Start development server:
   - `npm run dev`

## Database Seed
- `npm run seed:bakeries`

This seeds:
- Bakeries from `src/ingestion/sample-bakeries.csv`
- 3 sample cakes per bakery

## Admin Bootstrap
1. Set these in `.env`:
   - `ADMIN_NAME`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - optional: `ADMIN_FORCE_RESET_PASSWORD=true` to rotate password for existing admin email
2. Run:
   - `npm run bootstrap:admin`

Behavior:
- Creates an admin if email does not exist.
- If email exists, promotes role to `admin` and updates name.
- Password is only reset when `ADMIN_FORCE_RESET_PASSWORD=true`.

## Delivery Partner Bootstrap
1. Set these in `.env`:
   - `PARTNER_NAME`
   - `PARTNER_EMAIL`
   - `PARTNER_PASSWORD`
   - optional: `PARTNER_FORCE_RESET_PASSWORD=true` to rotate password
2. Run:
   - `npm run bootstrap:partner`

Behavior:
- Creates a delivery partner if email does not exist.
- If email exists, promotes role to `partner` and updates name.
- Password is only reset when `PARTNER_FORCE_RESET_PASSWORD=true`.

## API Endpoints
- `POST /api/register`
- `POST /api/login`
- `GET /api/bakeries/geocode?address=...`
- `GET /api/bakeries/nearby?lat=..&lng=..&radius=10`
- `GET /api/bakeries/:id`
- `GET /api/bakeries/:id/cakes`
- `GET /api/orders` (Auth required, admin sees all / user sees own)
- `POST /api/orders` (Auth required)
- `GET /api/orders/:id` (Auth required)
- `PATCH /api/orders/:id/status` (Admin auth required)
- `GET /api/orders/delivery/available` (Partner auth required)
- `GET /api/orders/delivery/my` (Partner auth required)
- `POST /api/orders/:id/delivery/accept` (Partner auth required)
- `PATCH /api/orders/:id/delivery/status` (Partner auth required)

## Notes
- Geospatial filtering uses MongoDB `2dsphere` + `$near`.
- Nearby/list bakeries are sourced from `PLACES_API_BASE_URL` and normalized into local `Bakeries`.
- For heavy ingestion workloads, move ingestion to queue workers.
