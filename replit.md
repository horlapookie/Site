# Eclipse-MD Hosting Platform

A WhatsApp bot hosting platform that allows users to deploy Eclipse-MD bot instances to Heroku with a coin-based system, real-time log viewing, and dark/light theme toggle.

## Overview

Users can:
- Sign up and log in with Replit Auth (supports Google, GitHub, X, Apple, email/password)
- Get 10 free coins upon registration
- Deploy Eclipse-MD WhatsApp bot instances to Heroku
- View real-time deployment logs
- Manage bot deployments (restart, delete)
- Toggle between dark and light themes

## Recent Changes (January 12, 2025)

### Backend Implementation
- Set up PostgreSQL database for user authentication (Replit Auth)
- Set up MongoDB for bot deployment data
- Implemented Heroku API integration for bot deployments
- Created REST API endpoints for:
  - User authentication (`/api/auth/user`)
  - Bot CRUD operations (`/api/bots`)
  - Bot logs (`/api/bots/:id/logs`)
  - Bot restart/delete functionality
- Integrated coin system (users start with 10 coins, 5 coins per deployment)

### Frontend Implementation
- Connected all pages to backend APIs
- Implemented authentication flow with Replit Auth
- Added real-time data fetching with React Query
- Created user dashboard with bot management
- Implemented deployment form with validation
- Added log viewer with auto-refresh
- Error handling with unauthorized redirects

## Project Architecture

### Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui, Wouter (routing), TanStack Query
- **Backend**: Express.js, TypeScript
- **Databases**: 
  - PostgreSQL (via Drizzle ORM) - User data and sessions
  - MongoDB (via Mongoose) - Bot deployment data
- **Authentication**: Replit Auth (OpenID Connect)
- **Deployment**: Heroku Platform API
- **External Services**: Heroku API for bot deployments

### Database Schema

#### PostgreSQL (User Data)
- `sessions` - Session storage for Replit Auth
- `users` - User accounts with coins balance

#### MongoDB (Bot Data)
- `bots` - Bot deployment records with:
  - User ID reference
  - Heroku app details
  - Bot configuration (number, session data, prefix, API keys)
  - Status tracking (deploying, running, stopped, failed)
  - Deployment timestamps

### Key Files

#### Backend
- `server/routes.ts` - API endpoints and authentication setup
- `server/replitAuth.ts` - Replit Auth/OpenID Connect configuration
- `server/storage.ts` - PostgreSQL database operations
- `server/mongodb.ts` - MongoDB connection management
- `server/models/Bot.ts` - Mongoose model for bot deployments
- `server/herokuService.ts` - Heroku API integration
- `shared/schema.ts` - Shared types and schemas

#### Frontend
- `client/src/App.tsx` - Main app with routing
- `client/src/pages/` - Page components (Home, Dashboard, Deploy)
- `client/src/components/` - Reusable UI components
- `client/src/hooks/useAuth.ts` - Authentication hook
- `client/src/lib/authUtils.ts` - Auth error handling utilities

## Environment Variables

Required secrets:
- `DATABASE_URL` - PostgreSQL connection string (auto-configured by Replit)
- `MONGODB_URI` - MongoDB connection string
- `HEROKU_API_KEY` - Heroku API key for deployments
- `SESSION_SECRET` - Session encryption key (auto-configured by Replit)
- `REPL_ID` - Replit app ID (auto-configured)

## User Flow

1. **Landing Page**: User sees hero section with "Get Started Free" CTA
2. **Sign In**: Click sign in → Replit Auth login flow → Redirects back with 10 coins
3. **Dashboard**: View deployed bots or deploy first bot
4. **Deploy Bot**:
   - Enter WhatsApp number
   - Enter session ID (with help link to https://eclipse-session.onrender.com)
   - Configure prefix and optional features
   - Deploy (costs 5 coins)
5. **Manage Bots**: View logs, restart, or delete deployments

## Bot Deployment Process

When a user deploys a bot:
1. Backend validates input and checks coin balance
2. Generates unique Heroku app name
3. Creates bot record in MongoDB (status: "deploying")
4. Deducts 5 coins from user balance
5. Asynchronously:
   - Creates Heroku app via API
   - Sets environment variables from render.yaml
   - Deploys from GitHub repo (horlapookie/Eclipse-MD)
   - Updates bot status to "running" or "failed"
   - Refunds coins on failure

## Design Guidelines

- Black and white theme with dark/light mode toggle
- Clean, modern interface inspired by Vercel/Railway
- JetBrains Mono for code/logs, Inter for UI
- Minimal shadows, subtle elevations
- Consistent spacing and component usage
- See `design_guidelines.md` for detailed design specs

## Development

### Running the Project
```bash
npm run dev  # Starts both frontend and backend
```

### Database Migrations
```bash
npm run db:push  # Sync PostgreSQL schema changes
```

## Future Enhancements

- Coin purchase system with payment integration
- Bot health monitoring and uptime tracking  
- Email notifications for deployment events
- Admin dashboard for platform analytics
- Deployment history and usage analytics
