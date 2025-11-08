# Talent Track - AI-Powered Workout Analysis App

A comprehensive fitness tracking application with AI-powered workout analysis using MediaPipe and computer vision.

## 🌟 Features

- **AI Workout Analysis**: Real-time pose detection and form validation using MediaPipe
- **Annotated Videos**: Skeleton overlay with colored lines, joint markers, and real-time metrics
- **7 Workout Types**: Push-ups, Pull-ups, Sit-ups, Vertical Jump, Shuttle Run, Sit Reach, Vertical Broad Jump
- **Live Recording**: Real-time camera recording and analysis (5 workout types)
- **Video Upload**: Upload pre-recorded workout videos for analysis
- **Performance Tracking**: Detailed metrics, rep counting, form validation, and progress tracking
- **Multi-Role Support**: Athlete, Coach, and Admin dashboards
- **Beautiful UI**: Modern, responsive design with Tailwind CSS and shadcn/ui

## 🚀 Quick Start

### One-Click Launch (Windows)

```bash
START.bat
```

This will automatically:
- Check requirements
- Install dependencies
- Start backend (Port 3001)
- Start frontend (Port 8080)
- Open browser

### Manual Start

**Terminal 1 - Backend:**
```bash
cd server
node server.js
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Then open: **http://localhost:8080**

### Local Development

1. **Install Dependencies**
```bash
npm install
```

2. **Start Development Server**
```bash
npm run dev
```

3. **Open Browser**
```
http://localhost:5173
```

### Deploy to Vercel

1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push
```

2. **Deploy**
- Go to [Vercel](https://vercel.com)
- Import your GitHub repository
- Vercel will automatically detect Vite and deploy
- Your app will be live in minutes!

**Note**: All processing happens in the browser using MediaPipe Web - no backend server needed!

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Fast setup and usage guide
- **[WORKOUT_SETUP.md](WORKOUT_SETUP.md)** - Detailed installation and configuration
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and technical details
- **[INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md)** - Python integration overview
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Comprehensive testing procedures

## 🎯 Supported Workouts

### Full Support (Upload + Live Recording)
- ✅ **Push-ups** - Rep counting, elbow angle tracking, form validation
- ✅ **Pull-ups** - Chin-over-bar detection, elbow extension measurement
- ✅ **Sit-ups** - Torso angle tracking, rep counting
- ✅ **Vertical Jump** - Jump height measurement, air time tracking
- ✅ **Shuttle Run** - Distance tracking, direction change detection

### Upload Only
- ✅ **Sit Reach** - Flexibility measurement
- ✅ **Vertical Broad Jump** - Horizontal distance tracking

## 🎨 Annotated Video Features

All processed videos include:
- **Skeleton Overlay**: Colored lines connecting body joints
- **Joint Markers**: Dots at key body points
- **Real-time Metrics**: Rep counter, angles, timer, state indicators
- **Form Feedback**: Correct/incorrect rep indicators
- **Color Coding**: Green (good form), Red (issues), Yellow (neutral)

## 🛠️ Technology Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui
- React Router
- TanStack Query

### Backend
- Node.js + Express
- Multer (file uploads)
- CSV Parser
- Child Process (Python integration)

### ML Processing
- Python 3.8+
- MediaPipe (pose detection)
- OpenCV (video processing)
- NumPy (calculations)
- Pandas (data handling)

## 📁 Project Structure

```
project/
├── src/                          # React frontend
│   ├── components/workout/       # Workout UI components
│   ├── services/                 # API services
│   └── pages/                    # App pages
├── server/                       # Node.js backend
│   ├── server.js                 # Express server
│   ├── uploads/                  # Temp video uploads
│   └── outputs/                  # Processed results
├── Talent Track py scripts/      # Python ML scripts
│   ├── pushup_video.py
│   ├── pullup_video.py
│   ├── situp_video.py
│   ├── verticaljump_video.py
│   ├── shuttlerun_video.py
│   └── requirements.txt
└── Documentation/                # Guides and docs
```

## 🎥 How It Works

1. **User uploads video or records live**
2. **Backend receives video and spawns Python process**
3. **Python script processes video:**
   - Detects body landmarks with MediaPipe
   - Tracks joint angles
   - Counts reps/jumps
   - Validates form
   - Draws skeleton overlay
   - Generates annotated video
4. **Backend returns results to frontend**
5. **User views annotated video with statistics**

## 📊 Output Data

### Annotated Video
- MP4 format with skeleton overlay
- Colored lines connecting joints
- Joint markers (dots)
- On-screen metrics (reps, angles, timer)
- Form indicators

### CSV Data
Detailed metrics per rep:
- Timestamps
- Joint angles
- Duration
- Form validation
- Performance statistics

## 🔧 Requirements

- **Python 3.8+** - [Download](https://www.python.org/downloads/)
- **Node.js 16+** - [Download](https://nodejs.org/)
- **Webcam** (optional, for live recording)

## 🎓 Usage

1. **Login** - Select Athlete role
2. **Select Workout** - Choose from 7 workout types
3. **Record/Upload** - Use camera or upload video
4. **Wait for Processing** - AI analyzes your workout (30-60 seconds)
5. **View Results** - Watch annotated video with skeleton overlay
6. **Review Metrics** - Check reps, form, angles, and statistics
7. **Submit** - Save workout to your profile

## 🐛 Troubleshooting

### Backend Connection Issues
```bash
# Ensure backend is running
cd server
npm start
```

### Python Errors
```bash
# Reinstall dependencies
cd "Talent Track py scripts"
pip install -r requirements.txt
```

### Camera Access
- Allow camera permissions in browser
- Try Chrome (recommended)
- Close other apps using camera

See [WORKOUT_SETUP.md](WORKOUT_SETUP.md) for detailed troubleshooting.

## 📈 Performance

- **Processing Time**: 30-60 seconds per video
- **Video Length**: 30 seconds to 2 minutes recommended
- **Resolution**: 720p or higher for best results
- **CPU Usage**: Moderate (MediaPipe optimized)

## 🎯 Tips for Best Results

- **Lighting**: Bright, even lighting
- **Framing**: Full body visible in frame
- **Background**: Plain, uncluttered
- **Camera**: Steady, landscape orientation
- **Clothing**: Fitted clothing for better detection

## 🚀 Future Enhancements

- Browser-based processing (TensorFlow.js)
- Cloud storage integration
- Social features (leaderboards, challenges)
- Mobile app (React Native)
- Advanced analytics dashboard
- Video comparison tools
- Progress tracking graphs

## 📞 Support

For issues or questions:
1. Check documentation in project root
2. Review browser console (F12)
3. Check server terminal for errors
4. Verify all dependencies installed

## 🙏 Credits

- **MediaPipe** - Google's ML framework
- **OpenCV** - Computer vision library
- **React** - UI framework
- **shadcn/ui** - Component library

## 📄 License

This project is built with [Lovable](https://lovable.dev)

## 🎉 Get Started

Ready to analyze your workouts? Run `start-full-app.bat` and start training! 💪

---

**Project URL**: https://lovable.dev/projects/08737ad9-f564-47e3-807e-3374d954b89f
