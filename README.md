# Abelov Technical Records

A comprehensive **multi-module operations platform** for tracking device repairs, inventory & sales, an in-house academy, staff attendance, and technician performance — with **role-based dashboards**, **secure REST API**, and a **Node.js + Express + MongoDB backend**.

The frontend is built around **six dedicated modules** (Repairs, Sales & Inventory, Academy, Attendance, Admin, plus a dedicated Technician workflow), each with its own dashboard and analytics view.

## Key Features

### Authentication & User Management
- **JWT Login/Signup** against MongoDB-backed users (httpOnly-safe, token in `localStorage` for the SPA)
- **Role-based access control (RBAC)**: `admin`, `secretary`, `technician`, `sales`, `academy`
- **Department mapping**: `engineering`, `sales`, `it_academy` for secretaries/technicians and beyond
- **Protected Routes** in frontend (`ProtectedRoute` + `AdminProtectedRoute`)
- **Session Persistence** via `localStorage` + bearer token on every API call

### Role-Based Dashboards
Every role gets a tailored home view:
- **Repairs Dashboard** (`/repairs-dashboard`) — aggregate tickets, revenue, balance for admin/secretary/academy
- **Technician Dashboard** (`/technician-dashboard`) — your assigned jobs & status mix
- **Sales Dashboard** (`/sales-dashboard`) — goods, purchases, orders, expenses, credits
- **Academy Dashboard** (`/academy-dashboard`) — courses, drafts, revenue
- **Attendance Dashboard** (`/attendance-dashboard`) — present today, late, absent, half-day
- **Admin Dashboard** (`/admin`) — cross-module global stats + recent tickets & activity

### Dedicated Analytics Pages
- **Admin Analytics** (`/admin/analytics`) — module-level stats (repairs, sales, academy, attendance, users-by-role) + revenue/trend charts
- **Technician Analytics** (`/technician-analytics`) — personal KPIs (completion rate, avg resolution time, monthly revenue trend, top device brands)
- **Academy Analytics** (`/academy/analytics`) — course status, category, level, monthly creation
- **Sales Analytics** (`/sales-analytics`)
- **Attendance Analytics** (`/attendance/reports`)
- **Technician Payment Analytics** (`/payment-analytics`)

### Service Request Management
- **Create**: Add new service requests with comprehensive details
- **Read**: View all requests on the dashboard or individual request details
- **Update**: Edit any existing service request
- **Delete**: Remove service requests from the system
- **Search & Filter**: Find requests by customer name, phone, device, ID, or status

### Comprehensive Form
- **Single-Page Form**: All fields visible on one scrollable page (no tabs)
- **8 Sections**:
  1. Shop Information (shop name, technician, date)
  2. Customer Information (name, phone, email, address)
  3. Device Information (model, brand, serial number, OS, accessories)
  4. Problem Description (detailed issue report)
  5. Diagnosis & Repair (diagnosis date, technician, fault, parts, action, status)
  6. Cost Summary (service charge, parts cost, auto-calculated totals and balance)
  7. Repair Timeline (track multiple repair steps with dates and notes)
  8. Customer Confirmation (signature, device collection, technician sign-off)

### Dashboard Features
- **Statistics Cards**: 
  - Total requests count
  - Completed requests
  - Pending requests
  - In-progress requests
  - Total revenue
  - Outstanding balance
- **Request Cards**: Quick overview of each request with essential info
- **Fast Actions**: Edit, view details, or delete from the dashboard
- **Smart Search**: Real-time search across multiple fields

### Cost Management
- **Auto-Calculation**: Total cost = service charge + parts cost
- **Balance Tracking**: Balance = total cost - deposit paid
- **Payment Status**: Mark payments as completed
- **Financial Overview**: Dashboard shows total revenue and outstanding balance

### Data Persistence & Backend
- **Backend**: Node.js + Express (`server/`)
- **Database**: MongoDB via Mongoose
- **Indexes**: Status+created_at, customer_phone, serial_number, customer_name
- **Optional Field Encryption**: AES-256-GCM for PII (email/phone)
- **Health Endpoint**: `/health` reports DB readyState
- **API Docs**: Swagger UI at `/docs`
- **Logging**: `pino` + `pino-http`
- **Security**: `helmet`, `cors`, compression, rate limiting

## Technology Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS + shadcn-ui components
- **Routing**: React Router v6
- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **Authentication**: Local dev (storage); backend-ready for JWT
- **Build Tool**: Vite (frontend), TypeScript (backend)
- **UI Components**: shadcn-ui
- **Icons**: Lucide React
- **State Management**: React Query (TanStack Query)
- **Validation**: Zod (backend) + TypeScript types

