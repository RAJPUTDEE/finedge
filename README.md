# FinEdge API

🏦 Personal Finance and Expense Tracker backend built with Node.js and Express.

## ✨ Core Features

- **👤 User Management** — Registration, JWT-based authentication, secure password handling
- **💸 Transaction Tracking** — Create, read, update, delete with per-user isolation and auto-categorization
- **💰 Budget Planning** — Set and manage monthly budgets with goal tracking
- **📊 Analytics & Insights** — Income/expense summaries, category breakdown, monthly trends, savings tips
- **⚡ Performance** — TTL caching for summary endpoints, file-level locking for concurrent write safety
- **🔒 Security** — JWT authentication, rate limiting, input validation, custom error handling
- **🧪 Well-Tested** — 100% passing integration tests (Jest + supertest)
- **📝 Logged & Observable** — Request logging with timestamp, status, duration tracking

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

## 🏗️ Architecture & Project Structure

### MVC + Services Pattern

The project follows a layered architecture for clean separation of concerns:

```text
finedge/
  src/
    ├── app.js              → Express app factory (middleware + route registration)
    ├── server.js           → Server bootstrap (loads config, starts listening)
    ├── config.js           → Environment configuration (dotenv-driven)
    │
    ├── controllers/        → HTTP Layer (request validation, response formatting)
    │   ├── userController.js          (register, login, me, list)
    │   ├── transactionController.js   (CRUD, filtering)
    │   ├── budgetController.js        (set, list, getForMonth)
    │   └── summaryController.js       (analytics with caching)
    │
    ├── services/           → Business Logic Layer (core functionality)
    │   ├── userService.js             (user operations, JWT signing)
    │   ├── transactionService.js      (transaction operations, cache invalidation)
    │   ├── budgetService.js           (budget operations, month-based storage)
    │   └── summaryService.js          (analytics, caching, insights)
    │
    ├── models/             → Data Access Layer (JSON file I/O)
    │   ├── userModel.js               (findAll, findById, findByEmail, create)
    │   ├── transactionModel.js        (CRUD with file locking)
    │   └── budgetModel.js             (upsert, month-based queries)
    │
    ├── routes/             → Endpoint Definitions (verb + handler mapping)
    │   ├── userRoutes.js              (POST / POST /login GET /me GET /)
    │   ├── transactionRoutes.js       (CRUD + filters)
    │   ├── budgetRoutes.js            (CRUD by month)
    │   └── summaryRoutes.js           (GET with optional filters)
    │
    ├── middleware/         → Cross-Cutting Concerns
    │   ├── asyncHandler.js            (wraps controller Promise rejections)
    │   ├── auth.js                    (JWT verification, Bearer token extraction)
    │   ├── errorHandler.js            (global error handler, custom error mapping)
    │   ├── logger.js                  (request logging: method, URL, status, duration)
    │   ├── rateLimiter.js             (express-rate-limit integration)
    │   └── validator.js               (input validation for transactions, users, budgets)
    │
    ├── utils/              → Shared Utilities & Helpers
    │   ├── errors.js                  (AppError, ValidationError, NotFoundError, etc.)
    │   ├── fileStore.js               (withLock for concurrent write safety)
    │   ├── cache.js                   (TTL-based caching with Map backend)
    │   ├── analytics.js               (summarize, byCategory, monthlyTrends)
    │   └── aiHelper.js                (autoCategorize by keywords, savingsTips)
    │
    └── data/               → JSON File Storage (persistent state)
        ├── users.json                 (user records)
        ├── transactions.json          (transaction log)
        └── budgets.json               (budget records)

  tests/                   → Integration Tests (Jest + supertest)
    ├── health.test.js                (server status endpoint)
    ├── users.test.js                 (registration, login, authentication)
    ├── transactions.test.js          (CRUD, filtering, isolation)
    ├── summary.test.js               (analytics, caching)
    └── setup.js                      (test data reset)
```

### Data Flow Example: Creating a Transaction

```
POST /transactions (with JWT)
    ↓
[rateLimiter] — Check rate limit
    ↓
[auth middleware] — Extract & verify Bearer token
    ↓
[transactionController.create] — Validate request, call service
    ↓
[transactionService.create] — Validate fields, auto-categorize, call model
    ↓
[transactionModel.create] — Acquire file lock, write to transactions.json
    ↓
[cache.invalidate] — Clear stale summary cache entries
    ↓
HTTP 201 — Return created transaction
```

## 🔧 Scripts

```bash
npm start          # Start production server (requires .env)
npm run dev        # Start development server with auto-reload (nodemon)
npm test           # Run all tests (Jest) with coverage
```

