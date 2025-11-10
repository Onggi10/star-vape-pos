import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package } from "lucide-react";
import { Product } from "@/types/product";

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
        {product.image ? (
          <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
        ) : (
          <Package className="w-16 h-16 text-muted-foreground" />
        )}
        {isLowStock && !isOutOfStock && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            Stok Rendah
          </Badge>
        )}
        {isOutOfStock && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            Habis
          </Badge>
        )}
      </div>
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
          <p className="text-sm text-muted-foreground">{product.category}</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-bold text-primary">
              Rp {product.price.toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-muted-foreground">Stok: {product.stock}</p>
          </div>
          <Button
            size="icon"
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            className="group-hover:scale-110 transition-transform"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
