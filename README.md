# 🎮 FragBeats — Game. Edit. Vibe.

> A short-form gaming clip platform for Indian gamers. Upload your best frags, add lo-fi beats, and share with a community that gets it.

🔗 **Live:** [fragbeats.vercel.app](https://fragbeats.vercel.app)

---

## 🚀 What is FragBeats?

FragBeats is a **TikTok-style gaming clip app** built specifically for Indian gamers. Upload 10–45 second clips from BGMI, Valorant, Free Fire, COD Mobile, GTA V and more — with lo-fi music built right in.

No noise. No dancing. Just frags and vibes.

---

## ✨ Features

- 🔐 **Real Auth** — Supabase email login/signup with username
- 📤 **3-Step Upload Flow** — Title, Game, Music in one smooth flow
- 🎬 **Explore Page** — Infinite scroll, game filters, real-time search
- ❤️ **Likes System** — Real like/unlike stored in database
- 💬 **Comments** — Real comments per clip stored in database
- 👤 **Profile Page** — Your clips, stats, total views and likes
- 🎵 **Music Library** — 12 lo-fi tracks with mini player on every page
- 🏆 **Leaderboard** — Top creators and clips
- 🔔 **Notifications** — Likes, comments, follows
- 📊 **Analytics** — Performance stats with SVG charts
- 🌙 **Dark / Light Mode** — React Context powered
- 📱 **PWA** — Installable on mobile like a native app
- 🔒 **RLS Enabled** — Row Level Security on all Supabase tables

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Routing | React Router DOM |
| State | React Context API |
| Backend | Supabase (Auth + DB + Storage) |
| Deployment | Vercel |
| PWA | Vite PWA Plugin |

---

## 🗄️ Database Schema

```
clips       — id, title, game, music, emoji, color, views, likes, user_id
profiles    — user_id, username, email, avatar_url, bio
clip_likes  — id, user_id, clip_id (unique constraint)
comments    — id, user_id, clip_id, text, created_at
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.jsx
│   ├── Hero.jsx
│   ├── Features.jsx
│   ├── Trending.jsx
│   ├── Footer.jsx
│   ├── CommentModal.jsx
│   ├── ShareModal.jsx
│   ├── MusicPlayer.jsx
│   ├── SkeletonCard.jsx
│   ├── PageLoader.jsx
│   ├── ScrollToTop.jsx
│   └── ProtectedRoute.jsx
├── pages/
│   ├── Home.jsx
│   ├── Auth.jsx
│   ├── Explore.jsx
│   ├── Upload.jsx
│   ├── Profile.jsx
│   ├── ClipDetail.jsx
│   ├── Music.jsx
│   ├── Search.jsx
│   ├── Leaderboard.jsx
│   ├── Notifications.jsx
│   ├── Analytics.jsx
│   ├── Settings.jsx
│   ├── Pricing.jsx
│   ├── Blog.jsx
│   ├── About.jsx
│   ├── Waitlist.jsx
│   ├── Terms.jsx
│   └── NotFound.jsx
├── context/
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
└── lib/
    └── supabase.js
```

---

## ⚡ Getting Started

```bash
# Clone the repo
git clone https://github.com/Amanulla4/fragbeats.git
cd fragbeats

# Install dependencies
npm install

# Add environment variables
cp .env.example .env
# Add your Supabase URL and anon key

# Run locally
npm run dev
```

---

## 🔑 Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🎯 Roadmap

- [ ] Real video upload to Supabase Storage
- [ ] Username shown on comments and clips
- [ ] Follow / unfollow system
- [ ] Real notifications
- [ ] Mobile app (React Native)
- [ ] FragBeats Pro subscription

---

## 👨‍💻 Built By

**Aman Pathan** — BCA Graduate, Frontend Developer, Gamer  
📍 Latur, Maharashtra  
🔗 [Portfolio](https://amanulla-pathan.github.io) • [LinkedIn](https://linkedin.com/in/amanulla-pathan) • [GitHub](https://github.com/Amanulla4)

---

> *"Built at midnight. Fueled by lo-fi. Made for gamers."* 🎮🎵