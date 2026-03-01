# Ai-gym-planner
# ForgeFit — AI-Powered Gym Planner

A full-stack web application that uses AI to generate personalized workout plans, provide fitness coaching, and track your training progress.

Deployed App: https://ai-gym-planner.onrender.com/

![ForgeFit](https://img.shields.io/badge/ForgeFit-AI%20Gym%20Planner-c8f135?style=for-the-badge&labelColor=0a0a0a)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

---

## Features

- **AI Workout Generator** — Describe your goals, fitness level, and available equipment; the AI builds a full weekly programme
- **AI Fitness Coach** — Chat with an AI coach for advice on training, nutrition, recovery, and form
- **Workout Tracker** — Log, view, and manage all your workouts in one place
- **Progress Dashboard** — See your stats, weekly calendar, streaks, and recent activity at a glance
- **User Authentication** — Secure register/login with JWT tokens and bcrypt password hashing
- **Mobile Responsive** — Full mobile support with bottom navigation and slide-in sidebar drawer
- **Provider Agnostic AI** — Works with Groq, OpenAI, Mistral, or any OpenAI-compatible API

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML, CSS, Vanilla JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **AI** | Groq API (llama-3.3-70b-versatile) |
| **Security** | Helmet, CORS, express-rate-limit, express-validator |

---

## Project Structure

```
gym-planner-v2/
├── public/                  # Frontend (served as static files)
│   ├── index.html           # Landing page
│   ├── login.html           # Login page
│   ├── register.html        # Registration wizard (3 steps)
│   ├── dashboard.html       # Main dashboard
│   ├── workouts.html        # Workout library
│   ├── generator.html       # AI workout generator
│   ├── ai-coach.html        # AI chat coach
│   ├── profile.html         # User profile & settings
│   ├── styles.css           # Global stylesheet + responsive
│   ├── api.js               # Frontend API client
│   └── mobile.js            # Mobile nav (hamburger + bottom nav)
│
├── routes/
│   ├── auth.js              # POST /api/auth/register, /login, GET /me
│   ├── workouts.js          # CRUD /api/workouts
│   ├── ai.js                # POST /api/ai/generate-workout, /chat, /analyze-workout
│   └── users.js             # PATCH /api/users/profile, /password, DELETE /account
│
├── models/
│   ├── User.js              # User schema (name, email, password, goals, preferences)
│   └── Workout.js           # Workout schema (exercises, category, AI-generated flag)
│
├── middleware/
│   └── auth.js              # JWT verification middleware
│
├── server.js                # Express app entry point
├── package.json
├── .env                     # Environment variables (never commit this)
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **MongoDB** — local installation or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free)
- **Groq API Key** — free at [console.groq.com](https://console.groq.com)

### 1. Clone the Repository

```bash
git clone https://github.com/Ga1233/Ai-gym-planner.git
cd Ai-gym-planner
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Open `.env` and fill in all values:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/gym_planner

# Auth
JWT_SECRET=your_long_random_secret_here_at_least_32_chars
JWT_EXPIRES_IN=7d

# AI (Groq recommended)
AI_API_KEY=your_groq_api_key_here
AI_API_BASE_URL=https://api.groq.com/openai/v1
AI_MODEL=llama-3.3-70b-versatile
AI_MAX_TOKENS=2048

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

### 4. Run the App

```bash
# Development (auto-restarts on file changes)
npm run dev

# Production
npm start
```

Open **http://localhost:3000** in your browser.

### 5. First Use

1. Click **Get Started** on the landing page
2. Complete the 3-step registration (account details → fitness profile → equipment)
3. Go to **Generate Plan** → configure preferences → click Generate
4. Save the plan → workouts appear in **My Workouts**
5. Chat with the **AI Coach** for personalised advice

---

## API Reference

All `/api/workouts`, `/api/ai`, and `/api/users` endpoints require a `Bearer` token in the `Authorization` header.

### Auth

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Create new account | No |
| `POST` | `/api/auth/login` | Login, returns JWT | No |
| `GET` | `/api/auth/me` | Get current user | Yes |

**Register body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass1",
  "fitnessLevel": "intermediate",
  "goals": ["muscle_gain", "endurance"],
  "preferences": { "daysPerWeek": 4, "sessionLength": 60, "equipment": ["dumbbells"] }
}
```

### Workouts

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/workouts` | List workouts (supports `?category=strength&limit=20&page=1`) |
| `POST` | `/api/workouts` | Create workout |
| `GET` | `/api/workouts/:id` | Get single workout |
| `PATCH` | `/api/workouts/:id` | Update workout |
| `DELETE` | `/api/workouts/:id` | Delete workout |

