# Biizora

**Smarter Invoicing. Better Cash Flow. Powered by Bizz AI.**

Biizora is an AI-powered Business Operating System built specifically for Indian SMEs, startups, freelancers, retailers, wholesalers, manufacturers, salons, and restaurants.

---

## Technical Stack

- **Client:** React 19 + Vite + Tailwind CSS + Framer Motion
- **Server:** Express + MongoDB (Mongoose) + JWT + Brevo Email API
- **AI Engine:** Bizz AI Co-Pilot (Bilingual English & Gujarati)
- **Auth System:** JWT Access/Refresh tokens + Brevo Hashed Email OTP

---

## Quick Start

### 1. Database (MongoDB)
Start a local MongoDB instance or set `MONGODB_URI` in `server/.env`:
```bash
docker run -d --name biizora-mongo -p 27017:27017 mongo:7
```

### 2. Backend Server
```bash
cd server
cp .env.example .env
npm install
npm run seed
npm run dev
```
API runs on `http://localhost:5000`

### 3. Frontend Client
```bash
cd client
npm install
npm run dev
```
App runs on `http://localhost:5173`

---

## Demo Accounts

All demo accounts feature pre-populated business data and one-click access:

| Demo Category | Work Email | Password | Business Name |
| :--- | :--- | :--- | :--- |
| **Manufacturing (Primary)** | `manufacturing@biizora.demo` | `demo1234` | Apex Manufacturing Works |
| **Retail** | `retail-demo@biizora.com` | `demo123` | Apex Retail Outlet |
| **Salon** | `salon-demo@biizora.com` | `demo123` | Glow Salon Studio |
| **Restaurant** | `restaurant-demo@biizora.com` | `demo123` | The Olive Table |
| **Stationery** | `stationery-demo@biizora.com` | `demo123` | PageCraft Stationery |

---

# Biizora Troubleshooting & Bug Guide

This section is a practical reference for developers working on the Biizora codebase. If you encounter bugs or runtime errors, consult the category tables below to quickly identify the root cause, responsible files, and verification steps.

---

## 1. Authentication & JWT Bugs

| Problem / Error | Check First | Responsible File / Folder | Common Fix & Verification |
| :--- | :--- | :--- | :--- |
| `HTTP 401 Unauthorized` on protected routes | Authorization header or httpOnly cookie | `server/src/middleware/auth.js` | Ensure `Bearer <token>` is sent in client request header `api/client.js`. Verify `JWT_ACCESS_SECRET` matches in `server/.env`. |
| Token refresh failing / infinite loop | Cookie path and CORS credentials | `server/src/controllers/authController.js` | Verify `credentials: 'include'` is set on fetch in client and `COOKIE_SECURE` is set correctly for dev (`false`). |
| One account accessing multiple businesses | Membership query validation | `server/src/models/Membership.js` | Enforce 1-business per user membership in `getPrimaryBusinessPayload()` in `authController.js`. |

---

## 2. OTP & Brevo Email Service

| Problem / Error | Check First | Responsible File / Folder | Common Fix & Verification |
| :--- | :--- | :--- | :--- |
| OTP email not received | `BREVO_API_KEY` in `.env` | `server/src/services/emailService.js` | If `BREVO_API_KEY` is not provided, inspect server terminal output for `[DEV EMAIL FALLBACK]` logs containing the 6-digit OTP. |
| `HTTP 429 Please wait X seconds` | Rate limiting cooldown | `server/src/models/OTP.js` | 60-second cooldown is enforced between resend requests. Wait 60 seconds or reset document `lastSentAt` in MongoDB. |
| `Invalid verification code` | OTP bcrypt hash comparison | `server/src/controllers/authController.js` | Ensure raw OTP code string is passed without extra whitespace. Max 5 verification attempts allowed per code. |

---

## 3. Bizz AI & Bilingual Assistant

| Problem / Error | Check First | Responsible File / Folder | Common Fix & Verification |
| :--- | :--- | :--- | :--- |
| Bizz AI replying in wrong language | `language` state ('en' \| 'gu') | `client/src/components/FloatingAIChat.jsx` | Click the **EN \| ગુજરાતી** toggle in the Bizz header. Check `localStorage.getItem('bizz_lang')`. |
| Bizz briefing missing on Dashboard | `/api/bizz/briefing` API call | `server/src/controllers/bizzController.js` | Verify server status and ensure active business context (`req.businessId`) is populated via middleware. |
| Fallback generic responses | Query matcher in Bizz engine | `server/src/controllers/bizzController.js` | Inspect query keywords in `handleChat()` (e.g., 'stock', 'revenue', 'expense', 'customer'). |

---

## 4. Frontend & Route Navigation

| Problem / Error | Check First | Responsible File / Folder | Common Fix & Verification |
| :--- | :--- | :--- | :--- |
| Page showing "Module needs expanding" | React Router route definitions | `client/src/App.jsx` | Ensure route is mapped to a functional component in `client/src/pages/demoModules/` instead of `ModulePlaceholderPage`. |
| Navigation item missing from sidebar | Module registry & permissions | `client/src/modules/registry.js` | Check `businessTypes` array in `server/src/config/businessTypes.js` to ensure module ID is included in `defaultModules`. |
| Whitescreen on route transition | Component export / prop dereference | `client/src/layouts/AppLayout.jsx` | Open browser developer console (F12) to inspect React error boundary stack traces. |

---

## 5. Invoices & PDF Export

| Problem / Error | Check First | Responsible File / Folder | Common Fix & Verification |
| :--- | :--- | :--- | :--- |
| PDF download blank or failing | `html2canvas` / `jspdf` rendering | `client/src/pages/InvoiceListPage.jsx` | Ensure target element ID matches PDF generator ref. Remove custom unsupported CSS pseudo-elements. |
| WhatsApp share button not opening | Phone number formatting | `client/src/pages/InvoiceListPage.jsx` | Clean phone number string to numbers only (e.g. `919876543210`) for `https://wa.me/` URLs. |
| Tax CGST/SGST vs IGST incorrect | Customer state vs Business state | `client/src/pages/InvoiceCreatePage.jsx` | If customer state matches business state, CGST (9%) + SGST (9%) is calculated; otherwise IGST (18%) is applied. |

---

## 6. Environment Variables Checklist

Ensure your `server/.env` contains the following keys:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/biizora
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
CLIENT_ORIGIN=http://localhost:5173

# Brevo Transactional Email Service
BREVO_API_KEY=your_brevo_api_key_here
EMAIL_FROM=no-reply@biizora.com
EMAIL_FROM_NAME=Biizora

# Super Admin Emails
ADMIN_EMAILS=manufacturing@biizora.demo
```

---

## License

© Biizora Technologies Private Limited. All rights reserved.
