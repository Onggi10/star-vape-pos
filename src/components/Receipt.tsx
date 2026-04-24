import { useEffect, useRef, useState } from "react";
import { CartItem } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Printer, Bluetooth, X, MessageCircle, Loader2 } from "lucide-react";
import { useThermalPrinterContext } from "@/contexts/ThermalPrinterContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from "html2canvas";
import "@/styles/print.css";

interface ReceiptProps {
  items: CartItem[];
  total: number;
  transactionId: string;
  paymentMethod: string;
  customer?: { name: string; phone: string } | null;
  onPrintComplete: () => void;
}

export const Receipt = ({
  items,
  total,
  transactionId,
  paymentMethod,
  customer,
  onPrintComplete,
}: ReceiptProps) => {
  const { toast } = useToast();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [sendingWa, setSendingWa] = useState(false);
  const {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    printReceipt,
  } = useThermalPrinterContext();

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

  const handleSendWhatsApp = async () => {
    if (!customer) {
      toast({
        title: "Customer belum dipilih",
        description: "Pilih customer pada saat checkout untuk mengirim struk via WhatsApp.",
        variant: "destructive",
      });
      return;
    }
    if (!receiptRef.current) return;

    setSendingWa(true);
    try {
      // Render struk ke canvas
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      });
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png")
      );
      if (!blob) throw new Error("Gagal membuat gambar struk");

      // Upload ke storage
      const fileName = `${transactionId}-${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(fileName, blob, { contentType: "image/png", upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(fileName);
      const imageUrl = urlData.publicUrl;

      // Susun pesan
      const message =
        `Halo *${customer.name}*, terima kasih sudah berbelanja di *STAR VAPE*! 🙏\n\n` +
        `No. Transaksi: ${transactionId}\n` +
        `Total: Rp ${total.toLocaleString("id-ID")}\n\n` +
        `Struk lengkap: ${imageUrl}`;

      const waUrl = `https://wa.me/${customer.phone}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");

      toast({
        title: "Membuka WhatsApp",
        description: `Pesan untuk ${customer.name} siap dikirim.`,
      });
    } catch (e: any) {
      toast({
        title: "Gagal mengirim",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setSendingWa(false);
    }
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

        <Button
          variant="default"
          size="sm"
          onClick={handleSendWhatsApp}
          disabled={sendingWa || !customer}
          className="bg-[#25D366] hover:bg-[#1DA851] text-white"
          title={customer ? `Kirim ke +${customer.phone}` : "Customer belum dipilih"}
        >
          {sendingWa ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <MessageCircle className="w-4 h-4 mr-2" />
          )}
          Kirim WhatsApp
        </Button>

        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="print-area flex justify-center">
        <div
          ref={receiptRef}
          id="receipt-print"
          className="w-[72mm] mx-auto p-4 bg-white text-black mt-16 print:mt-0 print:p-2"
          style={{ fontFamily: 'monospace' }}
        >
          {/* ===================== HEADER TOKO ===================== */}
          <div className="text-center mb-3">
            <img
              src="/images/starvape-logo.jpeg"
              alt="Star Vape Logo"
              className="w-12 h-12 mx-auto mb-1 object-contain print:w-[15mm] print:h-[15mm]"
            />
            <h1 className="text-base font-bold text-black tracking-wide">
              STAR VAPE
            </h1>
            <p className="text-[10px] text-gray-600 leading-tight">
              Jl. RS. Fatmawati Raya No.1, Pd. Labu, Cilandak, Jakarta Selatan
            </p>
            <p className="text-[10px] text-gray-600">
              Telp: 0895-1446-5010
            </p>
            <div className="border-t border-dashed border-gray-400 my-2" />
          </div>

          {/* ===================== INFO TRANSAKSI ===================== */}
          <div className="mb-2 text-[10px]">
            <p className="text-gray-600">No: {transactionId}</p>
            <p className="text-gray-600">
              {new Date().toLocaleString("id-ID")}
            </p>
          </div>

          <div className="border-t border-dashed border-gray-400 my-2" />

          {/* ===================== DAFTAR PRODUK ===================== */}
          <div className="space-y-1 mb-2 text-[11px]">
            {items.map((item) => (
              <div key={item.id}>
                <p className="font-medium text-black truncate">{item.name}</p>
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-600">
                    {item.quantity} x {item.price.toLocaleString("id-ID")}
                  </span>
                  <span className="font-semibold text-black">
                    {(item.price * item.quantity).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-400 my-2" />

          {/* ===================== TOTAL ===================== */}
          <div className="flex justify-between text-sm font-bold mb-2">
            <span className="text-black">TOTAL</span>
            <span className="text-black">
              Rp {total.toLocaleString("id-ID")}
            </span>
          </div>

          {/* ===================== METODE PEMBAYARAN ===================== */}
          <div className="text-[10px] mb-2">
            <p className="text-gray-600">
              Bayar: <span className="font-semibold text-black">{getPaymentLabel(paymentMethod)}</span>
            </p>
          </div>

          <div className="border-t border-dashed border-gray-400 my-2" />

          {/* ===================== FOOTER ===================== */}
          <div className="text-center text-[9px] text-gray-600 leading-tight">
            <p>Terima kasih atas kunjungan Anda!</p>
            <p>Barang yang sudah dibeli tidak dapat dikembalikan.</p>
            <p className="mt-1 font-semibold">~ STAR VAPE ~</p>
          </div>
        </div>
      </div>
    </div>
  );
};
