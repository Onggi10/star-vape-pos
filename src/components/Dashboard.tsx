import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, DollarSign, ShoppingCart, Package } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { useProducts } from "@/hooks/useProducts";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const Dashboard = () => {
  const { transactions } = useTransactions();
  const { products } = useProducts();

  // Calculate stats
  const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.total), 0);
  const totalTransactions = transactions.length;
  const lowStockProducts = products.filter((p) => p.stock < 5).length;

  // Get current month data
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const dailySales = daysInMonth.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayTransactions = transactions.filter(
      (t) => format(new Date(t.created_at), "yyyy-MM-dd") === dayStr
    );
    const total = dayTransactions.reduce((sum, t) => sum + Number(t.total), 0);
    return {
      date: format(day, "dd MMM", { locale: idLocale }),
      total,
    };
  });

  // Top products
  const productSales: Record<string, { name: string; total: number; quantity: number }> = {};
  transactions.forEach((transaction) => {
    transaction.items?.forEach((item) => {
      if (!productSales[item.product_id]) {
        productSales[item.product_id] = {
          name: item.product_name,
          total: 0,
          quantity: 0,
        };
      }
      productSales[item.product_id].total += Number(item.subtotal);
      productSales[item.product_id].quantity += item.quantity;
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "#8884d8", "#82ca9d"];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">
                Rp {totalRevenue.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Transaksi</p>
              <p className="text-2xl font-bold text-foreground">{totalTransactions}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/50 rounded-lg">
              <Package className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Produk</p>
              <p className="text-2xl font-bold text-foreground">{products.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-destructive/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stok Rendah</p>
              <p className="text-2xl font-bold text-foreground">{lowStockProducts}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Penjualan Bulan Ini
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Produk Terlaris
          </h3>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topProducts}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => entry.name}
                >
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: any) => `Rp ${Number(value).toLocaleString("id-ID")}`}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Belum ada data penjualan
            </div>
          )}
        </Card>
      </div>

      {/* Top Products Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Top 5 Produk</h3>
        <div className="space-y-3">
          {topProducts.map((product, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-primary text-lg">#{index + 1}</span>
                <div>
                  <p className="font-medium text-foreground">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.quantity} terjual</p>
                </div>
              </div>
              <p className="font-semibold text-primary">
                Rp {product.total.toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
