import { useState } from "react";
import { Plus, Target, Calendar, ChevronRight, Trash2, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useGoals, useCreateGoal, useContributeGoal, useDeleteGoal } from "@/hooks/useGoals";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const goalIcons = ["🎯", "🏠", "🚗", "✈️", "📱", "💻", "📚", "🎮", "🛡️", "💰"];
const goalColors = [
  "hsl(160, 84%, 39%)",
  "hsl(258, 90%, 66%)",
  "hsl(330, 86%, 60%)",
  "hsl(38, 92%, 50%)",
  "hsl(199, 89%, 48%)",
  "hsl(0, 84%, 60%)",
];

export default function Goals() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showContributeDialog, setShowContributeDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  
  // Create form state
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [icon, setIcon] = useState("🎯");
  const [color, setColor] = useState(goalColors[0]);
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  
  // Contribute form state
  const [contributeAmount, setContributeAmount] = useState("");
  const [contributeNotes, setContributeNotes] = useState("");

  const { data: goals, isLoading } = useGoals();
  const createGoal = useCreateGoal();
  const contributeGoal = useContributeGoal();
  const deleteGoal = useDeleteGoal();

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

  const getDaysRemaining = (deadline: string | null) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const activeGoals = (goals || []).filter(g => g.status === "active");
  const totalSaved = activeGoals.reduce((acc, goal) => acc + Number(goal.current_amount), 0);
  const totalTarget = activeGoals.reduce((acc, goal) => acc + Number(goal.target_amount), 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    try {
      await createGoal.mutateAsync({
        name,
        target_amount: parseFloat(targetAmount),
        deadline: deadline || null,
        icon,
        color,
        priority,
      });
      toast.success("Meta criada com sucesso!");
      setShowCreateDialog(false);
      resetCreateForm();
    } catch (error) {
      toast.error("Erro ao criar meta");
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal || !contributeAmount) {
      toast.error("Preencha o valor da contribuição");
      return;
    }

    try {
      await contributeGoal.mutateAsync({
        goal_id: selectedGoal.id,
        amount: parseFloat(contributeAmount),
        notes: contributeNotes || null,
      });
      toast.success("Contribuição registrada com sucesso!");
      setShowContributeDialog(false);
      setSelectedGoal(null);
      setContributeAmount("");
      setContributeNotes("");
    } catch (error) {
      toast.error("Erro ao registrar contribuição");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteGoal.mutateAsync(deleteId);
      toast.success("Meta excluída com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir meta");
    }
    setDeleteId(null);
  };

  const resetCreateForm = () => {
    setName("");
    setTargetAmount("");
    setDeadline("");
    setIcon("🎯");
    setColor(goalColors[0]);
    setPriority("medium");
  };

  const openContributeDialog = (goal: any) => {
    setSelectedGoal(goal);
    setShowContributeDialog(true);
  };

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
        <Button className="btn-gradient" onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Nova Meta
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
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
                style={{ width: `${Math.min(overallProgress, 100)}%` }}
              />
            </div>
          </div>

          {/* Goals Grid */}
          {activeGoals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-card rounded-2xl border border-border/50">
              <Target className="w-12 h-12 mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium">Nenhuma meta ativa</p>
              <p className="text-sm">Crie sua primeira meta clicando no botão acima</p>
            </div>
          ) : (
            <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2">
              {activeGoals.map((goal, index) => {
                const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
                const daysRemaining = getDaysRemaining(goal.deadline);
                const remaining = Number(goal.target_amount) - Number(goal.current_amount);

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
                          {goal.deadline && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(goal.deadline)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteId(goal.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-end justify-between mb-2">
                        <div>
                          <p className="text-2xl font-bold">{formatCurrency(Number(goal.current_amount))}</p>
                          <p className="text-sm text-muted-foreground">
                            de {formatCurrency(Number(goal.target_amount))}
                          </p>
                        </div>
                        <span className="text-lg font-semibold" style={{ color: goal.color }}>
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progress, 100)}%`, background: goal.color }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Falta</p>
                        <p className="font-semibold">{formatCurrency(remaining)}</p>
                      </div>
                      {daysRemaining !== null && (
                        <div className="space-y-1 text-center">
                          <p className="text-sm text-muted-foreground">Dias restantes</p>
                          <p className="font-semibold">{daysRemaining > 0 ? daysRemaining : 0}</p>
                        </div>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => openContributeDialog(goal)}
                      >
                        Contribuir
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Create Goal Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Meta</DialogTitle>
            <DialogDescription>
              Crie uma nova meta financeira para acompanhar seu progresso.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da meta</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Viagem para Europa"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Valor alvo</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0,00"
                  className="pl-10"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Prazo (opcional)</Label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ícone</Label>
              <div className="flex flex-wrap gap-2">
                {goalIcons.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={cn(
                      "w-10 h-10 rounded-lg text-xl flex items-center justify-center border-2 transition-colors",
                      icon === i ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    )}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {goalColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "w-10 h-10 rounded-lg border-2 transition-all",
                      color === c ? "border-foreground scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full btn-gradient" disabled={createGoal.isPending}>
              {createGoal.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Criar Meta"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contribute Dialog */}
      <Dialog open={showContributeDialog} onOpenChange={setShowContributeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contribuir para {selectedGoal?.name}</DialogTitle>
            <DialogDescription>
              Adicione um valor à sua meta.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleContribute} className="space-y-4">
            <div className="space-y-2">
              <Label>Valor da contribuição</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  type="number"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  placeholder="0,00"
                  className="pl-10"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observação (opcional)</Label>
              <Input
                value={contributeNotes}
                onChange={(e) => setContributeNotes(e.target.value)}
                placeholder="Ex: Bônus do trabalho"
              />
            </div>

            <Button type="submit" className="w-full btn-gradient" disabled={contributeGoal.isPending}>
              {contributeGoal.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Contribuir"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir meta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A meta e todas as contribuições serão excluídas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
