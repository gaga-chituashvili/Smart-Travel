# StayBook — AI-Powered Travel Planning Platform

A modern full-stack travel planning platform with collaborative trip planning, interactive maps, budget management, and real-time collaboration.

## 🚀 Live Demo

- **Frontend:** https://smart-travel-ruby.vercel.app
- **Backend API:** https://smart-travel-3d9c.onrender.com

---

## 🛠 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS v4
- Framer Motion
- TanStack Query
- Zustand
- React Router DOM
- Leaflet (Interactive Maps)
- DnD Kit (Drag & Drop)
- Recharts
- Socket.io Client
- Lucide React

### Backend
- Node.js + Express (JavaScript)
- PostgreSQL + Prisma ORM
- Socket.io (Real-time)
- JWT Authentication
- Redis (optional)
- Cloudinary (Media)

---

## 📁 Project Structure
```
smarttravel/
├── frontend/                  # React + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # Navbar, Sidebar, Layout
│   │   │   └── ui/            # Reusable components
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── TripsPage.tsx
│   │   │   ├── TripDetailPage.tsx
│   │   │   ├── MapPage.tsx
│   │   │   ├── BudgetPage.tsx
│   │   │   ├── CollabPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   └── SavedPage.tsx
│   │   ├── hooks/
│   │   │   ├── useTrips.ts
│   │   │   ├── useBudget.ts
│   │   │   └── useCollab.ts
│   │   ├── store/             # Zustand stores
│   │   ├── lib/               # Axios instance
│   │   └── types/             # TypeScript types
│   ├── .env.local
│   └── .env.production
│
└── backend/                   # Node.js + Express
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── socket/
│   ├── config/
│   └── utils/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
└── .env
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL
- Git

### 1. Clone

```bash
git clone https://github.com/gaga-chituashvili/Smart-Travel.git
cd Smart-Travel
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env`:
```env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://your_user@localhost:5432/staybook"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret"
CLIENT_URL="http://localhost:5173"
```

```bash
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local`:
```env
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

```bash
npm run dev
```

App runs at: **http://localhost:5173**

---

## 🌐 Deployment

### Backend → Render

- **Root Directory:** `backend`
- **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy`
- **Start Command:** `npm start`

**Environment Variables:**
DATABASE_URL=your_postgres_url
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
NODE_ENV=production
PORT=4000
CLIENT_URL=https://your-frontend.vercel.app

### Frontend → Vercel

- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

**Environment Variables:**
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com

---

## ✨ Features

- ✅ JWT Authentication (Register / Login / Logout)
- ✅ Trip Planning with Day-by-Day Itinerary
- ✅ Drag & Drop Activity Reordering
- ✅ Budget Tracking & Expense Management
- ✅ Currency Converter
- ✅ Interactive Map (Leaflet)
- ✅ Real-time Collaboration (Socket.io)
- ✅ Comment System with Reactions
- ✅ Team Invitations
- ✅ Dark / Light Mode
- ✅ Fully Responsive Design
- ✅ Spending Charts (Recharts)



---

## 👤 Author

**Gaga Chituashvili**  
Full-Stack Engineer · Tbilisi, Georgia 🇬🇪  
GitHub: [@gaga-chituashvili](https://github.com/gaga-chituashvili)
