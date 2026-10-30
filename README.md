# BorrowBox

BorrowBox is a campus resource-sharing platform that allows students to lend and borrow items such as books, calculators, electronics, lab equipment, and academic resources.

## Features
- Student Profile Management
- Browse Available Items
- Add New Listings
- Borrow Requests
- Accept/Reject Requests
- Return Tracking
- Dashboard Analytics

## Tech Stack
Frontend:
- React
- Vite
- Tailwind CSS
- Axios

Backend:
- Node.js
- Express.js

Database:
- MongoDB Atlas

Deployment:
- Vercel (Frontend)
- Render (Backend)

## Architecture

React Frontend
↓
Express REST API
↓
MongoDB Atlas

## Deployment Links

Frontend:
https://borrowbox-one.vercel.app

Backend:
https://borrowbox-0kro.onrender.com

## Multi-factor authentication and RBAC

BorrowBox uses TOTP compatible with Google Authenticator and Microsoft Authenticator.

1. Copy `backend/.env.example` to `backend/.env` and configure `JWT_SECRET`, `MONGO_URI`, and optionally `SUPERVISOR_EMAIL`.
2. A new account's first password login returns an MFA setup token. Scan the returned QR code in the authenticator app, enter the generated code, and the API returns an access token.
3. Later logins require both the password and the current authenticator code.
4. Send authenticated requests as `Authorization: Bearer <access-token>`.
5. Item and student update/delete routes, plus request decision routes, require a `supervisor` or `admin` role. A missing token returns HTTP `401`; a valid token with insufficient permissions returns HTTP `403`.

## Container security scan

The backend image was scanned with Trivy for CRITICAL and HIGH vulnerabilities.

| Image | CRITICAL | HIGH |
|---|---:|---:|
| Baseline (`node:22`, root) | 23 | 478 |
| Hardened (`node:22-alpine`, non-root `borrowbox`) | 0 | 0 |

The hardened image is approximately 288 MB compared with 1.68 GB for the baseline image.
