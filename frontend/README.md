# God's Cake Frontend

Next.js app for location-aware cake ordering from nearby bakeries.
Leaflet + OpenStreetMap are used for delivery map visualization (no Mapbox token needed for map rendering).

## Setup
1. Copy `.env.example` to `.env.local`
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`

## Pages
- `/` Home
- `/register` Register
- `/login` Login
- `/bakeries` Nearby bakery discovery
- `/bakery/:id` Cakes from selected bakery
- `/cart` Checkout flow
- `/orders/:id` Order tracking
