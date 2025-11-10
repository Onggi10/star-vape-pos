import { useEffect } from "react";
import { CartItem } from "@/types/product";
import "@/styles/print.css"; // file CSS print seperti sebelumnya

interface ReceiptProps {
  items: CartItem[];
  total: number;
  transactionId: string;
  paymentMethod: string; // ⬅️ Tambahkan properti baru
  onPrintComplete: () => void;
}

export const Receipt = ({
  items,
  total,
  transactionId,
  paymentMethod,
  onPrintComplete,
}: ReceiptProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
      onPrintComplete();
    }, 200);
    return () => clearTimeout(timer);
  }, [onPrintComplete]);

  // Fungsi bantu untuk menampilkan nama metode pembayaran
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

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto print:relative print:bg-white print-area">
      <div
        id="receipt-print"
        className="max-w-sm mx-auto p-8 print:p-4 bg-white text-black"
      >
        {/* Header toko */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground print:text-black">
            STAR VAPE
          </h1>
          <p className="text-sm text-muted-foreground print:text-gray-600">
            Jl. RS. Fatmawati Raya No.1, RT.1/RW.1, Pd. Labu, Kec. Cilandak,
            Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12450
          </p>
          <p className="text-sm text-muted-foreground print:text-gray-600">
            0895-1446-5010
          </p>
          <div className="border-t-2 border-dashed border-border print:border-gray-300 my-4" />
        </div>

        {/* Info transaksi */}
        <div className="mb-4 text-sm">
          <p className="text-muted-foreground print:text-gray-600">
            No. Transaksi: {transactionId}
          </p>
          <p className="text-muted-foreground print:text-gray-600">
            Tanggal: {new Date().toLocaleString("id-ID")}
          </p>
        </div>

        <div className="border-t-2 border-dashed border-border print:border-gray-300 my-4" />

        {/* Daftar barang */}
        <div className="space-y-3 mb-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div className="flex-1">
                <p className="font-medium text-foreground print:text-black">
                  {item.name}
                </p>
                <p className="text-muted-foreground print:text-gray-600">
                  {item.quantity} x Rp {item.price.toLocaleString("id-ID")}
                </p>
              </div>
              <p className="font-semibold text-foreground print:text-black">
                Rp {(item.price * item.quantity).toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t-2 border-dashed border-border print:border-gray-300 my-4" />

        {/* Total */}
        <div className="flex justify-between text-lg font-bold mb-3">
          <span className="text-foreground print:text-black">TOTAL</span>
          <span className="text-primary print:text-black">
            Rp {total.toLocaleString("id-ID")}
          </span>
        </div>

        {/* Keterangan metode pembayaran */}
        <div className="text-sm mb-6">
          <p className="text-muted-foreground print:text-gray-600">
            Metode Pembayaran:{" "}
            <span className="font-semibold text-foreground print:text-black">
              {getPaymentLabel(paymentMethod)}
            </span>
          </p>
        </div>

        <div className="border-t-2 border-dashed border-border print:border-gray-300 my-4" />

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground print:text-gray-600">
          <p>Terima kasih atas kunjungan Anda!</p>
          <p className="mt-2">
            Barang yang sudah dibeli tidak dapat dikembalikan.
          </p>
        </div>
      </div>
    </div>
  );
};
