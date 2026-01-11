import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useFinancialContext() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["financial_context", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      // Get transactions for the month
      const { data: transactions, error: transError } = await supabase
        .from("transactions")
        .select("*, categories(name)")
        .eq("user_id", user.id)
        .gte("date", startOfMonth)
        .lte("date", endOfMonth)
        .order("date", { ascending: false });

      if (transError) throw transError;

      // Calculate totals
      const income = transactions
        .filter(t => t.type === "income")
        .reduce((acc, t) => acc + Number(t.amount), 0);
      
      const expenses = transactions
        .filter(t => t.type === "expense")
        .reduce((acc, t) => acc + Number(t.amount), 0);

      // Get category breakdown
      const categoryMap = new Map<string, number>();
      transactions
        .filter(t => t.type === "expense")
        .forEach(t => {
          const catName = (t.categories as any)?.name || "Sem categoria";
          categoryMap.set(catName, (categoryMap.get(catName) || 0) + Number(t.amount));
        });

      const categoryBreakdown = Array.from(categoryMap.entries())
        .map(([name, total]) => ({
          name,
          total,
          percentage: expenses > 0 ? (total / expenses) * 100 : 0,
        }))
        .sort((a, b) => b.total - a.total);

      // Get goals
      const { data: goals, error: goalsError } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active");

      if (goalsError) throw goalsError;

      const goalsProgress = goals.length > 0
        ? goals.reduce((acc, g) => acc + (g.current_amount / g.target_amount) * 100, 0) / goals.length
        : 0;

      // Get credit cards
      const { data: creditCards, error: cardsError } = await supabase
        .from("credit_cards")
        .select("*")
        .eq("user_id", user.id);

      if (cardsError) throw cardsError;

      // Get credit card usage
      const { data: cardTransactions } = await supabase
        .from("transactions")
        .select("credit_card_id, amount")
        .eq("user_id", user.id)
        .eq("type", "expense")
        .not("credit_card_id", "is", null)
        .gte("date", startOfMonth)
        .lte("date", endOfMonth);

      const totalCreditUsed = cardTransactions?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;
      const totalCreditLimit = creditCards.reduce((acc, c) => acc + Number(c.credit_limit), 0);

      // Recent transactions for context
      const recentTransactions = transactions.slice(0, 10).map(t => ({
        type: t.type,
        amount: Number(t.amount).toFixed(2),
        description: t.description,
        category: (t.categories as any)?.name || "Sem categoria",
        date: t.date,
      }));

      return {
        totalBalance: income - expenses,
        monthlyIncome: income,
        monthlyExpenses: expenses,
        goalsCount: goals.length,
        goalsProgress,
        creditCardsCount: creditCards.length,
        totalCreditLimit,
        totalCreditUsed,
        recentTransactions,
        categoryBreakdown,
        goals: goals.map(g => ({
          name: g.name,
          current_amount: g.current_amount,
          target_amount: g.target_amount,
        })),
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