## 📮 API Testing with Postman Collection

A complete, pre-configured Postman collection is provided (`finedge-api.postman_collection.json`) for GUI-based testing with auto-token injection.

### 🚀 Quick Start (2 minutes)

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Import collection into Postman:**
   - Open **Postman** → Click **Import** (top-left)
   - Select **File** → Choose `finedge-api.postman_collection.json`
   - Click **Import** → Done! 🎉

3. **Verify environment is set:**
   - Postman auto-detects `base_url = http://localhost:3000`
   - `token` variable is auto-populated after first login (see below)

### 📋 Collection Organization

The collection is organized into **5 feature folders** with pre-configured requests:

| Folder | Endpoints | Purpose |
|--------|-----------|---------|
| 🔍 **Health** | 1 | Verify server status |
| 👤 **Users** | 4 | Register, login, get profile, list users |
| 💸 **Transactions** | 6 | Create, list (with filters), get, update, delete |
| 💰 **Budgets** | 3 | Set budget, list, get by month |
| 📊 **Summary** | 4 | Analytics with optional date/category filters |

### 🔐 Auto-Token Injection (Magic ✨)

**No manual token copying needed!**

1. Click **Users > 2. Login User**
2. Click **Send** button
3. ✅ Postman **automatically extracts JWT** and stores it in `{{token}}` environment variable
4. All subsequent requests use this token automatically in `Authorization: Bearer {{token}}` header

Verify token was saved: Postman menu → **Environments** → Click the collection environment → See `token` variable populated.

### ✨ Recommended Testing Workflow

**Run these in order (all should return 2xx status):**

```
1️⃣  🔍 Health > Health Check                    (GET /health)
2️⃣  👤 Users > 1. Register New User             (POST /users)
3️⃣  👤 Users > 2. Login User                    (POST /users/login) ← Saves token
4️⃣  💸 Transactions > 1. Create (Expense)       (POST /transactions)
5️⃣  💸 Transactions > 1b. Create (Income)       (POST /transactions)
6️⃣  💸 Transactions > 2. List Transactions      (GET /transactions)
7️⃣  💰 Budgets > 1. Set/Create Budget           (POST /budgets)
8️⃣  📊 Summary > 1. Get Summary (All Data)      (GET /summary) ← Cached
9️⃣  📊 Summary > 1. Get Summary (All Data)      (GET /summary) ← From cache
```

If all return expected status codes → **Your API is healthy!** ✅

### 📊 Query Filters & Examples

**Transaction Filters:**
```
GET /transactions?type=expense&category=food&from=2026-04-01&to=2026-05-31
```

**Summary Filters:**
```
# By date range
GET /summary?from=2026-04-01&to=2026-05-31

# By category
GET /summary?category=food

# Combined
GET /summary?from=2026-04-01&to=2026-05-31&category=food
```

**Budget by Month:**
```
GET /budgets/2026-05  # Must be YYYY-MM format
```

### 📋 All Available Endpoints

| Method | Endpoint | Auth | Purpose | Status |
|--------|----------|------|---------|--------|
| GET | `/health` | ❌ | Server status check | 200 |
| POST | `/users` | ❌ | User registration | 201 |
| POST | `/users/login` | ❌ | Login (returns JWT) | 200 |
| GET | `/users/me` | 🔐 | Get current user profile | 200 |
| GET | `/users` | 🔐 | List all users | 200 |
| POST | `/transactions` | 🔐 | Create transaction (income/expense) | 201 |
| GET | `/transactions` | 🔐 | List transactions (optional filters) | 200 |
| GET | `/transactions/:id` | 🔐 | Get single transaction | 200 |
| PATCH | `/transactions/:id` | 🔐 | Update transaction (partial) | 200 |
| DELETE | `/transactions/:id` | 🔐 | Delete transaction | 204 |
| POST | `/budgets` | 🔐 | Set budget for month (upsert) | 201 |
| GET | `/budgets` | 🔐 | List all budgets | 200 |
| GET | `/budgets/:month` | 🔐 | Get budget by month | 200 |
| GET | `/summary` | 🔐 | Financial summary (cached) | 200 |

### ⚠️ Common Testing Mistakes

| ❌ Mistake | ✅ Solution |
|-----------|------------|
| Opening `/users/login` in browser address bar | Use Postman (browser sends GET; endpoint requires POST) |
| Forgot to login before protected endpoints | Run **Users > 2. Login** first to auto-populate token |
| Missing `Content-Type: application/json` header | Postman adds this automatically for you |
| Manually copying token from response | Token auto-saves to environment after login |
| Using `/` as an endpoint | Use `/health` to verify server is running |
| Sending transaction without Bearer token | All transaction endpoints require `Authorization: Bearer {{token}}` |

