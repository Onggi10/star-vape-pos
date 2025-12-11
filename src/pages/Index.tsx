import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ShoppingBag, Package, History, BarChart3, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { Cart } from "@/components/Cart";
import { InventoryManager } from "@/components/InventoryManager";
import { TransactionHistory } from "@/components/TransactionHistory";
import { Dashboard } from "@/components/Dashboard";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { PaymentMethodSelector } from "@/components/PaymentMethodSelector";
import { Receipt } from "@/components/Receipt";
import { CartItem } from "@/types/product";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/hooks/useProducts";
import { useTransactions } from "@/hooks/useTransactions";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { createTransaction } = useTransactions();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }
  }, []);

  const [currentTransaction, setCurrentTransaction] = useState<{
    items: CartItem[];
    total: number;
    id: string;
    paymentMethod: string;
  } | null>(null);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (product: typeof products[0]) => {
    if (product.stock === 0) {
      toast({
        title: "Stok Habis",
        description: "Produk ini sedang habis",
        variant: "destructive",
      });
      return;
    }

    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast({
          title: "Stok Tidak Cukup",
          description: "Jumlah melebihi stok yang tersedia",
          variant: "destructive",
        });
        return;
      }
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }

    toast({
      title: "Ditambahkan ke keranjang",
      description: `${product.name} berhasil ditambahkan`,
    });
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id);
      return;
    }

    const product = products.find((p) => p.id === id);
    if (product && quantity > product.stock) {
      toast({
        title: "Stok Tidak Cukup",
        description: "Jumlah melebihi stok yang tersedia",
        variant: "destructive",
      });
      return;
    }

    setCart(cart.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  const handleRemoveItem = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    setShowPaymentDialog(true);
  };

  const handlePaymentConfirm = async (paymentMethod: string) => {
    if (cart.length === 0) return;

    try {
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const transaction = await createTransaction(cart, total, paymentMethod);

      setCurrentTransaction({
        items: cart,
        total,
        id: transaction.transaction_number,
        paymentMethod,
      });

      setShowReceipt(true);
      setShowPaymentDialog(false);
    } catch (error) {
      console.error("Transaction error:", error);
    }
  };

  const handlePrintComplete = () => {
    setShowReceipt(false);
    setCart([]);
    setCurrentTransaction(null);
  };

  const handleBarcodeScanned = (barcode: string) => {
    const product = products.find((p) => p.barcode === barcode);
    if (product) {
      handleAddToCart(product);
    } else {
      toast({
        title: "Produk Tidak Ditemukan",
        description: `Barcode ${barcode} tidak terdaftar`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {showReceipt && currentTransaction && (
        <Receipt
          items={currentTransaction.items}
          total={currentTransaction.total}
          transactionId={currentTransaction.id}
          paymentMethod={currentTransaction.paymentMethod}
          onPrintComplete={handlePrintComplete}
        />
      )}

      <PaymentMethodSelector
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        onConfirm={handlePaymentConfirm}
        total={cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}
      />

      <div className="container mx-auto p-4 sm:p-6">
        {/* ======= HEADER DENGAN LOGO ======= */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src="/images/starvape-logo.jpeg"
              alt="Star Vape Logo"
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full shadow-md object-contain"
            />
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-foreground">Star Vape POS</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                Sistem kasir modern untuk toko vape Anda
              </p>
            </div>
          </div>
          {!isInstalled && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/install")}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Install App</span>
            </Button>
          )}
        </div>

        <Tabs defaultValue="pos" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger value="pos" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">Kasir</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <Package className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">Inventori</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <History className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">Riwayat</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">Dashboard</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB POS */}
          <TabsContent value="pos" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Cari produk..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <BarcodeScanner onScan={handleBarcodeScanned} />
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-secondary rounded-lg h-64"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-6">
                  <Cart
                    items={cart}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                    onCheckout={handleCheckoutClick}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryManager />
          </TabsContent>

          <TabsContent value="history">
            <TransactionHistory />
          </TabsContent>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
