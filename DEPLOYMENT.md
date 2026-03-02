# Deployment Guide

## Backend on Render
1. Create a new Web Service from `backend/`.
2. Build command: `npm install`
3. Start command: `npm start`
4. Add env vars:
   - `NODE_ENV=production`
   - `PORT=10000` (or Render assigned port)
   - `MONGO_URI=<MongoDB Atlas URI>`
   - `JWT_SECRET=<strong-secret>`
   - `JWT_EXPIRES_IN=7d`
   - `FRONTEND_URL=<vercel-frontend-url>`
   - `GEOCODE_PROVIDER=openstreetmap` (or `mapbox` + token)
5. Ensure MongoDB Atlas network access allows Render.

## Frontend on Vercel
1. Import `frontend/` as a Vercel project.
2. Framework preset: Next.js.
3. Add env var:
   - `NEXT_PUBLIC_API_BASE_URL=https://<render-backend-domain>/api`
4. Deploy.

## Post-Deploy Checks
1. Open frontend and register a user.
2. Search bakeries by address.
3. Open a bakery, add cakes to cart, place order.
4. Open order tracking page and verify status shows `Placed`.
