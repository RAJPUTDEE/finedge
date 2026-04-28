# FinEdge — Personal Finance & Expense Tracker API

A RESTful API backend for tracking personal income and expenses, built with **Node.js** and **Express**. Demonstrates async/await, modular MVC architecture, custom middleware, JWT-based sessions, JSON file persistence with `fs/promises`, in-memory TTL caching, rate limiting, and basic analytics.

---

## Features

- User registration and JWT-based login (mock session)
- Transaction CRUD (income / expense) with per-user isolation
- Monthly budgets with `monthlyGoal` and `savingsTarget`
- `/summary` endpoint with totals, category breakdown, monthly trends, and savings tips
- Auto-categorization of expenses by description keywords
- In-memory TTL cache for `/summary` (auto-invalidated on writes)
- Rate limiting, CORS, request logging, structured error handling

---

## Project structure

```
src/
├── app.js                  Express app wiring
├── server.js               Server entry point
├── config.js               Env-driven configuration
├── routes/                 Route definitions
│   ├── userRoutes.js
│   ├── transactionRoutes.js
│   ├── summaryRoutes.js
│   └── budgetRoutes.js
├── controllers/            Request/response handling
│   ├── userController.js
│   ├── transactionController.js
│   ├── summaryController.js
│   └── budgetController.js
├── services/               Business logic
│   ├── userService.js
│   ├── transactionService.js
│   ├── summaryService.js
│   └── budgetService.js
├── models/                 Data access (fs/promises + JSON)
│   ├── userModel.js
│   ├── transactionModel.js
│   └── budgetModel.js
├── middleware/
│   ├── errorHandler.js     Global error handler + 404
│   ├── logger.js           Request logging
│   ├── validator.js        Input validation
│   ├── auth.js             JWT verification
│   ├── rateLimiter.js      express-rate-limit
│   └── asyncHandler.js     async wrapper
├── utils/
│   ├── errors.js           Custom error classes
│   ├── analytics.js        Summary, trends, filtering
│   ├── aiHelper.js         Auto-category + saving tips
│   ├── cache.js            In-memory TTL cache
│   └── fileStore.js        JSON read/write with locking
└── data/
    ├── users.json
    ├── transactions.json
    └── budgets.json
tests/                      Jest + supertest integration tests
```

---

## Setup

```bash
git clone <your-repo-url>
cd finedge
npm install
cp .env.example .env
npm run dev
```

Server starts at `http://localhost:3000`.

### Environment variables (`.env`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | HTTP port |
| `NODE_ENV` | `development` | Env label |
| `JWT_SECRET` | `dev-secret-change-me` | JWT signing key |
| `JWT_EXPIRES_IN` | `1d` | Token lifetime |
| `CACHE_TTL_MS` | `30000` | Summary cache TTL |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window |
| `RATE_LIMIT_MAX` | `100` | Max requests per window per IP |

---

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the server |
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm test` | Run Jest test suite |

---

## API reference

All authenticated routes require `Authorization: Bearer <token>` (obtained via `POST /users/login`).

### Health

```
GET /health
→ 200 { "status": "ok", "uptime": 12.34, "timestamp": "..." }
```

### Users

```
POST /users
Body: { "name": "Alice", "email": "a@x.com", "password": "secret123" }
→ 201 { id, name, email, preferences, createdAt }

POST /users/login
Body: { "email": "a@x.com", "password": "secret123" }
→ 200 { token, user }

GET  /users/me           (auth)  → current user
GET  /users              (auth)  → all users
```

### Transactions  *(all require auth)*

```
POST   /transactions
Body: { "type": "expense", "amount": 250, "category": "food", "description": "Lunch", "date": "2026-04-28" }
→ 201 transaction
(category is auto-detected from description if omitted)

GET    /transactions?type=expense&category=food&from=2026-04-01&to=2026-04-30
→ 200 [transactions]

GET    /transactions/:id      → 200 transaction | 404
PATCH  /transactions/:id      → 200 updated transaction
DELETE /transactions/:id      → 204
```

### Summary  *(auth)*

```
GET /summary?from=2026-04-01&to=2026-04-30&category=food
→ 200 {
  totalIncome, totalExpenses, balance, count,
  byCategory: { food: 2000, transport: 1500 },
  monthlyTrends: [ { month: "2026-04", income, expenses, balance } ],
  tips: [ "..." ],
  cached: false
}
```

Result is cached for `CACHE_TTL_MS` per (user, filter-set) and auto-invalidated on transaction writes.

### Budgets  *(auth)*

```
POST /budgets
Body: { "month": "2026-04", "monthlyGoal": 25000, "savingsTarget": 5000 }
→ 201 budget (upsert)

GET  /budgets               → 200 [budgets]
GET  /budgets/:month        → 200 budget | 404   (e.g. /budgets/2026-04)
```

---

## Testing

```bash
npm test
```

The suite uses Jest + supertest and resets the JSON data files before each test.

---

## Implementation notes

- **Persistence**: JSON files in `src/data/`, accessed via `fs/promises` with an in-process write lock (`utils/fileStore.js`) so concurrent writes don't clobber each other.
- **Error handling**: Custom `AppError` subclasses (`ValidationError`, `NotFoundError`, `UnauthorizedError`, `ConflictError`) → caught by global middleware → JSON response with the correct status code.
- **Auth**: `POST /users/login` issues a JWT signed with `JWT_SECRET`. The `requireAuth` middleware verifies it and attaches `req.user`.
- **Cache**: A simple `Map`-based TTL cache. Keys are namespaced per user; transaction writes call `cache.invalidate` to clear stale summaries.
- **Bonus features chosen**: **C** (Data persistence with JSON files) and **D** (Advanced middleware: rate limiting, CORS, logging, in-memory cache).
