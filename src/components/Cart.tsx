import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Minus, Plus, Trash2, ShoppingCart, Printer } from "lucide-react";
import { CartItem } from "@/types/product";

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  onPrint: () => void;
}

export const Cart = ({ items, onUpdateQuantity, onRemoveItem, onCheckout, onPrint }: CartProps) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card className="h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <ShoppingCart className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Keranjang</h2>
        </div>
        <p className="text-sm text-muted-foreground">{itemCount} item</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Keranjang kosong</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 rounded-lg bg-secondary/50">
                <div className="w-16 h-16 bg-background rounded flex items-center justify-center flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" />
                  ) : (
                    <ShoppingCart className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">{item.name}</h3>
                  <p className="text-sm text-primary font-semibold">
                    Rp {item.price.toLocaleString("id-ID")}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center font-medium text-foreground">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 ml-auto text-destructive hover:text-destructive"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-6 border-t border-border space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span>Rp {total.toLocaleString("id-ID")}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold text-foreground">
            <span>Total</span>
            <span className="text-primary">Rp {total.toLocaleString("id-ID")}</span>
          </div>
        </div>
        <div className="space-y-2">
          <Button
            className="w-full"
            size="lg"
            onClick={onCheckout}
            disabled={items.length === 0}
          >
            Checkout
          </Button>
          <Button
            className="w-full"
            size="lg"
            variant="outline"
            onClick={onPrint}
            disabled={items.length === 0}
          >
            <Printer className="w-4 h-4 mr-2" />
            Cetak Struk
          </Button>
        </div>
      </div>
    </Card>
  );
};
