import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ThermalPrinterProvider } from "@/contexts/ThermalPrinterContext";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import AdminCashiers from "./pages/AdminCashiers";
import AdminInventory from "./pages/AdminInventory";
import AdminReport from "./pages/AdminReport";
import AdminDashboard from "./pages/AdminDashboard";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <ThermalPrinterProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/install" element={<Install />} />
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/admin/cashiers" element={<ProtectedRoute requireRole="admin"><AdminCashiers /></ProtectedRoute>} />
                <Route path="/stok" element={<ProtectedRoute requireRole="admin"><AdminInventory /></ProtectedRoute>} />
                <Route path="/laporan" element={<ProtectedRoute requireRole="admin"><AdminReport /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute requireRole="admin"><AdminDashboard /></ProtectedRoute>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </ThermalPrinterProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
