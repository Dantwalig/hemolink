# Hemolink Backend — Engineering Reference

> **Audience:** Junior developers joining the project.
> **Purpose:** Explain every architectural decision, every file, every function, and every change made to this backend — in plain language. Read this before touching any code.

---

## Table of Contents

1. [What Is Hemolink?](#1-what-is-hemolink)
2. [How the Backend Is Structured](#2-how-the-backend-is-structured)
3. [How a Request Travels Through the System](#3-how-a-request-travels-through-the-system)
4. [What I Found When I Arrived](#4-what-i-found-when-i-arrived)
5. [The Database Layer — Prisma & PostgreSQL](#5-the-database-layer--prisma--postgresql)
6. [File-by-File Breakdown](#6-file-by-file-breakdown)
   - [Entry Point](#entry-point--srcindexjs)
   - [Config](#config--srcconfigprismajs--srcconfigswaggerjs)
   - [Utils](#utils--srcutilsapiresponsejs)
   - [Middlewares](#middlewares--srcmiddlewaresauthjs--srcmiddlewareserrorhandlerjs)
   - [Routes Index](#routes-index--srcroutesindexjs)
   - [Health Module](#health-module)
   - [Donor Module](#donor-module)
   - [Hospital Module](#hospital-module)
   - [Blood Request Module](#blood-request-module)
7. [Authentication — How JWTs Work Here](#7-authentication--how-jwts-work-here)
8. [Password Security — Why We Use bcrypt](#8-password-security--why-we-use-bcrypt)
9. [The Test Suite](#9-the-test-suite)
10. [Schema Changes Made](#10-schema-changes-made)
11. [API Reference](#11-api-reference)
12. [Running the Project](#12-running-the-project)
13. [Environment Variables](#13-environment-variables)
14. [Rules Every Developer Must Follow](#14-rules-every-developer-must-follow)

---

## 1. What Is Hemolink?

Hemolink is a blood donation coordination platform. Its job is to connect **donors** (people who can give blood) with **hospitals** (institutions that need blood). A hospital can post a blood request — specifying the blood type, quantity, and urgency. Donors in the area can be notified and respond.

The backend is a REST API built with:

- **Node.js + Express** — the HTTP server and routing layer
- **PostgreSQL** — the relational database
- **Prisma ORM** — the tool that lets us write JavaScript instead of raw SQL
- **JWT (JSON Web Tokens)** — for authentication
- **bcrypt** — for password hashing

---

## 2. How the Backend Is Structured

```
backend/
├── prisma/
│   ├── schema.prisma          # Database model definitions
│   ├── seed.js                # Script to pre-populate reference data
│   └── migrations/            # Auto-generated SQL migration history
│
├── src/
│   ├── index.js               # App entry point — starts the server
│   ├── config/
│   │   ├── prisma.js          # Creates and exports the Prisma client
│   │   └── swagger.js         # Configures auto-generated API documentation
│   ├── middlewares/
│   │   ├── auth.js            # JWT authentication + role-based authorization
│   │   └── errorHandler.js    # Catches unhandled errors across the whole app
│   ├── routes/
│   │   ├── index.js           # Master router — registers all sub-routers
│   │   ├── health.routes.js   # GET /api/health
│   │   ├── donor.routes.js    # POST /api/donors/register, login, profile
│   │   ├── hospital.routes.js # POST /api/hospitals/register, login
│   │   └── request.routes.js  # POST /api/requests, PATCH /api/requests/:id/status
│   ├── controllers/
│   │   ├── health.controller.js
│   │   ├── donor.controller.js
│   │   ├── hospital.controller.js
│   │   └── request.controller.js
│   └── utils/
│       └── apiResponse.js     # Shared helpers for sending consistent responses
│
└── tests/
    ├── donor.test.js
    ├── hospital.test.js
    └── request.test.js
```

The pattern is always the same:

```
HTTP Request → Route → Controller → Prisma → Database → Response
```

This is called **separation of concerns**. Routes know nothing about business logic. Controllers know nothing about how HTTP routing works. Prisma knows nothing about HTTP at all. Each layer does one job.

---

## 3. How a Request Travels Through the System

Let's trace what happens when a hospital sends `POST /api/hospitals/register`:

```
1. HTTP POST arrives at Express
2. express.json() middleware parses the JSON body
3. The request reaches the master router in routes/index.js
4. index.js matches "/hospitals" and hands off to hospital.routes.js
5. hospital.routes.js matches "/register" and calls the register controller
6. hospital.controller.js runs 10 validation steps in cheapest-first order:
     a. All required fields present (no DB call needed)
     b. Password >= 6 characters (no DB call needed)
     c. Email format valid if provided (no DB call needed)
     d. Lat/lon — both or neither; if given, within Rwanda's bounding box (no DB call)
     e. Prisma: is this phone already registered? → 409 if yes
     f. Prisma: is this email already registered? → 409 if yes (only if email given)
     g. Prisma: does provinceCode exist in the provinces table? → 400 if not
     h. Prisma: does districtCode exist, and does it belong to that province? → 400 if not
     i. bcrypt hashes the password (10 salt rounds)
     j. prisma.hospital.create() inserts the row
     k. Password stripped from response, success() sends 201
7. If anything throws an unhandled error, Express passes it to errorHandler.js
```

Every module follows this exact same pattern. Once you understand one, you understand all of them.

---

## 4. What I Found When I Arrived

When I first looked at this codebase, here is exactly what existed and what was missing.

### Already built and working

| File | State |
|---|---|
| `src/index.js` | Complete — server boots, middleware wired, routes mounted |
| `src/config/prisma.js` | Complete — Prisma client singleton |
| `src/config/swagger.js` | Complete — auto-generates API docs from JSDoc comments in routes |
| `src/middlewares/auth.js` | Complete — JWT authentication and role-based authorization |
| `src/middlewares/errorHandler.js` | Complete — global error handler |
| `src/utils/apiResponse.js` | Complete — `success()` and `error()` helpers |
| `src/routes/health.routes.js` | Complete |
| `src/controllers/health.controller.js` | Complete |
| `src/controllers/donor.controller.js` | **Fully implemented** — register, login, getProfile, updateProfile, updateAvailability |
| `src/routes/donor.routes.js` | **Fully implemented** — all donor endpoints with Swagger docs |
| `prisma/schema.prisma` | Partially complete — Donor model was correct, Hospital model was missing `password` and `@unique` on `phone` |
| `prisma/seed.js` | Complete — seeds 8 blood types into the database |

### Empty files (existed but had no code)

| File | State |
|---|---|
| `src/controllers/hospital.controller.js` | Empty |
| `src/routes/hospital.routes.js` | Empty |
| `src/controllers/request.controller.js` | Empty |
| `src/routes/request.routes.js` | Empty |
| `tests/donor.test.js` | Empty |
| `tests/hospital.test.js` | Empty |
| `tests/request.test.js` | Empty |

### Missing entirely

- No test framework configured (`jest`, `supertest` not in `package.json`)
- No `test` script in `package.json`
- Hospital routes were not registered in `src/routes/index.js`
- Request routes were not registered in `src/routes/index.js`

---

## 5. The Database Layer — Prisma & PostgreSQL

Prisma is an **ORM** — Object Relational Mapper. Instead of writing SQL like:

```sql
INSERT INTO hospitals (name, phone, password, latitude, longitude)
VALUES ('KFH', '0788100001', '$2b$10$...', -1.9441, 30.0619);
```

We write JavaScript like:

```js
await prisma.hospital.create({
  data: { name, phone, password: hashedPassword, latitude, longitude }
});
```

Prisma reads `prisma/schema.prisma` to know the shape of the database. Every time you change that file, you run a migration to apply the change to the real database.

### The models

**`Province`** — Rwanda's 5 administrative provinces. Seeded once, never written by the API. Primary key is a short code: `KIG`, `NOR`, `SOU`, `EAS`, `WES`.

**`District`** — Rwanda's 30 districts. Each row includes the `provinceCode` it belongs to. This relationship is what lets the API reject a district/province mismatch — e.g., someone claiming GASABO (Kigali) is in the Northern Province.

**`Donor`** — a person who can give blood.
Fields: `donorId`, `fullName`, `phone` (unique), `password`, `bloodTypeCode`, `latitude`, `longitude`, `available`, `consentSms`

**`Hospital`** — a registered medical institution in Rwanda.
Fields: `hospitalId`, `name`, `phone` (unique), `email` (unique, optional), `password`, `provinceCode`, `districtCode`, `sector`, `cell`, `village`, `latitude` (optional), `longitude` (optional)

The address follows Rwanda's official 5-level administrative hierarchy: Province → District → Sector → Cell → Village. Province and district are validated against the seeded reference tables. Sector, cell, and village are free-text strings — there are thousands of them and they don't change system behaviour, so a reference table would be over-engineering.

Latitude and longitude are now optional. A structured address is sufficient for locating a hospital. If coordinates are provided, both must be given together and must fall within Rwanda's geographic bounding box.

**`BloodType`** — a reference table. Values: `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`. Seeded once, never changed by the API.

**`BloodRequest`** — a hospital's request for blood.
Fields: `requestId`, `hospitalId`, `bloodTypeCode`, `unitsNeeded`, `urgencyLevel`, `statusCode`, `neededBy`

**`RequestStatus`** — a reference table for valid status codes: `pending`, `fulfilled`, `cancelled`.

**`Inventory`** — tracks how many units of each blood type a hospital holds.

**`Notification`** — tracks which donors were notified about a request and their response.

### Schema changes made

The original `Hospital` model was missing `password`, had no unique constraint on `phone`, and had no address fields — just raw coordinates. Two rounds of changes were made.

**Round 1** — add authentication fields:

```diff
 model Hospital {
   hospitalId Int    @id @default(autoincrement()) @map("hospital_id")
   name       String
-  phone      String
+  phone      String @unique
+  password   String
   latitude   Float
   longitude  Float
 }
```

**Round 2** — add Rwanda-specific structured address, optional email, make coordinates optional:

```diff
+model Province {
+  provinceCode String     @id @map("province_code")
+  name         String
+  districts    District[]
+  hospitals    Hospital[]
+  @@map("provinces")
+}

+model District {
+  districtCode String   @id @map("district_code")
+  name         String
+  provinceCode String   @map("province_code")
+  province     Province  @relation(...)
+  hospitals    Hospital[]
+  @@map("districts")
+}

 model Hospital {
   hospitalId Int     @id @default(autoincrement()) @map("hospital_id")
   name       String
   phone      String  @unique
+  email      String? @unique
   password   String
-  latitude   Float
-  longitude  Float
+  provinceCode String  @map("province_code")
+  districtCode String  @map("district_code")
+  sector       String
+  cell         String
+  village      String
+  latitude     Float?
+  longitude    Float?
+  province     Province @relation(...)
+  district     District @relation(...)
 }
```

**After pulling this code, apply all pending migrations:**

```bash
npx prisma migrate dev --name add_hospital_address_fields
```

---

## 6. File-by-File Breakdown

---

### Entry Point — `src/index.js`

This file was already in place. It is the first thing Node.js runs.

```js
require("dotenv").config();     // Load environment variables from .env
const app = express();
app.use(cors());                // Allow cross-origin requests (frontend on a different port)
app.use(morgan("dev"));         // Log every HTTP request to the terminal
app.use(express.json());        // Parse JSON request bodies automatically
app.use("/api-docs", ...);      // Serve auto-generated Swagger docs
app.use("/api", routes);        // All API endpoints are under /api
app.use(errorHandler);          // Catch any unhandled errors
app.listen(PORT, ...);
module.exports = app;           // Exported so test files can import the app
```

The `module.exports = app` at the bottom is important — without it, the test files cannot import the Express app to send test requests to it.

---

### Config — `src/config/prisma.js` & `src/config/swagger.js`

**`prisma.js`** creates a single `PrismaClient` instance and exports it. Why a single instance? Because Prisma manages a connection pool to PostgreSQL. Creating a new client on every request would open thousands of connections and crash the database. One shared instance handles this correctly.

```js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
module.exports = prisma;
```

Every controller that needs the database imports this same object.

**`swagger.js`** reads JSDoc comment blocks from every file matching `./src/routes/*.js` and compiles them into an OpenAPI 3.0 specification. This powers the interactive documentation available at `http://localhost:PORT/api-docs`. You do not maintain a separate docs file — the source of truth for docs lives directly in the route files as comments.

---

### Utils — `src/utils/apiResponse.js`

This file existed already and is one of the most important utility files in the project.

```js
const success = (res, data, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const error = (res, message = "Something went wrong", statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};
```

**Why does this matter?** Without this, every controller would construct its own JSON response, and they would all look slightly different. The frontend would need to handle inconsistencies. By routing every response through `success()` and `error()`, every single API response in this system has the same shape:

```json
{ "success": true,  "message": "...", "data": { ... } }
{ "success": false, "message": "..." }
```

The frontend can rely on `response.body.success` being a boolean on every response, no exceptions.

---

### Middlewares — `src/middlewares/auth.js` & `src/middlewares/errorHandler.js`

These files existed already and required no changes.

**`auth.js`** exports two functions:

`authenticate(req, res, next)` — reads the `Authorization` header, extracts the Bearer token, verifies it against `JWT_SECRET`, and if valid, attaches the decoded payload to `req.user`. If the token is missing or invalid, it immediately responds with 401 and the request goes no further.

`authorize(...roles)` — a function that returns a middleware. It checks whether `req.user.role` is in the list of allowed roles. If not, it responds with 403 Forbidden. This is how we restrict blood request creation to hospitals only — we add `authorize("hospital")` to those routes.

Usage example:
```js
// Only authenticated hospitals can reach the createRequest controller
router.post("/", authenticate, authorize("hospital"), createRequest);
```

**`errorHandler.js`** is the last middleware in `index.js`. Express has a special signature for error-handling middleware: it takes four arguments `(err, req, res, next)`. Any time a controller calls `next(err)` or throws inside an `async` function that Express catches, the error lands here. It logs the stack trace and sends a clean JSON error to the client. In development mode, it also includes the stack trace in the response body to help with debugging.

The pattern in every `async` controller is:

```js
try {
  // ... do the work
} catch (err) {
  next(err);  // hand off to errorHandler
}
```

---

### Routes Index — `src/routes/index.js`

This is the master router. It imports all the sub-routers and mounts them under their URL prefixes. I added hospital and request routes here.

**Before:**
```js
router.use("/health", healthRoutes);
router.use("/donors", donorRoutes);
```

**After:**
```js
router.use("/health",    healthRoutes);
router.use("/donors",    donorRoutes);
router.use("/hospitals", hospitalRoutes);  // added
router.use("/requests",  requestRoutes);   // added
```

When a request hits `/api/hospitals/register`, Express strips `/api` (handled in `index.js`), then strips `/hospitals` (handled here), and passes `/register` to `hospital.routes.js`.

---

### Health Module

**`health.routes.js`** and **`health.controller.js`** — existed, no changes.

`GET /api/health` returns `{ status: "UP", timestamp: "..." }`. This is used by deployment infrastructure (load balancers, uptime monitors) to check whether the server process is alive and responding. It requires no authentication and no database access.

---

### Donor Module

**`src/controllers/donor.controller.js`** — was already fully implemented. No changes were made to it. Documented here for completeness.

#### `sanitizeDonor({ password, ...donor }) => donor`

This is a small but critical helper at the top of the file. It uses JavaScript destructuring to pull `password` out of the donor object and return everything else. This runs before every response that includes donor data, ensuring the hashed password is never sent to the client, not even accidentally.

#### `register(req, res, next)`

1. Extracts `fullName`, `phone`, `password`, `bloodTypeCode`, `latitude`, `longitude`, `consentSms` from `req.body`
2. Checks all fields are present — returns 400 if not
3. Checks password is at least 6 characters — returns 400 if not
4. Queries Prisma for an existing donor with the same phone — returns 409 (Conflict) if found
5. Hashes the password with `bcrypt.hash(password, 10)`
6. Creates the donor record in the database
7. Returns the new donor (sanitized) with status 201

#### `login(req, res, next)`

1. Extracts `phone` and `password` from `req.body`
2. Validates both fields are present — returns 400 if not
3. Finds the donor by phone — returns 401 if not found (deliberately vague to prevent user enumeration attacks)
4. Compares the submitted password against the stored hash with `bcrypt.compare()` — returns 401 if wrong
5. Signs a JWT: `{ id: donor.donorId, role: "donor" }` with a 1-day expiry
6. Returns the donor (sanitized) and the token

#### `getProfile`, `updateProfile`, `updateAvailability`

Protected routes that require a valid donor JWT. They use `req.user.id` (set by the `authenticate` middleware) to know which donor's record to read or update. These were already implemented and are not tested in the current test suite — a good area for future coverage.

**`src/routes/donor.routes.js`** — was already fully implemented. No changes were made.

---

### Hospital Module

**`src/controllers/hospital.controller.js`** — written from scratch, then extended with Rwanda-specific validation.

Deliberately mirrors the donor module structure so that any developer familiar with one is immediately productive in the other.

#### `RWANDA_BOUNDS`

A constant defining Rwanda's geographic bounding box:

```js
const RWANDA_BOUNDS = { latMin: -2.84, latMax: -1.05, lonMin: 28.86, lonMax: 30.90 };
```

Any submitted coordinates are checked against these limits before hitting the database. A hospital in Rwanda cannot have GPS coordinates that put it in Uganda or the DRC. Values are sourced from Rwanda's official GIS boundaries.

#### `EMAIL_REGEX`

A minimal regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) that catches obviously malformed email addresses. We don't send a verification email yet, but we still reject garbage at registration time so the data stays clean.

#### `sanitizeHospital({ password, ...hospital }) => hospital`

Same pattern as `sanitizeDonor`. Strips the password hash before any hospital object is sent in a response.

#### `register(req, res, next)`

Accepts: `name`, `phone`, `password`, `provinceCode`, `districtCode`, `sector`, `cell`, `village` (all required) and `email`, `latitude`, `longitude` (all optional).

Validation runs in 10 steps, ordered cheapest-first — field checks before any database queries:

1. **Required fields present** — returns 400 if any of the 9 required fields are missing
2. **Password ≥ 6 characters** — returns 400 if not
3. **Email format** (only if provided) — returns 400 if malformed
4. **Lat/lon — both or neither** — returns 400 if only one is given. If both given, checks they are within `RWANDA_BOUNDS` — returns 400 if outside
5. **Duplicate phone** — queries `hospital.findUnique({ where: { phone } })` — returns 409 if taken
6. **Duplicate email** (only if provided) — queries `hospital.findUnique({ where: { email } })` — returns 409 if taken
7. **Province exists** — queries `province.findUnique({ where: { provinceCode } })` — returns 400 if not found. Error message lists the 5 valid codes so the developer knows exactly what to send
8. **District exists and belongs to province** — queries `district.findUnique({ where: { districtCode } })` — returns 400 if not found. Then checks `district.provinceCode === provinceCode` — returns 400 with a message naming both the district and province if they don't match. This catches the case where both codes individually exist but are combined incorrectly (e.g., GASABO under NOR instead of KIG)
9. **Hash password** — `bcrypt.hash(password, 10)`
10. **Create record** — `prisma.hospital.create()`

#### `login(req, res, next)`

Accepts: `phone`, `password`

1. Validates both fields — returns 400 if missing
2. Finds hospital by phone — returns 401 if not found
3. Compares password with `bcrypt.compare()` — returns 401 if wrong
4. Signs a JWT: `{ id: hospital.hospitalId, role: "hospital" }` with 1-day expiry
5. Returns the sanitized hospital and token

**Why do "not found" and "wrong password" return the same message?**

Both return `"Invalid phone or password."`. This is intentional. Different error messages for each case would let an attacker use the login endpoint to enumerate which phone numbers are registered. Same message for both failures — we give away nothing.

**`src/routes/hospital.routes.js`** — written from scratch, then updated with new Swagger docs.

Two endpoints, documented with JSDoc blocks that appear in the auto-generated Swagger UI at `/api-docs`. No authentication required — register and login are how you get a token in the first place.

---

### Blood Request Module

**`src/controllers/request.controller.js`** — written from scratch.

#### `VALID_STATUSES = ["pending", "fulfilled", "cancelled"]`

Defined as a constant at the top of the file. The status codes must also exist as rows in the `RequestStatus` table (a database constraint enforced by Prisma's foreign key). We validate against this array before hitting the database so we can return a readable 400 error instead of a Prisma constraint error.

#### `createRequest(req, res, next)`

This endpoint is protected — only authenticated hospitals can call it.

1. Extracts `bloodTypeCode`, `unitsNeeded`, `urgencyLevel`, `neededBy` from `req.body`
2. Gets `hospitalId` from `req.user.id` — this is the ID embedded in the JWT by the login endpoint. The hospital cannot fake their own ID.
3. Validates fields are present. Note: `unitsNeeded == null` is used instead of `!unitsNeeded`. This is important — `!0` is `true` in JavaScript, which would incorrectly flag `unitsNeeded: 0` as missing. Using `== null` catches only `null` and `undefined`.
4. Validates `unitsNeeded` is a positive integer using `Number.isInteger()` and `>= 1`
5. Creates the blood request, hardcoding `statusCode: "pending"` — a new request is always pending, the hospital cannot choose a different starting status
6. Returns the created request with status 201

#### `updateStatus(req, res, next)`

1. Reads `:id` from the URL params and `status` from the request body
2. Validates `status` is present — returns 400 if not
3. Validates `status` is in `VALID_STATUSES` — returns 400 with clear message listing the valid options
4. Fetches the request from the database first — returns 404 if it doesn't exist
5. Updates only the `statusCode` field

**Why fetch before updating?** Prisma's `update()` throws a runtime error if the record doesn't exist, rather than returning a clean 404. By calling `findUnique()` first, we control the error ourselves and return a human-readable message.

**`src/routes/request.routes.js`** — written from scratch.

Both endpoints are protected with `authenticate` and `authorize("hospital")`. A donor JWT will reach `authenticate` fine (it is a valid token) but will be rejected by `authorize("hospital")` with a 403, because the role embedded in the token is `"donor"` not `"hospital"`.

---

## 7. Authentication — How JWTs Work Here

A JWT (JSON Web Token) is a signed string that looks like this:

```
eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwiccm9sZSI6Imhvc3BpdGFsIn0.SIGNATURE
```

It has three parts separated by dots: header, payload, signature. The payload is base64-encoded JSON — anyone can decode and read it. But only the server, which knows the `JWT_SECRET`, can produce a valid signature. If someone tampers with the payload, the signature won't match and `jwt.verify()` will throw an error.

**The flow:**

1. Hospital calls `POST /api/hospitals/login` with correct credentials
2. Server creates a token: `jwt.sign({ id: 1, role: "hospital" }, JWT_SECRET, { expiresIn: "1d" })`
3. Token is returned to the client
4. Client stores the token and sends it in future requests: `Authorization: Bearer <token>`
5. `authenticate` middleware calls `jwt.verify(token, JWT_SECRET)` — if valid, attaches the decoded payload to `req.user`
6. Controllers can read `req.user.id` and `req.user.role` without querying the database

This is stateless — the server does not store sessions anywhere. The token itself carries the identity information.

---

## 8. Password Security — Why We Use bcrypt

Passwords are never stored as plain text. If the database is ever compromised, an attacker should not be able to recover user passwords.

bcrypt works by:
1. Generating a random "salt" (a random string unique to each password)
2. Combining the password and salt, then running a deliberately slow hashing algorithm
3. Storing the result: `$2b$10$<22-char-salt><31-char-hash>`

The `10` in `bcrypt.hash(password, 10)` is the number of "rounds". Each additional round doubles the computation time. 10 rounds means the hash takes ~100ms on a modern machine. That is slow enough to make brute-force attacks impractical (an attacker trying millions of passwords would need millions of 100ms operations) but fast enough not to make login feel sluggish.

When a user logs in, `bcrypt.compare(submittedPassword, storedHash)` re-runs the algorithm with the stored salt and checks whether the result matches. You never decrypt a bcrypt hash — you only compare.

---

## 9. The Test Suite

Tests are in `backend/tests/`. They use:

- **Jest** — the test runner. Defines `describe`, `test`, `expect`.
- **Supertest** — lets us send real HTTP requests to the Express app in memory, without starting an actual server.

Run all tests:

```bash
npm test
```

Current results: **37 tests, 37 passing** across 3 suites (9 new hospital tests added when Rwanda validation was introduced).

### How tests work without a real database

Every test file mocks Prisma — including all the new reference table models:

```js
jest.mock("../src/config/prisma", () => ({
  donor:    { findUnique: jest.fn(), create: jest.fn() },
  hospital: { findUnique: jest.fn(), create: jest.fn() },
  province: { findUnique: jest.fn() },   // Rwanda province reference table
  district: { findUnique: jest.fn() },   // Rwanda district reference table
  bloodRequest: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
}));
```

`jest.fn()` creates a fake function that does nothing by default. In each test, we configure what it should return:

```js
prisma.donor.findUnique.mockResolvedValue(null);  // pretend no donor exists
prisma.donor.create.mockResolvedValue(storedDonor);  // pretend create succeeded
```

This means tests run in milliseconds without a database connection, and each test has full control over what the database "returns". After each test, `jest.clearAllMocks()` resets all the fake functions so tests don't bleed into each other.

Because the hospital `register` controller calls `hospital.findUnique` twice in sequence (once for phone, once for email), the hospital tests use `mockResolvedValueOnce` instead of `mockResolvedValue` — the former returns a value once and then resets, so each call in the same request gets its own answer:

```js
prisma.hospital.findUnique
  .mockResolvedValueOnce(null)   // first call: phone not taken
  .mockResolvedValueOnce(null);  // second call: email not taken
prisma.province.findUnique.mockResolvedValue({ provinceCode: "KIG", name: "Kigali" });
prisma.district.findUnique.mockResolvedValue({ districtCode: "GASABO", provinceCode: "KIG" });
```

A shared `mockSuccessfulRegistration()` helper in the hospital test file sets all four of these up at once, keeping individual tests short.

### A bug that was caught and fixed during testing

The `request.controller.js` originally validated `unitsNeeded` like this:

```js
if (!bloodTypeCode || !unitsNeeded || !urgencyLevel || !neededBy) { ... }
```

The test sent `unitsNeeded: 0` and expected a "positive integer" error. Instead it got a "required fields" error. The problem: `!0` is `true` in JavaScript, so `0` was being treated as a missing field. The fix:

```js
if (!bloodTypeCode || unitsNeeded == null || !urgencyLevel || !neededBy) { ... }
```

Now `0` passes the required-fields check and correctly hits the integer validation below it. This is the kind of subtle JavaScript coercion bug that tests are designed to catch.

---

## 10. Schema Changes Made

Two rounds of changes were made to `prisma/schema.prisma`:

See the diff in the [Hospital Module section](#hospital-module) above for the full before/after.

**To apply all pending migrations:**

```bash
cd backend
npx prisma migrate dev --name add_hospital_address_fields
```

**To seed all reference data (blood types, provinces, districts):**

```bash
npm run prisma:seed
```

The seed script must be run once after migrating. Provinces are seeded before districts because districts have a foreign key pointing at provinces — order matters.

---

## 11. API Reference

All endpoints are prefixed with `/api`. Full interactive docs available at `http://localhost:PORT/api-docs` when the server is running.

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | None | Server health check |

### Donors

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/donors/register` | None | Register a new donor |
| POST | `/api/donors/login` | None | Login, receive JWT |
| GET | `/api/donors/profile` | Donor JWT | Get own profile |
| PUT | `/api/donors/profile` | Donor JWT | Update profile fields |
| PUT | `/api/donors/availability` | Donor JWT | Toggle available status |

### Hospitals

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/hospitals/register` | None | Register a new hospital (Rwanda address required) |
| POST | `/api/hospitals/login` | None | Login, receive JWT |

**Hospital registration required fields:** `name`, `phone`, `password`, `provinceCode`, `districtCode`, `sector`, `cell`, `village`

**Optional fields:** `email` (unique if given), `latitude` + `longitude` (both or neither; must be within Rwanda's bounds if given)

**Valid province codes:** `KIG` (Kigali), `NOR` (Northern), `SOU` (Southern), `EAS` (Eastern), `WES` (Western)

**District codes** — use the district name in uppercase, e.g. `GASABO`, `HUYE`, `MUSANZE`. Full list of all 30 codes is in `prisma/seed.js`.

### Blood Requests

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/requests` | Hospital JWT | Create a blood request |
| PATCH | `/api/requests/:id/status` | Hospital JWT | Update request status |

### Standard response shapes

**Success:**
```json
{
  "success": true,
  "message": "Descriptive message here",
  "data": { }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

### HTTP status codes used

| Code | Meaning | When used |
|------|---------|-----------|
| 200 | OK | Successful GET, login, PATCH |
| 201 | Created | Successful register, blood request creation |
| 400 | Bad Request | Missing fields, invalid values |
| 401 | Unauthorized | Wrong credentials, missing/invalid JWT |
| 403 | Forbidden | Valid JWT but wrong role |
| 404 | Not Found | Record doesn't exist |
| 409 | Conflict | Phone number or email already registered |
| 500 | Internal Server Error | Unhandled exceptions |

---

## 12. Running the Project

### Prerequisites

- Node.js 18+
- PostgreSQL running locally
- A `.env` file in `backend/` (see section 13)

### First-time setup

```bash
# Install dependencies
cd backend
npm install

# Apply database migrations
npx prisma migrate dev

# Seed reference data: blood types, Rwanda provinces and districts
# Provinces must seed before districts (foreign key dependency)
npm run prisma:seed

# Start the server
npm run dev
```

### Running tests

```bash
npm test
```

Tests do not require a running database or server. They mock everything.

### Viewing the database in a GUI

```bash
npm run prisma:studio
```

Opens a browser-based interface to browse and edit database records directly. Useful for debugging.

---

## 13. Environment Variables

Create a file called `.env` in the `backend/` directory. It is gitignored and must never be committed.

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/hemolink"
JWT_SECRET="your-long-random-secret-string"
PORT=5000
NODE_ENV=development
```

`JWT_SECRET` should be a long, random string. Any JWT signed with this secret can authenticate against this server. Keep it secret — if it leaks, anyone can forge tokens.

---

## 14. Rules Every Developer Must Follow

These are not suggestions.

**Never store plaintext passwords.** Always use `bcrypt.hash()` before inserting into the database.

**Never return passwords in responses.** Use `sanitizeDonor()` or `sanitizeHospital()` before sending any user object. Even if the password is hashed, it should not leave the server.

**Never trust the request body for user identity.** Controllers read `hospitalId` from `req.user.id` (the JWT), not from `req.body.hospitalId`. A malicious client could send any value in the body. The JWT is cryptographically signed and cannot be forged.

**Follow the route → controller → prisma pattern.** Do not put database queries in route files. Do not put HTTP response logic in controller helper functions. Keep each layer doing its one job.

**Validate before you query.** Check required fields and value constraints at the top of every controller, before touching Prisma. This avoids unnecessary database round trips and gives cleaner error messages.

**Write tests for every new endpoint.** Mock Prisma. Cover the happy path, missing fields, unauthorized access, and not-found cases at minimum.

**Run `npx prisma migrate dev` after schema changes.** Never edit the database directly. All schema changes go through migrations so the history is tracked and reproducible.

**Validate location data against Rwanda's administrative structure.** Province and district must be verified against the seeded reference tables — not hard-coded in application logic. This way the data stays authoritative and future additions (new districts, boundary changes) only require a seed update, not a code change. Sector, cell, and village are too numerous to enumerate — validate them as non-empty strings.

**Validate coordinates against Rwanda's geographic bounding box.** Latitude must be between -2.84 and -1.05, longitude between 28.86 and 30.90. If a hospital submits coordinates outside these bounds, reject immediately with 400 — do not store bad geographic data that will break distance calculations later.
