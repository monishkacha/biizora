# Biizora

**Smarter Invoicing. Better Cash Flow. Powered by AI.**

Biizora is an AI-powered Business Operating System built specifically for Indian SMEs, startups, freelancers, retailers, wholesalers, manufacturers, agencies and service businesses.

## Stack

- **Client:** React 19 + Vite + Tailwind CSS
- **Server:** Express + MongoDB (Mongoose)
- **Auth:** JWT access tokens + httpOnly refresh cookies

## Quick start

### 1. MongoDB

Start a local MongoDB instance (Docker example):

```bash
docker run -d --name biizora-mongo -p 27017:27017 mongo:7
```

Or set `MONGODB_URI` in `server/.env` to your Atlas connection string.

### 2. Server

```bash
cd server
cp .env.example .env
npm install
npm run seed
npm run dev
```

API: `http://localhost:5000`

Demo login after seed:
- Email: `adrian.hale@biizora.demo`
- Password: `demo1234`

### 3. Client

```bash
cd client
npm install
npm run dev
```

App: `http://localhost:5173` (proxies `/api` to the server)

## Phase 1 features

- Full rebrand to Biizora
- Monochrome light design system
- Multi-business workspaces with data isolation
- Team invites & role permissions (Owner, Manager, Accountant, Sales, Employee)
- Global search + Cmd/Ctrl+K command palette
- Notification center
- Activity / audit log
- Onboarding wizard
- Organization / Profile / Preferences settings
- MongoDB-backed CRUD for customers, products, invoices, expenses

## License

© Biizora Technologies Private Limited. All rights reserved.
