# TripEasy Planner (Web)

TripEasy is a fully featured trip planning web application built with Next.js 15, Prisma, Tailwind CSS, and Google Maps. Plan itineraries, manage logistics, collaborate with travel companions, and visualize activities on interactive maps.

## Features

- **Dashboard overview** – quick stats, upcoming trip cards, and preparation insights.
- **Trips library** – searchable, filterable list of every itinerary with progress tracking.
- **Trip workspace** – daily itinerary timeline, lodging & transport logistics, collaborative notes, and packing checklist.
- **Budget tracker** – add expenses, monitor category totals, and surface overall spend.
- **Interactive mapping** – Google Maps preview card plus full-page experience with day filtering.
- **Rich data model** – Prisma + SQLite schema covering activities, companions, packing items, expenses, notes, and more.
- **API endpoints** – RESTful routes for all major entities to support future integrations or mobile clients.

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router, Server Components, Suspense)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/) + SQLite
- [React Hook Form](https://react-hook-form.com/) + Zod validation
- [React Leaflet](https://react-leaflet.js.org/) for maps

## Getting Started

1. **Install dependencies**

   ```bash
   cd wanderlog-app
   npm install
   ```

2. **Configure environment**

   Copy the example env file and adjust if necessary:

   ```bash
   cp .env.example .env
   ```

   Add a Google Places API key so location autocomplete can reach Google's endpoints:

   ```
   GOOGLE_PLACES_API_KEY=your_google_places_api_key
   ```

3. **Initialize the database**

   ```bash
   npx prisma migrate dev
   npm run prisma:seed
   ```

   This seeds the database with a sample "Japan Spring Explorer" itinerary containing activities, logistics, and collaborators.

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000` to explore the dashboard and trip workspace.

## Project Structure

```
wanderlog-app/
├─ app/
│  ├─ page.tsx                # Dashboard overview
│  ├─ trips/                  # Trips library, new trip flow, workspace, map view
│  └─ api/                    # RESTful route handlers for CRUD operations
├─ components/
│  ├─ trips/                  # Trip-focused UI widgets (timeline, tasks, packing, etc.)
│  ├─ maps/                   # Map preview + full map experience
│  └─ common/                 # App shell and shared atoms
├─ lib/                       # Prisma client, data access, validation helpers
├─ prisma/                    # Schema & seed data
└─ styles/                    # Global styling helpers
```

## Development Notes

- **Server Actions ready** – configuration allows future server actions usage via `next-safe-action`.
- **Map tiles** – configurable via `NEXT_PUBLIC_MAP_TILE_URL` (defaults to OpenStreetMap tiles).
- **Styling** – Tailwind with a custom `brand` color palette keeps the UI cohesive.
- **Data fetching** – server components hydrate client sections with fully-typed Prisma results.

## Next Steps

- Add authentication and per-user workspaces.
- Expand collaboration (sharing, commenting, notifications).
- Integrate third-party APIs for reservations, flights, and POI search.
- Add automated testing (unit + integration) and CI workflows.

Enjoy planning your next adventure!
