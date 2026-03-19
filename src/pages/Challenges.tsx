import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChallenges } from "@/hooks/useChallenges";
import { useCategories } from "@/hooks/useCategories";
import { useGoals } from "@/hooks/useGoals";
import { Trophy, Target, Flame, Star, Plus, Trash2, CheckCircle, Clock, XCircle } from "lucide-react";
import { format, addDays, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const CHALLENGE_TYPES = [
  { value: "no_extra_spending", label: "Semana sem gasto extra", icon: "🚫", defaultDays: 7 },
  { value: "save_amount", label: "Economizar valor", icon: "💰", defaultDays: 30 },
  { value: "reduce_category", label: "Reduzir categoria", icon: "📉", defaultDays: 30 },
  { value: "add_to_goal", label: "Adicionar à meta", icon: "🎯", defaultDays: 30 },
];

export default function Challenges() {
  const { challenges, loadingChallenges, achievements, badges, badgeInfo, createChallenge, completeChallenge, deleteChallenge } = useChallenges();
  const { data: categories = [] } = useCategories();
  const { data: goals = [] } = useGoals();
  const [isOpen, setIsOpen] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    type: "save_amount",
    target_value: 100,
    target_category_id: null as string | null,
    target_goal_id: null as string | null,
    end_date: format(addDays(new Date(), 30), "yyyy-MM-dd"),
    points_reward: 100,
  });

  const handleCreate = () => {
    const challengeType = CHALLENGE_TYPES.find(t => t.value === newChallenge.type);
    createChallenge.mutate({
      title: newChallenge.title || `${challengeType?.icon} ${challengeType?.label}`,
      description: newChallenge.description,
      type: newChallenge.type,
      target_value: newChallenge.target_value,
      target_category_id: newChallenge.target_category_id,
      target_goal_id: newChallenge.target_goal_id,
      start_date: format(new Date(), "yyyy-MM-dd"),
      end_date: newChallenge.end_date,
      points_reward: newChallenge.points_reward,
    });
    setIsOpen(false);
    setNewChallenge({
      title: "",
      description: "",
      type: "save_amount",
      target_value: 100,
      target_category_id: null,
      target_goal_id: null,
      end_date: format(addDays(new Date(), 30), "yyyy-MM-dd"),
      points_reward: 100,
    });
  };

  const activeChallenges = challenges.filter(c => c.status === "active");
  const completedChallenges = challenges.filter(c => c.status === "completed");
  const failedChallenges = challenges.filter(c => c.status === "failed");

  const getChallengeProgress = (challenge: typeof challenges[0]) => {
    if (!challenge.target_value) return 0;
    return Math.min((challenge.current_progress / challenge.target_value) * 100, 100);
  };

  const getDaysRemaining = (endDate: string) => {
    return differenceInDays(parseISO(endDate), new Date());
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with Points */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Desafios Gamificados</h1>
            <p className="text-muted-foreground">Complete desafios e ganhe pontos!</p>
          </div>
          <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-white/20 rounded-full p-3">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm opacity-90">Nível {achievements?.level || 1}</p>
                <p className="text-2xl font-bold">{achievements?.total_points || 0} pts</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Conquistas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {badges.map(badge => {
                  const info = badgeInfo[badge.badge_type];
                  return (
                    <div
                      key={badge.id}
                      className="flex items-center gap-2 bg-muted rounded-full px-4 py-2"
                      title={info?.description}
                    >
                      <span className="text-xl">{info?.icon}</span>
                      <span className="text-sm font-medium">{info?.name}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="active">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full overflow-x-auto">
              <TabsList className="inline-flex w-auto min-w-full sm:min-w-0">
                <TabsTrigger value="active" className="gap-1.5 text-xs sm:text-sm">
                  <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Ativos</span> ({activeChallenges.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="gap-1.5 text-xs sm:text-sm">
                  <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Completos</span> ({completedChallenges.length})
                </TabsTrigger>
                <TabsTrigger value="failed" className="gap-1.5 text-xs sm:text-sm">
                  <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Falhos</span> ({failedChallenges.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Desafio
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Desafio</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Tipo de Desafio</Label>
                    <Select value={newChallenge.type} onValueChange={v => setNewChallenge(prev => ({ ...prev, type: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CHALLENGE_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Título (opcional)</Label>
                    <Input
                      value={newChallenge.title}
                      onChange={e => setNewChallenge(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Nome do desafio"
                    />
                  </div>

                  {(newChallenge.type === "save_amount" || newChallenge.type === "add_to_goal") && (
                    <div>
                      <Label>Valor Alvo (R$)</Label>
                      <Input
                        type="number"
                        value={newChallenge.target_value}
                        onChange={e => setNewChallenge(prev => ({ ...prev, target_value: parseFloat(e.target.value) }))}
                      />
                    </div>
                  )}

                  {newChallenge.type === "reduce_category" && (
                    <>
                      <div>
                        <Label>Categoria</Label>
                        <Select
                          value={newChallenge.target_category_id || ""}
                          onValueChange={v => setNewChallenge(prev => ({ ...prev, target_category_id: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.filter(c => c.type === "expense").map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.icon} {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Reduzir em (%)</Label>
                        <Input
                          type="number"
                          value={newChallenge.target_value}
                          onChange={e => setNewChallenge(prev => ({ ...prev, target_value: parseFloat(e.target.value) }))}
                        />
                      </div>
                    </>
                  )}

                  {newChallenge.type === "add_to_goal" && (
                    <div>
                      <Label>Meta</Label>
                      <Select
                        value={newChallenge.target_goal_id || ""}
                        onValueChange={v => setNewChallenge(prev => ({ ...prev, target_goal_id: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {goals.filter(g => g.status === "active").map(goal => (
                            <SelectItem key={goal.id} value={goal.id}>
                              {goal.icon} {goal.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label>Data Final</Label>
                    <Input
                      type="date"
                      value={newChallenge.end_date}
                      onChange={e => setNewChallenge(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label>Pontos de Recompensa</Label>
                    <Select
                      value={newChallenge.points_reward.toString()}
                      onValueChange={v => setNewChallenge(prev => ({ ...prev, points_reward: parseInt(v) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50">50 pts (Fácil)</SelectItem>
                        <SelectItem value="100">100 pts (Médio)</SelectItem>
                        <SelectItem value="200">200 pts (Difícil)</SelectItem>
                        <SelectItem value="500">500 pts (Extremo)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleCreate} className="w-full">
                    Criar Desafio
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <TabsContent value="active" className="mt-4">
            {loadingChallenges ? (
              <p className="text-center text-muted-foreground py-8">Carregando...</p>
            ) : activeChallenges.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum desafio ativo</p>
                  <p className="text-sm text-muted-foreground">Crie um novo desafio para começar!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {activeChallenges.map(challenge => {
                  const type = CHALLENGE_TYPES.find(t => t.value === challenge.type);
                  const daysRemaining = getDaysRemaining(challenge.end_date);
                  const progress = getChallengeProgress(challenge);

                  return (
                    <Card key={challenge.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{type?.icon}</span>
                            <div>
                              <CardTitle className="text-base">{challenge.title}</CardTitle>
                              <CardDescription>{type?.label}</CardDescription>
                            </div>
                          </div>
                          <Badge variant={daysRemaining <= 3 ? "destructive" : "secondary"}>
                            <Clock className="h-3 w-3 mr-1" />
                            {daysRemaining}d
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progresso</span>
                            <span>
                              {challenge.target_value
                                ? `R$ ${challenge.current_progress.toFixed(0)} / R$ ${challenge.target_value}`
                                : `${progress.toFixed(0)}%`}
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>

                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="gap-1">
                            <Trophy className="h-3 w-3 text-yellow-500" />
                            {challenge.points_reward} pts
                          </Badge>
                          <div className="flex gap-2">
                            {progress >= 100 && (
                              <Button
                                size="sm"
                                onClick={() => completeChallenge.mutate(challenge.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Completar
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteChallenge.mutate(challenge.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-4">
            {completedChallenges.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum desafio completo ainda</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {completedChallenges.map(challenge => {
                  const type = CHALLENGE_TYPES.find(t => t.value === challenge.type);
                  return (
                    <Card key={challenge.id} className="bg-green-500/5 border-green-500/20">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-green-500/10 rounded-full p-3">
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{challenge.title}</p>
                          <p className="text-sm text-muted-foreground">{type?.label}</p>
                        </div>
                        <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                          +{challenge.points_reward} pts
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="failed" className="mt-4">
            {failedChallenges.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum desafio falho - continue assim!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {failedChallenges.map(challenge => {
                  const type = CHALLENGE_TYPES.find(t => t.value === challenge.type);
                  return (
                    <Card key={challenge.id} className="bg-red-500/5 border-red-500/20">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-red-500/10 rounded-full p-3">
                          <XCircle className="h-6 w-6 text-red-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{challenge.title}</p>
                          <p className="text-sm text-muted-foreground">{type?.label}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteChallenge.mutate(challenge.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
