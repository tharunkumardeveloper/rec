# Deploy Backend to Render

## The Issue
Your production backend at `rec-backend-yi7u.onrender.com` doesn't have the new auth routes yet.
The auth routes (`/api/auth/signup`, `/api/auth/login`) only exist in your local code.

## Solution: Deploy Updated Backend to Render

### Option 1: Auto-Deploy (If Connected to GitHub)
If your Render service is connected to your GitHub repo:

1. **Push your backend changes** (already done ✅)
2. **Render will auto-deploy** - Check your Render dashboard
3. **Wait for deployment** - Usually takes 2-5 minutes
4. **Check logs** - Make sure auth routes are registered

### Option 2: Manual Deploy via Render Dashboard

1. Go to https://dashboard.render.com
2. Find your backend service (`rec-backend-yi7u`)
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for deployment to complete
5. Check logs to verify auth routes are loaded

### Option 3: Deploy New Backend Service

If you need to create a new backend service:

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `talenttrack-backend` (or any name)
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment Variables**:
     - `MONGODB_URI`: Your MongoDB connection string
     - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
     - `CLOUDINARY_API_KEY`: Your Cloudinary API key
     - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
5. Click "Create Web Service"
6. Wait for deployment
7. Update `VITE_BACKEND_URL` in your frontend to the new URL

## Verify Deployment

Once deployed, test the endpoints:

```bash
# Test signup endpoint
curl -X POST https://rec-backend-yi7u.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "role": "ATHLETE"
  }'

# Test login endpoint
curl -X POST https://rec-backend-yi7u.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

## Check Backend Logs

In Render dashboard:
1. Go to your service
2. Click "Logs" tab
3. Look for:
   - ✅ "MongoDB connected successfully"
   - ✅ "Server running on port 3001"
   - ✅ Auth routes should be registered

## Current Backend Files

Your backend already has:
- ✅ `server/routes/auth.js` - Auth endpoints
- ✅ `server/server.js` - Registers auth routes
- ✅ `server/db.js` - MongoDB connection

All you need to do is deploy!

## After Deployment

1. Your frontend will automatically connect to the production backend
2. Users can create accounts from any device
3. Login credentials work across all devices
4. All data stored in MongoDB (persistent)

## Troubleshooting

If deployment fails:
1. Check Render logs for errors
2. Verify MongoDB connection string is correct
3. Make sure all environment variables are set
4. Check that `server/routes/auth.js` exists in the deployed code
