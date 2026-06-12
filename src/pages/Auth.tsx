import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate("/", { replace: true });
  }, [user, authLoading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login Gagal", description: error.message, variant: "destructive" });
    } else {
      navigate("/", { replace: true });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: fullName, phone },
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Daftar Gagal", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Berhasil Daftar", description: "Cek email untuk verifikasi akun." });
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-background p-4 overflow-hidden">
      {/* Dynamic Animated Blobs behind the login card */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-primary/10 blur-3xl animate-blob-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-indigo-500/10 blur-3xl animate-blob-slower pointer-events-none" />
      
      <Card className="w-full max-w-md glassmorphism border shadow-2xl relative z-10 transition-all duration-500">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <div className="p-1.5 bg-background/50 rounded-full border shadow-inner hover:scale-105 transition-transform duration-300">
              <img src="/images/starvape-logo.jpeg" alt="Star Vape" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-contain" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Star Vape POS
          </CardTitle>
          <CardDescription className="text-sm">
            Masuk atau daftar untuk mengakses kasir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-6 p-1 bg-secondary/30 rounded-lg">
              <TabsTrigger value="signin" className="rounded-md py-2 font-medium transition-all">Masuk</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-md py-2 font-medium transition-all">Daftar</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="si-email">Email</Label>
                  <Input 
                    id="si-email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="bg-background/40 hover:bg-background/60 focus:bg-background/80 transition-colors border-muted-foreground/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="si-pass">Password</Label>
                  <Input 
                    id="si-pass" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="bg-background/40 hover:bg-background/60 focus:bg-background/80 transition-colors border-muted-foreground/20"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full mt-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold hover:scale-[1.01] active:scale-[0.99] transition-all duration-200" 
                  disabled={loading}
                >
                  {loading ? "Memproses..." : "Masuk"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="su-name">Nama Lengkap</Label>
                  <Input 
                    id="su-name" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    required 
                    placeholder="Nama lengkap Anda"
                    className="bg-background/40 hover:bg-background/60 focus:bg-background/80 transition-colors border-muted-foreground/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-phone">Nomor Telepon</Label>
                  <Input 
                    id="su-phone" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="Contoh: 0812345678"
                    className="bg-background/40 hover:bg-background/60 focus:bg-background/80 transition-colors border-muted-foreground/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-email">Email</Label>
                  <Input 
                    id="su-email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    placeholder="alamat.email@anda.com"
                    className="bg-background/40 hover:bg-background/60 focus:bg-background/80 transition-colors border-muted-foreground/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-pass">Password</Label>
                  <Input 
                    id="su-pass" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    minLength={6} 
                    placeholder="Minimal 6 karakter"
                    className="bg-background/40 hover:bg-background/60 focus:bg-background/80 transition-colors border-muted-foreground/20"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full mt-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold hover:scale-[1.01] active:scale-[0.99] transition-all duration-200" 
                  disabled={loading}
                >
                  {loading ? "Memproses..." : "Daftar"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
