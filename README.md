# 🏆 TalentTrack - AI Fitness Revolution

<div align="center">

[![Live Demo](https://img.shields.io/badge/🚀-Live%20Demo-success?style=flat-square)](https://rec-green.vercel.app)
[![GitHub](https://img.shields.io/badge/⭐-Star-yellow?style=flat-square)](https://github.com/tharunkumardeveloper/rec)

**AI-powered workout analysis with real-time coaching and gamification**

[Quick Start](#-quick-start) • [Features](#-features) • [Tech](#-tech-stack)

</div>

## 🎯 What is TalentTrack?

Next-gen fitness platform combining **AI pose detection**, **voice coaching**, and **gamification**.

### Key Features

- 🤖 AI Analysis - MediaPipe pose detection & rep counting
- � Voice TCoach - ElevenLabs AI real-time encouragement  
- 👻 Ghost Mode - Race your best performances
- 🎯 Test Mode - Timed fitness challenges
- 📊 Analytics - Comprehensive progress tracking
- 🏅 Gamification - Badges, challenges, leaderboards
- 👥 Social - Connect with friends and coaches
- � PWA t- Install as native app

## 🎮 Workout Modes

**💪 Normal Mode** - AI rep counting with real-time form analysis and voice coaching

**👻 Ghost Mode** - Race against your previous best performance with visual comparison

**🎯 Test Mode** - Timed challenges (30s, 1min, 2min) with leaderboards and badges

## ✨ Features

### 🏋️ Supported Workouts

**Strength:** Push-ups, Pull-ups, Squats, Knee Push-ups  
**Cardio:** Shuttle Run, Vertical Jump  
**Flexibility:** Sit-ups, Sit & Reach  
**Variations:** Wide-arm, Inclined, Modified versions

### 🎤 AI Voice Coach

ElevenLabs AI provides real-time encouragement with dynamic feedback and personalized motivation.

**Voices:** Adam (male), Freya (female)

### 📊 Analytics & Tracking

Progress tracking • Form analysis • Rep screenshots • Video playback • PDF reports • Detailed statistics

### 👥 Social & Coaching

Friend connections • Leaderboards • Coach dashboard • Badges & achievements • AI chat support

### 🏛️ SAI Admin Dashboard

National leaderboard • Event scheduling • Talent scouting • Comprehensive analytics

## 🚀 Quick Start

**Try Online:** [https://rec-green.vercel.app](https://rec-green.vercel.app)

**Run Locally:**
```bash
git clone https://github.com/tharunkumardeveloper/rec.git
cd rec && npm install && npm run dev
```

**Requirements:** Node.js 16+, Modern browser, Webcam

## 🛠️ Tech Stack

**Frontend:** React 18, TypeScript, Vite, TailwindCSS  
**AI/ML:** MediaPipe, ElevenLabs, Python, OpenCV  
**Backend:** Node.js, Express, MongoDB, Cloudinary  
**Deploy:** Vercel, Render

## 🎯 How It Works

1. **📹 Record** - Webcam or upload video
2. **🤖 AI Analysis** - MediaPipe pose detection  
3. **📊 Feedback** - Real-time metrics & skeleton overlay
4. **🎤 Coaching** - Voice encouragement every 2 seconds
5. **💾 Save** - Store workout data & videos
6. **📈 Progress** - View analytics & improvements

## 🎮 User Roles

**🏃 Athlete:** Workouts, progress tracking, challenges, social features  
**👨‍🏫 Coach:** Monitor athletes, analytics, content creation, team management  
**🏛️ SAI Admin:** National leaderboard, events, talent scouting, oversight

## 🔧 Configuration

**Voice Coach:** Add `VITE_ELEVENLABS_API_KEY` to `.env.local` - See [ELEVENLABS_SETUP.md](ELEVENLABS_SETUP.md)

**MongoDB:** Add `MONGODB_URI` to `.env`

## 📚 Documentation

[Setup Guide](ELEVENLABS_SETUP.md) • [SAI Features](SAI_ADMIN_FEATURES.md) • [Face Verification](FACE_VERIFICATION_README.md)

## 🚀 Deploy

**Vercel:** `vercel --prod`  
**Render:** `git push origin main`

**Env vars:** `VITE_ELEVENLABS_API_KEY`, `MONGODB_URI`, `CLOUDINARY_*`

## 🤝 Contributing

Fork → Branch → Commit → Push → PR

## 🐛 Troubleshooting

**Camera:** Allow permissions, use Chrome  
**Voice:** Check API key, enable in settings  
**Backend:** Verify server & MongoDB connection

## 📈 Performance

⚡ 30 FPS pose detection • 🎥 HD video recording • 📱 Mobile optimized • 🌐 PWA support

## 🎯 Roadmap

Multi-language • Native apps • VR mode • Advanced AI • Global competitions

## 🙏 Credits

MediaPipe • ElevenLabs • React • MongoDB • Cloudinary

## 📄 License

MIT License

---

<div align="center">

[![Live Demo](https://img.shields.io/badge/🚀-Try%20Demo-success?style=flat-square)](https://rec-green.vercel.app)
[![GitHub](https://img.shields.io/badge/⭐-Star-yellow?style=flat-square)](https://github.com/tharunkumardeveloper/rec)

Made with 💪 by TalentTrack Team

</div>
