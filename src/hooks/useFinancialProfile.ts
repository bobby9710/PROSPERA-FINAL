import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export interface FinancialProfile {
  id: string;
  user_id: string;
  monthly_income: number;
  fixed_expenses: number;
  dependents: number;
  emergency_fund: number;
  investments: number;
  debts: number;
  risk_profile: 'conservative' | 'moderate' | 'aggressive';
  created_at: string;
  updated_at: string;
}

export type RiskProfile = FinancialProfile['risk_profile'];

export const RISK_PROFILE_INFO: Record<RiskProfile, { label: string; description: string; color: string; icon: string }> = {
  conservative: {
    label: 'Conservador',
    description: 'Prefere segurança e estabilidade. Investe principalmente em renda fixa e evita riscos.',
    color: 'bg-blue-500',
    icon: '🛡️',
  },
  moderate: {
    label: 'Moderado',
    description: 'Busca equilíbrio entre segurança e rentabilidade. Diversifica entre renda fixa e variável.',
    color: 'bg-yellow-500',
    icon: '⚖️',
  },
  aggressive: {
    label: 'Agressivo',
    description: 'Aceita maior risco em busca de maiores retornos. Foco em renda variável e investimentos de alto risco.',
    color: 'bg-red-500',
    icon: '🚀',
  },
};

function calculateRiskProfile(profile: Partial<FinancialProfile>): RiskProfile {
  const { monthly_income = 0, fixed_expenses = 0, emergency_fund = 0, investments = 0, debts = 0, dependents = 0 } = profile;
  
  let score = 50; // Start at moderate
  
  // Emergency fund coverage (6 months is ideal)
  const monthlyNeeds = fixed_expenses || monthly_income * 0.5;
  const emergencyMonths = monthlyNeeds > 0 ? emergency_fund / monthlyNeeds : 0;
  if (emergencyMonths >= 6) score += 10;
  else if (emergencyMonths < 3) score -= 15;
  
  // Debt ratio
  const debtRatio = monthly_income > 0 ? debts / (monthly_income * 12) : 0;
  if (debtRatio > 0.5) score -= 20;
  else if (debtRatio < 0.1) score += 10;
  
  // Investment ratio
  const investmentRatio = monthly_income > 0 ? investments / (monthly_income * 12) : 0;
  if (investmentRatio > 1) score += 15;
  else if (investmentRatio < 0.2) score -= 10;
  
  // Dependents factor
  if (dependents >= 3) score -= 10;
  else if (dependents === 0) score += 5;
  
  // Free income ratio
  const freeIncome = monthly_income - fixed_expenses;
  const freeIncomeRatio = monthly_income > 0 ? freeIncome / monthly_income : 0;
  if (freeIncomeRatio > 0.4) score += 10;
  else if (freeIncomeRatio < 0.2) score -= 10;
  
  if (score >= 60) return 'aggressive';
  if (score <= 40) return 'conservative';
  return 'moderate';
}

function generateSuggestions(profile: FinancialProfile): string[] {
  const suggestions: string[] = [];
  const { monthly_income, fixed_expenses, emergency_fund, investments, debts, dependents } = profile;
  
  const monthlyNeeds = fixed_expenses || monthly_income * 0.5;
  const emergencyMonths = monthlyNeeds > 0 ? emergency_fund / monthlyNeeds : 0;
  
  if (emergencyMonths < 3) {
    suggestions.push(`🚨 Priorize criar um fundo de emergência. Objetivo: R$ ${(monthlyNeeds * 6).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (6 meses de despesas).`);
  } else if (emergencyMonths < 6) {
    suggestions.push(`💰 Continue construindo seu fundo de emergência. Faltam R$ ${((monthlyNeeds * 6) - emergency_fund).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para 6 meses.`);
  }
  
  if (debts > 0) {
    const debtRatio = monthly_income > 0 ? debts / monthly_income : 0;
    if (debtRatio > 3) {
      suggestions.push('⚠️ Suas dívidas representam mais de 3 meses de renda. Considere um plano de quitação agressivo.');
    } else {
      suggestions.push('📉 Priorize quitar dívidas antes de investir em renda variável.');
    }
  }
  
  const savingsRate = monthly_income > 0 ? (monthly_income - fixed_expenses) / monthly_income : 0;
  if (savingsRate < 0.2) {
    suggestions.push('💡 Tente reduzir despesas fixas. Sua taxa de economia está abaixo de 20%.');
  } else if (savingsRate >= 0.3) {
    suggestions.push('🎉 Excelente taxa de economia! Considere aumentar seus investimentos.');
  }
  
  if (investments < monthly_income * 6) {
    suggestions.push('📈 Considere aumentar seus investimentos gradualmente para construir patrimônio.');
  }
  
  if (dependents >= 2 && emergency_fund < monthlyNeeds * 9) {
    suggestions.push(`👨‍👩‍👧‍👦 Com ${dependents} dependentes, considere um fundo de emergência maior (9-12 meses).`);
  }
  
  if (profile.risk_profile === 'conservative') {
    suggestions.push('🛡️ Como perfil conservador, foque em Tesouro Direto, CDBs e fundos de renda fixa.');
  } else if (profile.risk_profile === 'moderate') {
    suggestions.push('⚖️ Considere uma carteira 60% renda fixa e 40% renda variável.');
  } else {
    suggestions.push('🚀 Com perfil agressivo, explore ações, FIIs e ETFs, mas mantenha uma reserva em renda fixa.');
  }
  
  return suggestions;
}

export function useFinancialProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["financial-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("financial_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as FinancialProfile | null;
    },
    enabled: !!user,
  });

  const suggestions = profile ? generateSuggestions(profile) : [];

  const saveProfileMutation = useMutation({
    mutationFn: async (data: Omit<FinancialProfile, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'risk_profile'>) => {
      if (!user) throw new Error("User not authenticated");
      
      const risk_profile = calculateRiskProfile(data);
      
      const { data: existingProfile } = await supabase
        .from("financial_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (existingProfile) {
        const { data: updated, error } = await supabase
          .from("financial_profiles")
          .update({ ...data, risk_profile })
          .eq("id", existingProfile.id)
          .select()
          .single();
        
        if (error) throw error;
        return updated;
      } else {
        const { data: created, error } = await supabase
          .from("financial_profiles")
          .insert({ user_id: user.id, ...data, risk_profile })
          .select()
          .single();
        
        if (error) throw error;
        return created;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-profile"] });
      toast({
        title: "Perfil financeiro salvo!",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar perfil",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    profile,
    loadingProfile,
    suggestions,
    saveProfile: saveProfileMutation.mutate,
    savingProfile: saveProfileMutation.isPending,
    calculateRiskProfile,
  };
}
