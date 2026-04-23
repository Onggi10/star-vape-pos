import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, DollarSign, ShoppingCart, Package, Users } from "lucide-react";
import { format, startOfDay, endOfDay } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useTransactions } from "@/hooks/useTransactions";

interface CashierProfile {
  user_id: string;
  full_name: string;
}

interface ShiftRow {
  id: string;
  user_id: string | null;
}

export const DailyReport = () => {
  const [date, setDate] = useState<Date>(new Date());
  const { transactions, loading } = useTransactions();
  const [profiles, setProfiles] = useState<CashierProfile[]>([]);
  const [shifts, setShifts] = useState<ShiftRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name"),
        supabase.from("shifts").select("id, user_id"),
      ]);
      setProfiles(p || []);
      setShifts((s as ShiftRow[]) || []);
    };
    load();
  }, []);

  const report = useMemo(() => {
    const dayStart = startOfDay(date).getTime();
    const dayEnd = endOfDay(date).getTime();

    const dayTx = transactions.filter((t) => {
      const ts = new Date(t.created_at).getTime();
      return ts >= dayStart && ts <= dayEnd;
    });

    const shiftMap = new Map(shifts.map((s) => [s.id, s.user_id]));
    const nameMap = new Map(profiles.map((p) => [p.user_id, p.full_name]));

    const perCashier = new Map<
      string,
      { name: string; transactions: number; itemsSold: number; revenue: number }
    >();

    let totalRevenue = 0;
    let totalItems = 0;

    dayTx.forEach((t) => {
      const userId = t.shift_id ? shiftMap.get(t.shift_id) ?? null : null;
      const key = userId ?? "unknown";
      const name = userId ? nameMap.get(userId) ?? "Tanpa Nama" : "Tanpa Kasir";

      const itemsCount = (t.items || []).reduce((s, i) => s + i.quantity, 0);
      const revenue = Number(t.total);

      totalRevenue += revenue;
      totalItems += itemsCount;

      const prev = perCashier.get(key) ?? {
        name,
        transactions: 0,
        itemsSold: 0,
        revenue: 0,
      };
      prev.transactions += 1;
      prev.itemsSold += itemsCount;
      prev.revenue += revenue;
      perCashier.set(key, prev);
    });

    return {
      totalTransactions: dayTx.length,
      totalItems,
      totalRevenue,
      cashiers: Array.from(perCashier.values()).sort((a, b) => b.revenue - a.revenue),
    };
  }, [transactions, shifts, profiles, date]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-foreground">Laporan Penjualan Harian</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Ringkasan transaksi dan omzet per kasir
          </p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full sm:w-[260px] justify-start text-left font-normal")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, "EEEE, dd MMMM yyyy", { locale: idLocale })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card className="p-3 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
              <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-sm text-muted-foreground">Total Omzet</p>
              <p className="text-sm sm:text-2xl font-bold text-foreground truncate">
                Rp {report.totalRevenue.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="p-2 sm:p-3 bg-accent/10 rounded-lg">
              <ShoppingCart className="w-4 h-4 sm:w-6 sm:h-6 text-accent" />
            </div>
            <div>
              <p className="text-[10px] sm:text-sm text-muted-foreground">Total Transaksi</p>
              <p className="text-sm sm:text-2xl font-bold text-foreground">
                {report.totalTransactions}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="p-2 sm:p-3 bg-secondary/50 rounded-lg">
              <Package className="w-4 h-4 sm:w-6 sm:h-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-[10px] sm:text-sm text-muted-foreground">Total Item Terjual</p>
              <p className="text-sm sm:text-2xl font-bold text-foreground">{report.totalItems}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
              <Users className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] sm:text-sm text-muted-foreground">Kasir Aktif</p>
              <p className="text-sm sm:text-2xl font-bold text-foreground">
                {report.cashiers.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Per cashier table */}
      <Card className="p-3 sm:p-6">
        <h3 className="text-sm sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
          Rincian per Kasir
        </h3>
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-6">Memuat data...</p>
        ) : report.cashiers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Tidak ada transaksi pada tanggal ini
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kasir</TableHead>
                  <TableHead className="text-right">Transaksi</TableHead>
                  <TableHead className="text-right">Item Terjual</TableHead>
                  <TableHead className="text-right">Omzet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.cashiers.map((c, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-right">{c.transactions}</TableCell>
                    <TableCell className="text-right">{c.itemsSold}</TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      Rp {c.revenue.toLocaleString("id-ID")}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-secondary/30 font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">{report.totalTransactions}</TableCell>
                  <TableCell className="text-right">{report.totalItems}</TableCell>
                  <TableCell className="text-right text-primary">
                    Rp {report.totalRevenue.toLocaleString("id-ID")}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};
