# Zorvyn API - Documentation

## Overview
This is a complete Postman API collection for the **Zorvyn** financial management system. The collection includes all endpoints for authentication, transactions management, dashboard analytics, and system-wide analytics.

## Quick Start

### 1. Import the Collection and run the backend
- Open Postman
- Click **Import** > **Upload Files**
- Select `Zorvyn_API_Documentation.postman_collection.json` in files upload.
- The collection will be imported with all endpoints organized by category
- Start the backend project using command `node index.js`

### 2. Set Environment Variables
The collection uses the following variables that you can configure:

```
base_url: http://localhost:8000 (default)
access_token: (auto-populated after login)
refresh_token: (auto-populated after login)
user_id: (auto-populated after login)
```

To set these:
1. Open the collection
2. Click the **Variables** tab
3. Update `base_url` to your API server URL
4. Other variables will auto-populate after you login

### 3. First Request - Register
1. Go to **Authentication** → **Register Admin**
2. Update the request body with your credentials
3. Click **Send**
4. The response will automatically store `access_token` and `refresh_token`

#### Note: To register a Customer or an Analyst, the Admin must log in first. This ensures that only the Admin has permission to create Customer and Analyst accounts.
---

## API Endpoints Reference

### Authentication (`/auth`)
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/auth/register-admin` | ADMIN | Register a new admin user |
| POST | `/auth/register` | ADMIN | Register a new customer user |
| POST | `/auth/login` | Public | Login and receive tokens |
| POST | `/auth/refreshToken` | Public | Refresh access token |
| POST | `/auth/logout` | Authenticated | Logout user |
| PATCH | `/auth/users/:id/status` | ADMIN | Update user active status |



#### Example: Login Response
```json
{
  "message": "Logged in successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-123",
      "email": "customer@example.com",
      "role": "CUSTOMER"
    }
  }
}
```

---

### Transactions (`/transaction`)
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/transaction` | CUSTOMER | Create a new transaction |
| GET | `/transaction` | CUSTOMER, ADMIN, ANALYST | Get all transactions with filters |
| GET | `/transaction/:id` | CUSTOMER, ADMIN, ANALYST | Get specific transaction | //check
| PUT | `/transaction/:id` | CUSTOMER, ADMIN | Update transaction | //check
| DELETE | `/transaction/:id` | CUSTOMER, ADMIN | Delete transaction | //check

#### Query Parameters (GET all transactions)
- `type`: INCOME or EXPENSE
- `category`: Transaction category
- `startDate`: Filter from date (YYYY-MM-DD)
- `endDate`: Filter to date (YYYY-MM-DD)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

#### Example: Create Transaction Body
```json
{
  "type": "EXPENSE",
  "category": "Food",
  "amount": 50.00,
  "note": "Lunch at restaurant"
}
```

---

### Dashboard (`/dashboard`)
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/dashboard/summary` | CUSTOMER | Get total income, expenses, balance |
| GET | `/dashboard/category-wise` | CUSTOMER | Get breakdown by categories |
| GET | `/dashboard/recent/:limit` | CUSTOMER | Get recent transactions |
| GET | `/dashboard/trends` | CUSTOMER | Get transaction trends over time |

#### Dashboard Trends Query Parameters
- `period`: month, quarter, year, all-time
- `category`: Filter by specific category (optional)

---

### Analytics (`/analytics`)
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/analytics/top-spending` | ADMIN, ANALYST | Get top spending categories |
| GET | `/analytics/top-income` | ADMIN, ANALYST | Get top income categories |
| GET | `/analytics/summary` | ADMIN, ANALYST | Get overall system analytics |

#### Analytics Query Parameters
- `period`: month, quarter, year

---

## User Roles & Permissions

### CUSTOMER
- Login and manage their transactions
- View personal dashboard and trends
- Cannot access admin/analytics features

### ADMIN
- Register new users
- Manage user statuses
- Create/update/delete transactions
- Access analytics features

### ANALYST
- View all transactions
- Access analytics and reports
- Read-only access to system data

---

//check
## Error Responses

### 401 Unauthorized
```json
{
  "message": "Unauthorized access",
  "error": "Invalid or expired token"
}
```
**Solution**: Refresh your token using `/auth/refreshToken`

### 403 Forbidden
```json
{
  "message": "Forbidden",
  "error": "Insufficient permissions for this action"
}
```
**Solution**: Check your user role and permissions

### 400 Bad Request
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```
**Solution**: Fix the request body according to error details

---

## Testing Workflow

### 1. Registration Flow
```
1. POST /auth/register-admin
   ↓ (stores tokens in variables)
2. POST /auth/register
```

### 2. Authentication Flow
```
1. POST /auth/login
   ↓ (stores tokens in variables)
2. POST /auth/logout (when done)
```

### 3. Transaction Workflow
```
1. POST /transaction (create)
2. GET /transaction (list)
3. GET /transaction/:id (get one)
4. PUT /transaction/:id (update)
5. DELETE /transaction/:id (delete)
```

### 4. Dashboard Flow
```
1. GET /dashboard/summary
2. GET /dashboard/category-wise
3. GET /dashboard/recent/10
4. GET /dashboard/trends?period=month
```

### 5. Analytics Flow (Admin/Analyst only)
```
1. GET /analytics/summary
2. GET /analytics/top-spending
3. GET /analytics/top-income
```

---

## Collection Structure
```
Zorvyn API
├── Authentication
│   ├── Register Admin
│   ├── Register User
│   ├── Login
│   ├── Refresh Token
│   ├── Logout
│   └── Update User Status
├── Transactions
│   ├── Create Transaction
│   ├── Get All Transactions
│   ├── Get Transaction by ID
│   ├── Update Transaction
│   └── Delete Transaction
├── Dashboard
│   ├── Get Summary
│   ├── Get Category-wise Summary
│   ├── Get Recent Transactions
│   └── Get Trends
└── Analytics
    ├── Get Top Spending
    ├── Get Top Income
    └── Get Analytics Summary
```

---

**Last Updated**: April 6, 2024  
**API Version**: 1.0.0
