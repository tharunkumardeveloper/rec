# Push-up Live Detection Testing Guide

## How to Test

1. **Open the website** and navigate to Training > Push-ups > Live Mode
2. **Open Browser Console** (Press F12, then click "Console" tab)
3. **Allow camera access** when prompted
4. **Click "Start Recording"**

## What You Should See

### In the Console (F12):
- `✅ Push-up detector initialized` - Confirms detector is ready
- `🎬 Processing frame with detector` - Confirms frames are being processed
- `🔄 Detector processing landmarks` - Confirms detector is receiving data
- `📊 Elbow: XXX° | State: up/down | Reps: X` - Shows current metrics

### On Screen:
- **Skeleton overlay** - Purple/green lines showing your body
- **Metrics overlay** (when recording):
  - `Reps: 0` (in yellow)
  - `Elbow: XXX°` (green if ≤75°, red otherwise)
  - `Plank: XXX°` (green if ≥165°, red otherwise)
  - `Depth: XXX` (green if ≥40, red otherwise)
  - `State: up/down` (in gray)

## How to Do a Push-up for Detection

1. **Get into plank position** (hands on ground, body straight)
2. **Lower your body** until elbows bend to ~75° or less
   - You should see `🔽 Going DOWN` in console
   - Elbow angle should turn GREEN
3. **Push back up** until arms are straight (~110° or more)
   - You should see `🔼 Going UP` in console
   - You should see `✅ REP COMPLETED!` with all metrics
   - Rep count should increase by 1

## Troubleshooting

### If you see "⚠️ Detector not initialized!"
- The detector wasn't created for Push-ups
- Make sure you selected "Push-ups" activity

### If you see "⚠️ No pose detected!"
- MediaPipe can't see your body
- Move back so your full body is visible
- Ensure good lighting

### If angles show but reps don't count:
- Check console for `📊` logs to see current elbow angle
- Make sure elbow angle goes below 75° (bend elbows more)
- Make sure elbow angle goes above 110° (straighten arms fully)
- Check that you're in proper plank position (body straight)

### If nothing shows in console:
- Refresh the page
- Make sure you're in "Push-ups" activity
- Check browser console for any errors (red text)

## Expected Behavior

**Python code behavior:**
- DOWN_ANGLE = 75° (must go below this)
- UP_ANGLE = 110° (must go above this)
- PLANK_MIN_ANGLE = 165° (body should be straight)
- CHEST_DEPTH_MIN = 40 pixels (wrist should be below shoulder)

**Rep is counted when:**
1. You go from "up" state to "down" state (elbow ≤ 75°)
2. You go from "down" state to "up" state (elbow ≥ 110°)
3. Duration between down and up is ≥ 0.2 seconds

**Rep is marked "correct" when:**
- Minimum elbow angle ≤ 75°
- Duration ≥ 0.2 seconds
- Plank angle ≥ 165° (body straight)
- Chest depth ≥ 40 pixels (proper depth)

## Debug Information

The console logs will show you exactly what's happening:
- Current elbow angle
- Current state (up/down)
- When state changes (going down/up)
- When rep completes with all validation checks

If reps still don't count, share the console logs!
