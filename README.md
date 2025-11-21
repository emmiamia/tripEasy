# TripEasy

A collaborative, full-stack trip planning application designed to centralize itineraries, logistics, budgets, and maps into one shared workspace. Built with modern technologies and a focus on user experience, collaboration, and code quality.

![license MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js 15.0](https://img.shields.io/badge/Next.js-15.0-black?logo=next.js)
![TypeScript 5.6](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)
![Prisma 5.20](https://img.shields.io/badge/Prisma-5.20-2D3748?logo=prisma)

## ✨ Features

### Core Functionality

* **Trip Dashboard**: Overview of all trips with quick stats, member counts, and upcoming dates
* **Trip Creation**: Streamlined form to create trips with automatic daily structure generation
* **Itinerary Management**: Day-by-day activity planning with location search, time slots, and cost tracking
* **Task Board**: Kanban-style task management with due dates, assignments, and completion tracking
* **Packing Checklist**: Categorized packing lists with check-off functionality and progress tracking
* **Expense Tracking**: Budget monitoring with category breakdowns and currency support
* **Interactive Maps**: Visual trip map with activity markers and route previews
* **Collaboration**: Role-based access (Owner/Editor/Viewer) with email invites and member management
* **Notes & Logistics**: Centralized notes, lodging details, and transport segment tracking

### Technical Features

* ✅ **Authentication & Authorization**: NextAuth with role-based access control and secure session management
* ✅ **Email Invites**: Resend integration for sending collaboration invitations
* ✅ **Database**: Prisma ORM with PostgreSQL/SQLite support and type-safe queries
* ✅ **Form Validation**: Zod schemas with React Hook Form for robust client/server validation
* ✅ **Image Handling**: Secure remote image validation with graceful fallbacks
* ✅ **API Routes**: RESTful Next.js API routes with error handling and authorization checks
* ✅ **Responsive Design**: Mobile-first Tailwind CSS with adaptive layouts
* ✅ **Type Safety**: Full TypeScript coverage with Prisma-generated types
* ✅ **Error Boundaries**: Graceful error handling and user-friendly error messages
* ✅ **Loading States**: Skeleton screens and optimistic UI updates

## 🚀 Getting Started

### Prerequisites

* Node.js 18+ and npm
* PostgreSQL (for production) or SQLite (for local development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tripeasy.git
cd tripeasy
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
DATABASE_URL="file:./dev.db"  # or PostgreSQL connection string
NEXTAUTH_SECRET="your-secret-here"
APP_URL="http://localhost:3000"

# Optional: Enable features
GOOGLE_PLACES_API_KEY="your-key"
RESEND_API_KEY="your-key"
INVITE_FROM_EMAIL="TripEasy <hi@yourdomain.com>"
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## 🛠️ Tech Stack

* **Framework**: Next.js 15 (App Router)
* **Language**: TypeScript
* **Database**: Prisma ORM with PostgreSQL/SQLite
* **Authentication**: NextAuth v5
* **Styling**: Tailwind CSS
* **Forms**: React Hook Form + Zod
* **Maps**: Google Maps API + Leaflet
* **Email**: Resend
* **Icons**: React Icons (Feather)

## 📝 License

MIT
