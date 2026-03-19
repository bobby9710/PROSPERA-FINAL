import { useState } from "react";
import { TrendingUp, TrendingDown, Loader2, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { GoalProgress } from "@/components/dashboard/GoalProgress";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTransactionStats, useRecentTransactions, useMonthlyChartData } from "@/hooks/useTransactions";
import { useCategoryStats } from "@/hooks/useCategories";
import { useActiveGoals } from "@/hooks/useGoals";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function Dashboard() {
  const { user } = useAuth();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useTransactionStats(selectedMonth, selectedYear);
  const { data: recentTransactions, isLoading: transactionsLoading } = useRecentTransactions(5, selectedMonth, selectedYear);
  const { data: categoryStats, isLoading: categoriesLoading } = useCategoryStats(selectedMonth, selectedYear);
  const { data: activeGoals, isLoading: goalsLoading } = useActiveGoals(3);
  const { data: chartData, isLoading: chartLoading } = useMonthlyChartData(6);

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'Usuário';

  const isLoading = statsLoading || transactionsLoading || categoriesLoading || goalsLoading || chartLoading;

  // Navigation functions
  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  const availableYears = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];

  // Transform transactions for the component
  const formattedTransactions = (recentTransactions || []).map(t => ({
    id: t.id,
    description: t.description,
    category: t.category?.name || "Sem categoria",
    categoryIcon: t.category?.icon,
    categoryColor: t.category?.color,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Olá, <span className="text-gradient">{firstName}</span> 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Aqui está o resumo das suas finanças
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2 bg-card/40 backdrop-blur-sm p-1.5 rounded-2xl border border-border/50 shadow-sm">
          <Button variant="ghost" size="icon" onClick={goToPreviousMonth} className="h-9 w-9 rounded-xl">
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="h-9 font-bold px-4 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors">
                <Calendar className="w-4 h-4 mr-2" />
                {MONTHS[selectedMonth]} {selectedYear}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl rounded-2xl" align="end">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Ano</label>
                  <div className="flex flex-wrap gap-2">
                    {availableYears.map(year => (
                      <Button
                        key={year}
                        variant={selectedYear === year ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedYear(year)}
                        className="rounded-lg"
                      >
                        {year}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Mês</label>
                  <div className="grid grid-cols-3 gap-2">
                    {MONTHS.map((month, index) => (
                      <Button
                        key={month}
                        variant={selectedMonth === index ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedMonth(index);
                          setIsCalendarOpen(false);
                        }}
                        className="rounded-lg"
                      >
                        {month.slice(0, 3)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="icon" onClick={goToNextMonth} className="h-9 w-9 rounded-xl">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
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
              title={`Receitas de ${MONTHS[selectedMonth]}`}
              value={stats?.totalIncome || 0}
              icon={TrendingUp}
              type="income"
              delay={100}
            />
            <StatCard
              title={`Despesas de ${MONTHS[selectedMonth]}`}
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
