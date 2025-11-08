# 🏋️ Workout Analysis App

## 🚀 Quick Start (One-Click Launch)

### Just Double-Click:

```
START.bat
```

That's it! The script will:
- ✅ Check all requirements
- ✅ Install missing dependencies
- ✅ Start backend server (Port 3001)
- ✅ Start frontend (Port 8080)
- ✅ Open browser automatically

### To Stop:

```
STOP.bat
```

Or close the server windows.

---

## 📋 Requirements

- **Node.js** (v16+) - [Download](https://nodejs.org)
- **Python** (v3.8+) - [Download](https://python.org) *(Optional but recommended)*
- **Python packages** *(Auto-installed by START.bat)*:
  - opencv-python
  - mediapipe
  - numpy
  - pandas

---

## 🎯 How It Works

### With Backend (Python Scripts)
1. Upload video → Sent to backend server
2. Backend runs Python MediaPipe script from `scripts/` folder
3. Python processes video and generates:
   - Annotated video with skeleton overlay
   - CSV file with rep data
4. Results sent back to frontend
5. View annotated video and metrics

### Without Backend (Browser Only)
- If backend is not running, app automatically falls back to browser-based processing
- Uses MediaPipe in browser (slower but works offline)

---

## 📁 Project Structure

```
├── scripts/                    # Python MediaPipe scripts
│   ├── pushup_video.py
│   ├── pullup_video.py
│   ├── situp_video.py
│   ├── verticaljump_video.py
│   └── ...
├── server/                     # Backend server
│   ├── server.js              # Express server
│   ├── uploads/               # Uploaded videos
│   └── outputs/               # Processed results
├── src/                        # Frontend React app
│   ├── components/
│   ├── services/
│   │   ├── backendProcessor.ts    # Python backend integration
│   │   └── mediapipeProcessor.ts  # Browser fallback
│   └── ...
└── start-app.bat              # Windows startup script
```

---

## 🔧 Configuration

### Backend URL
Edit `.env` file (create if doesn't exist):
```
VITE_API_URL=http://localhost:3001
```

### Python Scripts
The backend automatically uses scripts from the `scripts/` folder:
- `pushup_video.py` → Push-ups
- `pullup_video.py` → Pull-ups
- `situp_video.py` → Sit-ups
- `verticaljump_video.py` → Vertical Jump
- `shuttlerun_video.py` → Shuttle Run
- `sitreach_video.py` → Sit Reach
- `verticalbroadjump_video.py` → Vertical Broad Jump

---

## 🐛 Troubleshooting

### Backend not starting?
```bash
cd server
npm install
node server.js
```
Check console for errors.

### Python errors?
Install required packages:
```bash
pip install opencv-python mediapipe numpy pandas
```

### Port already in use?
Change ports in:
- Backend: `server/server.js` (line with `PORT`)
- Frontend: `vite.config.ts`

### Video not processing?
1. Check browser console (F12)
2. Check backend terminal for Python errors
3. Ensure video format is MP4/AVI/MOV
4. Ensure full body is visible in video

---

## 📊 Supported Workouts

✅ Push-ups (all variations)
✅ Pull-ups
✅ Sit-ups
✅ Vertical Jump
✅ Standing Vertical Jump
✅ Standing Broad Jump
✅ Vertical Broad Jump
✅ Shuttle Run (all variations)
✅ Sit Reach
✅ Plank

---

## 🎥 Video Requirements

- **Format**: MP4, AVI, or MOV
- **Duration**: 5-60 seconds recommended
- **Quality**: 720p or higher
- **Framing**: Full body visible
- **Lighting**: Good lighting
- **Camera**: Stable (not handheld)
- **Angle**: Side view for most exercises

---

## 💡 Tips

- **First time**: Backend processing is more accurate
- **Offline**: Browser mode works without internet
- **Speed**: Backend is faster for longer videos
- **Accuracy**: Both modes use MediaPipe Pose

---

## 🆘 Need Help?

Check the console logs:
- Browser: Press F12
- Backend: Check terminal running `node server.js`

Common issues are usually:
1. Python not installed
2. Python packages missing
3. Port conflicts
4. Video format not supported
