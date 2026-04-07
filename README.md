# HMP OJ — Production Grade Online Judge

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/cloud/atlas)
[![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D?logo=redis)](https://upstash.com/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-CloudAMQP-FF6600?logo=rabbitmq)](https://www.cloudamqp.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

HMP OJ is a high-performance, scalable online judge platform built to handle high-concurrency code submissions using an event-driven architecture. It integrates sandboxed code execution, real-time feedback, and efficient data caching to provide a professional-grade competitive programming experience.

> [!TIP]
> For a full deep dive into the architecture, system flows, and engineering decisions, visit the **[Engineering Overview](ENGINEERING.md)** or the live [Engineering Page](/engineering) on the platform.

---

## 🌐 Live Demo

> 🚀 **Frontend:** *(coming soon — Vercel)*
> ⚙️ **Backend API:** *(coming soon — Render)*

**Developer:** [Subrat Shakya](https://subratshakya.vercel.app/)

---

## ✨ Key Features

### 📡 Event-Driven Architecture (RabbitMQ)
- **Async Processing**: Submissions are enqueued into RabbitMQ — decoupling heavy execution from the API request cycle.
- **Background Worker**: A dedicated Node.js worker process consumes jobs, interacts with Judge0, and updates the database independently.
- **70% Latency Reduction**: The API returns `202 Accepted` instantly; users see live status updates via Socket.io.

### ⚡ Performance & Scalability (Redis)
- **Leaderboard Caching**: High-traffic ranking endpoints are Redis-cached, drastically reducing MongoDB load.
- **Secure Sessions**: JWT stored in `httpOnly` cookies — XSS-safe and stateless.

### 🛡️ Security & RBAC
- **Google OAuth 2.0** + standard credential auth with bcrypt.
- **Role-Based Access Control**: Admin and User roles with middleware-enforced route protection.
- **Zero-Trust Submissions**: `userId` is always extracted from the JWT, never the request body.
- **Password Recovery**: Crypto token-based reset flow via Nodemailer.

### ⚔️ Codeforces-Style Contests
- Timed arenas with **real-time score decay** based on elapsed minutes.
- Flat **-50 point penalty** per wrong attempt before an accepted solution.
- Live leaderboard with Socket.io updates.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Tailwind CSS, CodeMirror |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose) — hosted on Atlas |
| **Cache** | Redis — hosted on Upstash |
| **Message Queue** | RabbitMQ (amqplib) — hosted on CloudAMQP |
| **Code Execution** | Judge0 API (sandboxed, 60+ language support) |
| **Auth** | JWT (httpOnly cookies) + Google OAuth 2.0 |
| **Real-Time** | Socket.io |
| **Local Dev** | Docker Compose (Mongo + Redis + RabbitMQ) |

---

## ⚡ Quick Start — Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Yarn](https://yarnpkg.com/)

### 1. Clone the repo
```bash
git clone https://github.com/subratshakya/HMPOJ.git
cd HMPOJ
```

### 2. Start Infrastructure (Docker)
Ensure Docker Desktop is running. This spins up MongoDB, Redis, and RabbitMQ:
```bash
docker-compose up -d
```

### 3. Configure Backend Environment
```bash
cd backend
cp .env.example .env
# Then fill in your values (see Environment Variables section below)
```

### 4. Install Dependencies & Seed Database
```bash
# In /backend
yarn install
node seed.js

# In root /
yarn install
```

### 5. Launch the App
Open **two separate terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
yarn server:dev
```

**Terminal 2 — Frontend:**
```bash
yarn start
```

Visit `http://localhost:3000` 🎉

---

## 🔑 Environment Variables

Create a `backend/.env` file with the following keys:

```env
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27018/hmp_oj
# For cloud: mongodb+srv://<user>:<pass>@cluster.mongodb.net/hmp_oj

# Auth
JWT_SECRET=your_jwt_secret_here
CLIENT_ID=your_google_oauth_client_id
CLIENT_SECRET=your_google_oauth_client_secret

# Code Execution
JUDGE0_API_KEY=your_judge0_rapidapi_key

# Redis (local Docker)
REDIS_HOST=localhost
REDIS_PORT=6379
# For cloud (Upstash): REDIS_URL=rediss://<user>:<pass>@host:6379

# RabbitMQ (local Docker)
RABBITMQ_URL=amqp://localhost
# For cloud (CloudAMQP): amqps://<user>:<pass>@host/vhost

# Frontend origin (for CORS)
CLIENT_ORIGIN=http://localhost:3000
```

---

## 🗺️ Application Routes

### Public
| Route | Description |
|---|---|
| `/` | Homepage with navigation cards |
| `/engineering` | Interactive architecture deep-dive |
| `/login` & `/signup` | Auth pages with Google OAuth |
| `/forgotpassword` | Token-based password reset |
| `/problemset` | Browse all problems |
| `/problem/:id` | View problem statement |
| `/blogs` | Community blog listing |
| `/blog/:id` | Single blog view |
| `/chat` | Real-time Socket.io chat room |
| `/leaderboard` | Global rankings |

### Authenticated Users
| Route | Description |
|---|---|
| `/submit/:id` | Code editor + submission workspace |
| `/profile/:username` | User dashboard & submission history |
| `/createblog` | Draft & publish a blog post |
| `/contests` | Browse upcoming/active/past contests |
| `/contest/:id` | Contest arena & problem list |
| `/contest/:id/leaderboard` | Live contest rankings |

### Admin Only
| Route | Description |
|---|---|
| `/createProblem` | Create problems with test cases |
| `/admin/contest/create` | Schedule and configure contests |

---

## 📐 System Design

```
User → React UI → Express API → RabbitMQ → Node.js Worker → Judge0
                       ↕                          ↕
                    MongoDB                    Socket.io → User
                    Redis Cache
```

See the full [Engineering Overview](ENGINEERING.md) for interactive diagrams, deep dives, and architectural decisions.

---

## 📜 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.
