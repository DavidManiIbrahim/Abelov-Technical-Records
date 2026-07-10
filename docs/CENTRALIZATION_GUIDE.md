# Abelov Centralized System Documentation

## Overview

The Abelov Technical Records system has been consolidated into a unified, modular platform that integrates functionality from multiple systems:
- **Abelov Technical Records** (Service Request Management)
- **Abelov Sales Management System** (Sales & Inventory)
- **Abelov IT Academy** (Training/Educational modules - ready for integration)

---

## Project Structure

```
src/
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── SignupPage.tsx
│   ├── service-requests/
│   │   ├── ServiceRequestForm.tsx
│   │   ├── ServiceRequestViewPage.tsx
│   │   ├── RequestsList.tsx
│   │   └── ConfirmationPage.tsx
│   ├── dashboard/
│   │   ├── DashboardPage.tsx
│   │   ├── AnalyticsDashboard.tsx
│   │   └── AdminDashboard.tsx
│   ├── sales/
│   │   ├── GoodsList.tsx          # Inventory Management
│   │   ├── PurchasesList.tsx      # Purchase Tracking
│   │   ├── OrdersList.tsx         # Order Management
│   │   ├── ExpensesList.tsx       # Expense Tracking
│   │   └── CreditsList.tsx        # Credit Management
│   ├── NotFound.tsx
│   └── Index.tsx
├── components/
│   ├── ui/                         # Reusable UI components
│   ├── ProtectedRoute.tsx
│   ├── AdminProtectedRoute.tsx
│   ├── GoodsAnalytics.tsx
│   ├── PurchasesAnalytics.tsx
│   ├── OrdersAnalytics.tsx
│   ├── ExpensesAnalytics.tsx
│   ├── CreditsAnalytics.tsx
│   ├── AddGoodsModal.tsx
│   ├── AddPurchasesModal.tsx
│   ├── AddOrdersModal.tsx
│   ├── AddExpensesModal.tsx
│   └── AddCreditsModal.tsx
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/
│   ├── api.ts                     # API integration layer
│   └── utils.ts
├── types/
│   ├── database.ts                # Database type definitions
│   └── serviceRequest.ts
├── utils/
│   └── storage.ts
├── App.tsx                        # Main app with unified routing
└── main.tsx
```

---

## Route Structure

### Authentication Routes
- `GET /login` - Login page
- `GET /signup` - Registration page

### Service Request Module
- `GET /dashboard` - Main dashboard
- `POST /new-request` - Create new service request
- `GET /edit/:id` - Edit existing service request
- `GET /view/:id` - View service request details
- `GET /confirmation/:id` - Service request confirmation
- `GET /requests` - List all service requests

### Sales & Inventory Module
- `GET /goods` - Goods/Inventory management
- `GET /purchases` - Purchase tracking
- `GET /orders` - Order management
- `GET /expenses` - Expense tracking
- `GET /credits` - Credit management

### Dashboard & Analytics
- `GET /dashboard` - Main dashboard
- `GET /analytics` - Analytics dashboard

### Admin Routes
- `GET /admin` - Admin dashboard

---

## Key Features

### 1. Service Request Management
- Create, edit, view, and manage service requests
- Multi-step form with persistent state
- PDF export and print functionality
- Confirmation page with cost summary
- Request timeline tracking

### 2. Sales & Inventory Module
- **Goods Management**: Add, edit, search inventory items
- **Purchases**: Track supplier purchases with analytics
- **Orders**: Manage customer orders with payment status
- **Expenses**: Track recurring and one-time expenses
- **Credits**: Manage customer credits and usage

### 3. Analytics Dashboard
- System-wide analytics
- Module-specific analytics
  - Goods Analytics
  - Purchases Analytics
  - Orders Analytics
  - Expenses Analytics
  - Credits Analytics

### 4. Authentication & Authorization
- User authentication with AuthContext
- Protected routes for authenticated users
- Admin-only routes for administrative functions

---

## API Integration

All modules use a centralized API layer (`src/lib/api.ts`):

```typescript
// Service Requests API
serviceRequestAPI.getByUserId(userId)
serviceRequestAPI.create(request)
serviceRequestAPI.update(id, request)

// Goods API
goodsAPI.getAll(userId)
goodsAPI.create(good)
goodsAPI.update(id, good)

// Purchases API
purchasesAPI.getAll(userId)
purchasesAPI.create(purchase)

// Orders API
ordersAPI.getAll(userId)
ordersAPI.create(order)

// Expenses API
expensesAPI.getAll(userId)
expensesAPI.create(expense)

// Credits API
creditsAPI.getAll(userId)
creditsAPI.create(credit)
```

