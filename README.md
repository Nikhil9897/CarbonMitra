<p align="center">
  <img src="https://img.icons8.com/color/96/earth-planet.png" alt="CarbonTrack Logo" width="80" />
</p>

<h1 align="center">🌍 CarbonTrack</h1>
<p align="center"><strong>Full-Stack Sustainability Analytics Platform</strong></p>

<p align="center">
  <a href="https://github.com/Milindverma24/carbon_tracker"><img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" /></a>
  <img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" />
  <img src="https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</p>

---

## 📸 Screenshots

> Add your screenshots here after deployment.

---

## ✨ Features

### 👤 User Capabilities
- **Flexible Authentication** – Register locally or authenticate via Google OAuth2.
- **Dynamic Emission Engine** – Log transport, electricity, food, and shopping activities with database-driven emission factors.
- **Goal Tracking** – Set reduction goals, track savings against a baseline, and predict completion dates.
- **Community Leaderboard** – Compare achievements with GDPR-masked usernames.
- **Gamification** – Earn badges for streaks (7/30 days) and carbon-saving milestones.
- **Carbon Certificates** – Generate and download personalized certificates with unique IDs.
- **Interactive Route Planner** – Search routes on OpenStreetMap, calculate shortest paths, compare vehicle emissions, and log trips.
- **AI Eco-Assistant** – Chat with a Cohere-powered sustainability chatbot for personalized green tips.

### 🏢 Organization Portal
- Track aggregate emissions across all affiliated members.
- Manage and invite users to corporate organizations.

### 🛡️ Administrator Panel
- Review and manage user profiles.
- Dynamically adjust emission factors globally.

### 📧 Email Notifications
- Welcome emails on registration.
- Daily streak warnings and weekly carbon digests.
- Password reset emails with secure tokens.
- Brevo SMTP with graceful fallback logging.

---

## 🏗️ Architecture

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│   React +    │──────▶│  Spring Boot 3   │──────▶│   MySQL 8    │
│   Vite       │ REST  │  (REST API)      │  JPA  │  (Primary)   │
│   (Vercel)   │◀──────│  (Render)        │◀──────│              │
└──────────────┘       └────────┬─────────┘       └──────────────┘
                                │
                       ┌────────┴─────────┐
                       │   Redis Cache    │
                       │   (Upstash)      │
                       └──────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Java 17, Spring Boot 3.3, Spring Security 6, Spring Data JPA, Flyway, Maven |
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts, Leaflet.js, Lucide Icons |
| **Database** | MySQL 8 |
| **Cache** | Redis (Upstash for production) |
| **Auth** | JWT (Access + Refresh Tokens), Google OAuth2, BCrypt |
| **Email** | Brevo SMTP (production), Console fallback (development) |
| **AI** | Cohere Chat API |
| **Maps** | OpenStreetMap + OSRM Routing + Nominatim Geocoding |
| **Docs** | Swagger / OpenAPI 3 (SpringDoc) |
| **Monitoring** | Spring Boot Actuator |

---

## 📂 Folder Structure

```
carbon_track/
├── backend/
│   ├── src/main/java/com/carbontrack/
│   │   ├── config/         # App & OpenAPI configuration
│   │   ├── controller/     # REST Controllers
│   │   ├── dto/            # Data Transfer Objects
│   │   ├── entity/         # JPA Entities
│   │   ├── event/          # Spring Application Events
│   │   ├── exception/      # Global Exception Handler
│   │   ├── listener/       # Event Listeners
│   │   ├── mapper/         # MapStruct Mappers
│   │   ├── repository/     # Spring Data JPA Repositories
│   │   ├── security/       # JWT, OAuth2, Spring Security
│   │   └── service/        # Business Logic & Implementations
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/   # Flyway SQL migrations
│   ├── .env                # Local secrets (git-ignored)
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context (Auth)
│   │   ├── pages/          # Page components
│   │   └── services/       # Axios API client
│   ├── vercel.json         # Vercel SPA routing
│   └── package.json
├── .env.example            # Environment variable template
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🚀 Installation & Local Setup

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8+
- Redis
- Maven

### 1. Clone the Repository
```bash
git clone https://github.com/Milindverma24/carbon_tracker.git
cd carbon_tracker
```

### 2. Configure Environment Variables
```bash
cp .env.example backend/.env
```
Edit `backend/.env` and fill in your actual values.

### 3. Create MySQL Database
```sql
CREATE DATABASE carbontrack;
```

### 4. Run Backend
```bash
cd backend
mvn spring-boot:run
```
Flyway will automatically run all database migrations.

### 5. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

### 6. Swagger API Docs
Open [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html).

---

## 🔐 Environment Variables

| Variable | Description |
| :--- | :--- |
| `DB_HOST` | MySQL host |
| `DB_PORT` | MySQL port (default: 3306) |
| `DB_NAME` | Database name |
| `DB_USER` | Database username |
| `DB_PASSWORD` | Database password |
| `REDIS_HOST` | Redis host |
| `REDIS_PORT` | Redis port (default: 6379) |
| `JWT_SECRET` | 256-bit hex key for JWT signing |
| `GOOGLE_CLIENT_ID` | Google OAuth2 Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 Client Secret |
| `BREVO_SMTP_HOST` | Brevo SMTP server |
| `BREVO_SMTP_PORT` | Brevo SMTP port |
| `BREVO_SMTP_USERNAME` | Brevo SMTP username |
| `BREVO_SMTP_PASSWORD` | Brevo SMTP password |
| `COHERE_API_KEY` | Cohere AI API key |
| `FRONTEND_URL` | Frontend URL for CORS & OAuth redirect |
| `VITE_API_URL` | Backend API URL (frontend) |

---

## 🔑 Authentication

### JWT Flow
1. User registers or logs in → receives `accessToken` + `refreshToken`.
2. Access token expires in **1 hour**; refresh token in **7 days**.
3. Frontend auto-refreshes expired access tokens using the refresh token.

### Google OAuth2 Flow
1. User clicks "Login with Google" → redirected to Google consent screen.
2. Google returns authorization code → backend exchanges for user info.
3. Backend creates/updates user and returns JWT tokens.

**Production OAuth Setup:**
- **Authorized JavaScript Origins**: `https://your-backend.onrender.com`
- **Authorized Redirect URIs**: `https://your-backend.onrender.com/login/oauth2/code/google`

