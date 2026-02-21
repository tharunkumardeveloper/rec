# Test Connections API

## Test the API directly

Open your browser console and run these commands:

### 1. Test the /api/users/all endpoint (should show all 7 users)

```javascript
fetch('https://rec-backend-yi7u.onrender.com/api/users/all')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Total users:', data.length);
    console.log('📋 Users:', data.map(u => ({ name: u.name, role: u.role, userId: u.userId })));
  })
  .catch(err => console.error('❌ Error:', err));
```

### 2. Test the /api/users/discover endpoint (should show 6 users, excluding yourself)

```javascript
const currentUserId = localStorage.getItem('userId');
console.log('Current user ID:', currentUserId);

fetch(`https://rec-backend-yi7u.onrender.com/api/users/discover?userId=${currentUserId}`)
  .then(r => r.json())
  .then(data => {
    console.log('✅ Discoverable users:', data.length);
    console.log('📋 Users:', data.map(u => ({ name: u.name, role: u.role, userId: u.userId })));
  })
  .catch(err => console.error('❌ Error:', err));
```

### 3. Check if ConnectionsPage is loading

```javascript
// After clicking Connections button, check console for:
// - "Loading discover users for: coach_01b406652f27db9d"
// - "Discovered users: [...]"
// - "✅ Loaded users via fallback: 6"
```

## Expected Results

### For Coach (Gautham Vasudev menon):
- Should see 6 other users:
  1. Coach (coach@talenttrack.ai)
  2. Tharun Kumar (athlete_ae77e2c700a36856)
  3. Rajesh Kumar (sai_admin_b97c85134da63daf)
  4. Ratheesh (athlete_60065cba8d150a6f)
  5. Ratheesh (athlete_0da07afede2d5c61)
  6. Ratheesh (athlete_8357cf9736124482)

### For Athlete (Tharun Kumar):
- Should see 6 other users (all except yourself)

### For SAI Admin (Rajesh Kumar):
- Should see 6 other users (all except yourself)

## Troubleshooting

### If you see "No users found":

1. **Check browser console** for error messages
2. **Check Network tab** in DevTools:
   - Look for requests to `/api/users/discover` or `/api/users/all`
   - Check if they return 200 OK or error
3. **Check Render logs** for backend errors
4. **Verify userId** is being sent correctly

### If API returns empty array:

1. Check MongoDB connection
2. Verify users collection has data
3. Check if userId format matches

### If you see loading spinner forever:

1. API might be timing out
2. Check Render backend is running
3. Check CORS settings
