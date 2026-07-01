import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";

// Auth Pages
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";

// Service Request Pages
import ServiceRequestForm from "@/pages/ServiceRequestForm";
import ServiceRequestViewPage from "@/pages/ServiceRequestViewPage";
import RequestsList from "@/pages/RequestsList";
import ConfirmationPage from "@/pages/ConfirmationPage";

// Dashboard & Analytics
import DashboardPage from "@/pages/DashboardPage";
import AnalyticsDashboard from "@/pages/AnalyticsDashboard";
import AdminDashboard from "@/pages/AdminDashboard";

// Sales & Inventory Module Pages
import GoodsList from "@/pages/sales/GoodsList";
import PurchasesList from "@/pages/sales/PurchasesList";
import OrdersList from "@/pages/sales/OrdersList";
import ExpensesList from "@/pages/sales/ExpensesList";
import CreditsList from "@/pages/sales/CreditsList";

// Error Pages
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <AuthProvider>
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Home Route */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Navigate to="/dashboard" replace />
                  </ProtectedRoute>
                }
              />

              {/* Service Request Routes */}
              <Route
                path="/new-request"
                element={
                  <ProtectedRoute>
                    <ServiceRequestForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit/:id"
                element={
                  <ProtectedRoute>
                    <ServiceRequestForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/view/:id"
                element={<ServiceRequestViewPage />}
              />
              <Route
                path="/confirmation/:id"
                element={
                  <ProtectedRoute>
                    <ConfirmationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/requests"
                element={
                  <ProtectedRoute>
                    <RequestsList />
                  </ProtectedRoute>
                }
              />

              {/* Dashboard Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <AnalyticsDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Sales & Inventory Module Routes */}
              <Route
                path="/goods"
                element={
                  <ProtectedRoute>
                    <GoodsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/purchases"
                element={
                  <ProtectedRoute>
                    <PurchasesList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <OrdersList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/expenses"
                element={
                  <ProtectedRoute>
                    <ExpensesList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/credits"
                element={
                  <ProtectedRoute>
                    <CreditsList />
                  </ProtectedRoute>
                }
              />

              {/* Admin Route */}
              <Route
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                }
              />

              {/* Error Route - MUST BE LAST */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </HashRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
