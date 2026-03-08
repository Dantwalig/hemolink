# Hemolink System Architecture

## System Overview
Hemolink is a blood donation coordination platform that connects donors and hospitals. The system allows hospitals to request blood, donors to respond to requests, and administrators to monitor system activity.

The application is composed of two primary layers:

- Frontend (React)
- Backend API (Node.js + Express)
- Database (PostgreSQL via Prisma ORM)

The backend exposes REST APIs consumed by the frontend.

---

## High-Level Architecture

Frontend (React)
        │
        │ HTTP Requests
        ▼
Backend API (Express)
        │
        │ Prisma ORM
        ▼
Database (PostgreSQL)

---

## Backend Structure

backend/src/

controllers/
Handles request logic and coordinates responses.

Example:
- donor.controller.js
- health.controller.js

routes/
Defines API endpoints and connects them to controllers.

Example:
- donor.routes.js
- health.routes.js

middlewares/
Reusable request processing components.

Examples:
- auth.js (authentication middleware)
- errorHandler.js (global error handling)

config/
System configuration.

Examples:
- prisma.js (database client)
- swagger.js (API documentation setup)

utils/
Utility helpers used across the backend.

Example:
- apiResponse.js (standard API response format)

---

## Database Layer

Prisma ORM is used for database access.

Key files:
- prisma/schema.prisma
- prisma/migrations/

Responsibilities:
- Define database models
- Handle schema migrations
- Provide type-safe database queries

---

## Frontend Architecture

frontend/src/

pages/
Contains main UI pages organized by user role.

admin/
Admin dashboard and system management pages.

donor/
Donor registration and response pages.

hospital/
Hospital dashboard and blood request management.

utils/
Reusable utilities and API helpers.

Example:
- api.js (central API request handler)
- AuthContext.jsx (authentication context provider)

---

## API Flow Example

Donor Registration

User → Frontend Form  
Frontend → POST /api/donors/register  
Routes → donor.routes.js  
Controller → donor.controller.js  
Database → Prisma ORM  
Response → API Response Utility

---

## Security Layer

Authentication is handled using middleware.

auth.js middleware ensures protected routes require authentication.

Global error handling is implemented using:

middlewares/errorHandler.js

---

## Key Design Principles

1. Separation of concerns
   Controllers handle request logic
   Routes define endpoints
   Prisma handles database communication

2. Role-based frontend structure
   Admin, donor, and hospital pages are separated

3. Consistent API responses
   apiResponse utility ensures standard responses

---

## Future Extension Points

Potential system improvements include:

- Notification service (SMS / email alerts)
- Real-time request updates
- Inventory prediction system
- Donor eligibility tracking
- External health system integrations