import { useState } from "react";

const PRODUCT_CATEGORIES = [
  "Pod",
  "Liquid",
  "Coil",
  "Device",
  "Aksesori",
  "Baterai",
  "Charger",
  "Cotton",
];

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Image as ImageIcon,
  Search,
  ScanBarcode,
  ChevronRight,
  Boxes,
  AlertCircle,
} from "lucide-react";
import { useProducts, Product } from "@/hooks/useProducts";

export const InventoryManager = () => {
  const { products, addProduct, updateProduct, deleteProduct, uploadImage } = useProducts();
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    barcode: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [customCategory, setCustomCategory] = useState(false);

  const resetForm = () => {
    setFormData({ name: "", price: "", stock: "", category: "", barcode: "" });
    setCustomCategory(false);
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock || !formData.category) return;
    setUploading(true);
    try {
      let imageUrl = editingProduct?.image_url || null;
      if (imageFile) imageUrl = await uploadImage(imageFile);
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        barcode: formData.barcode || null,
        image_url: imageUrl,
      };
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await addProduct(productData);
      }
      setIsOpen(false);
      resetForm();
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setCustomCategory(!PRODUCT_CATEGORIES.includes(product.category));
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      barcode: product.barcode || "",
    });
    setImagePreview(product.image_url || null);
    setIsOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await deleteProduct(deleteId);
      setDeleteId(null);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode || "").includes(searchQuery)
  );

  const lowStockCount = products.filter((p) => p.stock < 5).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Boxes className="w-5 h-5 text-primary" />
            Manajemen Stok
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {products.length} produk terdaftar
            {lowStockCount > 0 && (
              <span className="ml-2 text-amber-500 font-medium">
                · {lowStockCount} stok hampir habis
              </span>
            )}
          </p>
        </div>
        <Button
          onClick={() => { resetForm(); setIsOpen(true); }}
          className="w-full sm:w-auto gap-2 font-semibold shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          Tambah Produk
        </Button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama, kategori, atau barcode..."
          className="pl-10 h-11 bg-secondary/30 border-border/50 focus:border-primary transition-all rounded-xl"
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Produk", value: products.length, color: "text-primary" },
          { label: "Stok Aman", value: products.filter((p) => p.stock >= 5).length, color: "text-emerald-500" },
          { label: "Stok Menipis", value: lowStockCount, color: "text-amber-500" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-secondary/30 rounded-xl p-3 text-center border border-border/30"
          >
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground rounded-2xl border border-dashed border-border/50 bg-secondary/10">
          <Package className="w-14 h-14 mb-3 opacity-30" />
          <p className="font-medium text-sm">
            {searchQuery ? "Produk tidak ditemukan" : "Belum ada produk"}
          </p>
          <p className="text-xs mt-1 opacity-70">
            {searchQuery ? "Coba kata kunci lain" : "Klik 'Tambah Produk' untuk memulai"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 cursor-pointer"
              onClick={() => handleEdit(product)}
            >
              {/* Product image */}
              <div className="w-14 h-14 rounded-xl bg-secondary overflow-hidden flex items-center justify-center flex-shrink-0 border border-border/30">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                  <p className="font-bold text-sm text-primary whitespace-nowrap">
                    Rp {product.price.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  {product.stock < 5 ? (
                    <Badge variant="destructive" className="text-[10px] px-2 py-0 h-5 gap-1">
                      <AlertCircle className="w-2.5 h-2.5" />
                      Stok: {product.stock}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5">
                      Stok: {product.stock}
                    </Badge>
                  )}
                  {product.barcode && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <ScanBarcode className="w-3 h-3" />
                      {product.barcode}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); setDeleteId(product.id); }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Sheet */}
      <Sheet open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md p-0 flex flex-col"
        >
          {/* Sheet Header */}
          <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-border/40">
            <SheetHeader>
              <SheetTitle className="text-lg font-bold flex items-center gap-2">
                {editingProduct ? (
                  <><Edit className="w-5 h-5 text-primary" /> Edit Produk</>
                ) : (
                  <><Plus className="w-5 h-5 text-primary" /> Tambah Produk Baru</>
                )}
              </SheetTitle>
              <p className="text-sm text-muted-foreground">
                {editingProduct ? "Perbarui informasi produk" : "Isi detail produk yang ingin ditambahkan"}
              </p>
            </SheetHeader>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Image Upload */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Foto Produk</Label>
                {imagePreview ? (
                  <div className="relative w-full h-44 bg-secondary rounded-2xl overflow-hidden border border-border/40">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border/60 rounded-2xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                        <ImageIcon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                        Klik untuk upload foto
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">PNG, JPG (maks. 2MB)</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                )}
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="inv-name" className="text-sm font-medium">
                  Nama Produk <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="inv-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Pod Liquid Mint 30ml"
                  className="h-11 rounded-xl bg-secondary/30 border-border/50 focus:border-primary"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Kategori <span className="text-destructive">*</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <label
                      key={cat}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        formData.category === cat
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.category === cat}
                        onChange={() => setFormData({ ...formData, category: cat })}
                        className="sr-only"
                      />
                      {cat}
                    </label>
                  ))}
                  {customCategory && (
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Kategori custom"
                      className="h-9 w-40 rounded-xl bg-secondary/30 border-border/50 focus:border-primary text-sm"
                      autoFocus
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCustomCategory(!customCategory);
                    if (!customCategory) setFormData({ ...formData, category: "" });
                  }}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors mt-1"
                >
                  {customCategory ? "Pilih dari daftar" : "Kategori lain"}
                </button>
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="inv-price" className="text-sm font-medium">
                    Harga (Rp) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="inv-price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="50000"
                    className="h-11 rounded-xl bg-secondary/30 border-border/50 focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inv-stock" className="text-sm font-medium">
                    Jumlah Stok <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="inv-stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="10"
                    className="h-11 rounded-xl bg-secondary/30 border-border/50 focus:border-primary"
                    required
                  />
                </div>
              </div>

              {/* Barcode */}
              <div className="space-y-1.5">
                <Label htmlFor="inv-barcode" className="text-sm font-medium flex items-center gap-1.5">
                  <ScanBarcode className="w-3.5 h-3.5 text-muted-foreground" />
                  Barcode
                  <span className="text-xs text-muted-foreground font-normal">(Opsional)</span>
                </Label>
                <Input
                  id="inv-barcode"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="1234567890"
                  className="h-11 rounded-xl bg-secondary/30 border-border/50 focus:border-primary font-mono"
                />
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-border/40 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11 rounded-xl"
                onClick={() => { setIsOpen(false); resetForm(); }}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 rounded-xl font-semibold gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : editingProduct ? (
                  <><Edit className="w-4 h-4" /> Simpan Perubahan</>
                ) : (
                  <><Plus className="w-4 h-4" /> Tambah Produk</>
                )}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-2">
              <Trash2 className="w-6 h-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center">Hapus Produk?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Produk yang dihapus tidak bisa dikembalikan lagi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:flex-row gap-2">
            <AlertDialogCancel className="flex-1 rounded-xl m-0">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="flex-1 rounded-xl bg-destructive hover:bg-destructive/90 m-0"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
