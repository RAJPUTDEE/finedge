# FinEdge API

Personal Finance and Expense Tracker backend built with Node.js and Express.

This repository provides:
- JWT-based user authentication
- Transaction CRUD with user-level isolation
- Budget management by month
- Summary analytics (income, expenses, balance, trends)
- JSON file persistence with fs/promises
- Global error handling, validation, logging, and rate limiting
- Jest + supertest integration tests

## Tech Stack

- Node.js
- Express
- dotenv
- jsonwebtoken
- express-rate-limit
- Jest
- supertest

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Start server in dev mode:

```bash
npm run dev
```

4. Server base URL:

- http://localhost:3000

## Important Route Note

- `GET /` is not implemented in this project.
- If you open `http://localhost:3000/`, `{"error":"Route not found","path":"/"}` is expected behavior.
- Use `GET /health` to verify server status.

## Environment Variables

Defined in `.env.example` and read by `src/config.js`:

- `PORT` (default: `3000`)
- `NODE_ENV` (default: `development`)
- `JWT_SECRET` (default: `dev-secret-change-me`)
- `JWT_EXPIRES_IN` (default: `1d`)
- `CACHE_TTL_MS` (default: `30000`)
- `RATE_LIMIT_WINDOW_MS` (default: `60000`)
- `RATE_LIMIT_MAX` (default: `100`)

## Project Structure

Easy-to-read repository layout with purpose of each folder:

```text
finedge/
  src/
    app.js                -> Express app setup (middlewares + routes)
    server.js             -> Server bootstrap (starts listening)
    config.js             -> Environment-based configuration

    controllers/          -> HTTP layer (req/res handling)
      userController.js
      transactionController.js
      budgetController.js
      summaryController.js

    routes/               -> Endpoint definitions and route mapping
      userRoutes.js
      transactionRoutes.js
      budgetRoutes.js
      summaryRoutes.js

    services/             -> Business logic
      userService.js
      transactionService.js
      budgetService.js
      summaryService.js

    models/               -> Data access for JSON persistence
      userModel.js
      transactionModel.js
      budgetModel.js

    middleware/           -> Cross-cutting request handling
      asyncHandler.js
      auth.js
      errorHandler.js
      logger.js
      rateLimiter.js
      validator.js

    utils/                -> Shared helpers (analytics, cache, errors, file IO)
      aiHelper.js
      analytics.js
      cache.js
      errors.js
      fileStore.js

    data/                 -> Local JSON storage files
      users.json
      transactions.json
      budgets.json

  tests/                  -> Integration tests (Jest + supertest)
    health.test.js
    users.test.js
    transactions.test.js
    summary.test.js
    setup.js
```

## Scripts

```bash
npm start
npm run dev
npm test
```

## API Testing Guide

### ✅ Happy Path (5 Calls)

Use this quick flow to confirm the core functionality end-to-end:

1. 🔍 Health check

```bash
curl -sS http://localhost:3000/health
```

2. 👤 Register user

```bash
curl -sS -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret123"}'
```

3. 🔐 Login and copy token

```bash
curl -sS -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}'
```

4. 💸 Create one transaction (use Bearer token)

```bash
curl -sS -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"type":"expense","amount":250,"category":"food","description":"Lunch"}'
```

5. 📊 View summary

```bash
curl -sS -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:3000/summary"
```

If these 5 calls work, your main flow is healthy.

### 📚 Detailed API Checks

Use these additional calls for full verification.

#### 1) Health Check

```bash
curl -sS http://localhost:3000/health
```

Expected: status `ok` in JSON response.

#### 2) Register User

```bash
curl -sS -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret123"}'
```

#### 3) Login (Get JWT)

```bash
curl -sS -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}'
```

Copy `token` from response.

#### 4) Create Transaction (Auth Required)

```bash
curl -sS -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"type":"expense","amount":250,"category":"food","description":"Lunch"}'
```

#### 5) List Transactions

```bash
curl -sS -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:3000/transactions?type=expense"
```

#### 6) Update and Delete Transaction

```text
PATCH /transactions/:id
DELETE /transactions/:id
```

#### 7) Set and Read Budgets

```bash
curl -sS -X POST http://localhost:3000/budgets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"month":"2026-05","monthlyGoal":3000,"savingsTarget":500}'
```

```text
GET /budgets
GET /budgets/:month
```

#### 8) Get Summary

```bash
curl -sS -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:3000/summary?from=2026-04-01&to=2026-04-30"
```

Summary includes totals, category breakdown, monthly trends, and `cached` field.

## Common Mistakes ⚠️

- Opening `/users/login` in browser address bar sends GET request.
  - This route expects POST with JSON body.
- Missing `Content-Type: application/json` for POST/PATCH requests.
- Missing `Authorization: Bearer <token>` on protected routes.
- Using `/` as functional route instead of `/health` or API endpoints.

## Testing

Run all tests:

```bash
npm test
```

Tests reset JSON data before each run using `tests/setup.js`.

## Data Persistence Notes

- Data is stored in `src/data/*.json`.
- File access goes through `src/utils/fileStore.js`.
- Write operations are serialized with an in-process lock to reduce race-condition issues.
