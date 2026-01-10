import { Target, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Goal {
  id: string;
  name: string;
  current: number;
  target: number;
  icon: string;
  color: string;
}

interface GoalProgressProps {
  goals: Goal[];
}

export function GoalProgress({ goals }: GoalProgressProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: "compact",
    }).format(value);
  };

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-card animate-slide-up opacity-0" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
      <div className="flex items-center justify-between p-6 border-b border-border/50">
        <h3 className="font-semibold text-lg">Metas Ativas</h3>
        <Link
          to="/goals"
          className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
        >
          Ver todas
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="p-4 space-y-4">
        {goals.map((goal) => {
          const progress = (goal.current / goal.target) * 100;
          
          return (
            <div key={goal.id} className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${goal.color}20` }}
                >
                  {goal.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{goal.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(goal.current)} de {formatCurrency(goal.target)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-primary">
                  {progress.toFixed(0)}%
                </span>
              </div>
              
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
