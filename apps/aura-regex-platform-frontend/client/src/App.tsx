import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import { Route, Switch, Redirect } from "wouter";

// Pages
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import RulesPage from "@/pages/RulesPage";
import LogsPage from "@/pages/LogsPage";
import NotFound from "@/pages/NotFound";
import AdminDashboard from "@/pages/AdminDashboard"; // ✅ صفحة الأدمن
import Community from "@/pages/Community"; // 🌍 Community Page

import { ThemeProvider } from "@/contexts/ThemeContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import DashboardLayout from "@/components/DashboardLayout"; // ✅ Layout

// ✅ استيراد useAuth من المسار النسبي الصحيح
import { AuthProvider, useAuth } from "./_core/hooks/useAuth";

// --- Guards (حراس المسارات) ---

// 1. حارس للمستخدمين المسجلين (أي مستخدم)
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
      </div>
    );
  }
  return isAuthenticated ? <>{children}</> : <Redirect to="/" />;
}

// 2. حارس خاص للأدمن (Admin Only)
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-red-600" />
      </div>
    );
  }

  // إذا لم يكن موجوداً أو لم يكن دوره ADMIN -> نطرده للداشبورد العادي
  if (!user || user.role !== 'ADMIN') {
    return <Redirect to="/dashboard" />;
  }

  return <>{children}</>;
}

// 3. حارس للزوار (يمنع المسجلين من دخول صفحة الهوم)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
      </div>
    );
  }
  return isAuthenticated ? <Redirect to="/dashboard" /> : <>{children}</>;
}

// --- Router (الخريطة) ---
function Router() {
  return (
    <Switch>
      <Route path="/">
        <PublicRoute>
          <Home />
        </PublicRoute>
      </Route>

      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>

      {/* ✅ مسار الأدمن */}
      <Route path="/admin">
        <AdminRoute>
          <DashboardLayout>
            <AdminDashboard />
          </DashboardLayout>
        </AdminRoute>
      </Route>

      <Route path="/rules">
        <ProtectedRoute>
          <DashboardLayout>
            <RulesPage />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/logs">
        <ProtectedRoute>
          <DashboardLayout>
            <LogsPage />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/community">
        <ProtectedRoute>
          <DashboardLayout>
            <Community />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      {/* 404 Page */}
      <Route path="/404" component={NotFound} />
      <Route>
        <Redirect to="/404" />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable={true}>
        <TooltipProvider>
          <AuthProvider>
            <Router />
            <Toaster position="top-center" richColors closeButton />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;