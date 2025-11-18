# Eclipse-MD Hosting Platform 🤖

A web-based platform for deploying and managing Eclipse-MD WhatsApp bot instances on Heroku with a coin-based system.

## 🚀 Features

- **Easy Bot Deployment**: Deploy WhatsApp bots to Heroku with just a few clicks
- **Coin System**: 5 coins per deployment (users get 50 coins to start)
- **Real-time Monitoring**: View live logs from your bot deployments
- **Bot Management**: Restart or delete bot instances
- **Team Support**: Deploys to team Heroku accounts (configured for `kephakings1`)
- **Dark/Light Theme**: Modern UI with theme toggle
- **Secure**: Uses Replit Auth for authentication

## 📋 Prerequisites

Before running the platform, you need:

1. **Heroku API Key** (from team account)
2. **MongoDB Atlas Account** (free tier works)

## ⚙️ Setup

### Step 1: Add Secrets

Add these to your Replit Secrets panel:

```
HEROKU_API_KEY=your_heroku_api_key_here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eclipse-md
```

**Get Heroku API Key:**
- Login to https://dashboard.heroku.com/account
- Scroll to "API Key" → Click "Reveal"
- Copy and add to Replit Secrets

**Get MongoDB URI:**
- Create free cluster at https://mongodb.com/cloud/atlas
- Click "Connect" → "Connect your application"
- Copy connection string (replace `<password>`)

### Step 2: Configure Team (Optional)

The platform is pre-configured for the `kephakings1` team. To change:

Add to Replit Secrets:
```
HEROKU_TEAM=your_team_name
```

### Step 3: Run

Click the "Run" button! The platform will start on port 5000.

## 🎯 Usage

1. **Sign In**: The platform uses a development user by default
2. **Deploy Bot**: Click "New Deployment"
3. **Enter Details**:
   - WhatsApp Number (e.g., `2347055517860`)
   - Session ID (your WhatsApp pairing data)
   - Bot Settings (prefix, AI keys, auto-features)
4. **Monitor**: View logs, restart, or delete your bots

## 🏗️ Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Express + Node.js
- **Database**: PostgreSQL (user data) + MongoDB (bot deployments)
- **Hosting**: Replit (platform) + Heroku (bots)
- **UI**: Shadcn UI components

## 📁 Project Structure

```
├── client/           # React frontend
│   ├── src/
│   │   ├── pages/    # Dashboard, Deploy, Landing
│   │   ├── components/  # UI components
│   │   └── lib/      # Utils and API client
├── server/           # Express backend
│   ├── routes.ts     # API endpoints
│   ├── herokuService.ts  # Heroku integration
│   ├── mongodb.ts    # MongoDB connection
│   └── models/       # Database models
└── shared/           # Shared types and schemas
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Push database schema
npm run db:push
```

## 🌐 API Endpoints

- `GET /api/auth/user` - Get current user
- `GET /api/bots` - List all bot deployments
- `POST /api/bots` - Create new bot deployment
- `GET /api/bots/:id/logs` - Get bot logs
- `POST /api/bots/:id/restart` - Restart bot
- `DELETE /api/bots/:id` - Delete bot

## 🛡️ Security

- API keys stored securely in environment variables
- Session-based authentication
- CORS enabled for secure communication
- Team-based Heroku deployments for billing isolation

## 📝 Notes

- Default deployment cost: 5 coins
- Users start with 50 coins
- Bots deploy to Heroku team account automatically
- Delete functionality includes confirmation dialog
- Real-time log streaming supported

## 🐛 Troubleshooting

**App won't start?**
- Check if `MONGODB_URI` and `HEROKU_API_KEY` are in Secrets

**Deployment fails?**
- Verify team account has billing enabled
- Check Heroku API key is correct
- Ensure session ID is valid

**Delete not working?**
- Make sure app is running first
- Check browser console for errors
- Confirm bot exists in database

## 📄 License

MIT

## 👤 Author

Built for Eclipse-MD bot hosting on Heroku team accounts.
