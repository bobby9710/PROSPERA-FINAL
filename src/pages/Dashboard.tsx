import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { GoalProgress } from "@/components/dashboard/GoalProgress";
import { useAuth } from "@/hooks/useAuth";
import { useTransactionStats, useRecentTransactions, useMonthlyChartData } from "@/hooks/useTransactions";
import { useCategoryStats } from "@/hooks/useCategories";
import { useActiveGoals } from "@/hooks/useGoals";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useTransactionStats();
  const { data: recentTransactions, isLoading: transactionsLoading } = useRecentTransactions(5);
  const { data: categoryStats, isLoading: categoriesLoading } = useCategoryStats();
  const { data: activeGoals, isLoading: goalsLoading } = useActiveGoals(3);
  const { data: chartData, isLoading: chartLoading } = useMonthlyChartData(6);
  
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 
                    user?.email?.split('@')[0] || 
                    'Usuário';

  const isLoading = statsLoading || transactionsLoading || categoriesLoading || goalsLoading || chartLoading;

  // Transform transactions for the component
  const formattedTransactions = (recentTransactions || []).map(t => ({
    id: t.id,
    description: t.description,
    category: t.category?.name || "Sem categoria",
    amount: Number(t.amount),
    type: t.type as "income" | "expense",
    date: t.date,
  }));

  // Transform goals for the component
  const formattedGoals = (activeGoals || []).map(g => ({
    id: g.id,
    name: g.name,
    current: Number(g.current_amount),
    target: Number(g.target_amount),
    icon: g.icon,
    color: g.color,
  }));

  // Transform category stats
  const formattedCategories = (categoryStats || []).length > 0 
    ? categoryStats 
    : [{ name: "Sem gastos", value: 0, color: "hsl(220, 9%, 46%)" }];

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Olá, <span className="text-gradient">{firstName}</span> 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Aqui está o resumo das suas finanças
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Balance and Stats Grid */}
          <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-4 mb-6">
            <div className="lg:col-span-2">
              <BalanceCard 
                balance={stats?.balance || 0} 
                percentChange={0} 
              />
            </div>
            <StatCard
              title="Receitas do Mês"
              value={stats?.totalIncome || 0}
              icon={TrendingUp}
              type="income"
              delay={100}
            />
            <StatCard
              title="Despesas do Mês"
              value={stats?.totalExpense || 0}
              icon={TrendingDown}
              type="expense"
              delay={150}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2 mb-6">
            <ExpenseChart data={chartData || []} />
            <CategoryChart data={formattedCategories} />
          </div>

          {/* Transactions and Goals Grid */}
          <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2">
            <RecentTransactions transactions={formattedTransactions} />
            <GoalProgress goals={formattedGoals} />
          </div>
        </>
      )}
    </AppLayout>
  );
}
