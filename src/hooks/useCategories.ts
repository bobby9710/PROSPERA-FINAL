import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { getLocalDateString } from "@/lib/date-utils";

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

export interface CreateCategoryData {
  name: string;
  icon?: string;
  color?: string;
  type: "income" | "expense";
  is_default?: boolean;
}

export interface UpdateCategoryData {
  id: string;
  name?: string;
  icon?: string;
  color?: string;
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

export function useCategoryStats(month?: number, year?: number) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["categories", "stats", user?.id, month, year],
    queryFn: async () => {
      if (!user) return [];
      
      const now = new Date();
      const targetMonth = month ?? now.getMonth();
      const targetYear = year ?? now.getFullYear();

      const startOfMonth = getLocalDateString(new Date(targetYear, targetMonth, 1));
      const endOfMonth = getLocalDateString(new Date(targetYear, targetMonth + 1, 0));

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

export function useCreateCategory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCategoryData) => {
      if (!user) throw new Error("User not authenticated");

      const { data: category, error } = await supabase
        .from("categories")
        .insert({
          user_id: user.id,
          name: data.name,
          icon: data.icon || "📦",
          color: data.color || "#8B5CF6",
          type: data.type,
          is_default: false,
        })
        .select()
        .single();

      if (error) throw error;
      return category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCategoryData) => {
      const { id, ...updateData } = data;
      
      const { data: category, error } = await supabase
        .from("categories")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
export function useSeedCategories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const defaultCategories = [
        // Receitas
        { user_id: user.id, name: "Salário", icon: "salary.svg", color: "#10B981", type: "income", is_default: true },
        { user_id: user.id, name: "Investimentos", icon: "earning_investments.svg", color: "#3B82F6", type: "income", is_default: true },
        { user_id: user.id, name: "Empréstimos", icon: "loans.svg", color: "#8B5CF6", type: "income", is_default: true },
        { user_id: user.id, name: "Outros", icon: "other_earnings.svg", color: "#6B7280", type: "income", is_default: true },
        
        // Despesas (Conforme a imagem enviada)
        { user_id: user.id, name: "Alimentação", icon: "food.svg", color: "#F06292", type: "expense", is_default: true },
        { user_id: user.id, name: "Assinaturas e serviços", icon: "subscriptions_and_services.svg", color: "#7986CB", type: "expense", is_default: true },
        { user_id: user.id, name: "Bares e restaurantes", icon: "bars_and_restaurants.svg", color: "#5C6BC0", type: "expense", is_default: true },
        { user_id: user.id, name: "Casa", icon: "home.svg", color: "#64B5F6", type: "expense", is_default: true },
        { user_id: user.id, name: "Compras", icon: "shopping.svg", color: "#D81B60", type: "expense", is_default: true },
        { user_id: user.id, name: "Cuidados pessoais", icon: "personal_care.svg", color: "#FF7043", type: "expense", is_default: true },
        { user_id: user.id, name: "Dívidas e empréstimos", icon: "debts_and_loans.svg", color: "#FF8A80", type: "expense", is_default: true },
        { user_id: user.id, name: "Educação", icon: "education.svg", color: "#3F51B5", type: "expense", is_default: true },
        { user_id: user.id, name: "Família e filhos", icon: "family_and_children.svg", color: "#66BB6A", type: "expense", is_default: true },
        { user_id: user.id, name: "Impostos e Taxas", icon: "taxes.svg", color: "#FFAB91", type: "expense", is_default: true },
        { user_id: user.id, name: "Investimentos", icon: "investments.svg", color: "#F48FB1", type: "expense", is_default: true },
        { user_id: user.id, name: "Lazer e hobbies", icon: "entertainment.svg", color: "#43A047", type: "expense", is_default: true },
        { user_id: user.id, name: "Mercado", icon: "groceries.svg", color: "#FF8A65", type: "expense", is_default: true },
        { user_id: user.id, name: "Outros", icon: "other.svg", color: "#90A4AE", type: "expense", is_default: true },
        { user_id: user.id, name: "Pets", icon: "pets.svg", color: "#FFB74D", type: "expense", is_default: true },
        { user_id: user.id, name: "Presentes e doações", icon: "gifts_and_donations.svg", color: "#3949AB", type: "expense", is_default: true },
        { user_id: user.id, name: "Roupas", icon: "clothing.svg", color: "#BF360C", type: "expense", is_default: true },
        { user_id: user.id, name: "Saúde", icon: "health.svg", color: "#42A5F5", type: "expense", is_default: true },
        { user_id: user.id, name: "Trabalho", icon: "work.svg", color: "#3F51B5", type: "expense", is_default: true },
        { user_id: user.id, name: "Transporte", icon: "transportation.svg", color: "#4DB6AC", type: "expense", is_default: true },
        { user_id: user.id, name: "Viagem", icon: "travel.svg", color: "#FF5252", type: "expense", is_default: true }
      ];

      // Limpar categorias antigas para garantir que o catálogo premium de 21 itens seja aplicado corretamente
      await supabase
        .from("categories")
        .delete()
        .eq('user_id', user.id);

      const { data, error } = await supabase
        .from("categories")
        .insert(defaultCategories)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
