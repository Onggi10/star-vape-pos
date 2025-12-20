import { useState } from "react";
import { Clock, DollarSign, LogIn, LogOut, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shift } from "@/hooks/useShifts";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface ShiftManagerProps {
  currentShift: Shift | null;
  onOpenShift: (openingCash: number) => Promise<Shift | null>;
  onCloseShift: (closingCash: number, notes?: string) => Promise<Shift | null>;
  shiftSummary?: {
    totalSales: number;
    cashSales: number;
    qrisSales: number;
    transactionCount: number;
  };
}

export const ShiftManager = ({
  currentShift,
  onOpenShift,
  onCloseShift,
  shiftSummary,
}: ShiftManagerProps) => {
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [openingCash, setOpeningCash] = useState("");
  const [closingCash, setClosingCash] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenShift = async () => {
    if (!openingCash) return;
    setIsLoading(true);
    const result = await onOpenShift(parseFloat(openingCash));
    setIsLoading(false);
    if (result) {
      setOpeningCash("");
      setIsOpenDialogOpen(false);
    }
  };

  const handleCloseShift = async () => {
    if (!closingCash) return;
    setIsLoading(true);
    const result = await onCloseShift(parseFloat(closingCash), notes);
    setIsLoading(false);
    if (result) {
      setClosingCash("");
      setNotes("");
      setIsCloseDialogOpen(false);
    }
  };

  const expectedCash = currentShift
    ? currentShift.opening_cash + (shiftSummary?.cashSales || 0)
    : 0;

  return (
    <>
      {/* Shift Status Card */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Status Shift
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentShift ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status:</span>
                <span className="text-sm font-medium text-green-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Shift Aktif
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Dibuka:</span>
                <span className="text-sm font-medium">
                  {format(new Date(currentShift.opened_at), "dd MMM yyyy, HH:mm", { locale: id })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Modal Awal:</span>
                <span className="text-sm font-medium">
                  Rp {currentShift.opening_cash.toLocaleString("id-ID")}
                </span>
              </div>
              {shiftSummary && (
                <>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Transaksi:</span>
                      <span className="text-sm font-medium">{shiftSummary.transactionCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Penjualan:</span>
                      <span className="text-sm font-medium">
                        Rp {shiftSummary.totalSales.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Penjualan Tunai:</span>
                      <span className="text-sm font-medium">
                        Rp {shiftSummary.cashSales.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Penjualan QRIS:</span>
                      <span className="text-sm font-medium">
                        Rp {shiftSummary.qrisSales.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Kas Diharapkan:</span>
                      <span className="text-sm font-bold text-primary">
                        Rp {expectedCash.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </>
              )}
              <Button
                onClick={() => setIsCloseDialogOpen(true)}
                variant="destructive"
                className="w-full mt-2"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Tutup Shift
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">Tidak ada shift yang aktif</p>
              <Button onClick={() => setIsOpenDialogOpen(true)} className="w-full">
                <LogIn className="w-4 h-4 mr-2" />
                Buka Shift
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Open Shift Dialog */}
      <Dialog open={isOpenDialogOpen} onOpenChange={setIsOpenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogIn className="w-5 h-5" />
              Buka Shift Baru
            </DialogTitle>
            <DialogDescription>
              Masukkan jumlah uang tunai awal di kasir untuk memulai shift.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openingCash">Modal Awal (Rp)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="openingCash"
                  type="number"
                  placeholder="0"
                  value={openingCash}
                  onChange={(e) => setOpeningCash(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpenDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleOpenShift} disabled={!openingCash || isLoading}>
              {isLoading ? "Memproses..." : "Buka Shift"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Shift Dialog */}
      <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="w-5 h-5" />
              Tutup Shift
            </DialogTitle>
            <DialogDescription>
              Hitung uang tunai di kasir dan masukkan jumlahnya.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {shiftSummary && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Modal Awal:</span>
                    <span className="font-medium">
                      Rp {currentShift?.opening_cash.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Penjualan Tunai:</span>
                    <span className="font-medium">
                      Rp {shiftSummary.cashSales.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="font-medium">Kas Diharapkan:</span>
                    <span className="font-bold text-primary">
                      Rp {expectedCash.toLocaleString("id-ID")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="space-y-2">
              <Label htmlFor="closingCash">Jumlah Kas Aktual (Rp)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="closingCash"
                  type="number"
                  placeholder="0"
                  value={closingCash}
                  onChange={(e) => setClosingCash(e.target.value)}
                  className="pl-10"
                />
              </div>
              {closingCash && (
                <p className={`text-sm ${parseFloat(closingCash) === expectedCash ? "text-green-500" : parseFloat(closingCash) > expectedCash ? "text-blue-500" : "text-destructive"}`}>
                  {parseFloat(closingCash) === expectedCash
                    ? "✓ Kas sesuai"
                    : parseFloat(closingCash) > expectedCash
                    ? `↑ Lebih Rp ${(parseFloat(closingCash) - expectedCash).toLocaleString("id-ID")}`
                    : `↓ Kurang Rp ${(expectedCash - parseFloat(closingCash)).toLocaleString("id-ID")}`}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan (Opsional)</Label>
              <Textarea
                id="notes"
                placeholder="Catatan shift..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCloseDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleCloseShift}
              disabled={!closingCash || isLoading}
              variant="destructive"
            >
              {isLoading ? "Memproses..." : "Tutup Shift"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
