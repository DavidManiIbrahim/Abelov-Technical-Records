import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import MainLayout from "@/components/MainLayout";

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
import AdminAnalyticsPage from "@/pages/admin/AdminAnalyticsPage";
import TicketManagementPage from "@/pages/admin/TicketManagementPage";
import UserManagementPage from "@/pages/admin/UserManagementPage";
import ActivityLogPage from "@/pages/admin/ActivityLogPage";

// Sales & Inventory Module Pages
import GoodsList from "@/pages/sales/GoodsList";
import PurchasesList from "@/pages/sales/PurchasesList";
import OrdersList from "@/pages/sales/OrdersList";
import ExpensesList from "@/pages/sales/ExpensesList";
import CreditsList from "@/pages/sales/CreditsList";

// Academy Page
import AcademyPage from "@/pages/academy/AcademyPage";

// Profile Page
import ProfilePage from "@/pages/ProfilePage";

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
              {/* Auth Routes - No Sidebar */}
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

              {/* Protected Routes with Sidebar */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <DashboardPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* Service Request Routes */}
              <Route
                path="/new-request"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ServiceRequestForm />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit/:id"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ServiceRequestForm />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/view/:id"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ServiceRequestViewPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/confirmation/:id"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ConfirmationPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/requests"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <RequestsList />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* Analytics Route */}
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <AnalyticsDashboard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* Sales & Inventory Module Routes */}
              <Route
                path="/goods"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <GoodsList />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/purchases"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <PurchasesList />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <OrdersList />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/expenses"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ExpensesList />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/credits"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <CreditsList />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <MainLayout>
                      <AdminAnalyticsPage />
                    </MainLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/tickets"
                element={
                  <AdminProtectedRoute>
                    <MainLayout>
                      <TicketManagementPage />
                    </MainLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminProtectedRoute>
                    <MainLayout>
                      <UserManagementPage />
                    </MainLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/activity"
                element={
                  <AdminProtectedRoute>
                    <MainLayout>
                      <ActivityLogPage />
                    </MainLayout>
                  </AdminProtectedRoute>
                }
              />

              {/* Academy Route */}
              <Route
                path="/academy"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <AcademyPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* Profile Route */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ProfilePage />
                    </MainLayout>
                  </ProtectedRoute>
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
