# Development Commands

## Clear Database

To clear all database data (users, coins, bot deployments) during development, you must first be logged in:

**Web Browser Method (Easiest):**
1. Sign in to the application
2. Open browser console
3. Run: `fetch('/api/dev/clear-database', {method: 'POST'}).then(r => r.json()).then(console.log)`

**Command Line Method:**
```bash
# Login first to establish a session
curl -c cookies.txt http://localhost:5000/api/login

# Then clear the database using the session
curl -b cookies.txt -X POST http://localhost:5000/api/dev/clear-database
```

**Security Note:** This endpoint requires authentication and is only available when NODE_ENV is not set to "production".

### What it clears:
- All user data from PostgreSQL
- All coin balances and claim history
- All bot deployments from MongoDB
- All sessions (you will be logged out)

### Example Response:
```json
{
  "message": "All database data cleared successfully. You have been logged out."
}
```

After running this command, you'll need to sign up again to create a new user account.

## Authentication System

This project uses a mock authentication system for development:
- A single mock user (ID: "dev-user-123") is shared across all sessions
- Users "sign up" by visiting `/signup` and clicking "Create Account"
- This creates/restores the mock user and establishes a session
- Sign out properly destroys the session and requires re-signup