## Tech Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS + shadcn-ui components
- **Routing**: React Router v6 (hash router)
- **Charts**: Recharts (area, bar, pie, line)
- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **Auth**: JWT bearer tokens with hashed passwords (`scrypt`) + RBAC middleware
- **Build Tool**: Vite (frontend), `tsc` (backend)
- **UI Components**: shadcn-ui
- **Icons**: Lucide React
- **State Management**: TanStack Query (server cache) + in-memory SPA cache (`utils/storage.ts`)
- **Validation**: Zod (backend) + TypeScript types (frontend)

## Modules

| Module | Routes | Who can access |
|---|---|---|
| **Repairs** | `/repairs-dashboard`, `/requests`, `/new-request`, `/view/:id`, `/edit/:id`, `/analytics` | admin, secretary, academy |
| **Technician** | `/technician-dashboard`, `/technician-analytics`, `/payment-analytics` | admin, secretary, technician |
| **Sales & Inventory** | `/sales-dashboard`, `/goods`, `/purchases`, `/orders`, `/expenses`, `/credits`, `/sales-analytics` | sales, admin |
| **Academy** | `/academy-dashboard`, `/academy`, `/academy/analytics` | academy, admin |
| **Attendance** | `/attendance-dashboard`, `/attendance/manage`, `/attendance/reports` | secretary, admin |
| **Admin** | `/admin`, `/admin/analytics`, `/admin/tickets`, `/admin/users`, `/admin/activity` | admin |

Sidebar items are dynamically filtered by the current user's roles, and role chips + department badges are shown under the user's name.

## Project Structure

```
service-hub-pro/
├── src/                                # Frontend
│   ├── pages/
│   │   ├── DashboardPage.tsx           # Role-aware landing dashboard
│   │   ├── ServiceRequestForm.tsx      # 8-section single-page form
│   │   ├── ServiceRequestViewPage.tsx
│   │   ├── RequestsList.tsx
│   │   ├── RepairsDashboard.tsx        # Repairs module dashboard
│   │   ├── TechnicianDashboard.tsx     # Personal job overview
│   │   ├── TechnicianAnalyticsPage.tsx # Personal performance analytics
│   │   ├── AnalyticsDashboard.tsx      # Cross-module utility analytics
│   │   ├── admin/                      # AdminDashboardPage, AdminAnalyticsPage, TicketManagementPage, UserManagementPage, ActivityLogPage
│   │   ├── sales/                      # SalesDashboard, SalesAnalyticsPage, GoodsList, PurchasesList, OrdersList, ExpensesList, CreditsList
│   │   ├── academy/                    # AcademyDashboard, AcademyPage, AcademyAnalyticsPage
│   │   └── attendance/                 # AttendanceDashboard, StaffAttendancePage, AttendanceReportsPage, MyAttendancePage
│   ├── components/                     # UI + layout (Sidebar, MainLayout, ProfileMenu, modals…)
│   ├── contexts/AuthContext.tsx        # JWT auth + role/department context
│   ├── lib/api.ts                      # REST API client per domain (requests, admin, sales, attendance, technician, academy…)
│   ├── types/database.ts               # TypeScript types
│   └── main.tsx                        # Entry point
├── server/                             # Backend
│   ├── src/
│   │   ├── server.ts                   # Bootstrap
│   │   ├── app.ts                      # Express app, middleware, routes
│   │   ├── config/env.ts               # Env parsing & validation
│   │   ├── db/mongo.ts                 # Mongoose connection & pooling
│   │   ├── models/                     # request, user, goods, order, purchase, expense, credit, academy, attendance
│   │   ├── services/
│   │   ├── controllers/                # requests, admin, sales, academy, attendance, auth
│   │   ├── routes/                     # requests, admin, sales, academy, attendance, auth
│   │   ├── middlewares/                # auth (JWT/RBAC), logger, rateLimit, error, validate
│   │   ├── utils/                      # crypto (AES-256-GCM), auth (scrypt)
│   │   └── docs/swagger.ts             # Swagger spec
│   ├── tests/                          # Vitest + supertest
│   ├── .env.example                    # Backend env template
│   └── package.json                    # Backend scripts & deps
├── vite.config.ts                      # Frontend config
└── README.md                           # This documentation
```

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd service-hub-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd server && npm install
   ```

3. **Configure Backend**
   ```bash
   cd server
   copy .env.example .env
   # set values in .env
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB_NAME=technical_records
   MONGODB_MIN_POOL_SIZE=5
   MONGODB_MAX_POOL_SIZE=20
   FIELD_ENCRYPTION_KEY=<32-byte hex key>
   ```

4. **Start Servers**
   ```bash
   # backend
   cd server && npm run dev
   # frontend (in another terminal)
   cd .. && npm run dev
   ```

5. **Optional Frontend Config**
   - Create `.env.local` in project root:
   ```
   VITE_API_BASE_URL=https://abelov-technical-records-backend.onrender.com
