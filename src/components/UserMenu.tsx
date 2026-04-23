import { LogOut, User as UserIcon, Settings, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

export const UserMenu = () => {
  const { profile, role, signOut, user } = useAuth();
  const navigate = useNavigate();

  const initials = (profile?.full_name || user?.email || "?")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 px-2">
          <Avatar className="w-8 h-8">
            {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile.full_name || ""} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm font-medium">
            {profile?.full_name || user?.email}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{profile?.full_name || "Pengguna"}</span>
            <span className="text-xs text-muted-foreground capitalize flex items-center gap-1">
              {role === "admin" ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
              {role || "cashier"}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/profile")}>
          <UserIcon className="w-4 h-4 mr-2" />
          Profil Saya
        </DropdownMenuItem>
        {role === "admin" && (
          <DropdownMenuItem onClick={() => navigate("/admin/cashiers")}>
            <Settings className="w-4 h-4 mr-2" />
            Kelola Kasir
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="text-destructive">
          <LogOut className="w-4 h-4 mr-2" />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
