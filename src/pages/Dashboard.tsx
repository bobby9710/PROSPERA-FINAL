import { TrendingUp, TrendingDown } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { GoalProgress } from "@/components/dashboard/GoalProgress";
import { useAuth } from "@/hooks/useAuth";

// Mock data - será substituído por dados reais do banco
const mockBalance = 15420.5;
const mockIncome = 8500;
const mockExpense = 4230.75;

const mockChartData = [
  { month: "Ago", receitas: 7200, despesas: 4100 },
  { month: "Set", receitas: 8100, despesas: 5200 },
  { month: "Out", receitas: 7800, despesas: 4800 },
  { month: "Nov", receitas: 8500, despesas: 4500 },
  { month: "Dez", receitas: 9200, despesas: 5100 },
  { month: "Jan", receitas: 8500, despesas: 4230 },
];

const mockCategories = [
  { name: "Alimentação", value: 1250, color: "hsl(258, 90%, 66%)" },
  { name: "Transporte", value: 850, color: "hsl(330, 86%, 60%)" },
  { name: "Moradia", value: 1200, color: "hsl(160, 84%, 39%)" },
  { name: "Lazer", value: 430, color: "hsl(38, 92%, 50%)" },
  { name: "Outros", value: 500, color: "hsl(220, 9%, 46%)" },
];

const mockTransactions = [
  {
    id: "1",
    description: "Salário",
    category: "Renda",
    amount: 8500,
    type: "income" as const,
    date: "2024-01-05",
  },
  {
    id: "2",
    description: "Supermercado Extra",
    category: "Alimentação",
    amount: 342.5,
    type: "expense" as const,
    date: "2024-01-04",
  },
  {
    id: "3",
    description: "Netflix",
    category: "Assinaturas",
    amount: 55.9,
    type: "expense" as const,
    date: "2024-01-03",
  },
  {
    id: "4",
    description: "Uber",
    category: "Transporte",
    amount: 28.5,
    type: "expense" as const,
    date: "2024-01-03",
  },
  {
    id: "5",
    description: "Freelance Design",
    category: "Renda Extra",
    amount: 1200,
    type: "income" as const,
    date: "2024-01-02",
  },
];

const mockGoals = [
  {
    id: "1",
    name: "Reserva de Emergência",
    current: 8500,
    target: 15000,
    icon: "🛡️",
    color: "hsl(160, 84%, 39%)",
  },
  {
    id: "2",
    name: "Viagem Europa",
    current: 4200,
    target: 12000,
    icon: "✈️",
    color: "hsl(258, 90%, 66%)",
  },
  {
    id: "3",
    name: "iPhone 15",
    current: 2800,
    target: 5000,
    icon: "📱",
    color: "hsl(330, 86%, 60%)",
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 
                    user?.email?.split('@')[0] || 
                    'Usuário';

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

      {/* Balance and Stats Grid */}
      <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-4 mb-6">
        <div className="lg:col-span-2">
          <BalanceCard balance={mockBalance} percentChange={12.5} />
        </div>
        <StatCard
          title="Receitas do Mês"
          value={mockIncome}
          icon={TrendingUp}
          type="income"
          delay={100}
        />
        <StatCard
          title="Despesas do Mês"
          value={mockExpense}
          icon={TrendingDown}
          type="expense"
          delay={150}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2 mb-6">
        <ExpenseChart data={mockChartData} />
        <CategoryChart data={mockCategories} />
      </div>

      {/* Transactions and Goals Grid */}
      <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2">
        <RecentTransactions transactions={mockTransactions} />
        <GoalProgress goals={mockGoals} />
      </div>
    </AppLayout>
  );
}
