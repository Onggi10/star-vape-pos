import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package } from "lucide-react";
import { Product } from "@/hooks/useProducts";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const isLowStock = product.stock < 5;
  const isOutOfStock = product.stock === 0;

  return (
    <Card className="overflow-hidden hover:border-primary transition-all duration-300 group">
      <div className="aspect-square bg-secondary flex items-center justify-center relative overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="object-cover w-full h-full" />
        ) : (
          <Package className="w-10 h-10 sm:w-16 sm:h-16 text-muted-foreground" />
        )}
        {isLowStock && !isOutOfStock && (
          <Badge variant="destructive" className="absolute top-1 right-1 sm:top-2 sm:right-2 text-[10px] sm:text-xs px-1.5 sm:px-2">
            Stok Rendah
          </Badge>
        )}
        {isOutOfStock && (
          <Badge variant="destructive" className="absolute top-1 right-1 sm:top-2 sm:right-2 text-[10px] sm:text-xs px-1.5 sm:px-2">
            Habis
          </Badge>
        )}
      </div>
      <div className="p-2 sm:p-4">
        <div className="mb-1 sm:mb-2">
          <h3 className="font-semibold text-foreground truncate text-xs sm:text-base">{product.name}</h3>
          <p className="text-[10px] sm:text-sm text-muted-foreground truncate">{product.category}</p>
        </div>
        <div className="flex items-center justify-between gap-1">
          <div className="min-w-0 flex-1">
            <p className="text-sm sm:text-xl font-bold text-primary truncate">
              Rp {product.price.toLocaleString("id-ID")}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Stok: {product.stock}</p>
          </div>
          <Button
            size="icon"
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            className="group-hover:scale-110 transition-transform h-7 w-7 sm:h-10 sm:w-10 flex-shrink-0"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
