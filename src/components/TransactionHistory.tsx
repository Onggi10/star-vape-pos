import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { History, Receipt, CalendarIcon, X } from "lucide-react";
import { useTransactions, Transaction } from "@/hooks/useTransactions";
import { format, isSameDay, isSameMonth, isSameYear } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";

type FilterMode = "all" | "date" | "month" | "year";

export const TransactionHistory = () => {
  const { transactions, loading } = useTransactions();
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  // Get available years from transactions
  const availableYears = useMemo(() => {
    const years = new Set(
      transactions.map((t) => new Date(t.created_at).getFullYear())
    );
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  // Get available months
  const months = [
    { value: "0", label: "Januari" },
    { value: "1", label: "Februari" },
    { value: "2", label: "Maret" },
    { value: "3", label: "April" },
    { value: "4", label: "Mei" },
    { value: "5", label: "Juni" },
    { value: "6", label: "Juli" },
    { value: "7", label: "Agustus" },
    { value: "8", label: "September" },
    { value: "9", label: "Oktober" },
    { value: "10", label: "November" },
    { value: "11", label: "Desember" },
  ];

  // Filter transactions based on selected filter
  const filteredTransactions = useMemo(() => {
    if (filterMode === "all") return transactions;

    return transactions.filter((t) => {
      const transactionDate = new Date(t.created_at);

      if (filterMode === "date" && selectedDate) {
        return isSameDay(transactionDate, selectedDate);
      }

      if (filterMode === "month" && selectedMonth && selectedYear) {
        return (
          transactionDate.getMonth() === parseInt(selectedMonth) &&
          transactionDate.getFullYear() === parseInt(selectedYear)
        );
      }

      if (filterMode === "year" && selectedYear) {
        return transactionDate.getFullYear() === parseInt(selectedYear);
      }

      return true;
    });
  }, [transactions, filterMode, selectedDate, selectedMonth, selectedYear]);

  const clearFilter = () => {
    setFilterMode("all");
    setSelectedDate(undefined);
    setSelectedMonth("");
    setSelectedYear("");
  };

  const getPaymentMethodBadge = (method: string) => {
    const variants: Record<string, any> = {
      cash: "default",
      qris: "secondary",
      transfer: "outline",
    };
    return variants[method] || "default";
  };

  const getTotalByDate = (date: string) => {
    const dayTransactions = filteredTransactions.filter(
      (t) => format(new Date(t.created_at), "yyyy-MM-dd") === date
    );
    return dayTransactions.reduce((sum, t) => sum + Number(t.total), 0);
  };

  const groupedTransactions = filteredTransactions.reduce(
    (acc: Record<string, Transaction[]>, transaction) => {
      const date = format(new Date(transaction.created_at), "yyyy-MM-dd");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    },
    {}
  );

  const totalFiltered = filteredTransactions.reduce(
    (sum, t) => sum + Number(t.total),
    0
  );

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-secondary rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-secondary rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            Riwayat Transaksi
          </h2>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filterMode}
            onValueChange={(value: FilterMode) => {
              setFilterMode(value);
              setSelectedDate(undefined);
              setSelectedMonth("");
              setSelectedYear("");
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="date">Tanggal</SelectItem>
              <SelectItem value="month">Bulan</SelectItem>
              <SelectItem value="year">Tahun</SelectItem>
            </SelectContent>
          </Select>

          {filterMode === "date" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[160px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate
                    ? format(selectedDate, "dd/MM/yyyy")
                    : "Pilih tanggal"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                  locale={idLocale}
                />
              </PopoverContent>
            </Popover>
          )}

          {filterMode === "month" && (
            <>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Bulan" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Tahun" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}

          {filterMode === "year" && (
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {filterMode !== "all" && (
            <Button variant="ghost" size="icon" onClick={clearFilter}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Total Summary */}
      {filterMode !== "all" && filteredTransactions.length > 0 && (
        <div className="mb-4 p-3 bg-primary/10 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Total {filteredTransactions.length} transaksi
            </span>
            <span className="font-bold text-primary">
              Rp {totalFiltered.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      )}

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">
            {filterMode === "all"
              ? "Belum ada transaksi"
              : "Tidak ada transaksi pada periode ini"}
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {Object.entries(groupedTransactions).map(
              ([date, dayTransactions]) => (
                <div key={date}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">
                      {format(new Date(date), "EEEE, dd MMMM yyyy", {
                        locale: idLocale,
                      })}
                    </h3>
                    <Badge variant="outline" className="text-primary w-fit">
                      Total: Rp {getTotalByDate(date).toLocaleString("id-ID")}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {dayTransactions.map((transaction) => (
                      <Card
                        key={transaction.id}
                        className="p-3 sm:p-4 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-mono text-xs sm:text-sm text-muted-foreground">
                              {transaction.transaction_number}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(
                                new Date(transaction.created_at),
                                "HH:mm:ss"
                              )}
                            </p>
                          </div>
                          <Badge
                            variant={getPaymentMethodBadge(
                              transaction.payment_method
                            )}
                          >
                            {transaction.payment_method.toUpperCase()}
                          </Badge>
                        </div>

                        {transaction.items && transaction.items.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {transaction.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex justify-between text-xs sm:text-sm"
                              >
                                <span className="text-muted-foreground">
                                  {item.quantity}x {item.product_name}
                                </span>
                                <span className="text-foreground">
                                  Rp {item.subtotal.toLocaleString("id-ID")}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        <Separator className="my-2" />

                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-foreground text-sm">
                            Total
                          </span>
                          <span className="text-base sm:text-lg font-bold text-primary">
                            Rp{" "}
                            {Number(transaction.total).toLocaleString("id-ID")}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
};
