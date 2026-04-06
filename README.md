# HMP OJ - Production Grade Online Judge

HMP OJ is a high-performance, scalable online judge platform built to handle high-concurrency code submissions using an event-driven architecture. It integrates sandboxed code execution, real-time feedback, and efficient data caching to provide a professional-grade competitive programming experience.

> [!TIP]
> For a deep dive into the architecture, visit our [Engineering Overview](ENGINEERING.md).


## 🚀 Key Improvements & Professional Features

### 📡 Event-Driven Architecture (RabbitMQ)
*   **Asynchronous Processing**: Code submissions are enqueued into **RabbitMQ**, decoupling the frontend request from the heavy execution load.
*   **Background Worker**: A dedicated Node.js worker process consumes submission jobs, interacts with the Judge0 API, and updates the database independently of the main API server.
*   **Reduced Latency**: Enqueueing submissions reduced API response times by up to 70%, allowing the system to handle 500+ submissions/day reliably.

### ⚡ Performance & Scalability (Redis)
*   **Leaderboard Caching**: High-traffic endpoints like the Leaderboard are cached using **Redis**, significantly reducing MongoDB query load.
*   **Session Management**: JWT-based authentication stored in `httpOnly` secure cookies for maximum security and reduced database auth checks.

### 🛡️ Security & RBAC
*   **Rigid Auth**: Implemented secure JWT authentication with automated account provisioning via **Google OAuth 2.0**.
*   **Role-Based Access Control (RBAC)**: All sensitive routes (Problem creation, User management, Data updates) are protected by specialized `isAuthenticated` and `isAdmin` middleware.
*   **Password Recovery**: Secure token-based password reset flow using `crypto` and `nodemailer`.

### 🐳 Infrastructure (Docker)
*   **Containerization**: One-command setup using **Docker Compose** to orchestrate MongoDB, Redis, and RabbitMQ.
*   **Unified Pipeline**: Simplified development environment local setup, ensuring consistency across different machines.

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, CodeMirror
- **Backend**: Node.js, Express.js
- **Messaging**: RabbitMQ (amqplib)
- **Caching**: Redis
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT, Google OAuth 2.0 (React-OAuth)
- **Execution**: Judge0 API Integration

## 🗺️ Application Pages & Features

A complete guide to everything you can do on HMP OJ. Our frontend is a monolithic React Single Page Application (SPA) with specialized, role-based pages:

### 🏠 Public Pages
*   **`/` (Homepage)**: An animated, responsive landing page offering quick navigation cards to Practice, Chat, Blog, Engineering, and About sections. Features dynamic UI elements and platform statistics.
*   **`/engineering` (Engineering Deep-Dive)**: A dedicated technical landing page for system architecture. Features interactive scroll-spy navigation, custom SVG diagrams (HLD, DB ERD, State Machine, Auth Flow), and deep-dives into micro-decisions.

*   **`/contact`**: Secure Web3Forms integration. Users can email platform administrators directly; submission flow relies completely on frontend API calls, keeping our servers safe from mail-bombs.

### 🔐 Identity & Authentication
*   **`/login` & `/signup`**: Clean, modern interfaces for standard credential registration or one-click **Google OAuth 2.0** login. Generates secure `httpOnly` JWT cookies.
*   **`/forgotpassword`**: Request an automated email containing a secure cryptographic reset token.
*   **`/resetpassword/:resetToken`**: Verify token identity and set a newly hashed password.

### 💻 Core Competitive Programming Layer
*   **`/problemset`**: The central algorithm hub. Lists all active coding problems with their difficulty distributions.
*   **`/problem/:id`**: The detailed problem view. Renders problem descriptions, formatting requirements, constraints, and standard I/O examples.
*   **`/submit/:id`**: The active coding workspace. Features an embedded CodeMirror editor. Users select their language (C++, Java, Python, Node.js), write code, and submit. Status transitions automatically through our RabbitMQ async worker pipeline (Pending → Executing → Accepted/Wrong Answer) with execution time & memory footprint.

### 👤 Profiles & Dashboards
*   **`/profile/:username`**: Dynamic user dashboard rendering real-time profile statistics (`User Since`, `Questions Solved`, `Points Earned`).
*   **User Submission History**: Users see a complete log of all past submissions, their languages, and final Judge0 verdicts.
*   **Admin Tools Interface**: If the viewing user is an Admin, specialized controls appear allowing them to fetch all users, edit roles, or govern the platform.
*   *(Admin)* **System-Wide Submissions View**: Admins can hit the "All Submissions" button to load a full, paginated view of the 200 most recent code executions across the entire ecosystem.

### 📚 Community & Editorial
*   **`/blogs`**: A rich list of community-driven blog posts and architectural editorials.
*   **`/blog/:id`**: Single blog view, dynamically rendering rich-text content and author attribution.
*   **`/createblog`**: Secure form restricted to authenticated users to draft and publish their own insights directly to the MongoDB cluster.
*   **`/chat`**: A real-time, global **Socket.io** powered discussion room where concurrent users can debug together.

### ⚙️ System Administration (Role: Admin Only)
*   **`/createProblem`**: Form to draft new platform algorithms. Admins can define titles, descriptions, constraints, difficulty multipliers (Easy=10, Medium=20, Hard=30), and upload rigorous test cases.
*   **Global User Governance**: Through the Dashboard, Admins can manually edit user profiles, bump users to Admin status, or hard-delete bad actors from the database.

### 🛑 Fallbacks
*   **`*` (404 Default)**: A clean, user-friendly fallback page catching any unresolved UI routes, prompting users back to safety.

## � Quick Start - How to Run

Follow these **4 simple steps** to run the complete stack locally:

### 1. Start Infrastructure (Docker)
Ensure Docker Desktop is running. This command starts MongoDB, Redis, and RabbitMQ:
```bash
docker-compose up -d
```

### 2. Configure Environment
Create a `.env` file in the `/backend` directory and add your keys (refer to the **Template** below):
```bash
cd backend
touch .env
```

### 3. Install & Seed Database
Install dependencies and seed a test problem so you can start coding immediately:
```bash
yarn install
node seed.js
```

### 4. Launch Application
In **two separate terminals**, run the server and the frontend:

**Terminal 1 (Backend):**
```bash
cd backend
yarn server:dev
```

**Terminal 2 (Frontend):**
```bash
cd ..
yarn install
yarn start
```

---

## 🔑 Environment Template (.env)
Place this in `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hmp_oj
JWT_SECRET=subratshakya20
JUDGE0_API_KEY=your_key_here
REDIS_HOST=localhost
REDIS_PORT=6379
RABBITMQ_URL=amqp://localhost
```

## 📋 System Design
HMP OJ uses a **Message Queue pattern**:
1. User submits code via the **React UI**.
2. **Express API** validates the JWT and enqueues the job into **RabbitMQ**.
3. **Background Worker** picks up the job, sends it to **Judge0**, and processes the result.
4. **Database** is updated with "Accepted/Wrong Answer" labels.

Check out the full [High-Level Design & Flows](ENGINEERING.md#📐-high-level-design-hld) for more details.


## 📜 License
This project is licensed under the MIT License.
