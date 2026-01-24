import { useState, useMemo } from "react";
import {
  Calculator,
  TrendingUp,
  Calendar,
  Target,
  PiggyBank,
  ArrowRight,
  Info,
  DollarSign,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFinancialContext } from "@/hooks/useFinancialContext";
import { useGoals } from "@/hooks/useGoals";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

export default function Simulator() {
  const { data: financialContext } = useFinancialContext();
  const { data: goals = [] } = useGoals();
  
  const [activeTab, setActiveTab] = useState("savings");
  
  // Savings simulator state
  const [monthlySavings, setMonthlySavings] = useState(500);
  const [savingsMonths, setSavingsMonths] = useState(12);
  const [annualReturn, setAnnualReturn] = useState(10);
  
  // Goal simulator state
  const [targetAmount, setTargetAmount] = useState(10000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  
  // When will I reach goal state
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [extraContribution, setExtraContribution] = useState(0);

  // Calculate savings projection
  const savingsProjection = useMemo(() => {
    const monthlyRate = annualReturn / 100 / 12;
    const data = [];
    let balance = 0;
    let totalInvested = 0;
    
    for (let month = 0; month <= savingsMonths; month++) {
      data.push({
        month,
        label: `Mês ${month}`,
        balance: Math.round(balance),
        invested: totalInvested,
        earnings: Math.round(balance - totalInvested),
      });
      
      balance = balance * (1 + monthlyRate) + monthlySavings;
      totalInvested += monthlySavings;
    }
    
    return data;
  }, [monthlySavings, savingsMonths, annualReturn]);

  // Calculate how many months to reach target
  const monthsToTarget = useMemo(() => {
    if (monthlyContribution <= 0) return Infinity;
    
    const monthlyRate = annualReturn / 100 / 12;
    let balance = 0;
    let months = 0;
    
    while (balance < targetAmount && months < 600) {
      balance = balance * (1 + monthlyRate) + monthlyContribution;
      months++;
    }
    
    return months;
  }, [targetAmount, monthlyContribution, annualReturn]);

  // Calculate goal projection
  const selectedGoal = goals.find(g => g.id === selectedGoalId);
  const goalProjection = useMemo(() => {
    if (!selectedGoal) return null;
    
    const remaining = selectedGoal.target_amount - selectedGoal.current_amount;
    const baseMonthly = financialContext?.monthlyIncome 
      ? (financialContext.monthlyIncome - financialContext.monthlyExpenses) * 0.2 
      : 500;
    const totalMonthly = baseMonthly + extraContribution;
    
    if (totalMonthly <= 0) return null;
    
    const monthsNeeded = Math.ceil(remaining / totalMonthly);
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + monthsNeeded);
    
    // Generate projection data
    const data = [];
    let current = selectedGoal.current_amount;
    
    for (let month = 0; month <= Math.min(monthsNeeded, 24); month++) {
      data.push({
        month,
        label: `Mês ${month}`,
        current: Math.min(Math.round(current), selectedGoal.target_amount),
        target: selectedGoal.target_amount,
      });
      current += totalMonthly;
    }
    
    return {
      monthsNeeded,
      targetDate,
      monthlyNeeded: totalMonthly,
      data,
    };
  }, [selectedGoal, extraContribution, financialContext]);

  const finalBalance = savingsProjection[savingsProjection.length - 1];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Calculator className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Simulador Financeiro</h1>
            <p className="text-muted-foreground">Projete seu futuro financeiro</p>
          </div>
        </div>

        {/* Financial Context */}
        {financialContext && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Receita Mensal</p>
                    <p className="text-xl font-bold">
                      R$ {financialContext.monthlyIncome?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-destructive/5 border-destructive/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-destructive" />
                  <div>
                    <p className="text-sm text-muted-foreground">Despesas Mensais</p>
                    <p className="text-xl font-bold">
                      R$ {financialContext.monthlyExpenses?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-success/5 border-success/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <PiggyBank className="w-8 h-8 text-success" />
                  <div>
                    <p className="text-sm text-muted-foreground">Disponível p/ Investir</p>
                    <p className="text-xl font-bold">
                      R$ {(financialContext.monthlyIncome - financialContext.monthlyExpenses).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Simulator Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="savings" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <PiggyBank className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Poupança</span>
              <span className="xs:hidden">Poup.</span>
            </TabsTrigger>
            <TabsTrigger value="target" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Meta</span>
            </TabsTrigger>
            <TabsTrigger value="goal" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Quando?</span>
              <span className="xs:hidden">?</span>
            </TabsTrigger>
          </TabsList>

          {/* Savings Simulator */}
          <TabsContent value="savings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>E se eu economizar R$ X por mês?</CardTitle>
                <CardDescription>
                  Veja quanto você terá no futuro com investimentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label>Valor mensal</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">R$</span>
                      <Input
                        type="number"
                        value={monthlySavings}
                        onChange={(e) => setMonthlySavings(Number(e.target.value))}
                        min={0}
                      />
                    </div>
                    <Slider
                      value={[monthlySavings]}
                      onValueChange={([v]) => setMonthlySavings(v)}
                      min={100}
                      max={5000}
                      step={100}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Período (meses)</Label>
                    <Input
                      type="number"
                      value={savingsMonths}
                      onChange={(e) => setSavingsMonths(Number(e.target.value))}
                      min={1}
                      max={120}
                    />
                    <Slider
                      value={[savingsMonths]}
                      onValueChange={([v]) => setSavingsMonths(v)}
                      min={6}
                      max={60}
                      step={6}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Rentabilidade anual (%)</Label>
                    <Input
                      type="number"
                      value={annualReturn}
                      onChange={(e) => setAnnualReturn(Number(e.target.value))}
                      min={0}
                      max={30}
                    />
                    <Slider
                      value={[annualReturn]}
                      onValueChange={([v]) => setAnnualReturn(v)}
                      min={0}
                      max={20}
                      step={0.5}
                    />
                  </div>
                </div>

                {/* Results */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Investido</p>
                    <p className="text-2xl font-bold text-primary">
                      R$ {finalBalance?.invested.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Rendimentos</p>
                    <p className="text-2xl font-bold text-success">
                      R$ {finalBalance?.earnings.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Saldo Final</p>
                    <p className="text-2xl font-bold">
                      R$ {finalBalance?.balance.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>

                {/* Chart */}
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={savingsProjection}>
                      <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="label" className="text-xs" />
                      <YAxis 
                        className="text-xs"
                        tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const data = payload[0].payload;
                          return (
                            <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                              <p className="font-medium">{data.label}</p>
                              <p className="text-sm text-primary">Saldo: R$ {data.balance.toLocaleString('pt-BR')}</p>
                              <p className="text-sm text-muted-foreground">Investido: R$ {data.invested.toLocaleString('pt-BR')}</p>
                              <p className="text-sm text-success">Rendimentos: R$ {data.earnings.toLocaleString('pt-BR')}</p>
                            </div>
                          );
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="hsl(var(--primary))"
                        fill="url(#colorBalance)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Target Simulator */}
          <TabsContent value="target" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quanto tempo para atingir R$ X?</CardTitle>
                <CardDescription>
                  Descubra quando você atingirá seu objetivo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label>Valor desejado</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">R$</span>
                      <Input
                        type="number"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(Number(e.target.value))}
                        min={1000}
                      />
                    </div>
                    <Slider
                      value={[targetAmount]}
                      onValueChange={([v]) => setTargetAmount(v)}
                      min={1000}
                      max={100000}
                      step={1000}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Contribuição mensal</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">R$</span>
                      <Input
                        type="number"
                        value={monthlyContribution}
                        onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                        min={100}
                      />
                    </div>
                    <Slider
                      value={[monthlyContribution]}
                      onValueChange={([v]) => setMonthlyContribution(v)}
                      min={100}
                      max={5000}
                      step={100}
                    />
                  </div>
                </div>

                {/* Result */}
                <div className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl text-center">
                  <p className="text-muted-foreground mb-2">
                    Com R$ {monthlyContribution.toLocaleString('pt-BR')}/mês e {annualReturn}% ao ano
                  </p>
                  <p className="text-4xl font-bold text-primary mb-2">
                    {monthsToTarget < 600 ? `${monthsToTarget} meses` : "Muito tempo"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {monthsToTarget < 600 && (
                      <>
                        ≈ {Math.floor(monthsToTarget / 12)} anos e {monthsToTarget % 12} meses
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                  <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Este cálculo considera juros compostos com rentabilidade de {annualReturn}% ao ano.
                    Valores reais podem variar de acordo com o investimento escolhido.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goal Progress Simulator */}
          <TabsContent value="goal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quando atingirei minha meta?</CardTitle>
                <CardDescription>
                  Simule contribuições extras para suas metas existentes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {goals.filter(g => g.status === "active").length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Você não tem metas ativas</p>
                    <Button className="mt-4" asChild>
                      <a href="/goals">Criar Meta</a>
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <Label>Selecione uma meta</Label>
                      <Select value={selectedGoalId} onValueChange={setSelectedGoalId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha uma meta" />
                        </SelectTrigger>
                        <SelectContent>
                          {goals.filter(g => g.status === "active").map((goal) => (
                            <SelectItem key={goal.id} value={goal.id}>
                              {goal.icon} {goal.name} - R$ {goal.current_amount.toFixed(2)} / R$ {goal.target_amount.toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedGoal && (
                      <>
                        <div className="space-y-3">
                          <Label>Contribuição extra mensal</Label>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">+ R$</span>
                            <Input
                              type="number"
                              value={extraContribution}
                              onChange={(e) => setExtraContribution(Number(e.target.value))}
                              min={0}
                            />
                          </div>
                          <Slider
                            value={[extraContribution]}
                            onValueChange={([v]) => setExtraContribution(v)}
                            min={0}
                            max={2000}
                            step={50}
                          />
                        </div>

                        {goalProjection && (
                          <>
                            <div className="p-6 bg-gradient-to-r from-success/10 to-primary/10 rounded-xl text-center">
                              <p className="text-muted-foreground mb-2">
                                Com R$ {goalProjection.monthlyNeeded.toFixed(2)}/mês
                              </p>
                              <p className="text-4xl font-bold text-success mb-2">
                                {goalProjection.monthsNeeded} meses
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Previsão: {goalProjection.targetDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                              </p>
                            </div>

                            {/* Projection Chart */}
                            <div className="h-[250px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={goalProjection.data}>
                                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                  <XAxis dataKey="label" className="text-xs" />
                                  <YAxis 
                                    className="text-xs"
                                    tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                                  />
                                  <Tooltip
                                    content={({ active, payload }) => {
                                      if (!active || !payload?.length) return null;
                                      const data = payload[0].payload;
                                      return (
                                        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                                          <p className="font-medium">{data.label}</p>
                                          <p className="text-sm text-success">Acumulado: R$ {data.current.toLocaleString('pt-BR')}</p>
                                          <p className="text-sm text-muted-foreground">Meta: R$ {data.target.toLocaleString('pt-BR')}</p>
                                        </div>
                                      );
                                    }}
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="current"
                                    stroke="hsl(var(--success))"
                                    strokeWidth={2}
                                    dot={false}
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="target"
                                    stroke="hsl(var(--muted-foreground))"
                                    strokeWidth={1}
                                    strokeDasharray="5 5"
                                    dot={false}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
