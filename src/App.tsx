import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  Outlet,
} from "react-router-dom";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppStateProvider } from "@/context/AppStateContext";
import { ThemeProvider } from "@/context/ThemeContext";

import AppLayout from "@/components/AppLayout";

import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import FileUploadPage from "@/pages/FileUploadPage";
import AIPriorityPage from "@/pages/AIPriorityPage";
import DisasterPage from "@/pages/DisasterPage";
import ProtectionPage from "@/pages/ProtectionPage";
import RecoveryPage from "@/pages/RecoveryPage";
import LowBandwidthPage from "@/pages/LowBandwidthPage";
import WeatherRiskPage from "@/pages/WeatherRiskPage";
import SecurityPage from "@/pages/SecurityPage";
import AlertsPage from "@/pages/AlertsPage";
import EdgeCasePage from "@/pages/EdgeCasePage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

/* 🔒 PROTECTED ROUTE */
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // ⏳ wait until auth is fully checked
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // ❌ not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppStateProvider>
      <Outlet />
    </AppStateProvider>
  );
};

/* 🚪 ROUTES */
const AppRoutes = () => {
  return (
    <Routes>

      {/* PUBLIC */}
      <Route path="/login" element={<LoginPage />} />

      {/* PROTECTED */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>

          {/* IMPORTANT: default redirect safety */}
          <Route index element={<DashboardPage />} />

          <Route path="upload" element={<FileUploadPage />} />
          <Route path="ai-engine" element={<AIPriorityPage />} />
          <Route path="disaster" element={<DisasterPage />} />
          <Route path="protection" element={<ProtectionPage />} />
          <Route path="recovery" element={<RecoveryPage />} />
          <Route path="low-bandwidth" element={<LowBandwidthPage />} />
          <Route path="weather-risk" element={<WeatherRiskPage />} />
          <Route path="security" element={<SecurityPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="edge-cases" element={<EdgeCasePage />} />

        </Route>
      </Route>

      {/* fallback */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
};

/* MAIN APP */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;