# bizcorp: The Ultimate Startup Ecosystem 🚀

Welcome to **bizcorp**, a comprehensive business-oriented platform designed for modern startups, investors, and elite enterprises. This workspace integrates a full-stack architecture with a focus on professional UI/UX, seamless data persistence, and a healthy dose of butler-induced condescension.

---

## 🏗 Architecture Overview

The project is architected as a decoupled monorepo, separating core business logic and data management from the interactive user experience.

- **Frontend:** A high-performance React application powered by **Vite**, utilizing **React-Bootstrap** for a consistent, "businessy" aesthetic.
- **Backend:** A scalable **Flask** REST API organized with Blueprints for modularity, utilizing **SQLAlchemy ORM** for database abstraction.
- **Database:** **SQLite3** for lightweight, file-based data persistence (ideal for rapid development and portability).
- **Style System:** CSS-in-JS patterns mixed with a centralized variable system (`:root`) for global transitions and theme management.

---

## 🎨 Frontend (React + Vite)

The frontend is built for speed and responsiveness.

### Key Components:

- **`ModalProvider`**: A custom global state system that replaces standard browser dialogs with themed, branded Bootstrap modals (Prompt/Confirm).
- **`CartProvider`**: Manages shopping state across sessions.
- **Micro-interactions**: Enhanced UI feedback featuring "Pop" animations for cart additions (Button scaling at 1.1x and Cart Icon scaling at 1.4x).
- **Dual-Theme Layout**: Intelligent routing that switches between `light-theme` (Business/Shop) and `dark-theme` (Forum/Internal) seamlessly.

### Features:

- **Solution Shop**: Categorized product listings with real-time cart totaling.
- **Engage Forum**: A staff-only message board for internal communication.
- **Internal Portal**: Admin view for managing orders, products, and posts.

---

## ⚙️ Backend (Python Flask)

The backend follows a Blueprint-based modular structure:

- **`/api/auth`**: Mock authentication flow for demo purposes.
- **`/api/shop`**: Handles product retrieval and checkout logic.
- **`/api/forum`**: Manages threaded posts, comments, and reactions.
- **`/api/internal`**: Admin-exclusive endpoints for data management.
- **`/api/bot`**: The crown jewel—our AI integration.

### 🐧 The Condescending Butler API (`Arthur`)

Integrated via the **Groq API** (running Llama-3.1), Arthur is our resident AI Butler.

- **Arthur's Mission**: To answer user queries with extreme reluctance and peak British condescension.
- **System Prompt Integrity**: Arthur is strictly bound to be sarcastic, formally polite, and dismissive. He finds your requests mediocre and will likely tell you so in under 20 words.
- **Fallbacks**: If the API key is missing, Arthur remains true to form, blaming human incompetence for the misconfiguration.

---

## 🛠 Setup & Installation

### Prerequisites

- Python 3.8+
- Node.js 16+
- Groq API Key (Optional, for Arthur's wit)

### 1. Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
# Create a .env file with GROQ_API_KEY
python app.py
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 📂 Project Structure

```
bizcorp/
├── backend/
│   ├── api/             # Blueprint modules (Arthur resides here)
│   ├── instance/        # SQLite Database storage
│   ├── models/          # SQLAlchemy Database schemas
│   ├── static/          # Uploaded assets and images
│   └── config.py        # Centralized configuration
├── frontend/
│   ├── src/
│   │   ├── components/  # Global UI elements
│   │   ├── features/    # Module-specific pages (Shop, Forum, Home)
│   │   ├── store/       # Global context (Auth, Cart, Modals)
│   │   └── App.jsx      # Root routing logic
└── README.md            # You are here
```

---

## 🧼 Codebase Philosophy

This project adheres to a "No-Slop" philosophy:

- **Zero Inline Styles**: All styling is class-based or variable-driven.
- **Feature Encapsulation**: Components are grouped by feature, not just type.
- **Clean Configuration**: No hardcoded paths; absolute pathing derived from `BASE_DIR`.

---

_Created for EnterpriseCorp Systems - Internal Portal Access v2.4_
