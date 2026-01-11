import { useState, useEffect } from "react";
import { Plus, Target, Calendar, ChevronRight, Trash2, Loader2, TrendingUp, Edit, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useGoals, useCreateGoal, useContributeGoal, useDeleteGoal, useUpdateGoalStatus, Goal } from "@/hooks/useGoals";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { GoalCelebration } from "@/components/goals/GoalCelebration";
import { toast } from "sonner";

const goalIcons = ["🎯", "🏠", "🚗", "✈️", "📱", "💻", "📚", "🎮", "🛡️", "💰", "💍", "🎓", "🏥", "🎸"];
const goalColors = [
  "hsl(160, 84%, 39%)",
  "hsl(258, 90%, 66%)",
  "hsl(330, 86%, 60%)",
  "hsl(38, 92%, 50%)",
  "hsl(199, 89%, 48%)",
  "hsl(0, 84%, 60%)",
];

const goalCategories = [
  { value: "emergency", label: "Reserva de Emergência" },
  { value: "travel", label: "Viagem" },
  { value: "education", label: "Educação" },
  { value: "home", label: "Casa Própria" },
  { value: "car", label: "Veículo" },
  { value: "retirement", label: "Aposentadoria" },
  { value: "investment", label: "Investimento" },
  { value: "other", label: "Outro" },
];

