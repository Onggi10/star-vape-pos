import { useEffect, useState } from "react";
import { CartItem } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Printer, Bluetooth, X } from "lucide-react";
import { useThermalPrinter } from "@/hooks/useThermalPrinter";
import { useToast } from "@/hooks/use-toast";
import "@/styles/print.css";

interface ReceiptProps {
  items: CartItem[];
  total: number;
  transactionId: string;
  paymentMethod: string;
  onPrintComplete: () => void;
}

export const Receipt = ({
  items,
  total,
  transactionId,
  paymentMethod,
  onPrintComplete,
}: ReceiptProps) => {
  const { toast } = useToast();
  const {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    printReceipt,
  } = useThermalPrinter();

  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error Printer",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case "cash":
        return "Tunai (Cash)";
      case "qris":
        return "QRIS";
      case "transfer":
        return "Transfer Bank";
      default:
        return "Lainnya";
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  const handleThermalPrint = async () => {
    if (!isConnected) {
      const connected = await connect();
      if (!connected) return;
    }

    setIsPrinting(true);
    const success = await printReceipt(items, total, transactionId, paymentMethod);
    setIsPrinting(false);

    if (success) {
      toast({
        title: "Berhasil",
        description: "Struk berhasil dicetak",
      });
    }
  };

  const handleClose = () => {
    onPrintComplete();
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-auto">
      {/* Control buttons - hidden during print */}
      <div className="fixed top-4 right-4 flex gap-2 no-print z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBrowserPrint}
          className="bg-background"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print Browser
        </Button>

        <Button
          variant={isConnected ? "default" : "outline"}
          size="sm"
          onClick={handleThermalPrint}
          disabled={isConnecting || isPrinting}
          className="bg-background"
        >
          <Bluetooth className="w-4 h-4 mr-2" />
          {isConnecting
            ? "Menghubungkan..."
            : isPrinting
            ? "Mencetak..."
            : isConnected
            ? "Cetak Thermal"
            : "Hubungkan Printer"}
        </Button>

        {isConnected && (
          <Button
            variant="ghost"
            size="sm"
            onClick={disconnect}
            className="text-muted-foreground"
          >
            Putus
          </Button>
        )}

        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="print-area">
        <div
          id="receipt-print"
          className="max-w-sm mx-auto p-8 print:p-4 bg-white text-black mt-16 print:mt-0"
        >
          {/* ===================== HEADER TOKO ===================== */}
          <div className="text-center mb-6">
            <img
              src="/images/starvape-logo.jpeg"
              alt="Star Vape Logo"
              className="w-20 h-20 mx-auto mb-2 object-contain"
            />
            <h1 className="text-xl font-bold text-foreground print:text-black tracking-wider">
              STAR VAPE
            </h1>
            <p className="text-xs text-muted-foreground print:text-gray-600 leading-tight">
              Jl. RS. Fatmawati Raya No.1, Pd. Labu, Cilandak, Jakarta Selatan
            </p>
            <p className="text-xs text-muted-foreground print:text-gray-600">
              Telp: 0895-1446-5010
            </p>
            <div className="border-t border-dashed border-border print:border-gray-300 my-3" />
          </div>

          {/* ===================== INFO TRANSAKSI ===================== */}
          <div className="mb-3 text-xs">
            <p className="text-muted-foreground print:text-gray-600">
              No. Transaksi: {transactionId}
            </p>
            <p className="text-muted-foreground print:text-gray-600">
              Tanggal: {new Date().toLocaleString("id-ID")}
            </p>
          </div>

          <div className="border-t border-dashed border-border print:border-gray-300 my-3" />

          {/* ===================== DAFTAR PRODUK ===================== */}
          <div className="space-y-2 mb-4 text-sm">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div className="flex-1">
                  <p className="font-medium text-foreground print:text-black">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground print:text-gray-600">
                    {item.quantity} x Rp {item.price.toLocaleString("id-ID")}
                  </p>
                </div>
                <p className="font-semibold text-foreground print:text-black">
                  Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-border print:border-gray-300 my-3" />

          {/* ===================== TOTAL ===================== */}
          <div className="flex justify-between text-base font-bold mb-2">
            <span className="text-foreground print:text-black">TOTAL</span>
            <span className="text-primary print:text-black">
              Rp {total.toLocaleString("id-ID")}
            </span>
          </div>

          {/* ===================== METODE PEMBAYARAN ===================== */}
          <div className="text-xs mb-4">
            <p className="text-muted-foreground print:text-gray-600">
              Metode Pembayaran:{" "}
              <span className="font-semibold text-foreground print:text-black">
                {getPaymentLabel(paymentMethod)}
              </span>
            </p>
          </div>

          <div className="border-t border-dashed border-border print:border-gray-300 my-3" />

          {/* ===================== FOOTER ===================== */}
          <div className="text-center text-xs text-muted-foreground print:text-gray-600 leading-tight">
            <p>Terima kasih atas kunjungan Anda!</p>
            <p>Barang yang sudah dibeli tidak dapat dikembalikan.</p>
            <p className="mt-2 font-semibold">~ STAR VAPE ~</p>
          </div>
        </div>
      </div>
    </div>
  );
};
