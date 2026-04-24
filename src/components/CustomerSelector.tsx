import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, UserPlus, X, User } from "lucide-react";
import { useCustomers, Customer, normalizePhone } from "@/hooks/useCustomers";
import { useToast } from "@/hooks/use-toast";

interface Props {
  selected: Customer | null;
  onChange: (c: Customer | null) => void;
}

export const CustomerSelector = ({ selected, onChange }: Props) => {
  const { customers, createCustomer } = useCustomers();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const qDigits = query.replace(/\D/g, "");
    return customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (qDigits && c.phone.includes(qDigits))
      )
      .slice(0, 5);
  }, [query, customers]);

  const handleAdd = async () => {
    setSaving(true);
    try {
      const c = await createCustomer(newName, newPhone);
      onChange(c);
      setShowAdd(false);
      setNewName("");
      setNewPhone("");
      setQuery("");
    } catch (e: any) {
      toast({ title: "Gagal", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (selected) {
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <User className="w-4 h-4" /> Customer
        </Label>
        <div className="flex items-center justify-between gap-2 p-3 rounded-lg border border-primary/40 bg-primary/5">
          <div className="min-w-0">
            <p className="font-medium truncate">{selected.name}</p>
            <p className="text-xs text-muted-foreground">+{selected.phone}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onChange(null)} className="h-8 w-8 shrink-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <User className="w-4 h-4" /> Customer <span className="text-xs text-muted-foreground">(opsional)</span>
      </Label>

      {!showAdd ? (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau nomor HP..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {results.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden">
              {results.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    onChange(c);
                    setQuery("");
                  }}
                  className="w-full flex justify-between items-center p-2 text-left hover:bg-secondary/50 border-b border-border last:border-0"
                >
                  <span className="text-sm font-medium">{c.name}</span>
                  <span className="text-xs text-muted-foreground">+{c.phone}</span>
                </button>
              ))}
            </div>
          )}

          {query.trim() && results.length === 0 && (
            <p className="text-xs text-muted-foreground px-1">Tidak ditemukan.</p>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setShowAdd(true);
              const qDigits = query.replace(/\D/g, "");
              if (qDigits) setNewPhone(query);
              else setNewName(query);
            }}
            className="w-full gap-2"
          >
            <UserPlus className="w-4 h-4" /> Tambah Customer Baru
          </Button>
        </>
      ) : (
        <div className="space-y-2 p-3 border border-border rounded-lg">
          <Input
            placeholder="Nama customer"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Input
            placeholder="Nomor HP (cth: 08123456789)"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            inputMode="tel"
          />
          {newPhone && (
            <p className="text-xs text-muted-foreground">
              Akan disimpan sebagai: +{normalizePhone(newPhone) || "?"}
            </p>
          )}
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)} className="flex-1">
              Batal
            </Button>
            <Button size="sm" onClick={handleAdd} disabled={saving || !newName || !newPhone} className="flex-1">
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