---

## Type Definitions

### Core Types (src/types/database.ts)
- `Goods` - Inventory item
- `Purchase` - Purchase record
- `Order` - Customer order
- `Expense` - Expense entry
- `Credit` - Customer credit

### Service Request Types (src/types/serviceRequest.ts)
- `ServiceRequest` - Main service request entity
- `RepairTimelineStep` - Repair timeline entry

---

## Component Organization

### UI Components (`src/components/ui/`)
- Card, Button, Badge, Input, Label, Textarea
- Select, Checkbox, Form, Tabs, Toggle, Table
- Toast notifications, Tooltips

### Feature Components
- **Analytics Components**: `GoodsAnalytics`, `PurchasesAnalytics`, etc.
- **Modal Components**: `AddGoodsModal`, `AddPurchasesModal`, etc.
- **Route Protection**: `ProtectedRoute`, `AdminProtectedRoute`

---

## Authentication Flow

1. **Login/Signup** → AuthContext manages user state
2. **Protected Routes** → `ProtectedRoute` wrapper checks authentication
3. **User Access** → User data available via `useAuth()` hook
4. **Logout** → Clear user state and redirect to login

```typescript
const { user, signOut } = useAuth();
```

---

## Development Guidelines

### Adding New Pages
1. Create page in appropriate module folder (e.g., `src/pages/sales/`)
2. Import in `src/App.tsx`
3. Add route to `<Routes>`
4. Use `ProtectedRoute` for authenticated pages

### Adding New API Endpoints
1. Add method to `src/lib/api.ts`
2. Define type in `src/types/database.ts`
3. Use in component via `useQuery` (React Query)

### Styling
- Tailwind CSS for all styling
- Use shadcn/ui components for consistency
- Dark mode support via `next-themes`

---

## Navigation & UX

### Dashboard Navigation
- Central hub for accessing all modules
- Quick links to service requests, sales, inventory
- User profile and logout

### Module Navigation
- Back to Dashboard buttons in all pages
- Consistent header styling
- Search and filter functionality

### Error Handling
- Toast notifications for errors
- 404 page for invalid routes
- Form validation feedback

---

## Performance Optimization

- React Query for server state management
- Hash-based routing for client-side optimization
- Lazy loading of analytics components
- Search/filter optimization with debouncing

---

## Future Enhancements

### Planned Integrations
- [ ] IT Academy training modules
- [ ] Advanced reporting and exports
- [ ] Multi-currency support
- [ ] Inventory forecasting
- [ ] Integration with payment gateways
- [ ] Mobile app companion
- [ ] Real-time notifications
- [ ] Team collaboration features

### Scalability
- API-first architecture allows easy backend scaling
- Component modularization for feature isolation
- Type safety with TypeScript throughout
- Prepared for multi-tenant deployment

---

## Environment Setup

### Required Dependencies
```json
{
  "react": "^18.0.0",
  "react-router-dom": "^6.0.0",
  "@tanstack/react-query": "^4.0.0",
  "next-themes": "^0.0.0",
  "tailwindcss": "^3.0.0",
  "lucide-react": "^0.0.0",
  "zod": "^3.0.0",
  "react-hook-form": "^7.0.0",
  "jspdf": "^2.5.0",
  "html2canvas": "^1.4.0"
}
```

### Setup Instructions
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

---

## API Response Format

All API responses follow a consistent format:

```typescript
// Success Response
{
  success: true,
  data: T,
  message?: string
}

// Error Response
{
  success: false,
  error: string,
  details?: any
}
```

---

## Database Integration

The system is designed to work with any backend API:
- PostgreSQL recommended for production
- Supabase integration-ready
- Firebase Realtime Database compatible
- REST API for maximum flexibility

---

## Support & Documentation

For questions or issues:
1. Check existing GitHub issues
2. Review component JSDoc comments
3. Consult API type definitions
4. Review example usage in pages

---

## License & Credits

**Abelov Technical Records** - Centralized Management System
- Built with React + TypeScript
- UI by shadcn/ui
- Styling with Tailwind CSS
- Icons by Lucide React

Last Updated: July 1, 2026
