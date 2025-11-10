import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, ShoppingBag, Package } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { Cart } from "@/components/Cart";
import { InventoryManager } from "@/components/InventoryManager";
import { Receipt } from "@/components/Receipt";
import { Product, CartItem } from "@/types/product";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Pod System Starter Kit",
      price: 350000,
      stock: 15,
      category: "Pod Device",
    },
    {
      id: "2",
      name: "Salt Nic Liquid 30ml Mint",
      price: 75000,
      stock: 25,
      category: "Liquid",
    },
    {
      id: "3",
      name: "Replacement Coil Pack",
      price: 45000,
      stock: 50,
      category: "Coil",
    },
    {
      id: "4",
      name: "Premium Liquid 60ml Fruits",
      price: 120000,
      stock: 20,
      category: "Liquid",
    },
    {
      id: "5",
      name: "Pod Cartridge Empty",
      price: 35000,
      stock: 30,
      category: "Accessories",
    },
    {
      id: "6",
      name: "Mod Box Advanced",
      price: 650000,
      stock: 8,
      category: "Mod",
    },
  ]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<{
    items: CartItem[];
    total: number;
    id: string;
  } | null>(null);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (product: Product) => {
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

    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // Update stock
    const updatedProducts = products.map((product) => {
      const cartItem = cart.find((item) => item.id === product.id);
      if (cartItem) {
        return {
          ...product,
          stock: product.stock - cartItem.quantity,
        };
      }
      return product;
    });

    setProducts(updatedProducts);

    toast({
      title: "Transaksi Berhasil",
      description: "Pembayaran berhasil diproses",
    });

    setCart([]);
  };

  const handlePrint = () => {
    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const transactionId = `TRX${Date.now()}`;

    setCurrentTransaction({
      items: cart,
      total,
      id: transactionId,
    });

    setShowReceipt(true);
  };

  const handlePrintComplete = () => {
    setShowReceipt(false);
    handleCheckout();
  };

  const handleAddProduct = (product: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
    };
    setProducts([...products, newProduct]);
  };

  const handleUpdateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(
      products.map((product) =>
        product.id === id ? { ...product, ...updates } : product
      )
    );
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((product) => product.id !== id));
    setCart(cart.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      {showReceipt && currentTransaction && (
        <Receipt
          items={currentTransaction.items}
          total={currentTransaction.total}
          transactionId={currentTransaction.id}
          onPrintComplete={handlePrintComplete}
        />
      )}

      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Vape Store POS</h1>
          <p className="text-muted-foreground">Sistem kasir modern untuk toko vape Anda</p>
        </div>

        <Tabs defaultValue="pos" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="pos" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Kasir
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Inventori
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pos" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Cari produk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-6">
                  <Cart
                    items={cart}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                    onCheckout={handleCheckout}
                    onPrint={handlePrint}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryManager
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
