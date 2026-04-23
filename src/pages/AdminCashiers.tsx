import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppRole } from "@/hooks/useAuth";

interface CashierRow {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: AppRole;
}

const AdminCashiers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rows, setRows] = useState<CashierRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRows = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const merged: CashierRow[] = (profiles || []).map((p: any) => ({
      user_id: p.user_id,
      full_name: p.full_name,
      phone: p.phone,
      avatar_url: p.avatar_url,
      role: ((roles || []).find((r: any) => r.user_id === p.user_id)?.role as AppRole) || "cashier",
    }));
    setRows(merged);
    setLoading(false);
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    const { error: delErr } = await supabase.from("user_roles").delete().eq("user_id", userId);
    if (delErr) {
      toast({ title: "Gagal", description: delErr.message, variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: newRole });
    if (error) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Role diperbarui" });
      fetchRows();
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="container mx-auto max-w-4xl">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 gap-2">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" /> Kelola Kasir
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Memuat...</p>
            ) : rows.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Belum ada pengguna terdaftar</p>
            ) : (
              <div className="space-y-3">
                {rows.map((r) => {
                  const initials = (r.full_name || "?").split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <div key={r.user_id} className="flex items-center gap-4 p-3 rounded-lg border">
                      <Avatar>
                        {r.avatar_url && <AvatarImage src={r.avatar_url} />}
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{r.full_name || "(Tanpa nama)"}</p>
                        <p className="text-sm text-muted-foreground truncate">{r.phone || "-"}</p>
                      </div>
                      <Badge variant={r.role === "admin" ? "default" : "secondary"} className="gap-1">
                        {r.role === "admin" ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                        {r.role}
                      </Badge>
                      <Select value={r.role} onValueChange={(v) => handleRoleChange(r.user_id, v as AppRole)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cashier">Kasir</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCashiers;
