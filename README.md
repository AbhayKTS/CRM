# Mini CRM

A simple Client Lead Management System that helps track leads, update statuses, and add follow-up notes from a secure admin dashboard.

## Features
- Secure admin login (JWT-based)
- Lead listing with status tracking (new, contacted, converted)
- Follow-up notes per lead
- Basic analytics (total, contacted, converted)
- Sample lead creation for quick demos

## Tech Stack
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** lowdb (JSON file storage)

## Getting Started

### 1) Install dependencies
- `server`: install packages and copy environment example
- `client`: install packages and copy environment example

### 2) Configure environment
Copy the example files and adjust values if needed:
- `server/.env.example` → `server/.env`
- `client/.env.example` → `client/.env`

### 3) Run the app
Start the API server, then the client dev server.

Default admin login:
- Email: `admin@example.com`
- Password: `admin123`

## API Overview
- `POST /api/auth/login`
- `GET /api/leads`
- `POST /api/leads`
- `PATCH /api/leads/:id`
- `GET /api/leads/summary`

## Project Structure
- `client/` React dashboard
- `server/` Express API + SQLite database

## Notes
The JSON database is stored in `server/data/crm.json`.
