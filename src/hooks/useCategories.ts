import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense";
  is_default: boolean;
  created_at: string;
}

export function useCategories(type?: "income" | "expense") {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["categories", user?.id, type],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("name");

      if (type) {
        query = query.eq("type", type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Category[];
    },
    enabled: !!user,
  });
}

export function useCategoryStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["categories", "stats", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from("transactions")
        .select(`
          amount,
          type,
          category:categories(id, name, icon, color)
        `)
        .eq("user_id", user.id)
        .eq("type", "expense")
        .gte("date", startOfMonth)
        .lte("date", endOfMonth);

      if (error) throw error;

      // Group by category
      const categoryMap = new Map<string, { name: string; value: number; color: string }>();
      
      data.forEach((t: any) => {
        const categoryName = t.category?.name || "Sem categoria";
        const categoryColor = t.category?.color || "#6B7280";
        const existing = categoryMap.get(categoryName);
        
        if (existing) {
          existing.value += Number(t.amount);
        } else {
          categoryMap.set(categoryName, {
            name: categoryName,
            value: Number(t.amount),
            color: categoryColor,
          });
        }
      });

      return Array.from(categoryMap.values())
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    },
    enabled: !!user,
  });
}
