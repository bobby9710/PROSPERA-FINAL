import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface FinancialInsight {
  id: string;
  user_id: string;
  type: "monthly_analysis" | "spending_pattern" | "recommendation";
  period: string | null;
  title: string;
  content: any;
  created_at: string;
}

export function useInsights(type?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["financial_insights", user?.id, type],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from("financial_insights")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (type) {
        query = query.eq("type", type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as FinancialInsight[];
    },
    enabled: !!user,
  });
}

export function useGenerateInsights() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ type, financialData }: { type: string; financialData: any }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase.functions.invoke("generate-insights", {
        body: { type, financialData },
      });

      if (error) throw error;

      // Save insight to database
      const now = new Date();
      const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const { data: savedInsight, error: saveError } = await supabase
        .from("financial_insights")
        .insert({
          user_id: user.id,
          type,
          period,
          title: getTitleForType(type),
          content: data.insights,
        })
        .select()
        .single();

      if (saveError) throw saveError;
      return savedInsight;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial_insights"] });
      toast({
        title: "Análise gerada!",
        description: "Seus insights financeiros estão prontos.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao gerar análise",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

function getTitleForType(type: string): string {
  switch (type) {
    case "monthly_analysis":
      return "Análise Mensal";
    case "spending_patterns":
      return "Padrões de Gasto";
    case "recommendations":
      return "Recomendações Personalizadas";
    default:
      return "Insight Financeiro";
  }
}