---

## 📖 API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/auth/register` | Create local account |
| POST | `/api/auth/login` | Local authentication |
| POST | `/api/auth/refresh` | Rotate access/refresh tokens |

### Activities (`/api/activities`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/activities` | Log an activity |
| GET | `/api/activities` | Get user's activity history |
| DELETE | `/api/activities/{id}` | Delete an activity log |

### Goals (`/api/goals`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/goals` | Set a reduction goal |
| GET | `/api/goals/{id}/progress` | Check goal progress |
| GET | `/api/goals/{id}/prediction` | Forecast completion |

### Other Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/analytics` | Dashboard metrics |
| GET | `/api/leaderboard` | Community rankings |
| GET | `/api/recommendations` | Personalized tips |
| GET | `/api/badges` | Earned badges |
| POST | `/api/ai/chat` | AI Eco-Assistant |

Full interactive docs: **Swagger UI** at `/swagger-ui.html`.

---

## 🌐 Deployment Guide

### Backend → Render

1. Push code to GitHub.
2. Create a **Web Service** on [Render](https://render.com).
3. Connect your GitHub repository.
4. Configure:
   - **Build Command**: `cd backend && mvn clean package -DskipTests`
   - **Start Command**: `cd backend && java -jar target/carbontrack-backend-0.0.1-SNAPSHOT.jar`
   - **Environment**: `Java 17`
5. Add all environment variables from `.env.example` in Render's Environment tab.
6. Render auto-detects the `PORT` variable and assigns it.

### Frontend → Vercel

1. Import the `frontend` folder on [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add environment variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com`
4. Deploy. Vercel handles SPA routing via `vercel.json`.

### Database → Free MySQL Hosting

| Provider | Free Tier |
| :--- | :--- |
| [Railway](https://railway.app) | 500 MB MySQL |
| [PlanetScale](https://planetscale.com) | 5 GB (MySQL-compatible) |
| [Aiven](https://aiven.io) | Free MySQL tier |
| [FreeSQLDatabase](https://freesqldatabase.com) | 5 MB (testing only) |

### Redis → Upstash

1. Create a free Redis database at [Upstash](https://upstash.com).
2. Copy the **host** and **port** into your environment variables.

### Email → Brevo

1. Sign up at [Brevo](https://www.brevo.com) (free tier: 300 emails/day).
2. Go to **SMTP & API** settings.
3. Copy your SMTP credentials into environment variables.

### Google OAuth → Production

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Update **Authorized JavaScript Origins** with your Render backend URL.
3. Update **Authorized Redirect URIs** with: `https://your-backend.onrender.com/login/oauth2/code/google`

---

## 🧪 Testing
```bash
cd backend
mvn test
```

---

## 🔮 Future Enhancements

- [ ] AI-Powered Monthly Carbon Audits with PDF export
- [ ] Real-Time Green Grid Scheduler (clean energy optimization)
- [ ] Collaborative Eco-Challenges & Group Pledges
- [ ] Simulated Carbon Offset Marketplace
- [ ] Push Notifications (PWA)
- [ ] Mobile App (React Native)

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

## 👨‍💻 Author

**Milind Verma**

[![GitHub](https://img.shields.io/badge/GitHub-Milindverma24-181717?style=for-the-badge&logo=github)](https://github.com/Milindverma24)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/milindverma)

---

<p align="center">
  Made with 💚 for a greener planet.
</p>
