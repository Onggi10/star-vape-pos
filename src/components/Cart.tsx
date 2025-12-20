import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { CartItem } from "@/types/product";

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  disabled?: boolean;
}

export const Cart = ({ items, onUpdateQuantity, onRemoveItem, onCheckout, disabled }: CartProps) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card className="flex flex-col max-h-[50vh] lg:max-h-[calc(100vh-200px)]">
      <div className="p-3 sm:p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h2 className="text-base sm:text-xl font-bold text-foreground">Keranjang</h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">{itemCount} item</p>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2 sm:p-4 space-y-2 sm:space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-6 sm:py-12">
              <ShoppingCart className="w-10 h-10 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-2 sm:mb-4 opacity-50" />
              <p className="text-sm text-muted-foreground">Keranjang kosong</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-secondary/50">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-background rounded flex items-center justify-center flex-shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded" />
                  ) : (
                    <ShoppingCart className="w-4 h-4 sm:w-6 sm:h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate text-xs sm:text-base">{item.name}</h3>
                  <p className="text-xs sm:text-sm text-primary font-semibold">
                    Rp {item.price.toLocaleString("id-ID")}
                  </p>
                  <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-6 w-6 sm:h-7 sm:w-7"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-6 sm:w-8 text-center font-medium text-foreground text-xs sm:text-sm">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-6 w-6 sm:h-7 sm:w-7"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 sm:h-7 sm:w-7 ml-auto text-destructive hover:text-destructive"
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

      <div className="p-3 sm:p-6 border-t border-border space-y-2 sm:space-y-4">
        <div className="space-y-1 sm:space-y-2">
          <Separator />
          <div className="flex justify-between text-sm sm:text-lg font-bold text-foreground">
            <span>Total</span>
            <span className="text-primary">Rp {total.toLocaleString("id-ID")}</span>
          </div>
        </div>
        <Button
          className="w-full"
          size="default"
          onClick={onCheckout}
          disabled={items.length === 0 || disabled}
        >
          {disabled ? "Buka Shift Dulu" : "Checkout"}
        </Button>
      </div>
    </Card>
  );
};
