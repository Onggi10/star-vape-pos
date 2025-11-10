import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Wallet, CreditCard, Smartphone } from "lucide-react";

interface PaymentMethodSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: string) => void;
  total: number;
}

export const PaymentMethodSelector = ({
  isOpen,
  onClose,
  onConfirm,
  total,
}: PaymentMethodSelectorProps) => {
  const [selectedMethod, setSelectedMethod] = useState("cash");

  const paymentMethods = [
    { value: "cash", label: "Cash", icon: Wallet },
    { value: "qris", label: "QRIS", icon: Smartphone },
    { value: "transfer", label: "Transfer Bank", icon: CreditCard },
  ];

  const handleConfirm = () => {
    onConfirm(selectedMethod);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground">Total Pembayaran</p>
            <p className="text-2xl font-bold text-primary">
              Rp {total.toLocaleString("id-ID")}
            </p>
          </div>

          <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <div
                    key={method.value}
                    className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedMethod(method.value)}
                  >
                    <RadioGroupItem value={method.value} id={method.value} />
                    <Label
                      htmlFor={method.value}
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <Icon className="w-5 h-5 text-primary" />
                      <span className="font-medium">{method.label}</span>
                    </Label>
                  </div>
                );
              })}
            </div>
          </RadioGroup>

          <Button onClick={handleConfirm} className="w-full" size="lg">
            Konfirmasi Pembayaran
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
