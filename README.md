
# Hemolink

Hemolink is a blood donation coordination platform that connects **donors** with **hospitals** requesting blood. Hospitals can create blood requests and donors can be notified to respond.

The system consists of:

- **Backend** – Node.js + Express + PostgreSQL + Prisma
- **Frontend** – client application
- **Database** – PostgreSQL

---

# Team Members

1. Daniel Gakumba Ntwali  
2. Melyssa Ingabe Mbayire  
3. Ariane Itetero  
4. Dianah Shimwa Gasasira  
5. Mfitumukiza Peter  
6. Teta Butera Nelly  

---

# Project Structure

```
hemolink/
├── backend/      # Node.js REST API
├── frontend/     # Frontend application
└── README.md
```

Backend structure:

```
backend/
├── prisma/
│   ├── schema.prisma
│   ├── seed.js
│   └── migrations/
│
├── src/
│   ├── index.js
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   └── utils/
```

---

# Quick Start (Recommended Setup)

This section gets the backend running **without reading the entire documentation**.

### 1 Install dependencies

```
cd backend
npm install
```

---

### 2 Setup environment variables

Create a file:

```
backend/.env
```

Example:

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/hemolink"
JWT_SECRET="super-secret-key"
PORT=3001
NODE_ENV=development
```

---

### 3 Run database migrations

```
npx prisma migrate dev
```

This creates the database tables.

---

### 4 Generate Prisma client

If Prisma errors appear, run:

```
npx prisma generate
```

---

### 5 Seed reference data

This step is **required** or many endpoints will fail.

```
npm run prisma:seed
```

This inserts:

- Blood types
- Provinces
- Districts
- Request statuses

---

### 6 Start the server

```
npm run dev
```

Server should start on:

```
http://localhost:3001
```

---

### 7 View API documentation

Swagger documentation is available at:

```
http://localhost:3001/api-docs
```

---

# Running Tests

```
npm test
```

Tests use **Jest** and **Supertest** and mock the database.

---

# Common Setup Errors (and Fixes)

### Error: `@prisma/client did not initialize`

Run:

```
npx prisma generate
```

---

### Error: `Invalid province code "KIG"`

The reference tables were not seeded.

Run:

```
npm run prisma:seed
```

---

### Error: `Foreign key constraint violated`

This usually means **reference data is missing**.

Examples:

| Error | Cause |
|-----|-----|
blood_requests_status_code_fkey | request status table empty |
province_code_fkey | provinces not seeded |
district_code_fkey | districts not seeded |

Fix:

```
npm run prisma:seed
```

---

### Error: Prisma crashes after install

Reset dependencies:

```
rm -rf node_modules
npm install
npx prisma generate
```

---

# API Overview

All endpoints use the prefix:

```
/api
```

### Health

```
GET /api/health
```

---

### Donors

```
POST /api/donors/register
POST /api/donors/login
GET /api/donors/profile
PUT /api/donors/profile
PUT /api/donors/availability
```

---

### Hospitals

```
POST /api/hospitals/register
POST /api/hospitals/login
```

---

### Blood Requests

```
POST /api/requests
PATCH /api/requests/:id/status
```

Only **authenticated hospitals** can create or update blood requests.

---

# Authentication

Authentication uses **JWT tokens**.

Example header:

```
Authorization: Bearer <token>
```

Roles:

| Role | Permissions |
|----|----|
donor | manage donor profile |
hospital | create blood requests |

---

# Standard API Response Format

Success:

```
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

Error:

```
{
  "success": false,
  "message": "Error message"
}
```

---

# Full Backend Engineering Documentation

The detailed engineering reference explaining:

- every file
- every controller
- database schema
- architectural decisions

is located here:

```
backend/ENGINEERING_REFERENCE.md
```

---

# Developer Rules

1. Never store plaintext passwords  
2. Always hash passwords using bcrypt  
3. Never return passwords in API responses  
4. Always validate request data before database queries  
5. Follow the route → controller → prisma architecture  
6. Use migrations for database changes  
7. Write tests for new endpoints  

---

# Database Tools

Open the Prisma database GUI:

```
npx prisma studio
```

---

# Notes for New Developers

If the API returns unexpected errors:

1. Ensure migrations are applied
2. Ensure reference data is seeded
3. Ensure Prisma client is generated
4. Check `.env` configuration

Most errors during setup come from **missing database setup steps**.
