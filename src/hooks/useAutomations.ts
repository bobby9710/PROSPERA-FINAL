import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface AutomationRule {
  id: string;
  user_id: string;
  name: string;
  is_active: boolean;
  trigger_type: string;
  trigger_value: string | null;
  action_type: string;
  action_value: string | null;
  created_at: string;
  updated_at: string;
}

export const TRIGGER_TYPES = [
  { value: "new_transaction", label: "Nova transação", description: "Qualquer nova transação" },
  { value: "amount_greater", label: "Valor maior que", description: "Valor acima de um limite" },
  { value: "category_equals", label: "Categoria igual a", description: "Transação de categoria específica" },
  { value: "description_contains", label: "Descrição contém", description: "Texto na descrição" },
];

export const ACTION_TYPES = [
  { value: "change_category", label: "Mudar categoria", description: "Alterar para outra categoria" },
  { value: "add_tag", label: "Adicionar tag", description: "Marcar com uma tag" },
  { value: "send_notification", label: "Enviar notificação", description: "Alertar sobre a transação" },
  { value: "add_to_goal", label: "Adicionar à meta", description: "Contribuir para uma meta" },
];

export function useAutomations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: rules = [], isLoading: loadingRules } = useQuery({
    queryKey: ["automation_rules", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("automation_rules")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AutomationRule[];
    },
    enabled: !!user,
  });

  const createRule = useMutation({
    mutationFn: async (rule: Omit<AutomationRule, "id" | "user_id" | "created_at" | "updated_at">) => {
      if (!user) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from("automation_rules")
        .insert({ ...rule, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation_rules"] });
      toast({ title: "Automação criada!", description: "A regra será aplicada às novas transações" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível criar a automação", variant: "destructive" });
    },
  });

  const updateRule = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AutomationRule> & { id: string }) => {
      const { data, error } = await supabase
        .from("automation_rules")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation_rules"] });
      toast({ title: "Automação atualizada" });
    },
  });

  const toggleRule = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from("automation_rules")
        .update({ is_active })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["automation_rules"] });
      toast({ title: data.is_active ? "Automação ativada" : "Automação desativada" });
    },
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("automation_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation_rules"] });
      toast({ title: "Automação removida" });
    },
  });

  // Function to apply automations to a transaction
  const applyAutomations = async (transaction: {
    description: string;
    amount: number;
    category_id: string | null;
    type: string;
  }) => {
    const activeRules = rules.filter(r => r.is_active);
    const appliedActions: string[] = [];

    for (const rule of activeRules) {
      let shouldApply = false;

      switch (rule.trigger_type) {
        case "new_transaction":
          shouldApply = true;
          break;
        case "amount_greater":
          shouldApply = transaction.amount > parseFloat(rule.trigger_value || "0");
          break;
        case "category_equals":
          shouldApply = transaction.category_id === rule.trigger_value;
          break;
        case "description_contains":
          shouldApply = transaction.description.toLowerCase().includes((rule.trigger_value || "").toLowerCase());
          break;
      }

      if (shouldApply) {
        appliedActions.push(`${rule.name}: ${ACTION_TYPES.find(a => a.value === rule.action_type)?.label}`);
      }
    }

    return appliedActions;
  };

  return {
    rules,
    loadingRules,
    createRule,
    updateRule,
    toggleRule,
    deleteRule,
    applyAutomations,
  };
}
