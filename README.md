# Hemolink

Hemolink is a blood donation coordination platform that connects
**donors** with **hospitals** requesting blood.\
Hospitals can create blood requests and donors can be notified to
respond.

Tech stack:

-   **Backend:** Node.js + Express + Prisma
-   **Database:** PostgreSQL
-   **API Docs:** Swagger

------------------------------------------------------------------------

# Team Members

1.  Daniel Gakumba Ntwali\
2.  Melyssa Ingabe Mbayire\
3.  Ariane Itetero\
4.  Dianah Shimwa Gasasira\
5.  Mfitumukiza Peter\
6.  Teta Butera Nelly

------------------------------------------------------------------------

# Project Structure

    hemolink/
    ├── backend/      # Node.js REST API
    ├── frontend/     # Frontend application
    └── README.md

Backend overview:

    backend/
    ├── prisma/
    │   ├── schema.prisma
    │   └── migrations/
    │
    ├── src/
    │   ├── index.js
    │   ├── config/
    │   ├── controllers/
    │   ├── routes/
    │   ├── middlewares/
    │   └── utils/

------------------------------------------------------------------------

# Quick Start (Backend)

### 1. Install dependencies

    cd backend
    npm install

------------------------------------------------------------------------

### 2. Configure environment variables

Create:

    backend/.env

Example:

    DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/hemolink"
    JWT_SECRET="super-secret-key"
    PORT=3001
    NODE_ENV=development

------------------------------------------------------------------------

### 3. Run database migrations

    npx prisma migrate dev

This will create the required database tables.

------------------------------------------------------------------------

### 4. Generate Prisma Client

If Prisma complains or after pulling new schema changes:

    npx prisma generate

------------------------------------------------------------------------

### 5. Start the development server

    npm run dev

Server runs at:

    http://localhost:3001

------------------------------------------------------------------------

# API Documentation

Swagger documentation:

    http://localhost:3001/api-docs

------------------------------------------------------------------------

# Useful Development Commands

Developers often need to inspect or interact with the database.\
These commands make that easier.

### View Database Tables (Prisma Studio)

    npx prisma studio

This opens a browser interface where you can:

-   View all tables
-   Inspect rows
-   Edit records manually
-   Debug data issues

------------------------------------------------------------------------

### Apply New Schema Changes

If the schema changes:

    npx prisma migrate dev

------------------------------------------------------------------------

### Regenerate Prisma Client

    npx prisma generate

------------------------------------------------------------------------

### Reset Local Database (Development Only)

If things break badly during development:

    npx prisma migrate reset

This will:

-   Drop the database
-   Recreate tables
-   Reapply migrations

Use only in development.

------------------------------------------------------------------------

# API Overview

All endpoints use:

    /api

### Health Check

    GET /api/health

------------------------------------------------------------------------

### Donor Endpoints

    POST /api/donors/register
    POST /api/donors/login
    GET /api/donors/profile
    PUT /api/donors/profile
    PUT /api/donors/availability

------------------------------------------------------------------------

### Hospital Endpoints

    POST /api/hospitals/register
    POST /api/hospitals/login

------------------------------------------------------------------------

### Blood Request Endpoints

    POST /api/requests
    PATCH /api/requests/:id/status

Hospitals create and manage blood requests.

------------------------------------------------------------------------

# Authentication

Authentication uses **JWT tokens**.

Example header:

    Authorization: Bearer <token>

Roles:

  Role       Permissions
  ---------- ----------------------------------
  donor      manage donor profile
  hospital   create and update blood requests

------------------------------------------------------------------------

# API Response Format

Successful response:

    {
      "success": true,
      "message": "Success message",
      "data": {}
    }

Error response:

    {
      "success": false,
      "message": "Error message"
    }

------------------------------------------------------------------------

# Developer Guidelines

1.  Never store plaintext passwords
2.  Always hash passwords with bcrypt
3.  Never return passwords in API responses
4.  Validate all request data before database queries
5.  Follow the **routes → controllers → prisma** architecture
6.  Use migrations for database changes
7.  Write tests for new endpoints

------------------------------------------------------------------------

# Troubleshooting

### Prisma client error

Run:

    npx prisma generate

------------------------------------------------------------------------

### Dependency issues

Reset dependencies:

    rm -rf node_modules
    npm install

------------------------------------------------------------------------

### Database debugging

Use Prisma Studio:

    npx prisma studio

------------------------------------------------------------------------

# Notes

Most development issues are related to:

-   missing migrations
-   incorrect environment variables
-   Prisma client not generated
