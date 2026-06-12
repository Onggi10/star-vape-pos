import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, User as UserIcon, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  // Form states for creating a new cashier
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [newRole, setNewRole] = useState<AppRole>("cashier");
  const [submitting, setSubmitting] = useState(false);

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

  const handleRoleChange = async (userId: string, targetRole: AppRole) => {
    const { error: delErr } = await supabase.from("user_roles").delete().eq("user_id", userId);
    if (delErr) {
      toast({ title: "Gagal", description: delErr.message, variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: targetRole });
    if (error) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Role diperbarui" });
      fetchRows();
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Validasi Gagal", description: "Password minimal 6 karakter.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await (supabase as any).rpc("create_employee_account", {
        new_email: email,
        new_password: password,
        new_full_name: fullName,
        new_phone: phone,
        new_role: newRole,
      });

      if (error) {
        toast({ title: "Gagal membuat akun", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Berhasil", description: `Akun pegawai ${fullName} berhasil dibuat.` });
        setIsDialogOpen(false);
        // Clear fields
        setEmail("");
        setPassword("");
        setFullName("");
        setPhone("");
        setNewRole("cashier");
        fetchRows();
      }
    } catch (err: any) {
      toast({ title: "Gagal membuat akun", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="container mx-auto max-w-4xl">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 gap-2">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Button>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" /> Kelola Kasir
            </CardTitle>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="w-4 h-4" /> Tambah Pegawai
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleCreateAccount}>
                  <DialogHeader>
                    <DialogTitle>Tambah Pegawai Baru</DialogTitle>
                    <DialogDescription>
                      Buat akun kasir atau admin baru. Akun akan langsung terkonfirmasi tanpa verifikasi email.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="fullName">Nama Lengkap</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Contoh: Budi Santoso"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Nomor Telepon</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Contoh: 08123456789"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Contoh: budi@starvape.com"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                        <SelectTrigger id="role" className="w-full">
                          <SelectValue placeholder="Pilih Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cashier">Kasir</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Menyimpan..." : "Simpan Pegawai"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Memuat...</p>
            ) : rows.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Belum ada pengguna terdaftar</p>
            ) : (
              <div className="space-y-3">
                {rows.map((r) => {
                  const initials = (r.full_name || "?")
                    .split(" ")
                    .map((s) => s[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
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
