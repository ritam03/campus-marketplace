# 🎓 Campus Marketplace

A secure, high-performance, real-time peer-to-peer marketplace built exclusively for campus communities. Users can buy, sell, and trade items within a closed university network while enjoying live chat, OTP-verified handovers, and enterprise-grade performance.

[🔗 **Live Demo (Vercel)**](https://campus-marketplace-project.vercel.app/)

---

## 🚀 Key Upgrades (Phase 1 & Phase 2)

This project has recently undergone massive infrastructure and logic upgrades to ensure it operates at an enterprise level:

*   **⚡ Redis Caching (Sub-Millisecond Latency):** Completely bypassed slow SQL database calls for the marketplace feed. Redis intercepts and serves the feed instantly, handling 1,000s of concurrent users with zero lag. Cache invalidates automatically upon item updates.
*   **🛡️ DDoS & Brute-Force Protection:** Implemented an advanced Redis-backed rate limiter. IP addresses are globally restricted (100 req/15min) and authentication routes are heavily throttled (15 req/hour) to prevent credential stuffing.
*   **🧠 Strict Business Logic Enforcement:** Refactored the core repositories to guarantee data integrity. Sold, Reserved, and Deleted items are strictly filtered at the database level so they never leak into the active marketplace feed.
*   **🎨 Premium UI/UX:** Completely redesigned the frontend with modern glassmorphism, dynamic micro-animations, tailored HSL color palettes, and a highly responsive Tailwind grid layout.
*   **🔒 State Hydration Stability:** Hardened the client-side Zustand store to gracefully handle corrupted JSON state and deeply nested authentication payloads.

---

## 🏗️ System Architecture

```mermaid
graph TD
    %% Frontend Layer
    subgraph Client [Frontend (Vercel)]
        UI[React + Tailwind CSS]
        State[Zustand Store]
        UI <--> State
    end

    %% Network & Edge Layer
    subgraph Network [Security & Edge]
        RL[Redis Rate Limiter]
        Auth[JWT Middleware]
    end

    %% Backend Service Layer
    subgraph Backend [Backend Server (Railway)]
        API[Node.js + Express API]
        Sockets[Socket.io Server]
        Services[Business Logic & Formatters]
        API <--> Services
    end

    %% Data Layer
    subgraph Storage [Data & Caching Layer]
        Redis[(Redis In-Memory Cache)]
        Neon[(Neon PostgreSQL DB)]
        Cloudinary[Cloudinary Image Hosting]
    end

    %% Data Flow Connections
    UI <-->|HTTP Requests| RL
    RL <--> Auth
    Auth <--> API
    
    UI <-->|WebSockets (E2EE)| Sockets
    
    Services <-->|1. Check Cache| Redis
    Services <-->|2. Fallback Query| Neon
    Services -->|Uploads| Cloudinary
```

---

## ✨ Detailed Features

1.  **User Management & Authentication**
    *   Registration/login with campus ID validation.
    *   Password hashing using bcrypt & Stateless JWT sessions (httpOnly cookies).
    *   Strict rate limiting on all authentication endpoints.
2.  **Listings & Marketplace**
    *   Create, read, update, delete listings (CRUD).
    *   **Redis Cached Feed:** Lightning-fast marketplace feed with automated cache invalidation.
    *   Image uploads via Cloudinary integration with universal URL sanitization.
    *   Advanced filtering by category, price, condition, and search terms.
3.  **Real-Time Chat (Socket.io)**
    *   Room-based messaging powered by Socket.io.
    *   End-to-end encrypted (E2EE) payloads (handled client-side).
    *   Global WebSocket notifications for incoming messages outside of rooms.
4.  **Transactions & OTP**
    *   Buyer-seller agreements strictly tracked in the PostgreSQL database.
    *   One-Time Passwords (OTP) sent via Nodemailer for handover verification.
    *   Status updates and audit logs in transaction records.

---

## 🛠️ Technology Stack

### Frontend
*   **React (v19) & Vite**
*   **Tailwind CSS** + **Lucide React** (Modern, premium UI)
*   **Zustand** (Global state management with local storage persistence)
*   **Socket.io-client** (Real-time communication)
*   **Axios** & **React Hot Toast**

### Backend & Infrastructure
*   **Node.js & Express.js**
*   **Redis** (In-memory caching and Rate Limiting)
*   **PostgreSQL** (Neon Serverless DB) via `pg` connection pooling
*   **Socket.io** (WebSocket Server)
*   **Cloudinary** (Image Storage) & **Nodemailer** (Email Services)
*   **Security:** `helmet`, `cors`, `bcrypt`, `zod`, `express-rate-limit`, `rate-limit-redis`

---

## 🔒 Security Posture
*   **DDoS Mitigation:** `express-rate-limit` combined with Redis handles massive request spikes gracefully.
*   **Injection Prevention:** Postgres parameterized queries (`$1, $2`) entirely prevent SQL injection.
*   **Payload Validation:** Strict `Zod` schemas validate all incoming API edge requests.
*   **Cross-Origin:** Configured CORS strictly allows only localhost and the Vercel production domain.
