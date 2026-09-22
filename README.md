# MERZADO — Mini B2B RFQ Marketplace

> **A secure, interview-ready B2B Request For Quotation (RFQ) marketplace built with Django REST Framework, Simple JWT, PostgreSQL, React 19, Vite, and Bootstrap 5.**

- **GitHub Repository**: [https://github.com/bhargavaachi06-dot/merzado-b2b-rfq-marketplace](https://github.com/bhargavaachi06-dot/merzado-b2b-rfq-marketplace)
- **Live Application**: `YOUR_LIVE_APPLICATION_URL` *(Not yet deployed — see Deployment Instructions below)*

---

## Table of Contents

1. [Project Overview & Problem Statement](#project-overview--problem-statement)
2. [Core Features](#core-features)
   - [Buyer Features](#buyer-features)
   - [Supplier Features](#supplier-features)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Database Schema & Design](#database-schema--design)
6. [API Endpoints Overview](#api-endpoints-overview)
7. [Authentication & Role-Based Authorization](#authentication--role-based-authorization)
8. [Data Validation & Error Handling](#data-validation--error-handling)
9. [Environment Variables](#environment-variables)
10. [Local Development Setup (Windows PowerShell)](#local-development-setup-windows-powershell)
11. [Running Tests](#running-tests)
12. [Production Build](#production-build)
13. [Deployment Instructions (Render / Vercel)](#deployment-instructions)
14. [Assumptions, Limitations & Future Improvements](#assumptions-limitations--future-improvements)

---

## Project Overview & Problem Statement

### Problem Statement
In traditional B2B procurement, enterprise buyers and commercial suppliers rely on fragmented communication channels (unstructured emails, phone calls, and spreadsheets) to negotiate pricing and project specifications. This causes delayed procurement cycles, zero pricing transparency, lost bids, and vulnerability to unauthorized bid tampering.

### Project Overview
**MERZADO** is a streamlined B2B Request For Quotation (RFQ) Marketplace designed to solve this problem. It establishes a structured procurement workflow:
- **Buyers** post formal RFQs specifying product specifications, quantity, delivery locations, and strict bidding deadlines.
- **Suppliers** discover business opportunities, filter by location and status, and submit price proposals with estimated lead times and proposal notes.
- **Strict Authorization**: Multi-tenant data segregation guarantees that buyers can only view bids on their own RFQs, suppliers can only view their own submissions, and competitors cannot view each other's quotation prices.

---

## Core Features

### Buyer Features
- **Secure Registration & Login**: Account creation with secure PBKDF2 password hashing and JWT token issuance.
- **Buyer Dashboard**: Real-time metrics showing total RFQs posted, active open RFQs, and total bids received.
- **Create RFQ**: Form with validation for product name, detailed specs, quantity (> 0), delivery location, and future deadline.
- **Manage & Edit RFQs**: Update project specifications, toggle status (`OPEN` / `CLOSED`), or permanently delete RFQs.
- **Evaluate Quotations**: Dedicated bid evaluation interface comparing quoted prices, delivery lead times, and supplier notes.

### Supplier Features
- **Supplier Portal & Metrics**: Real-time pipeline metrics tracking open opportunities, submitted bids, and total pipeline value.
- **Browse & Search Opportunities**: Live keyword search (by product name, description, and location) and status filters (`OPEN` / `CLOSED`).
- **RFQ Specifications View**: Detailed view of required quantities, delivery destinations, and deadline countdown.
- **Submit Quotation**: Competitive bidding form validating quoted price (> 0), lead time in days (> 0), optional proposal notes, and strict deadline enforcement.
- **Duplicate Prevention**: Suppliers are prevented from submitting duplicate bids for the same RFQ (returns `409 Conflict`).
- **My Quotations**: Centralized dashboard of all historical and active quotations submitted across all buyer RFQs.

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend Framework** | Python 3.8+ / Django 4.2 LTS | Core web framework, ORM, and admin |
| **API Layer** | Django REST Framework (DRF) | RESTful API views, serializers, permissions |
| **Authentication** | `djangorestframework-simplejwt` | Stateless JWT access and refresh tokens |
| **Database** | PostgreSQL (`psycopg2-binary`) | Production relational database (with local dev fallback) |
| **Filtering** | `django-filter` | Declarative filtering for status, location, quantity |
| **CORS** | `django-cors-headers` | Cross-Origin Resource Sharing handling |
| **Frontend Framework** | React 19 / Vite | Fast, responsive single-page application |
| **Styling & UI** | Bootstrap 5 + Bootstrap Icons | Clean, responsive B2B design system |
| **Routing** | React Router v7 | Client-side routing with role-guarded routes |
| **HTTP Client** | Axios | REST requests with automated JWT injection and refresh |

---

## System Architecture

```text
       +-------------------------------------------------------------+
       |                  React 19 + Vite Frontend                   |
       |  (Bootstrap 5, React Router v7, AuthContext, Axios Client)  |
       +------------------------------+------------------------------+
                                      |
                      HTTP / REST API (JSON Payload)
                      Header: Authorization: Bearer <JWT>
                                      |
       +------------------------------v------------------------------+
       |                Django REST Framework (Backend)              |
       |  +-------------------------------------------------------+  |
       |  | accounts: User Registration, JWT Login, /api/auth/me/ |  |
       |  | rfqs:     RFQ CRUD, Search, Ownership Permissions     |  |
       |  | quotations: Bidding, Deadline Guards, 409 Conflict    |  |
       |  +-------------------------------------------------------+  |
       +------------------------------+------------------------------+
                                      |
                          Django Object-Relational Mapping
                                      |
       +------------------------------v------------------------------+
       |                    PostgreSQL Database                      |
       |     (Users table, RFQs table, Quotations table + Indexes)   |
       +-------------------------------------------------------------+
```

---

## Database Schema & Design

### 1. `accounts_user` (Custom User Model)
| Column | Type | Constraints / Description |
|---|---|---|
| `id` | BigAutoField | Primary Key |
| `username` | CharField(150) | Unique |
| `email` | EmailField(254) | Unique, indexed |
| `password` | CharField(128) | PBKDF2 SHA256 hashed |
| `role` | CharField(10) | Choices: `BUYER`, `SUPPLIER` |
| `created_at` | DateTimeField | Auto timestamp on creation |

### 2. `rfqs_rfq` (Request For Quotation)
| Column | Type | Constraints / Description |
|---|---|---|
| `id` | BigAutoField | Primary Key |
| `buyer_id` | ForeignKey (`User`) | `on_delete=CASCADE`, `related_name='rfqs'` |
| `product_name` | CharField(255) | Required, max 255 chars |
| `description` | TextField | Required specifications |
| `quantity` | PositiveIntegerField | Must be > 0 |
| `delivery_location` | CharField(255) | Required, indexed |
| `deadline` | DateTimeField | Submission cutoff date/time, indexed |
| `status` | CharField(10) | Choices: `OPEN`, `CLOSED`, default `OPEN` |
| `created_at` | DateTimeField | Auto timestamp, ordered `-created_at` |
| `updated_at` | DateTimeField | Auto timestamp on update |

### 3. `quotations_quotation` (Supplier Bids)
| Column | Type | Constraints / Description |
|---|---|---|
| `id` | BigAutoField | Primary Key |
| `rfq_id` | ForeignKey (`RFQ`) | `on_delete=CASCADE`, `related_name='quotations'` |
| `supplier_id` | ForeignKey (`User`) | `on_delete=CASCADE`, `related_name='quotations'` |
| `quoted_price` | DecimalField(12, 2) | Must be > 0.00 |
| `estimated_delivery_time` | PositiveIntegerField | Lead time in days (must be >= 1) |
| `message` | TextField | Optional notes (max 2000 chars) |
| `created_at` | DateTimeField | Auto timestamp on creation |
| `updated_at` | DateTimeField | Auto timestamp on update |
| **Constraint** | `unique_together` | `['rfq', 'supplier']` (Prevents duplicate quotes) |

---

## API Endpoints Overview

### Authentication APIs (`/api/auth/`)
- `POST /api/auth/register/` — Register a new Buyer or Supplier account.
- `POST /api/auth/login/` — Authenticate credentials; returns `{ access, refresh, user }`.
- `POST /api/auth/refresh/` — Refresh an expired JWT access token.
- `GET /api/auth/me/` — Retrieve currently logged-in user profile.

### RFQ APIs (`/api/rfqs/`)
- `POST /api/rfqs/` — Create new RFQ *(Buyer only)*.
- `GET /api/rfqs/` — Browse RFQs with search & filtering *(Suppliers & Buyers)*.
  - Query params: `?search=laptop&status=OPEN&delivery_location=Austin`
- `GET /api/rfqs/my/` — List all RFQs created by the authenticated buyer *(Buyer only)*.
- `GET /api/rfqs/{id}/` — Retrieve complete RFQ details *(Authenticated)*.
- `PUT /api/rfqs/{id}/` — Full update of RFQ *(Owner Buyer only)*.
- `PATCH /api/rfqs/{id}/` — Partial update (e.g. toggle status) *(Owner Buyer only)*.
- `DELETE /api/rfqs/{id}/` — Delete RFQ and associated quotes *(Owner Buyer only)*.

### Quotation APIs (`/api/quotations/` & nested)
- `POST /api/rfqs/{rfq_id}/quotations/` — Submit quotation for an open RFQ *(Supplier only)*.
  - Returns `409 Conflict` if duplicate quote exists.
  - Returns `400 Bad Request` if RFQ is closed or deadline has passed.
- `GET /api/rfqs/{rfq_id}/quotations/` — View all quotations received for an RFQ *(Owner Buyer only)*.
- `GET /api/quotations/my/` — List all quotations submitted by current supplier *(Supplier only)*.
- `GET /api/quotations/{id}/` — View quotation detail *(Supplier owner or RFQ buyer only)*.

---

## Authentication & Role-Based Authorization

1. **Password Hashing**: Django uses PBKDF2 with SHA-256 by default. Plaintext passwords are never stored.
2. **JWT Claims**: User ID, username, email, and role are embedded into the token payload for stateless inspection.
3. **Backend-Enforced Authorization**:
   - `IsBuyer`: Ensures write actions on RFQs are restricted to buyers.
   - `IsSupplier`: Ensures quote submissions and quotation views are restricted to suppliers.
   - `IsRFQOwner`: Object-level permission verifying `obj.buyer == request.user` on PUT/PATCH/DELETE.
   - `CanViewRFQQuotations`: Verifies that only the buyer who created an RFQ can access its received bids.
   - `CanViewQuotationDetail`: Verifies that only the submitting supplier or the receiving buyer can view a specific quotation.
4. **URL ID Protection**: Even if a user alters the ID in a request URL (e.g., `GET /api/rfqs/99/quotations/`), the backend rejects the request with `403 Forbidden`.

---

## Data Validation & Error Handling

- **Positive Numbers**: Quantities and quoted prices must be strictly greater than 0.
- **Lead Time**: Estimated delivery lead time must be at least 1 day.
- **Deadlines**: New RFQ deadlines must be in the future. RFQ edits preserve existing deadlines while rejecting past updates.
- **Max Length**: Product names and delivery locations are restricted to 255 characters; proposal messages are limited to 2000 characters.
- **Standard HTTP Codes**:
  - `200 OK` / `201 Created` / `204 No Content`: Successful operations.
  - `400 Bad Request`: Input validation failure (e.g. past deadline, negative price).
  - `401 Unauthorized`: Missing or invalid JWT access token.
  - `403 Forbidden`: Role mismatch or attempting to access another user's protected data.
  - `404 Not Found`: Resource does not exist.
  - `409 Conflict`: Duplicate quotation attempt for the same RFQ by the same supplier.
  - `500 Server Error`: Handled securely without exposing internal stack traces in production.

---

## Environment Variables

### Backend (`backend/.env`)
```env
# Django Security Settings
SECRET_KEY=django-insecure-your-secret-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration (PostgreSQL)
# Both DB_* and DATABASE_* variable formats are supported:
DB_ENGINE=django.db.backends.postgresql
DB_NAME=merzado_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Frontend (`frontend/.env`)
```env
# API Base URL pointing to the Django REST Framework API
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## Local Development Setup (Windows PowerShell)

Run the following commands from the project root: `C:\Users\my pc\OneDrive\Desktop\MERZADO`

### Step 1: Backend Setup & Virtual Environment
```powershell
# Navigate to backend
cd backend

# Create virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install backend dependencies
pip install -r requirements.txt

# Create your .env file from template
Copy-Item .env.example .env
```

### Step 2: Database Configuration & Migrations
Ensure PostgreSQL is running locally with a database named `merzado_db` (or allow the app to fall back to SQLite if Postgres is not running):
```powershell
# Apply database migrations
python manage.py makemigrations accounts rfqs quotations
python manage.py migrate

# Seed sample demo data (Buyer, Suppliers, RFQs, Quotes)
python manage.py seed_data
```

> **Pre-populated Demo Credentials:**
> - **Buyer**: `buyer1` / Password: `Buyer123!`
> - **Supplier 1**: `supplier1` / Password: `Supplier123!`
> - **Supplier 2**: `supplier2` / Password: `Supplier123!`

### Step 3: Start Backend Dev Server
```powershell
python manage.py runserver 127.0.0.1:8000
```
Backend API will be live at: `http://127.0.0.1:8000/api/`  
Django Admin: `http://127.0.0.1:8000/admin/`

### Step 4: Frontend Setup & Dev Server (In a new PowerShell terminal)
```powershell
# Navigate to frontend
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend web application will open at: `http://localhost:5173/`

---

## Running Tests

Execute the comprehensive automated test suite (covering authentication, RBAC, CRUD, deadline rules, duplicate prevention, and permission checks):

```powershell
cd backend
python manage.py test accounts rfqs quotations -v 2
```

Expected result:
```text
Ran 28 tests in ~25s
OK
```

---

## Production Build

To verify that the frontend compiles cleanly for production:

```powershell
cd frontend
npm run build
```
Output files will be generated in `frontend/dist/`.

---

## Deployment Instructions

### 1. Backend Deployment (Render or Railway)
1. **Environment Variables on Cloud Provider**:
   - `SECRET_KEY`: Set to a strong cryptographic string.
   - `DEBUG`: Set to `False`.
   - `ALLOWED_HOSTS`: Set to your deployed domain (e.g., `merzado-api.onrender.com`).
   - `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`: Provide PostgreSQL connection parameters from managed database service (Render Postgres / Railway Postgres).
   - `CORS_ALLOWED_ORIGINS`: Set to your production frontend URL (e.g., `https://merzado.vercel.app`).
2. **Build Command**:
   ```bash
   pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput
   ```
3. **Start Command**:
   ```bash
   gunicorn merzado_backend.wsgi:application --bind 0.0.0.0:$PORT
   ```

### 2. Frontend Deployment (Vercel)
1. Import the `frontend/` directory into Vercel.
2. **Environment Variables**:
   - `VITE_API_BASE_URL`: `https://merzado-api.onrender.com/api` (your deployed backend API URL).
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. Configure client-side SPA routing rewrites via `vercel.json`:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

---

## Assumptions, Limitations & Future Improvements

### Assumptions
1. Prices and transactions are denominated in USD ($).
2. The bidding deadline represents a strict cut-off; quotations cannot be accepted after the deadline has passed.
3. Each supplier can submit one official proposal per RFQ; if pricing terms evolve, negotiation notes can be included in the message.

### Limitations
1. Attachment files (such as CAD diagrams or PDF engineering specs) are provided via external links rather than direct binary multipart uploads.
2. Email notifications (e.g. bid alerts) are logged internally rather than dispatched via an external SMTP service (e.g. SendGrid).

### Future Improvements
- **Direct Real-Time Chat**: Live WebSocket communication between buyer and bidding suppliers.
- **Contract Awarding**: One-click "Accept Quote" generating automated purchase order (PO) invoices.
- **Multi-Currency Support**: Support international conversions (EUR, GBP, INR).
- **Email/SMS Alerts**: Automated notifications when new quotes are submitted or deadlines approach.
