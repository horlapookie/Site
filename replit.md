# Eclipse-MD WhatsApp Bot Hosting Platform

## Overview

Eclipse-MD is a WhatsApp bot hosting platform that enables users to deploy and manage Eclipse-MD WhatsApp bot instances on Heroku. The platform uses a coin-based system where users receive 10 free coins on signup and spend 10 coins per bot deployment. Bots expire after 5 days and auto-renew if the user has sufficient coins. The platform includes referral rewards, coin claiming/transfer features, and automated bot monitoring capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React with TypeScript using Vite for bundling and development
- Wouter for client-side routing
- TanStack Query for server state management and API caching
- Shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for styling with custom theme system supporting dark/light modes

**Design System**
- Typography: Inter font family for UI, JetBrains Mono for code/logs
- Component structure follows modern deployment platform patterns (Vercel, Railway)
- Fully responsive with mobile-first approach
- Theme toggle persists to localStorage

**State Management Strategy**
- Authentication state managed via JWT tokens stored in localStorage
- Server state cached with TanStack Query (bots, user data, transactions)
- Form state handled by React Hook Form with Zod validation
- UI state (dialogs, theme) uses local component state

### Backend Architecture

**Server Framework**
- Express.js with TypeScript
- Session management using express-session with PostgreSQL store
- JWT authentication for API endpoints
- Environment-based configuration (development/production modes)

**Authentication & Authorization**
- JWT-based authentication system
- Tokens stored client-side, validated on each request
- Session management for development features
- Protected routes require valid JWT token in Authorization header

**API Design**
- RESTful endpoints under `/api/*`
- Standardized error handling with HTTP status codes
- Request/response validation using Zod schemas
- Rate limiting considerations for coin operations

### Data Storage Solutions

**PostgreSQL (Drizzle ORM)**
- User accounts (email, password hash, profile data)
- Coin balances and claim timestamps
- Referral tracking (codes, relationships, counts)
- Auto-monitor preferences
- Session storage for development
- Schema defined in `shared/schema.ts` using Drizzle

**MongoDB (Mongoose)**
- Bot deployment records (Heroku app details, configuration)
- Transaction history (claims, transfers, deductions, referrals)
- Bot status tracking (running, stopped, deploying, failed)
- Expiration timestamps for automated cleanup

**Storage Pattern Rationale**
- PostgreSQL for user data provides ACID compliance for financial operations (coins)
- MongoDB for bot deployments offers flexible schema for varying bot configurations
- Separation allows independent scaling of user vs. deployment data

### External Dependencies

**Heroku API Integration**
- Creates and manages bot app instances programmatically
- Deploys Eclipse-MD from GitHub repository
- Manages environment variables (session data, API keys, bot settings)
- Provides log streaming and dyno control (restart, delete)
- Configured to deploy to team account (`kephakings1`)

**Database Services**
- PostgreSQL: Provisioned by Replit automatically (DATABASE_URL)
- MongoDB Atlas: User-configured connection (MONGODB_URI)

**Third-Party APIs**
- Google Analytics (gtag.js) for user tracking
- ProPush notification service for PWA features
- Ad networks (iframe embeds on landing page)

**Environment Configuration**
- `HEROKU_API_KEY`: Required for Heroku deployments
- `HEROKU_TEAM`: Team account name for deployments (default: kephakings1)
- `MONGODB_URI`: MongoDB Atlas connection string
- `DATABASE_URL`: PostgreSQL connection (auto-configured)
- `SESSION_SECRET`: Session encryption key
- `JWT_SECRET`: JWT token signing key
- `NODE_ENV`: Environment mode (development/production)

### Background Jobs & Automation

**Bot Expiration System**
- Runs periodic checks for expired bots
- Auto-renews if user has 10+ coins (deducts 10 coins, extends 5 days)
- Deletes bot and Heroku app if insufficient coins
- Cleanup task runs on interval

**Auto-Monitor Service**
- Monitors bot status (stopped/failed states)
- Auto-restarts bots for users with auto-monitor enabled
- Costs 15 coins per restart attempt
- Runs every 10 minutes checking all deployments

**Coin Claiming System**
- Users can claim 1 coin every 8 seconds (10 coins total per 24-hour period)
- Claim eligibility tracked via `lastCoinClaim` date in MongoDB User collection
- Uses persistent date-based tracking: `lastCoinClaim` updated on FIRST claim of day
- Server restart-safe: claim tracking persists in database, not just in-memory
- Daily tracking reset: users can claim 10 coins per calendar day

**Referral System**
- Generates unique referral codes on signup
- Awards 5 coins to both referrer and new user
- Tracks referral count for analytics

### Security Considerations

**Authentication Security**
- Passwords hashed using bcrypt (10 rounds)
- JWT tokens expire after 30 days
- Protected endpoints validate token on every request
- Session cookies marked httpOnly, with sameSite protection

**Development Safety**
- Database clear endpoint only available in non-production
- Clear endpoint requires authentication
- Admin features protected by isAdmin flag

**API Key Management**
- Sensitive keys stored in environment variables
- Heroku API key never exposed to client
- Bot session data encrypted in transit

### Deployment Strategy

**Production Build**
- Vite builds optimized React bundle
- Server code bundled with esbuild
- Static assets served from `dist/public`
- Express serves API and handles client routing fallback

**Development Workflow**
- Hot module replacement via Vite
- TypeScript compilation with strict mode
- Drizzle migrations for schema changes
- Scripts for database management and testing

## Recent Updates (Nov 23, 2025)

### Ads & Monetization
- **Adsterra Banners**: Integrated on login, signup, dashboard, deploy, and admin pages
- **PopunderClickModal**: User must click button to trigger popunders (respects browser popup blockers)
- **Dashboard Popunders**: 30% chance on user click with 2-minute cooldown
- **PropPush Integration**: Re-enabled with graceful error handling for DNS failures
- **Tasks Popunder**: Clickable popunder modal for "watch 10 ads" task completion

### Coin System Fixes
- **Fixed claim tracking bug**: Updated `lastCoinClaim` on FIRST claim instead of 10th
- **Server restart resilience**: Claim tracking now persists in MongoDB, not just in-memory
- **Date-based checking**: Uses date string comparison instead of hour calculation
- **Status**: Coin claiming now works reliably across server restarts