### 📝 Example Request/Response

**Create Transaction (Expense):**

**Request:**
```json
POST /transactions
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "type": "expense",
  "amount": 250,
  "category": "food",
  "description": "Lunch at restaurant",
  "date": "2026-05-01"
}
```

**Response (201 Created):**
```json
{
  "id": "a1b2c3d4-e5f6-7g8h-i9j0-k1l2m3n4o5p6",
  "userId": "user-uuid",
  "type": "expense",
  "amount": 250,
  "category": "food",
  "description": "Lunch at restaurant",
  "date": "2026-05-01",
  "createdAt": "2026-05-01T12:34:56.789Z"
}
```

**Get Summary (with Cache):**

**First Request (not cached):**
```json
GET /summary
Authorization: Bearer <jwt_token>

Response:
{
  "totals": {
    "totalIncome": 5000,
    "totalExpenses": 250,
    "balance": 4750
  },
  "byCategory": { "food": 250 },
  "monthlyTrends": [...],
  "savingsTips": [...],
  "cached": false
}
```

**Second Request (cached - within 30 seconds):**
```json
Response: {
  ... same data ...
  "cached": true  ← Served from cache!
}
```

## 🧪 Integration Tests

Run automated tests to verify all functionality:

```bash
npm test
```

**Expected Output:**
```
Test Suites: 4 passed, 4 total
Tests:       12 passed, 12 total
Time:        1.234 s
```

**Test Coverage:**

| Test Suite | Coverage |
|-----------|----------|
| **health.test.js** | Server uptime, timestamp, status endpoint |
| **users.test.js** | Registration validation, duplicate email, login token generation |
| **transactions.test.js** | CRUD operations, per-user isolation, filtering, auto-categorization |
| **summary.test.js** | Analytics calculation, cache mechanism, cache invalidation |

**Key Test Scenarios:**
- ✅ User registration prevents duplicate emails (409 Conflict)
- ✅ JWT token generates and verifies correctly
- ✅ Transactions isolated per user (can only see own)
- ✅ Summary cached for 30 seconds (cached flag toggles)
- ✅ Cache invalidated on transaction create/update/delete
- ✅ Invalid input returns 400 Bad Request
- ✅ Missing auth returns 401 Unauthorized

Tests reset JSON data before each suite runs (via `tests/setup.js`).

## 🔍 Key Architecture Features

### 1. **File Locking for Concurrent Safety**

When multiple requests write to the same JSON file simultaneously, `src/utils/fileStore.js` uses an in-process lock to serialize writes:

```javascript
// Prevents race conditions and data corruption
await fileStore.withLock(filename, async () => {
  const data = await readJson(filename);
  data.push(newRecord);
  await writeJson(filename, data);
});
```

### 2. **TTL Caching with Auto-Invalidation**

Summary endpoint results are cached for 30 seconds (configurable):

```javascript
// Cache stores: { key → { value, expiresAt } }
// Automatically clears expired entries
// Transaction writes invalidate related cache entries
```

This provides:
- **Fast response times** for expensive analytics calculations
- **Reduced file I/O** on repeated queries
- **Automatic cleanup** when cache entries expire

### 3. **Auto-Categorization by Keywords**

Transactions are automatically categorized based on description keywords:

```javascript
// "lunch at zomato" → category: "food"
// "uber trip" → category: "transport"
// "netflix subscription" → category: "entertainment"
```

Fallback: If keywords don't match, category is set to `"other"`.

### 4. **Per-User Isolation**

All user data is isolated by user ID:

```javascript
// Users can only see/modify their own transactions
// Model methods filter by req.user.id automatically
// Prevents data leakage between accounts
```

### 5. **Standardized Error Handling**

Custom error classes provide consistent error responses:

```
ValidationError (400)  → Invalid input data
NotFoundError (404)    → Resource not found
UnauthorizedError (401) → Missing/invalid token
ConflictError (409)    → Duplicate email, etc.
```

### 6. **Rate Limiting**

Protects API from abuse:

```
Default: 100 requests per 60 seconds per IP
Configurable via RATE_LIMIT_MAX and RATE_LIMIT_WINDOW_MS
Returns 429 Too Many Requests when limit exceeded
```

## 📝 Data Persistence Notes

- Data is stored in `src/data/*.json` (users.json, transactions.json, budgets.json)
- File access is handled by `src/utils/fileStore.js` with write locking
- Data is loaded fresh on each request (no in-memory cache except summary)
- Tests reset all JSON data before each run using `tests/setup.js`