export default function Goals() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showContributeDialog, setShowContributeDialog] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebratingGoal, setCelebratingGoal] = useState<Goal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [activeTab, setActiveTab] = useState("active");
  
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

  const { data: allGoals, isLoading } = useGoals();
  const createGoal = useCreateGoal();
  const contributeGoal = useContributeGoal();
  const deleteGoal = useDeleteGoal();
  const updateGoalStatus = useUpdateGoalStatus();

  // Filter goals by status
  const activeGoals = (allGoals || []).filter(g => g.status === "active");
  const completedGoals = (allGoals || []).filter(g => g.status === "completed");

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

  const calculateMonthlyRequired = (goal: Goal) => {
    if (!goal.deadline) return null;
    const remaining = Number(goal.target_amount) - Number(goal.current_amount);
    const daysRemaining = getDaysRemaining(goal.deadline);
    if (!daysRemaining || daysRemaining <= 0) return remaining;
    const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30));
    return remaining / monthsRemaining;
  };

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
        deadline: deadline || undefined,
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

    const amount = parseFloat(contributeAmount);
    const newTotal = Number(selectedGoal.current_amount) + amount;
    const target = Number(selectedGoal.target_amount);

    try {
      await contributeGoal.mutateAsync({
        goal_id: selectedGoal.id,
        amount,
        notes: contributeNotes || undefined,
      });
      
      // Check if goal is now completed
      if (newTotal >= target) {
        await updateGoalStatus.mutateAsync({ id: selectedGoal.id, status: "completed" });
        setCelebratingGoal({ ...selectedGoal, current_amount: newTotal });
        setShowCelebration(true);
      } else {
        toast.success("Contribuição registrada com sucesso!");
      }
      
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

  const handleMarkComplete = async (goal: Goal) => {
    try {
      await updateGoalStatus.mutateAsync({ id: goal.id, status: "completed" });
      setCelebratingGoal(goal);
      setShowCelebration(true);
    } catch (error) {
      toast.error("Erro ao concluir meta");
    }
  };

  const resetCreateForm = () => {
    setName("");
    setTargetAmount("");
    setDeadline("");
    setIcon("🎯");
    setColor(goalColors[0]);
    setPriority("medium");
  };

  const openContributeDialog = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowContributeDialog(true);
  };

  const renderGoalCard = (goal: Goal, index: number) => {
    const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
    const daysRemaining = getDaysRemaining(goal.deadline);
    const remaining = Number(goal.target_amount) - Number(goal.current_amount);
    const monthlyRequired = calculateMonthlyRequired(goal);
    const isCompleted = goal.status === "completed";

    return (
      <div
        key={goal.id}
        className={cn(
          "bg-card rounded-2xl border border-border/50 shadow-card p-6 hover:shadow-lg transition-all duration-300 animate-slide-up opacity-0",
          isCompleted && "opacity-80"
        )}
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
            {isCompleted && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                Concluída
              </span>
            )}
            {!isCompleted && (
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteId(goal.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
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
              {Math.min(progress, 100).toFixed(0)}%
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%`, background: goal.color }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50 mb-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Falta</p>
            <p className="font-semibold">{formatCurrency(Math.max(0, remaining))}</p>
          </div>
          {daysRemaining !== null && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Dias restantes</p>
              <p className={cn(
                "font-semibold",
                daysRemaining <= 30 && daysRemaining > 0 && "text-warning",
                daysRemaining <= 0 && "text-destructive"
              )}>
                {daysRemaining > 0 ? daysRemaining : "Vencido"}
              </p>
            </div>
          )}
        </div>

        {/* Monthly Required */}
        {monthlyRequired !== null && !isCompleted && remaining > 0 && (
          <div className="bg-muted/50 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Ritmo necessário:</span>
              <span className="font-semibold text-primary">{formatCurrency(monthlyRequired)}/mês</span>
            </div>
          </div>
        )}

        {/* Actions */}
        {!isCompleted && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => openContributeDialog(goal)}
            >
              Contribuir
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            {progress >= 100 && (
              <Button
                size="sm"
                className="bg-success hover:bg-success/90 text-success-foreground"
                onClick={() => handleMarkComplete(goal)}
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Concluir
              </Button>
            )}
          </div>
        )}
      </div>
    );
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

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="stat-card">
              <p className="text-sm text-muted-foreground mb-1">Metas Ativas</p>
              <p className="text-2xl font-bold">{activeGoals.length}</p>
            </div>
            <div className="stat-card">
              <p className="text-sm text-muted-foreground mb-1">Concluídas</p>
              <p className="text-2xl font-bold text-success">{completedGoals.length}</p>
            </div>
            <div className="stat-card">
              <p className="text-sm text-muted-foreground mb-1">Total Economizado</p>
              <p className="text-xl font-bold">{formatCurrency(totalSaved)}</p>
            </div>
            <div className="stat-card">
              <p className="text-sm text-muted-foreground mb-1">Falta Total</p>
              <p className="text-xl font-bold">{formatCurrency(Math.max(0, totalTarget - totalSaved))}</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="active">
                Ativas ({activeGoals.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Concluídas ({completedGoals.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-6">
              {activeGoals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-card rounded-2xl border border-border/50">
                  <Target className="w-12 h-12 mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium">Nenhuma meta ativa</p>
                  <p className="text-sm">Crie sua primeira meta clicando no botão acima</p>
                </div>
              ) : (
                <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2">
                  {activeGoals.map((goal, index) => renderGoalCard(goal, index))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              {completedGoals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-card rounded-2xl border border-border/50">
                  <CheckCircle2 className="w-12 h-12 mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium">Nenhuma meta concluída</p>
                  <p className="text-sm">Continue contribuindo para suas metas!</p>
                </div>
              ) : (
                <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2">
                  {completedGoals.map((goal, index) => renderGoalCard(goal, index))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Create Goal Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Meta</DialogTitle>
            <DialogDescription>
              Crie uma nova meta financeira para acompanhar seu progresso.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da meta *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Viagem para Europa"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Valor alvo *</Label>
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
                  min="0.01"
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
                min={new Date().toISOString().split("T")[0]}
              />
              {deadline && targetAmount && (
                <p className="text-xs text-muted-foreground">
                  Contribuição sugerida: {formatCurrency(parseFloat(targetAmount) / Math.max(1, Math.ceil(getDaysRemaining(deadline)! / 30)))}/mês
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={priority} onValueChange={(v: "high" | "medium" | "low") => setPriority(v)}>
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
          {selectedGoal && (
            <div className="bg-muted/50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progresso atual:</span>
                <span className="font-semibold">
                  {formatCurrency(Number(selectedGoal.current_amount))} / {formatCurrency(Number(selectedGoal.target_amount))}
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${Math.min((Number(selectedGoal.current_amount) / Number(selectedGoal.target_amount)) * 100, 100)}%`,
                    background: selectedGoal.color 
                  }}
                />
              </div>
            </div>
          )}
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
                  min="0.01"
                  required
                />
              </div>
              {selectedGoal && contributeAmount && (
                <p className="text-xs text-muted-foreground">
                  Novo total: {formatCurrency(Number(selectedGoal.current_amount) + parseFloat(contributeAmount || "0"))}
                </p>
              )}
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

      {/* Goal Celebration Modal */}
      {celebratingGoal && (
        <GoalCelebration
          open={showCelebration}
          onOpenChange={setShowCelebration}
          goalName={celebratingGoal.name}
          targetAmount={Number(celebratingGoal.target_amount)}
        />
      )}

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
