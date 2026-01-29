# FitFranken Chatbot - Fix Guide

## Issue
FitFranken chatbot not working after Vercel deployment.

## Root Cause
**Environment variable mismatch**: The API expects `GROQ_API_KEY` but the example file had `VITE_GROQ_API_KEY`.

## Solution

### 1. Vercel Environment Variables

Go to your Vercel project dashboard:

**Settings** → **Environment Variables** → Add:

```
Name: GROQ_API_KEY
Value: your_actual_groq_api_key_here
Environment: Production, Preview, Development (select all)
```

**IMPORTANT**: Use `GROQ_API_KEY` (without `VITE_` prefix) for the backend API.

### 2. Local Development

Update your `.env.local` file:

```bash
# Backend API (no VITE_ prefix)
GROQ_API_KEY=your_groq_api_key_here

# Frontend (with VITE_ prefix)
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

### 3. Get Your Groq API Key

1. Go to: https://console.groq.com/keys
2. Sign in or create account
3. Click "Create API Key"
4. Copy the key
5. Add it to Vercel environment variables

### 4. Redeploy

After adding the environment variable in Vercel:

```bash
# Trigger a new deployment
git commit --allow-empty -m "Trigger redeploy for env vars"
git push origin main
```

Or use Vercel dashboard:
- Go to **Deployments**
- Click **...** on latest deployment
- Click **Redeploy**

### 5. Verify It's Working

1. Visit your deployed site
2. Navigate to any athlete tab (Training, Discover, Report, Roadmap)
3. Click the purple floating chat button (bottom-right corner)
4. Send a test message: "What workouts are available?"
5. FitFranken should respond within 2-3 seconds

## Troubleshooting

### Still not working?

**Check Vercel Function Logs:**
1. Go to Vercel Dashboard
2. Click on your project
3. Go to **Deployments** → Click latest deployment
4. Click **Functions** tab
5. Look for `/api/chat` errors

**Common errors:**

- `GROQ_API_KEY not configured` → Environment variable not set
- `Rate limit exceeded` → Too many requests, wait 1 minute
- `Failed to get response from Groq API` → Invalid API key or Groq service down

### Test API Directly

Use curl to test the API endpoint:

```bash
curl -X POST https://your-site.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello",
    "conversationHistory": [],
    "userContext": {
      "userName": "Test",
      "userRole": "athlete",
      "recentWorkouts": [],
      "currentStats": {
        "totalWorkouts": 0,
        "weeklyStreak": 0,
        "badges": 0
      }
    },
    "currentTab": "training"
  }'
```

Expected response:
```json
{
  "message": "Hey Test! 👻 I'm FitFranken...",
  "actions": []
}
```

### Clear Browser Cache

If the chat button doesn't appear:
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear localStorage: Open DevTools → Application → Local Storage → Clear
3. Reload page

## Environment Variable Names

| Variable | Where Used | Prefix |
|----------|-----------|--------|
| `GROQ_API_KEY` | Backend API (`/api/chat`) | No prefix |
| `VITE_ELEVENLABS_API_KEY` | Frontend (TTS) | `VITE_` prefix |

**Why the difference?**
- Backend API routes in Vercel don't need `VITE_` prefix
- Frontend Vite apps need `VITE_` prefix to expose variables to client

## Success Checklist

- [ ] Groq API key obtained from console.groq.com
- [ ] Environment variable `GROQ_API_KEY` added to Vercel (all environments)
- [ ] Redeployed after adding environment variable
- [ ] Chat button appears on athlete tabs
- [ ] Chat opens when button clicked
- [ ] FitFranken responds to messages
- [ ] No errors in browser console
- [ ] No errors in Vercel function logs

## Support

If still having issues:
1. Check Vercel function logs for specific errors
2. Verify API key is valid at console.groq.com
3. Test API endpoint directly with curl
4. Check browser console for frontend errors

---

**FitFranken should now be working! 👻💪**