/api/v1
   ```

6. **Open in browser**
   - Navigate to `http://localhost:5173`

## Routes (Frontend)

### Auth
- `/login` - Login page
- `/signup` - Signup page

### Repairs & Technician
- `/dashboard` - Role-aware landing dashboard (protected)
- `/repairs-dashboard` - Repairs module dashboard
- `/requests` - List of all service requests
- `/new-request` - Create a new service request
- `/edit/:id` - Edit existing service request
- `/view/:id` - View request details
- `/confirmation/:id` - Final confirmation after delivery
- `/analytics` - Cross-module analytics view
- `/technician-dashboard` - Personal job overview for technicians
- `/technician-analytics` - Personal performance analytics
- `/payment-analytics` - Technician payment analytics

### Sales & Inventory
- `/sales-dashboard` - Sales module dashboard
- `/goods`, `/purchases`, `/orders`, `/expenses`, `/credits` - module management
- `/sales-analytics` - Sales analytics

### Academy
- `/academy-dashboard` - Academy module dashboard
- `/academy` - Course management
- `/academy/analytics` - Course analytics

### Attendance
- `/attendance-dashboard` - Attendance overview
- `/attendance/manage` - Staff attendance management (secretary/admin)
- `/attendance/reports` - Attendance analytics

### Admin
- `/admin` - Cross-module admin overview
- `/admin/analytics` - Expanded admin analytics
- `/admin/tickets` - Ticket management
- `/admin/users` - User & role management (with editable department)
- `/admin/activity` - Activity log

## Usage Examples

### Creating a Service Request
1. Click "New Request" or go to home page
2. Fill in all the details across the 8 sections
3. Costs automatically calculate as you enter values
4. Add timeline steps by clicking "Add Step"
5. Click "Create Request" to save

### Editing a Request
1. Go to dashboard
2. Click "Edit" on any request card
3. Modify the details
4. Click "Update Request" to save changes

### Viewing Request Details
1. Go to dashboard
2. Click "View" on any request card
3. See all information in a read-only format
4. Print the request if needed
5. Click "Edit Request" to make changes

### Searching Requests
1. Use the search box on the dashboard
2. Type to filter by:
   - Customer name
   - Phone number
   - Device brand/model
   - Request ID
   - Status

## API Reference (Backend)

Base URL: `https://abelov-technical-records-backend.onrender.com
/api/v1`

Endpoints:
- `GET /requests` — list all requests
- `POST /requests` — create a request
- `GET /requests/:id` — get by id
- `PUT /requests/:id` — update by id
- `DELETE /requests/:id` — delete by id
- `GET /health` — service and DB status
- `GET /docs` — Swagger UI

Frontend `serviceRequestAPI` calls these endpoints:

```typescript
// Create
serviceRequestAPI.create(request: ServiceRequest)

// Read one
serviceRequestAPI.getById(id: string)

// Read all for user
serviceRequestAPI.getByUserId(userId: string)

// Update
serviceRequestAPI.update(id: string, updates: Partial<ServiceRequest>)

// Delete
serviceRequestAPI.delete(id: string)

// Search
serviceRequestAPI.search(userId: string, query: string)

// Get by status
serviceRequestAPI.getByStatus(userId: string, status: string)

// Get statistics
serviceRequestAPI.getStats(userId: string)
```

## Authentication

- **JWT Auth**: Secure HTTP-only cookies for session management
- **Protected Routes**: Backend middleware verifies tokens for all request operations
- **Role-based Access**: Foundation laid for user/admin roles

## Security & Best Practices

- **Helmet**: secure HTTP headers
- **CORS**: restricted origins (configurable)
- **Rate Limiting**: applied to `/api/*`
- **Authentication**: JWT-based protection for all critical API endpoints
- **Compression**: gzip responses
- **Logging**: structured logs with `pino`
- **Input Validation**: Zod schemas for payloads
- **Encryption (optional)**: AES-256-GCM on sensitive fields

## Environment Variables

### Frontend
```
VITE_API_BASE_URL=https://abelov-technical-records-backend.onrender.com
/api/v1
```

### Backend (`server/.env`)
```
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=technical_records
MONGODB_MIN_POOL_SIZE=5
MONGODB_MAX_POOL_SIZE=20
FIELD_ENCRYPTION_KEY=<32-byte hex key>
```

