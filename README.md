# God's Cake

Location-based multi-vendor cake ordering platform with:
- `backend/` Express + MongoDB geospatial API
- `frontend/` Next.js web app

## Quick Start
1. Start MongoDB locally (`mongodb://127.0.0.1:27017`).
2. Backend:
   - `cd backend`
   - `cp .env.example .env`
   - `npm install`
   - `npm run seed:bakeries`
   - `npm run dev`
3. Frontend:
   - `cd frontend`
   - `cp .env.example .env.local`
   - `npm install`
   - `npm run dev`

## Core APIs
- `POST /api/register`
- `POST /api/login`
- `GET /api/bakeries/geocode?address=...`
- `GET /api/bakeries/nearby?lat=&lng=&radius=`
- `GET /api/bakeries/:id/cakes`
- `POST /api/orders`
- `GET /api/orders/:id`

## Database Setup Script
- `backend/scripts/seedBakeries.js` seeds sample bakeries + cakes.

## Sample Dataset
- `backend/src/ingestion/sample-bakeries.csv`

## Deployment
- See `DEPLOYMENT.md`
