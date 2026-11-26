# FurEver Home

**FurEver Home** is a full-stack animal rescue, adoption, and pet care platform connecting adopters, verified shelters, rescuers, and veterinary clinics.

---

## Features

- **Authentication & Role-Based Access (`adopter`, `shelter`, `admin`)**: JWT-based authentication with protected routes and role-specific dashboards.
- **Animal Adoption Marketplace**: Browse available animals, view detailed profiles, and submit adoption applications; shelters and admins can manage listings and approve/reject requests.
- **Stray & Injured Animal Reporting + Live Rescue Map**: Report animals in distress with location data and track urgent vs. rescued cases on an interactive Leaflet / OpenStreetMap view.
- **Vets Near Me & Vet Directory**: Locate nearby veterinary clinics, browse the clinic directory, and read or submit clinic ratings and reviews.
- **Emergency SOS Contacts**: Floating SOS button to quickly find nearby rescue/emergency contacts based on GPS coordinates.
- **Pet Health Passports**: Manage microchip IDs, blood group, weight, spay/neuter status, allergies, chronic conditions, emergency vet contacts, vaccination logs (with due/overdue tracking), medical history records, and printable passport views.
- **Shelter & Admin Dashboards**: Analytics overview, shelter verification, user role management, and operational shortcuts.

---

## Tech Stack

- **Frontend (`client/`)**: React 18, Vite, React Router DOM, Tailwind CSS, Leaflet & React Leaflet, Lucide React, React Icons, AOS, DotLottie React Player, Cloudinary image upload
- **Backend (`server/`)**: Node.js (ESM), Express, MongoDB & Mongoose, JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cors`, `dotenv`

---

## Project Structure

```text
FurEver-Home/
├── client/                 # React + Vite frontend
│   ├── public/             # Static assets (.lottie animations)
│   └── src/
│       ├── components/     # Navbar, Hero, Footer, SosButton, ProtectedRoute, etc.
│       ├── context/        # AuthContext
│       ├── pages/          # Page components (Animals, ReportMap, HealthPassports, Dashboards, etc.)
│       ├── api.js          # API base URL helper
│       ├── App.jsx         # Application routes
│       └── main.jsx        # React entry point & AOS setup
└── server/                 # Express + Mongoose backend
    ├── config/             # MongoDB connection (db.js)
    ├── controllers/        # Route handlers
    ├── middleware/         # Auth & role authorization middleware
    ├── models/             # Mongoose schemas (User, Animal, Application, Report, VetClinic, VetReview, HealthPassport)
    ├── routes/             # Express API routes
    ├── utils/              # Distance, SOS search, vet rating & passport helpers
    ├── seed*.js            # Database seed scripts
    └── server.js           # Express app entry point
```

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB Atlas cluster or local MongoDB instance
- Cloudinary account (for uploading animal and report photos from the frontend)

### 1. Clone the repository

```bash
git clone https://github.com/Sara-Rubaya/FurEver-Home.git
cd FurEver-Home
```

### 2. Configure & Run the Backend (`server`)

```bash
cd server
npm install
```

Create a `server/.env` file (see `server/.env.example`):

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_jwt_secret
```

Start the backend server:

```bash
npm run dev
```

The API server runs on `http://localhost:5000` (health check: `GET /api/health`).

### 3. Configure & Run the Frontend (`client`)

Open a new terminal:

```bash
cd client
npm install
```

Optional `client/.env` variables:

```env
VITE_API_URL=http://localhost:5000
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

Start the Vite development server:

```bash
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies `/api` requests to `http://localhost:5000`.

### Production Build (`client`)

```bash
cd client
npm run build
```

---

## Database Seed Scripts

From the `server/` directory, you can run any of the seed scripts as needed:

```bash
node seedVets.js
node seedVetReviews.js
node seedReports.js
node seedRescuers.js
```

---

## API Endpoints Overview

| Prefix | Description |
| --- | --- |
| `/api/auth` | User registration, login, current user (`/me`), profile updates |
| `/api/animals` | Public animal listings & details; shelter/admin CRUD |
| `/api/applications` | Adoption application submission and status updates |
| `/api/reports` | Animal rescue reports, status updates, and rescue map feed |
| `/api/shelter` | Shelter dashboard statistics |
| `/api/admin` | Admin stats, user management, and shelter verification |
| `/api/vets` | Nearby vets, vet directory, clinic details, and reviews |
| `/api/sos` | Nearby emergency SOS contacts |
| `/api/passports` | Pet Health Passports, vaccinations, and medical records |
| `/api/health` | Server health check |
