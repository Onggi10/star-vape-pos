import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, AppRole } from "@/hooks/useAuth";

interface Props {
  children: ReactNode;
  requireRole?: AppRole;
}

export const ProtectedRoute = ({ children, requireRole }: Props) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Memuat...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (requireRole && role !== requireRole) {
    // Cashier yang mencoba akses halaman admin dialihkan ke beranda kasir
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
