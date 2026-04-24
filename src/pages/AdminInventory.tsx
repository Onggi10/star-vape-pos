import { InventoryManager } from "@/components/InventoryManager";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminInventory = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Button>
        <h1 className="text-2xl font-bold">Manajemen Stok</h1>
        <InventoryManager />
      </div>
    </div>
  );
};

export default AdminInventory;
