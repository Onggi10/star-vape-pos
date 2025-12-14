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
import { Input } from "@/components/ui/input";
import { Wallet, CreditCard, Smartphone, Building2, ArrowLeft, Calculator, CheckCircle2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface PaymentMethodSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: string) => void;
  total: number;
}

const banks = [
  { value: "bca", label: "BCA", account: "1234567890" },
  { value: "bni", label: "BNI", account: "0987654321" },
  { value: "bri", label: "BRI", account: "1122334455" },
  { value: "mandiri", label: "Mandiri", account: "5566778899" },
];

const quickAmounts = [10000, 20000, 50000, 100000, 200000, 500000];

// QRIS merchant info - ganti dengan data QRIS asli Anda
const QRIS_MERCHANT_NAME = "STAR VAPE";
const QRIS_MERCHANT_ID = "ID1234567890123";

export const PaymentMethodSelector = ({
  isOpen,
  onClose,
  onConfirm,
  total,
}: PaymentMethodSelectorProps) => {
  const [selectedMethod, setSelectedMethod] = useState("cash");
  const [step, setStep] = useState<"method" | "cash" | "transfer" | "qris">("method");
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [selectedBank, setSelectedBank] = useState("bca");

  const paymentMethods = [
    { value: "cash", label: "Cash", icon: Wallet },
    { value: "qris", label: "QRIS", icon: Smartphone },
    { value: "transfer", label: "Transfer Bank", icon: CreditCard },
  ];

  const change = cashReceived - total;

  // Generate QRIS data string (simplified format)
  const generateQrisData = () => {
    const timestamp = Date.now();
    return `00020101021126${QRIS_MERCHANT_ID}5204599953033605802ID5913${QRIS_MERCHANT_NAME}6007JAKARTA61051234062${timestamp}${total.toString().padStart(10, '0')}6304`;
  };

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    if (method === "cash") {
      setCashReceived(0);
      setStep("cash");
    } else if (method === "transfer") {
      setStep("transfer");
    } else if (method === "qris") {
      setStep("qris");
    }
  };

  const handleConfirm = () => {
    if (selectedMethod === "transfer") {
      onConfirm(`Transfer ${banks.find(b => b.value === selectedBank)?.label}`);
    } else {
      onConfirm(selectedMethod);
    }
    handleClose();
  };

  const handleClose = () => {
    setStep("method");
    setCashReceived(0);
    setSelectedMethod("cash");
    onClose();
  };

  const handleBack = () => {
    setStep("method");
  };

  const handleQuickAmount = (amount: number) => {
    setCashReceived(prev => prev + amount);
  };

  const handleClearAmount = () => {
    setCashReceived(0);
  };

  const handleExactAmount = () => {
    setCashReceived(total);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step !== "method" && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            {step === "method" && "Pilih Metode Pembayaran"}
            {step === "cash" && "Pembayaran Cash"}
            {step === "transfer" && "Transfer Bank"}
            {step === "qris" && "Pembayaran QRIS"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Total Display */}
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground">Total Pembayaran</p>
            <p className="text-2xl font-bold text-primary">
              Rp {total.toLocaleString("id-ID")}
            </p>
          </div>

          {/* Step: Method Selection */}
          {step === "method" && (
            <RadioGroup value={selectedMethod} onValueChange={handleMethodSelect}>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <div
                      key={method.value}
                      className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer transition-colors"
                      onClick={() => handleMethodSelect(method.value)}
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
          )}

          {/* Step: QRIS Payment */}
          {step === "qris" && (
            <div className="space-y-4">
              {/* QR Code Display */}
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-xl shadow-lg">
                  <QRCodeSVG
                    value={generateQrisData()}
                    size={200}
                    level="H"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
                
                <div className="text-center space-y-1">
                  <p className="font-bold text-lg">{QRIS_MERCHANT_NAME}</p>
                  <p className="text-xs text-muted-foreground">ID: {QRIS_MERCHANT_ID}</p>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-medium text-center">Cara Pembayaran:</p>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Buka aplikasi e-wallet atau m-banking</li>
                  <li>Pilih menu Scan QR / QRIS</li>
                  <li>Scan QR Code di atas</li>
                  <li>Periksa nominal dan konfirmasi pembayaran</li>
                  <li>Tunjukkan bukti pembayaran ke kasir</li>
                </ol>
              </div>

              {/* Supported Apps */}
              <div className="flex flex-wrap justify-center gap-2">
                {["GoPay", "OVO", "DANA", "ShopeePay", "LinkAja", "BCA", "BRI", "Mandiri"].map((app) => (
                  <span
                    key={app}
                    className="px-2 py-1 bg-secondary text-xs rounded-full text-muted-foreground"
                  >
                    {app}
                  </span>
                ))}
              </div>

              <Button 
                onClick={handleConfirm} 
                className="w-full" 
                size="lg"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Konfirmasi Pembayaran Diterima
              </Button>
            </div>
          )}

          {/* Step: Cash Payment */}
          {step === "cash" && (
            <div className="space-y-4">
              {/* Cash Input */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Uang Diterima
                </Label>
                <Input
                  type="number"
                  value={cashReceived || ""}
                  onChange={(e) => setCashReceived(Number(e.target.value))}
                  placeholder="Masukkan jumlah uang"
                  className="text-lg font-semibold"
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Jumlah Cepat</Label>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAmount(amount)}
                      className="text-xs sm:text-sm"
                    >
                      +{(amount / 1000)}K
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleExactAmount}
                    className="flex-1"
                  >
                    Uang Pas
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleClearAmount}
                    className="flex-1"
                  >
                    Reset
                  </Button>
                </div>
              </div>

              {/* Change Display */}
              <div className={`p-4 rounded-lg ${change >= 0 ? 'bg-success/20 border border-success' : 'bg-destructive/20 border border-destructive'}`}>
                <p className="text-sm text-muted-foreground">Kembalian</p>
                <p className={`text-2xl font-bold ${change >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {change >= 0 ? `Rp ${change.toLocaleString("id-ID")}` : `Kurang Rp ${Math.abs(change).toLocaleString("id-ID")}`}
                </p>
              </div>

              <Button 
                onClick={handleConfirm} 
                className="w-full" 
                size="lg"
                disabled={cashReceived < total}
              >
                Konfirmasi Pembayaran
              </Button>
            </div>
          )}

          {/* Step: Bank Transfer */}
          {step === "transfer" && (
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Pilih Bank Tujuan
              </Label>

              <RadioGroup value={selectedBank} onValueChange={setSelectedBank}>
                <div className="space-y-2">
                  {banks.map((bank) => (
                    <div
                      key={bank.value}
                      className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedBank === bank.value 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:bg-secondary/50'
                      }`}
                      onClick={() => setSelectedBank(bank.value)}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={bank.value} id={bank.value} />
                        <Label htmlFor={bank.value} className="cursor-pointer">
                          <span className="font-bold text-lg">{bank.label}</span>
                        </Label>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">No. Rekening</p>
                        <p className="font-mono text-sm">{bank.account}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground text-center">
                  Pastikan pelanggan sudah melakukan transfer ke rekening yang dipilih
                </p>
              </div>

              <Button onClick={handleConfirm} className="w-full" size="lg">
                Konfirmasi Transfer {banks.find(b => b.value === selectedBank)?.label}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};