import { Plus, Target, TrendingUp, Calendar, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Goal {
  id: string;
  name: string;
  current: number;
  target: number;
  icon: string;
  color: string;
  deadline: string;
  monthlyContribution: number;
  priority: "high" | "medium" | "low";
}

const mockGoals: Goal[] = [
  {
    id: "1",
    name: "Reserva de Emergência",
    current: 8500,
    target: 15000,
    icon: "🛡️",
    color: "hsl(160, 84%, 39%)",
    deadline: "2024-06-30",
    monthlyContribution: 800,
    priority: "high",
  },
  {
    id: "2",
    name: "Viagem Europa",
    current: 4200,
    target: 12000,
    icon: "✈️",
    color: "hsl(258, 90%, 66%)",
    deadline: "2024-12-15",
    monthlyContribution: 650,
    priority: "medium",
  },
  {
    id: "3",
    name: "iPhone 15 Pro",
    current: 2800,
    target: 5000,
    icon: "📱",
    color: "hsl(330, 86%, 60%)",
    deadline: "2024-04-20",
    monthlyContribution: 550,
    priority: "medium",
  },
  {
    id: "4",
    name: "Curso de Inglês",
    current: 1200,
    target: 3600,
    icon: "📚",
    color: "hsl(38, 92%, 50%)",
    deadline: "2024-08-01",
    monthlyContribution: 300,
    priority: "low",
  },
];

export default function Goals() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalSaved = mockGoals.reduce((acc, goal) => acc + goal.current, 0);
  const totalTarget = mockGoals.reduce((acc, goal) => acc + goal.target, 0);
  const overallProgress = (totalSaved / totalTarget) * 100;

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Metas Financeiras</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe o progresso das suas metas
          </p>
        </div>
        <Button className="btn-gradient">
          <Plus className="w-5 h-5 mr-2" />
          Nova Meta
        </Button>
      </div>

      {/* Overall Progress Card */}
      <div className="card-primary rounded-2xl p-6 mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-primary-foreground/80">Progresso Total</p>
            <h2 className="text-3xl font-bold text-primary-foreground">
              {formatCurrency(totalSaved)}
            </h2>
            <p className="text-primary-foreground/70 text-sm">
              de {formatCurrency(totalTarget)}
            </p>
          </div>
          <div className="text-right">
            <div className="w-20 h-20 rounded-full border-4 border-primary-foreground/30 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">
                {overallProgress.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
        <div className="h-2 rounded-full bg-primary-foreground/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary-foreground transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2">
        {mockGoals.map((goal, index) => {
          const progress = (goal.current / goal.target) * 100;
          const daysRemaining = getDaysRemaining(goal.deadline);
          const remaining = goal.target - goal.current;

          return (
            <div
              key={goal.id}
              className="bg-card rounded-2xl border border-border/50 shadow-card p-6 hover:shadow-lg transition-all duration-300 animate-slide-up opacity-0"
              style={{ animationDelay: `${(index + 2) * 100}ms`, animationFillMode: 'forwards' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${goal.color}20` }}
                  >
                    {goal.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{goal.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(goal.deadline)}</span>
                    </div>
                  </div>
                </div>
                <span
                  className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    goal.priority === "high" && "bg-destructive/10 text-destructive",
                    goal.priority === "medium" && "bg-warning/10 text-warning",
                    goal.priority === "low" && "bg-success/10 text-success"
                  )}
                >
                  {goal.priority === "high" ? "Alta" : goal.priority === "medium" ? "Média" : "Baixa"}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(goal.current)}</p>
                    <p className="text-sm text-muted-foreground">
                      de {formatCurrency(goal.target)}
                    </p>
                  </div>
                  <span className="text-lg font-semibold" style={{ color: goal.color }}>
                    {progress.toFixed(0)}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, background: goal.color }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Falta</p>
                  <p className="font-semibold">{formatCurrency(remaining)}</p>
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-sm text-muted-foreground">Dias restantes</p>
                  <p className="font-semibold">{daysRemaining > 0 ? daysRemaining : 0}</p>
                </div>
                <Button variant="outline" size="sm" className="gap-1">
                  Contribuir
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
