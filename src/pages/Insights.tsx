import { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Lightbulb, 
  RefreshCw,
  Calendar,
  Target,
  PiggyBank,
  Crown,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInsights, useGenerateInsights } from "@/hooks/useInsights";
import { useTransactions } from "@/hooks/useTransactions";
import { useFinancialContext } from "@/hooks/useFinancialContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function Insights() {
  const [activeTab, setActiveTab] = useState("monthly");
  
  const { data: insights = [], isLoading: insightsLoading } = useInsights();
  const { data: transactions = [] } = useTransactions();
  const { data: financialContext } = useFinancialContext();
  const generateInsights = useGenerateInsights();

  const monthlyInsight = insights.find(i => i.type === "monthly_analysis");
  const patternsInsight = insights.find(i => i.type === "spending_pattern");
  const recommendationsInsight = insights.find(i => i.type === "recommendation");

  // Map internal type names to database constraint values
  const getDbType = (uiType: string) => {
    const typeMap: Record<string, string> = {
      "spending_patterns": "spending_pattern",
      "recommendations": "recommendation",
      "monthly_analysis": "monthly_analysis"
    };
    return typeMap[uiType] || uiType;
  };

  const handleGenerateInsight = async (type: string) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= startOfMonth && date <= endOfMonth;
    });

    const income = monthTransactions
      .filter(t => t.type === "income")
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const expenses = monthTransactions
      .filter(t => t.type === "expense")
      .reduce((acc, t) => acc + Number(t.amount), 0);

    // Get previous month expenses
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const prevTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= prevStart && date <= prevEnd;
    });
    const previousExpenses = prevTransactions
      .filter(t => t.type === "expense")
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const financialData = {
      income,
      expenses,
      balance: income - expenses,
      previousExpenses,
      categories: financialContext?.categoryBreakdown || [],
      transactions: monthTransactions.map(t => ({
        date: t.date,
        description: t.description,
        amount: Number(t.amount),
        category: (t as any).categories?.name || "Sem categoria",
      })),
      topExpenses: (financialContext?.categoryBreakdown || []).slice(0, 5).map(c => ({
        category: c.name,
        amount: c.total,
      })),
      emergencyFundProgress: financialContext?.goalsProgress || 0,
      activeGoals: financialContext?.goalsCount || 0,
    };

    await generateInsights.mutateAsync({ type, financialData });
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "up":
        return <ArrowUp className="w-4 h-4 text-destructive" />;
      case "down":
        return <ArrowDown className="w-4 h-4 text-success" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "alta":
        return "bg-destructive/20 text-destructive";
      case "média":
        return "bg-warning/20 text-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">Insights & Análises</h1>
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              </div>
              <p className="text-muted-foreground">Análises personalizadas com IA</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="monthly" className="gap-2">
              <Calendar className="w-4 h-4" />
              Mensal
            </TabsTrigger>
            <TabsTrigger value="patterns" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Padrões
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="gap-2">
              <Lightbulb className="w-4 h-4" />
              Dicas
            </TabsTrigger>
          </TabsList>

          {/* Monthly Analysis */}
          <TabsContent value="monthly" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Análise Mensal</CardTitle>
                  <CardDescription>
                    {format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateInsight("monthly_analysis")}
                  disabled={generateInsights.isPending}
                >
                  <RefreshCw className={cn("w-4 h-4 mr-2", generateInsights.isPending && "animate-spin")} />
                  Gerar Análise
                </Button>
              </CardHeader>
              <CardContent>
                {monthlyInsight?.content ? (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <p className="text-sm leading-relaxed">{monthlyInsight.content.summary}</p>
                    </div>

                    {/* Score */}
                    {monthlyInsight.content.score && (
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Saúde Financeira</span>
                            <span className="text-sm font-bold">{monthlyInsight.content.score}/100</span>
                          </div>
                          <Progress value={monthlyInsight.content.score} className="h-2" />
                        </div>
                      </div>
                    )}

                    {/* Top Categories */}
                    {monthlyInsight.content.topCategories && (
                      <div>
                        <h4 className="text-sm font-medium mb-3">Principais Categorias</h4>
                        <div className="space-y-2">
                          {monthlyInsight.content.topCategories.map((cat: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-2">
                                {getTrendIcon(cat.trend)}
                                <span className="font-medium">{cat.name}</span>
                              </div>
                              <span className="font-bold">R$ {Number(cat.amount).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Comparison */}
                    {monthlyInsight.content.comparison && (
                      <div className="p-4 border border-border rounded-lg">
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Comparativo
                        </h4>
                        <p className="text-sm text-muted-foreground">{monthlyInsight.content.comparison}</p>
                      </div>
                    )}

                    {/* Savings Opportunities */}
                    {monthlyInsight.content.savings && (
                      <div className="p-4 border border-success/30 bg-success/5 rounded-lg">
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-success">
                          <PiggyBank className="w-4 h-4" />
                          Oportunidades de Economia
                        </h4>
                        <p className="text-sm">{monthlyInsight.content.savings}</p>
                      </div>
                    )}

                    {/* Forecast */}
                    {monthlyInsight.content.forecast && (
                      <div className="p-4 border border-primary/30 bg-primary/5 rounded-lg">
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-primary">
                          <Target className="w-4 h-4" />
                          Previsão Próximo Mês
                        </h4>
                        <p className="text-sm">{monthlyInsight.content.forecast}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-4">Nenhuma análise gerada ainda</p>
                    <Button
                      onClick={() => handleGenerateInsight("monthly_analysis")}
                      disabled={generateInsights.isPending}
                    >
                      Gerar Primeira Análise
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Spending Patterns */}
          <TabsContent value="patterns" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Padrões de Gasto</CardTitle>
                  <CardDescription>Identifique tendências nos seus gastos</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateInsight("spending_pattern")}
                  disabled={generateInsights.isPending}
                >
                  <RefreshCw className={cn("w-4 h-4 mr-2", generateInsights.isPending && "animate-spin")} />
                  Atualizar
                </Button>
              </CardHeader>
              <CardContent>
                {patternsInsight?.content ? (
                  <div className="space-y-6">
                    {/* Recurring Expenses */}
                    {patternsInsight.content.recurringExpenses?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-3">Gastos Recorrentes</h4>
                        <div className="space-y-2">
                          {patternsInsight.content.recurringExpenses.map((exp: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div>
                                <p className="font-medium">{exp.description}</p>
                                <p className="text-xs text-muted-foreground">{exp.frequency}</p>
                              </div>
                              <span className="font-bold">R$ {Number(exp.amount).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dominant Category */}
                    {patternsInsight.content.dominantCategory && (
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <h4 className="text-sm font-medium mb-2">Categoria Dominante</h4>
                        <p className="text-2xl font-bold text-primary">
                          {patternsInsight.content.dominantCategory}
                        </p>
                      </div>
                    )}

                    {/* Peak Spending Days */}
                    {patternsInsight.content.peakSpendingDays?.length > 0 && (
                      <div className="p-4 border border-border rounded-lg">
                        <h4 className="text-sm font-medium mb-2">Dias de Maior Gasto</h4>
                        <div className="flex gap-2">
                          {patternsInsight.content.peakSpendingDays.map((day: string, i: number) => (
                            <Badge key={i} variant="outline" className="capitalize">
                              {day}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Weekly Pattern */}
                    {patternsInsight.content.weeklyPattern && (
                      <div className="p-4 border border-border rounded-lg">
                        <h4 className="text-sm font-medium mb-2">Padrão Semanal</h4>
                        <p className="text-sm text-muted-foreground">{patternsInsight.content.weeklyPattern}</p>
                      </div>
                    )}

                    {/* Monthly Trend */}
                    {patternsInsight.content.monthlyTrend && (
                      <div className="p-4 border border-border rounded-lg">
                        <h4 className="text-sm font-medium mb-2">Tendência Mensal</h4>
                        <p className="text-sm text-muted-foreground">{patternsInsight.content.monthlyTrend}</p>
                      </div>
                    )}

                    {/* Unusual Transactions */}
                    {patternsInsight.content.unusualTransactions?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                          <TrendingDown className="w-4 h-4 text-warning" />
                          Transações Fora do Padrão
                        </h4>
                        <div className="space-y-2">
                          {patternsInsight.content.unusualTransactions.map((trans: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                              <div>
                                <p className="font-medium">{trans.description}</p>
                                <p className="text-xs text-muted-foreground">{trans.reason}</p>
                              </div>
                              <span className="font-bold">R$ {Number(trans.amount).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-4">Nenhum padrão identificado ainda</p>
                    <Button
                      onClick={() => handleGenerateInsight("spending_pattern")}
                      disabled={generateInsights.isPending}
                    >
                      Identificar Padrões
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations */}
          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recomendações</CardTitle>
                  <CardDescription>Dicas personalizadas para melhorar suas finanças</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateInsight("recommendation")}
                  disabled={generateInsights.isPending}
                >
                  <RefreshCw className={cn("w-4 h-4 mr-2", generateInsights.isPending && "animate-spin")} />
                  Atualizar
                </Button>
              </CardHeader>
              <CardContent>
                {recommendationsInsight?.content?.recommendations ? (
                  <div className="space-y-6">
                    {/* Recommendations List */}
                    <div className="space-y-4">
                      {recommendationsInsight.content.recommendations.map((rec: any, i: number) => (
                        <div key={i} className="p-4 border border-border rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <Lightbulb className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{rec.title}</h4>
                                <Badge className={getPriorityColor(rec.priority)}>
                                  {rec.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                              {rec.potentialSavings > 0 && (
                                <p className="text-sm font-medium text-success">
                                  Economia potencial: R$ {rec.potentialSavings.toFixed(2)}/mês
                                </p>
                              )}
                              {rec.action && (
                                <p className="text-sm text-primary mt-2">
                                  💡 {rec.action}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Budget Suggestion */}
                    {recommendationsInsight.content.budgetSuggestion && (
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <h4 className="text-sm font-medium mb-3">Orçamento Sugerido (Regra 50-30-20)</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-primary">
                              {recommendationsInsight.content.budgetSuggestion.needs}%
                            </p>
                            <p className="text-xs text-muted-foreground">Necessidades</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-secondary">
                              {recommendationsInsight.content.budgetSuggestion.wants}%
                            </p>
                            <p className="text-xs text-muted-foreground">Desejos</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-success">
                              {recommendationsInsight.content.budgetSuggestion.savings}%
                            </p>
                            <p className="text-xs text-muted-foreground">Investimentos</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Goal Suggestion */}
                    {recommendationsInsight.content.goalSuggestion && (
                      <div className="p-4 border border-success/30 bg-success/5 rounded-lg">
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-success">
                          <Target className="w-4 h-4" />
                          Sugestão de Meta
                        </h4>
                        <p className="text-sm">{recommendationsInsight.content.goalSuggestion}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-4">Nenhuma recomendação gerada ainda</p>
                    <Button
                      onClick={() => handleGenerateInsight("recommendation")}
                      disabled={generateInsights.isPending}
                    >
                      Gerar Recomendações
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
