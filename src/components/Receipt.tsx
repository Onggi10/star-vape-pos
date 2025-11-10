import { useEffect } from "react";
import { CartItem } from "@/types/product";

interface ReceiptProps {
  items: CartItem[];
  total: number;
  transactionId: string;
  onPrintComplete: () => void;
}

export const Receipt = ({ items, total, transactionId, onPrintComplete }: ReceiptProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
      onPrintComplete();
    }, 100);
    return () => clearTimeout(timer);
  }, [onPrintComplete]);

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto print:relative print:bg-white">
      <div className="max-w-sm mx-auto p-8 print:p-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground print:text-black">VAPE STORE</h1>
          <p className="text-sm text-muted-foreground print:text-gray-600">Struk Pembelian</p>
          <div className="border-t-2 border-dashed border-border print:border-gray-300 my-4" />
        </div>

        <div className="mb-4 text-sm">
          <p className="text-muted-foreground print:text-gray-600">No. Transaksi: {transactionId}</p>
          <p className="text-muted-foreground print:text-gray-600">
            Tanggal: {new Date().toLocaleString("id-ID")}
          </p>
        </div>

        <div className="border-t-2 border-dashed border-border print:border-gray-300 my-4" />

        <div className="space-y-3 mb-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div className="flex-1">
                <p className="font-medium text-foreground print:text-black">{item.name}</p>
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

        <div className="flex justify-between text-lg font-bold mb-6">
          <span className="text-foreground print:text-black">TOTAL</span>
          <span className="text-primary print:text-black">Rp {total.toLocaleString("id-ID")}</span>
        </div>

        <div className="border-t-2 border-dashed border-border print:border-gray-300 my-4" />

        <div className="text-center text-sm text-muted-foreground print:text-gray-600">
          <p>Terima kasih atas kunjungan Anda!</p>
          <p className="mt-2">Barang yang sudah dibeli tidak dapat dikembalikan</p>
        </div>
      </div>
    </div>
  );
};
