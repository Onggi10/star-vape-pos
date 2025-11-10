import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { History, Receipt } from "lucide-react";
import { useTransactions, Transaction } from "@/hooks/useTransactions";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const TransactionHistory = () => {
  const { transactions, loading } = useTransactions();

  const getPaymentMethodBadge = (method: string) => {
    const variants: Record<string, any> = {
      cash: "default",
      qris: "secondary",
      transfer: "outline",
    };
    return variants[method] || "default";
  };

  const getTotalByDate = (date: string) => {
    const dayTransactions = transactions.filter(
      (t) => format(new Date(t.created_at), "yyyy-MM-dd") === date
    );
    return dayTransactions.reduce((sum, t) => sum + Number(t.total), 0);
  };

  const groupedTransactions = transactions.reduce((acc: Record<string, Transaction[]>, transaction) => {
    const date = format(new Date(transaction.created_at), "yyyy-MM-dd");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {});

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
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <History className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Riwayat Transaksi</h2>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Belum ada transaksi</p>
        </div>
      ) : (
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
              <div key={date}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-foreground">
                    {format(new Date(date), "EEEE, dd MMMM yyyy", { locale: idLocale })}
                  </h3>
                  <Badge variant="outline" className="text-primary">
                    Total: Rp {getTotalByDate(date).toLocaleString("id-ID")}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {dayTransactions.map((transaction) => (
                    <Card key={transaction.id} className="p-4 hover:bg-secondary/50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-mono text-sm text-muted-foreground">
                            {transaction.transaction_number}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(transaction.created_at), "HH:mm:ss")}
                          </p>
                        </div>
                        <Badge variant={getPaymentMethodBadge(transaction.payment_method)}>
                          {transaction.payment_method.toUpperCase()}
                        </Badge>
                      </div>

                      {transaction.items && transaction.items.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {transaction.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
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
                        <span className="font-semibold text-foreground">Total</span>
                        <span className="text-lg font-bold text-primary">
                          Rp {Number(transaction.total).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
};