## Build, Test & Deployment

### Frontend
```bash
npm run build
npm run preview
npm run lint
```

### Backend
```bash
cd server
npm run build
npm start
npm test
```

## Recommended Features to Add

1. **Export to PDF** - Generate downloadable service reports
2. **Email Notifications** - Send updates to customers
3. **Photo Upload** - Attach device photos to requests
4. **SMS Alerts** - Send status updates via text
5. **Payment Integration** - Accept online payments
6. **Inventory Management** - Track spare parts stock
7. **Mobile App** - React Native version for field work
8. **Customer Portal** - Public page for customers to track repairs
9. **Advanced Reports** - Generate business analytics
10. **Multi-location Support** - Manage multiple shops

## Troubleshooting

### "Not authenticated" error
- Ensure you're logged in
- Check `.env.local` has correct Supabase credentials

### Cannot see database data
- Verify Supabase tables were created from `DATABASE_SCHEMA.sql`
- Check that RLS policies are enabled
- Ensure you're viewing your own data

### Form not submitting
- Check browser console for errors
- Verify all required fields are filled (marked with *)
- Check Supabase connection in Network tab

## Support & Documentation

- **Express**: https://expressjs.com/
- **Mongoose**: https://mongoosejs.com/
- **Swagger/OpenAPI**: https://swagger.io/
- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn-ui**: https://ui.shadcn.com

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Changelog

### v3.2.0 (Current)
- ✅ **Role-Based Dashboards** for every module: Repairs, Sales, Academy, Attendance, Admin, and a dedicated Technician workflow.
- ✅ **Admin split**: `/admin` for the cross-module overview dashboard and `/admin/analytics` for deep-dive charts (revenue over time, status pie, monthly tickets, department distribution, attendance breakdown, users-by-role).
- ✅ **Technician Dashboard & Analytics**: personal assignment list, status doughnut, monthly volume, top device brands worked on, average resolution time, monthly revenue trend.
- ✅ **Academy module expanded**: `/academy-dashboard`, dedicated course management (`/academy`) and `/academy/analytics` (status, category, level, monthly creation).
- ✅ **User Management**: editable role and department (engineering, sales, it_academy) with secretary/technician default mapping.
- ✅ **Sidebar reorganized into accordion groups** (Repairs, Sales & Inventory, Academy, Attendance, Admin) with role-aware filtering.
- ✅ **Skeleton loaders** across all dashboard and analytics pages for snappier perceived loading.
- ✅ **Send to WhatsApp** action for sharing user details directly to a phone number.
- ✅ **Sales UI bug fixes** and refactor of staff attendance logic.
- ✅ **Auth page polish** and bug fixes.
- ✅ Removed legacy modal components (`InternetUserModal`, `SelectRequestTypeModal`, `StudentRegistrationModal`, `WebDevelopmentProjectModal`) — flows consolidated into the proper module pages.

### v3.1.0
- ✅ **Responsive UI Improvements**: 
  - Optimized navbar text sizes for mobile devices across Dashboard, Admin, and Form pages.
  - Enhanced button responsiveness in headers (icon-only mode on mobile) to reduce clutter.
  - Improved layout for Login and Signup pages on smaller screens.

### v3.0.0
- ✅ Migrated backend to Node.js + Express + MongoDB
- ✅ Added RESTful API with controllers/services/routes
- ✅ Implemented security: helmet, cors, compression, rate limiting
- ✅ Added structured logging with pino
- ✅ Added Swagger docs at `/docs`
- ✅ Added health endpoint with DB status
- ✅ Frontend now calls REST API (`VITE_API_BASE_URL`)
- ✅ Simplified dev auth with local storage
- ✅ Unit & integration tests for backend
- ✅ **Security Hardening**: 
  - Applied JWT authentication middleware to all service request and admin endpoints.
  - **NoSQL Injection**: Added `express-mongo-sanitize` and strict Zod validation to prevent exploitation via MongoDB operators.
  - **Mass Assignment**: Disabled schema passthrough and whitelisted fields in controllers (e.g., `role` removed from public signup).
  - **Race Conditions**: Implemented MongoDB unique indexes and handle duplicate key errors (11000) gracefully.
  - **Password Policy**: Increased password complexity requirements (8+ chars, upper, lower, number, special).
  - **Role Management**: Protected admin routes with RBAC middleware; public signup forced to `user` role.

### v2.0.0
- ✅ Supabase backend integration and authentication
- ✅ Dashboard statistics and single-page form layout

### v1.0.0
- ✅ Initial release with local storage
