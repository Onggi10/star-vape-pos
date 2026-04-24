import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  created_at: string;
}

// Normalize phone to international format (62...) without +
export const normalizePhone = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  if (digits.startsWith("8")) return "62" + digits;
  return digits;
};

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const createCustomer = async (name: string, phone: string): Promise<Customer> => {
    const normalized = normalizePhone(phone);
    if (!normalized || normalized.length < 9) {
      throw new Error("Nomor HP tidak valid");
    }
    if (!name.trim()) {
      throw new Error("Nama wajib diisi");
    }

    // Check if exists
    const { data: existing } = await supabase
      .from("customers")
      .select("*")
      .eq("phone", normalized)
      .maybeSingle();

    if (existing) {
      await fetchCustomers();
      return existing as Customer;
    }

    const { data, error } = await supabase
      .from("customers")
      .insert({ name: name.trim(), phone: normalized })
      .select()
      .single();

    if (error) throw error;
    await fetchCustomers();
    toast({ title: "Customer ditambahkan", description: `${name} (${normalized})` });
    return data as Customer;
  };

  return { customers, loading, createCustomer, refetch: fetchCustomers };
};
