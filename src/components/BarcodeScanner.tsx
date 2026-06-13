import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScanLine, Search, Keyboard } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export const BarcodeScanner = ({ onScan }: BarcodeScannerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [scanning, setScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    // Flash scan animation
    setScanning(true);
    setTimeout(() => {
      onScan(barcode.trim());
      setBarcode("");
      setScanning(false);
      setIsOpen(false);
    }, 300);
  };

  const handleClose = () => {
    setBarcode("");
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="gap-2 border-primary/40 hover:border-primary hover:bg-primary/10 hover:text-primary transition-all duration-200 font-medium"
      >
        <ScanLine className="w-4 h-4" />
        <span className="hidden sm:inline">Scan Barcode</span>
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl p-0 border-0 shadow-2xl max-w-lg mx-auto sm:max-w-lg"
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>

          <SheetHeader className="px-6 pt-2 pb-4">
            <SheetTitle className="text-lg font-bold flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-primary" />
              Scan Barcode Produk
            </SheetTitle>
          </SheetHeader>

          {/* Scan animation area */}
          <div className="mx-6 mb-5 rounded-2xl overflow-hidden bg-secondary/30 border border-border/40 relative h-36 flex items-center justify-center">
            {/* Corner decorations */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-md" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-md" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-md" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-md" />

            {/* Scanning line */}
            <div
              className={`absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent transition-all duration-300 ${
                scanning ? "opacity-100 scale-110" : "animate-bounce opacity-70"
              }`}
              style={{ animationDuration: "2s" }}
            />

            {/* Center content */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className={`p-3 rounded-full transition-all duration-300 ${scanning ? "bg-primary/20 scale-110" : "bg-primary/10"}`}>
                <ScanLine className={`w-7 h-7 text-primary transition-all ${scanning ? "text-primary scale-110" : ""}`} />
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                {scanning ? "Memproses..." : "Arahkan scanner ke barcode"}
              </p>
            </div>
          </div>

          {/* Input area */}
          <form onSubmit={handleSubmit} className="px-6 pb-8 space-y-3">
            <div className="relative">
              <Keyboard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Ketik atau scan barcode di sini..."
                className="pl-10 h-12 text-sm bg-secondary/40 border-border/60 focus:border-primary focus:bg-background rounded-xl transition-all"
                onKeyDown={(e) => {
                  // Auto-submit on Enter (most scanners send Enter)
                  if (e.key === "Enter") handleSubmit(e as any);
                }}
              />
            </div>

            <p className="text-[11px] text-muted-foreground text-center">
              Scanner otomatis akan langsung mencari produk setelah scan
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="h-12 rounded-xl font-medium"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="h-12 rounded-xl font-semibold gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                disabled={!barcode.trim() || scanning}
              >
                <Search className="w-4 h-4" />
                {scanning ? "Mencari..." : "Cari Produk"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
};
