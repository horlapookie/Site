# Eclipse-MD Hosting Platform - Setup Guide

## Quick Start

This platform allows you to deploy Eclipse-MD WhatsApp bot instances to Heroku using a coin-based system.

### Required Environment Variables

You need to add these secrets in the Replit Secrets panel:

#### 1. HEROKU_API_KEY
- Go to your Heroku account settings: https://dashboard.heroku.com/account
- Scroll to "API Key" section
- Click "Reveal" and copy your API key
- Add it to Replit Secrets as `HEROKU_API_KEY`

**For Team Account (kephakings1):**
- Make sure you're logged into the team account
- The platform is configured to deploy to the `kephakings1` team by default
- You can change this by adding `HEROKU_TEAM` secret with your team name

#### 2. MONGODB_URI
- Sign up for MongoDB Atlas (free): https://www.mongodb.com/cloud/atlas
- Create a new cluster (M0 free tier)
- Click "Connect" → "Connect your application"
- Copy the connection string
- Replace `<password>` with your database password
- Add it to Replit Secrets as `MONGODB_URI`

Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/eclipse-md-hosting`

### Already Configured (No Action Needed)
- ✅ DATABASE_URL - PostgreSQL (auto-configured by Replit)
- ✅ SESSION_SECRET - Session management (auto-configured)
- ✅ HEROKU_TEAM - Set to `kephakings1` by default

## Testing Bot Deployment

Once secrets are added, you can test with:
- Phone: `2347055517860`
- Session ID: (provided by user)
- The platform will deploy to your team Heroku account

## Features
- 🤖 Deploy WhatsApp bots to Heroku
- 💰 Coin-based deployment system (5 coins per deployment)
- 📊 Real-time log viewing
- 🔄 Bot restart functionality
- 🗑️ Bot deletion with confirmation
- 🌓 Dark/Light theme toggle
- 🔐 Replit Auth integration

## Team Deployment
The platform is configured to deploy all bots to the `kephakings1` team account on Heroku. This ensures billing is handled through the team account.
