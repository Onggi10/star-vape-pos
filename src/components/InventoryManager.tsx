import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { Product } from "@/types/product";
import { useToast } from "@/hooks/use-toast";

interface InventoryManagerProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, "id">) => void;
  onUpdateProduct: (id: string, product: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
}

export const InventoryManager = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}: InventoryManagerProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
  });

  const resetForm = () => {
    setFormData({ name: "", price: "", stock: "", category: "" });
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.stock || !formData.category) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive",
      });
      return;
    }

    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category: formData.category,
    };

    if (editingProduct) {
      onUpdateProduct(editingProduct.id, productData);
      toast({
        title: "Berhasil",
        description: "Produk berhasil diupdate",
      });
    } else {
      onAddProduct(productData);
      toast({
        title: "Berhasil",
        description: "Produk berhasil ditambahkan",
      });
    }

    setIsOpen(false);
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
    });
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Yakin ingin menghapus produk ini?")) {
      onDeleteProduct(id);
      toast({
        title: "Berhasil",
        description: "Produk berhasil dihapus",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Manajemen Stok</h2>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Produk
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Produk</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Pod Liquid Mint"
                />
              </div>
              <div>
                <Label htmlFor="category">Kategori</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Contoh: Pod, Liquid, Coil"
                />
              </div>
              <div>
                <Label htmlFor="price">Harga (Rp)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="50000"
                />
              </div>
              <div>
                <Label htmlFor="stock">Stok</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="10"
                />
              </div>
              <Button type="submit" className="w-full">
                {editingProduct ? "Update Produk" : "Tambah Produk"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Produk</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Harga</TableHead>
              <TableHead className="text-right">Stok</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Belum ada produk. Tambahkan produk pertama Anda!
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">
                    Rp {product.price.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={product.stock < 5 ? "text-destructive font-semibold" : ""}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
