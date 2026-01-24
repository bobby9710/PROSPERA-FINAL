import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { useCallback } from "react";

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  credit_card_id: string | null;
  description: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  payment_method: string | null;
  notes: string | null;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  } | null;
}

export interface CreateTransactionData {
  description: string;
  amount: number;
  type: "income" | "expense";
  category_id?: string;
  credit_card_id?: string;
  date?: string;
  payment_method?: string;
  notes?: string;
  is_recurring?: boolean;
}

export function useTransactions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          category:categories(id, name, icon, color)
        `)
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
  });
}

export function useRecentTransactions(limit: number = 5) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["transactions", "recent", user?.id, limit],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          category:categories(id, name, icon, color)
        `)
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
  });
}

export function useTransactionStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["transactions", "stats", user?.id],
    queryFn: async () => {
      if (!user) return { totalIncome: 0, totalExpense: 0, balance: 0 };
      
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from("transactions")
        .select("amount, type")
        .eq("user_id", user.id)
        .gte("date", startOfMonth)
        .lte("date", endOfMonth);

      if (error) throw error;

      const totalIncome = data
        .filter(t => t.type === "income")
        .reduce((acc, t) => acc + Number(t.amount), 0);
      
      const totalExpense = data
        .filter(t => t.type === "expense")
        .reduce((acc, t) => acc + Number(t.amount), 0);

      return {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
      };
    },
    enabled: !!user,
  });
}

export function useMonthlyChartData(months: number = 6) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["transactions", "chart", user?.id, months],
    queryFn: async () => {
      if (!user) return [];
      
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
      
      const { data, error } = await supabase
        .from("transactions")
        .select("amount, type, date")
        .eq("user_id", user.id)
        .gte("date", startDate.toISOString().split('T')[0])
        .order("date");

      if (error) throw error;

      // Group by month
      const monthlyData = new Map<string, { receitas: number; despesas: number }>();
      
      // Initialize all months
      for (let i = 0; i < months; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - months + 1 + i, 1);
        const key = date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
        const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
        monthlyData.set(capitalizedKey, { receitas: 0, despesas: 0 });
      }

      // Fill with real data
      data.forEach((t) => {
        const date = new Date(t.date);
        const key = date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
        const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
        const existing = monthlyData.get(capitalizedKey);
        
        if (existing) {
          if (t.type === "income") {
            existing.receitas += Number(t.amount);
          } else {
            existing.despesas += Number(t.amount);
          }
        }
      });

      return Array.from(monthlyData.entries()).map(([month, values]) => ({
        month,
        ...values,
      }));
    },
    enabled: !!user,
  });
}

export function useCreateTransaction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateTransactionData) => {
      if (!user) throw new Error("User not authenticated");

      // First, check for automation rules
      const { data: automationRules } = await supabase
        .from("automation_rules")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true);

      let categoryId = data.category_id;
      let appliedAutomation: string | null = null;

      // Apply automation rules
      if (automationRules && automationRules.length > 0) {
        for (const rule of automationRules) {
          let shouldApply = false;

          switch (rule.trigger_type) {
            case "description_contains":
              if (rule.trigger_value && data.description.toLowerCase().includes(rule.trigger_value.toLowerCase())) {
                shouldApply = true;
              }
              break;
            case "amount_greater":
              if (rule.trigger_value && data.amount > parseFloat(rule.trigger_value)) {
                shouldApply = true;
              }
              break;
            case "new_transaction":
              shouldApply = true;
              break;
          }

          if (shouldApply && rule.action_type === "change_category" && rule.action_value) {
            categoryId = rule.action_value;
            appliedAutomation = rule.name;
            break; // Apply first matching rule
          }
        }
      }

      // Sanitize data: convert empty strings to null/undefined for UUID fields
      const sanitizedData = {
        ...data,
        category_id: categoryId && categoryId.trim() !== "" ? categoryId : null,
        credit_card_id: data.credit_card_id && data.credit_card_id.trim() !== "" ? data.credit_card_id : null,
        payment_method: data.payment_method && data.payment_method.trim() !== "" ? data.payment_method : null,
        notes: data.notes && data.notes.trim() !== "" ? data.notes : null,
      };

      const { data: transaction, error } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          ...sanitizedData,
          date: sanitizedData.date || new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;
      return { transaction, appliedAutomation };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      if (result.appliedAutomation) {
        toast({
          title: "Transação criada!",
          description: `Automação "${result.appliedAutomation}" aplicada automaticamente.`,
        });
      } else {
        toast({
          title: "Transação criada!",
          description: "Sua transação foi salva com sucesso.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar transação",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast({
        title: "Transação excluída",
        description: "A transação foi removida com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir transação",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateTransactionData> }) => {
      const { error } = await supabase
        .from("transactions")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast({
        title: "Transação atualizada",
        description: "A transação foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar transação",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useCardTransactions(cardId: string | null, month?: number, year?: number) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["transactions", "card", cardId, month, year, user?.id],
    queryFn: async () => {
      if (!user || !cardId) return [];
      
      const now = new Date();
      const targetMonth = month ?? now.getMonth();
      const targetYear = year ?? now.getFullYear();
      
      const startOfMonth = new Date(targetYear, targetMonth, 1).toISOString().split('T')[0];
      const endOfMonth = new Date(targetYear, targetMonth + 1, 0).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          category:categories(id, name, icon, color)
        `)
        .eq("user_id", user.id)
        .eq("credit_card_id", cardId)
        .gte("date", startOfMonth)
        .lte("date", endOfMonth)
        .order("date", { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user && !!cardId,
  });
}
