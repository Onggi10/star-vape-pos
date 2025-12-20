import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CartItem } from "@/types/product";

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  transaction_number: string;
  total: number;
  payment_method: string;
  created_at: string;
  shift_id?: string | null;
  items?: TransactionItem[];
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          transaction_items (*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const formattedData = data.map((t: any) => ({
        ...t,
        items: t.transaction_items,
      }));
      
      setTransactions(formattedData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const createTransaction = async (
    items: CartItem[],
    total: number,
    paymentMethod: string,
    shiftId?: string | null
  ) => {
    try {
      const transactionNumber = `TRX${Date.now()}`;

      // Create transaction
      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .insert([
          {
            transaction_number: transactionNumber,
            total,
            payment_method: paymentMethod,
            shift_id: shiftId || null,
          },
        ])
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Create transaction items
      const transactionItems = items.map((item) => ({
        transaction_id: transaction.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("transaction_items")
        .insert(transactionItems);

      if (itemsError) throw itemsError;

      // Update product stock
      for (const item of items) {
        // Get current product stock
        const { data: product } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.id)
          .single();
        
        if (product) {
          await supabase
            .from("products")
            .update({ stock: product.stock - item.quantity })
            .eq("id", item.id);
        }
      }

      await fetchTransactions();

      toast({
        title: "Transaksi Berhasil",
        description: `Nomor transaksi: ${transactionNumber}`,
      });

      return { ...transaction, transaction_number: transactionNumber };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    transactions,
    loading,
    createTransaction,
    refetch: fetchTransactions,
  };
};