### AI

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/generate-workout` | Generate a full weekly plan |
| `POST` | `/api/ai/chat` | Send a message to the AI coach |
| `POST` | `/api/ai/analyze-workout` | Get AI feedback on a workout |

**Generate workout body:**
```json
{
  "goals": ["muscle_gain"],
  "fitnessLevel": "intermediate",
  "daysPerWeek": 4,
  "sessionLength": 60,
  "equipment": ["dumbbells", "machines"],
  "focusArea": "full body"
}
```

### Users

| Method | Endpoint | Description |
|---|---|---|
| `PATCH` | `/api/users/profile` | Update name, goals, preferences |
| `PATCH` | `/api/users/password` | Change password |
| `DELETE` | `/api/users/account` | Delete account permanently |

---

## Security

- **API keys never reach the browser** — all AI requests are proxied through the server
- Passwords are hashed with **bcrypt** (12 salt rounds)
- **JWT** tokens expire after 7 days
- **Helmet** sets secure HTTP headers including Content Security Policy
- **Rate limiting** — 500 req/15min globally, 30 req/15min on auth endpoints, 20 req/min on AI endpoints
- **express-validator** validates all user input on the server

---

## AI Provider Configuration

The app works with any OpenAI-compatible API. Just change these two values in `.env`:

| Provider | `AI_API_BASE_URL` | Example Model |
|---|---|---|
| **Groq** (recommended) | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` |
| **OpenAI** | `https://api.openai.com/v1` | `gpt-4o` |
| **Mistral** | `https://api.mistral.ai/v1` | `mistral-large-latest` |
| **Ollama** (local) | `http://localhost:11434/v1` | `llama3` |

---

## Deployment

### Render (Free tier)

1. Push code to GitHub (ensure `.env` is in `.gitignore`)
2. Create a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster and get your connection string
3. Sign up at [render.com](https://render.com) with GitHub
4. **New** → **Web Service** → connect your repo
5. Set build command: `npm install`, start command: `node server.js`
6. Add all environment variables from `.env` in the Render dashboard (replace values with production ones)
7. Deploy — your app will be live at `https://your-app.onrender.com`

> **Note:** Render free tier spins down after 15 minutes of inactivity. Use [UptimeRobot](https://uptimerobot.com) (free) to ping your app every 10 minutes to keep it awake.

### Railway

1. Sign up at [railway.app](https://railway.app) with GitHub
2. **New Project** → **Deploy from GitHub repo**
3. Add environment variables in the **Variables** tab
4. **Settings** → **Networking** → **Generate Domain**
5. Update `ALLOWED_ORIGINS` to your Railway URL and redeploy

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `PORT` | Yes | Server port (default: 3000) |
| `NODE_ENV` | Yes | `development` or `production` |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens (32+ random chars) |
| `JWT_EXPIRES_IN` | Yes | Token expiry e.g. `7d`, `24h` |
| `AI_API_KEY` | Yes | Your AI provider API key |
| `AI_API_BASE_URL` | Yes | AI provider base URL |
| `AI_MODEL` | Yes | Model name e.g. `llama-3.3-70b-versatile` |
| `AI_MAX_TOKENS` | No | Max response tokens (default: 2048) |
| `ALLOWED_ORIGINS` | Yes | Comma-separated CORS origins |

---

## Scripts

```bash
npm start       # Start production server
npm run dev     # Start with nodemon (auto-restart on changes)
```

---

## License

MIT — feel free to use this project for personal or commercial purposes.

---

## Acknowledgements

- [Groq](https://groq.com) — blazing fast AI inference
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) — free cloud database
- [Render](https://render.com) — simple app hosting
- [Bebas Neue](https://fonts.google.com/specimen/Bebas+Neue) & [DM Sans](https://fonts.google.com/specimen/DM+Sans) — fonts used in the UI
