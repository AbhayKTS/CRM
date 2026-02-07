# Mini CRM

A production-ready Client Lead Management System that helps businesses track leads, update statuses, add follow-up notes, and view analytics from a secure admin dashboard.

## ✨ Features

- **Secure Admin Login** – JWT-based authentication
- **Full Lead CRUD** – Create, view, update, delete leads
- **Status Workflow** – new → contacted → converted
- **Follow-up Notes** – timestamped notes per lead
- **Search & Filters** – search by name/email/phone, filter by status or source
- **Analytics Dashboard** – total leads, contacted, converted, conversion rate, leads by source
- **Lead Details Page** – full view with quick status updates and note management
- **Add Lead Modal** – capture name, email, phone, source, initial note
- **Clean UI** – status badges, loading states, empty states, animations

## 🛠 Tech Stack

| Layer     | Technology             |
|-----------|------------------------|
| Frontend  | React 18 + Vite        |
| Backend   | Node.js + Express      |
| Database  | MongoDB + Mongoose     |
| Auth      | JWT (jsonwebtoken)     |

## 📂 Project Structure

```
CRM/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # LeadCard, AddLeadModal
│   │   ├── context/      # AuthContext
│   │   ├── pages/        # LoginPage, DashboardPage, LeadDetailsPage
│   │   ├── api.js        # API client helpers
│   │   ├── App.jsx       # Root component
│   │   ├── main.jsx      # Entry
│   │   └── styles.css
│   └── package.json
├── server/               # Express backend
│   ├── src/
│   │   ├── models/       # Lead.js (Mongoose)
│   │   ├── auth.js       # JWT helpers
│   │   ├── db.js         # Mongo connection
│   │   ├── leads.js      # Lead routes
│   │   └── index.js      # Entry
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally or a connection URI

### 1) Clone & Install

```bash
git clone https://github.com/AbhayKTS/CRM.git
cd CRM

# Server
cd server
npm install
cp .env.example .env
# Edit .env with your MONGO_URI if needed

# Client
cd ../client
npm install
cp .env.example .env
```

### 2) Configure Environment

**server/.env**
```
PORT=4000
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your_secret_key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
MONGO_URI=mongodb://127.0.0.1:27017/minicrm
```

**client/.env**
```
VITE_API_URL=http://localhost:4000
```

### 3) Run the App

```bash
# Terminal 1 – Start backend
cd server
npm run dev

# Terminal 2 – Start frontend
cd client
npm run dev
```

Open http://localhost:5173 and log in with the default credentials.

## 🔑 Default Admin

- **Email:** `admin@example.com`
- **Password:** `admin123`

## 📡 API Reference

### Auth
| Method | Endpoint           | Description      |
|--------|--------------------|------------------|
| POST   | /api/auth/login    | Admin login      |

### Leads (protected)
| Method | Endpoint               | Description                          |
|--------|------------------------|--------------------------------------|
| GET    | /api/leads             | List leads (supports ?search, ?status, ?source) |
| GET    | /api/leads/summary     | Analytics summary                    |
| GET    | /api/leads/:id         | Get single lead                      |
| POST   | /api/leads             | Create lead (public for contact forms) |
| PUT    | /api/leads/:id         | Update lead info + status            |
| DELETE | /api/leads/:id         | Delete lead                          |

### Notes (protected)
| Method | Endpoint                  | Description        |
|--------|---------------------------|--------------------|
| POST   | /api/leads/:id/notes      | Add follow-up note |
| GET    | /api/leads/:id/notes      | List notes         |

## 📊 Analytics

The `/api/leads/summary` endpoint returns:
- `total` – total lead count
- `contacted` – leads with status "contacted"
- `converted` – leads with status "converted"
- `conversionRate` – percentage of converted leads
- `bySource` – object with lead counts per source

## 🧪 Testing

Run a quick sanity check:
1. Start the backend.
2. Use `curl` or Postman to POST `/api/auth/login`.
3. Use the returned token to hit `/api/leads`.

## 📦 Deployment Tips

- Set `NODE_ENV=production` on your server.
- Use a managed MongoDB (Atlas) and update `MONGO_URI`.
- Build the client with `npm run build` and serve the `dist/` folder via a static host or reverse proxy.

## License

MIT
