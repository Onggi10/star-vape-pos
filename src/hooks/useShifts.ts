import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Shift {
  id: string;
  opened_at: string;
  closed_at: string | null;
  opening_cash: number;
  closing_cash: number | null;
  expected_cash: number | null;
  total_sales: number;
  total_transactions: number;
  notes: string | null;
  status: "open" | "closed";
  created_at: string;
}

export const useShifts = () => {
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCurrentShift = async () => {
    try {
      const { data, error } = await supabase
        .from("shifts")
        .select("*")
        .eq("status", "open")
        .order("opened_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setCurrentShift(data as Shift | null);
    } catch (error: any) {
      console.error("Error fetching current shift:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShifts = async () => {
    try {
      const { data, error } = await supabase
        .from("shifts")
        .select("*")
        .order("opened_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setShifts((data as Shift[]) || []);
    } catch (error: any) {
      console.error("Error fetching shifts:", error);
    }
  };

  useEffect(() => {
    fetchCurrentShift();
    fetchShifts();
  }, []);

  const openShift = async (openingCash: number) => {
    try {
      // Check if there's already an open shift
      if (currentShift) {
        toast({
          title: "Error",
          description: "Sudah ada shift yang sedang berjalan. Tutup shift terlebih dahulu.",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from("shifts")
        .insert([
          {
            opening_cash: openingCash,
            status: "open",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setCurrentShift(data as Shift);
      await fetchShifts();

      toast({
        title: "Shift Dibuka",
        description: `Shift dibuka dengan modal awal Rp ${openingCash.toLocaleString("id-ID")}`,
      });

      return data as Shift;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const closeShift = async (closingCash: number, notes?: string) => {
    try {
      if (!currentShift) {
        toast({
          title: "Error",
          description: "Tidak ada shift yang sedang berjalan.",
          variant: "destructive",
        });
        return null;
      }

      // Calculate expected cash and totals from transactions
      const { data: transactions, error: txError } = await supabase
        .from("transactions")
        .select("total, payment_method")
        .eq("shift_id", currentShift.id);

      if (txError) throw txError;

      const totalSales = transactions?.reduce((sum, tx) => sum + Number(tx.total), 0) || 0;
      const cashSales = transactions?.filter(tx => tx.payment_method === "cash")
        .reduce((sum, tx) => sum + Number(tx.total), 0) || 0;
      const expectedCash = currentShift.opening_cash + cashSales;

      const { data, error } = await supabase
        .from("shifts")
        .update({
          closed_at: new Date().toISOString(),
          closing_cash: closingCash,
          expected_cash: expectedCash,
          total_sales: totalSales,
          total_transactions: transactions?.length || 0,
          notes: notes || null,
          status: "closed",
        })
        .eq("id", currentShift.id)
        .select()
        .single();

      if (error) throw error;

      setCurrentShift(null);
      await fetchShifts();

      const difference = closingCash - expectedCash;
      const differenceText = difference === 0 
        ? "Kas sesuai" 
        : difference > 0 
          ? `Lebih Rp ${difference.toLocaleString("id-ID")}` 
          : `Kurang Rp ${Math.abs(difference).toLocaleString("id-ID")}`;

      toast({
        title: "Shift Ditutup",
        description: `Total penjualan: Rp ${totalSales.toLocaleString("id-ID")}. ${differenceText}`,
      });

      return data as Shift;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    currentShift,
    shifts,
    loading,
    openShift,
    closeShift,
    refetch: fetchCurrentShift,
  };
};
