# Campus Marketplace

A dedicated, real-time peer-to-peer marketplace designed specifically to provide a secure environment for buying, selling, and trading items within a campus ecosystem.

## 📖 About the Application
Campus Marketplace solves the trust and logistical issues of standard online classifieds by restricting access to a university community. It provides a localized platform where users can easily offload textbooks, electronics, and furniture, or find campus-specific deals. The application emphasizes real-time communication, ensuring buyers and sellers can coordinate instantly through live chat and OTP based handover.

## ✨ Key Features

* **Closed-Ecosystem Authentication:** Secure user registration and login utilizing JSON Web Tokens (JWT) and Bcrypt hashing, with architectural support for strict campus ID validation.
* **Real-Time Peer-to-Peer Chat:** A live messaging system built on WebSockets, allowing instant negotiation and coordination between buyers and sellers without refreshing the page.
* **Dynamic Product Listings:** Users can seamlessly post, browse, and view detailed descriptions of available items within the marketplace.
* **Centralized State Management:** Optimized data flow using Zustand to maintain a single source of truth for user sessions, socket connections, and UI states across the application.
* **Resilient Database Architecture:** Configured with robust PostgreSQL connection pooling and timeout handling to support serverless database environments.

## 🛠️ Technology Stack

**Frontend Architecture:**
* **Core:** React.js, Vite
* **Routing:** React Router DOM
* **State Management:** Zustand
* **Styling:** Tailwind CSS, Lucide React (Icons)
* **User Experience:** React Hot Toast (Notifications)
* **HTTP Client:** Axios

**Backend Architecture:**
* **Server:** Node.js, Express.js
* **Database:** PostgreSQL (Neon Serverless)
* **Database Client:** `pg` (Node-Postgres Pool)
* **Authentication:** JWT (JSON Web Tokens), `bcrypt`
* **Real-Time Engine:** Socket.io
* **Data Validation:** Zod

## 🔒 Security Measures
* Passwords cryptographically hashed via `bcrypt` before database insertion.
* Stateless authentication using JWTs securely stored on the client.
* SSL/TLS enforced database connections (`rejectUnauthorized: false` configured for cloud database compatibility).
* Protected backend routes utilizing custom authentication middleware.