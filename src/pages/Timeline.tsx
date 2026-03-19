import { useState, useMemo } from "react";
import {
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTransactions } from "@/hooks/useTransactions";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, addDays, addWeeks, addMonths, addYears, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { parseISOToLocal, formatFullDate } from "@/lib/date-utils";
import { Transaction } from "@/hooks/useTransactions";

type ViewMode = "day" | "week" | "month" | "year";

export default function Timeline() {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: transactions = [], isLoading } = useTransactions();

  // Get date range based on view mode
  const dateRange = useMemo(() => {
    switch (viewMode) {
      case "day":
        return { start: currentDate, end: currentDate };
      case "week":
        return { start: startOfWeek(currentDate, { locale: ptBR }), end: endOfWeek(currentDate, { locale: ptBR }) };
      case "month":
        return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
      case "year":
        return { start: startOfYear(currentDate), end: endOfYear(currentDate) };
    }
  }, [currentDate, viewMode]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const date = parseISOToLocal(t.date);
      return date >= dateRange.start && date <= dateRange.end;
    }).sort((a, b) => parseISOToLocal(b.date).getTime() - parseISOToLocal(a.date).getTime());
  }, [transactions, dateRange]);

  // Group transactions by day
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, typeof transactions> = {};

    filteredTransactions.forEach(t => {
      const dateKey = t.date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(t);
    });

    return Object.entries(groups).sort((a, b) =>
      parseISOToLocal(b[0]).getTime() - parseISOToLocal(a[0]).getTime()
    );
  }, [filteredTransactions]);

  // Calculate totals
  const totals = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === "income")
      .reduce((acc, t) => acc + Number(t.amount), 0);
    const expenses = filteredTransactions
      .filter(t => t.type === "expense")
      .reduce((acc, t) => acc + Number(t.amount), 0);
    return { income, expenses, balance: income - expenses };
  }, [filteredTransactions]);

  const navigatePrev = () => {
    switch (viewMode) {
      case "day":
        setCurrentDate(addDays(currentDate, -1));
        break;
      case "week":
        setCurrentDate(addWeeks(currentDate, -1));
        break;
      case "month":
        setCurrentDate(addMonths(currentDate, -1));
        break;
      case "year":
        setCurrentDate(addYears(currentDate, -1));
        break;
    }
  };

  const navigateNext = () => {
    switch (viewMode) {
      case "day":
        setCurrentDate(addDays(currentDate, 1));
        break;
      case "week":
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case "month":
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case "year":
        setCurrentDate(addYears(currentDate, 1));
        break;
    }
  };

  const getDateLabel = () => {
    switch (viewMode) {
      case "day":
        return format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
      case "week":
        return `${format(dateRange.start, "d MMM", { locale: ptBR })} - ${format(dateRange.end, "d MMM yyyy", { locale: ptBR })}`;
      case "month":
        return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
      case "year":
        return format(currentDate, "yyyy");
    }
  };

  const getDayLabel = (dateStr: string) => {
    const date = parseISOToLocal(dateStr);
    const today = new Date();
    const yesterday = addDays(today, -1);

    if (isSameDay(date, today)) return "Hoje";
    if (isSameDay(date, yesterday)) return "Ontem";
    return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
  };

  const getDayTotals = (dayTransactions: typeof transactions) => {
    const income = dayTransactions
      .filter(t => t.type === "income")
      .reduce((acc, t) => acc + Number(t.amount), 0);
    const expenses = dayTransactions
      .filter(t => t.type === "expense")
      .reduce((acc, t) => acc + Number(t.amount), 0);
    return { income, expenses };
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Linha do Tempo</h1>
              <p className="text-muted-foreground">Visualize suas transações cronologicamente</p>
            </div>
          </div>

          {/* View Mode Tabs */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList>
              <TabsTrigger value="day">Dia</TabsTrigger>
              <TabsTrigger value="week">Semana</TabsTrigger>
              <TabsTrigger value="month">Mês</TabsTrigger>
              <TabsTrigger value="year">Ano</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Navigation and Summary */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" size="icon" onClick={navigatePrev}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-semibold capitalize">{getDateLabel()}</h2>
              <Button variant="outline" size="icon" onClick={navigateNext}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-success/10 rounded-lg">
                <TrendingUp className="w-5 h-5 mx-auto text-success mb-1" />
                <p className="text-xs text-muted-foreground">Receitas</p>
                <p className="font-bold text-success">
                  R$ {totals.income.toFixed(2)}
                </p>
              </div>
              <div className="text-center p-3 bg-destructive/10 rounded-lg">
                <TrendingDown className="w-5 h-5 mx-auto text-destructive mb-1" />
                <p className="text-xs text-muted-foreground">Despesas</p>
                <p className="font-bold text-destructive">
                  R$ {totals.expenses.toFixed(2)}
                </p>
              </div>
              <div className={cn(
                "text-center p-3 rounded-lg",
                totals.balance >= 0 ? "bg-success/10" : "bg-destructive/10"
              )}>
                <ArrowUpDown className={cn(
                  "w-5 h-5 mx-auto mb-1",
                  totals.balance >= 0 ? "text-success" : "text-destructive"
                )} />
                <p className="text-xs text-muted-foreground">Saldo</p>
                <p className={cn(
                  "font-bold",
                  totals.balance >= 0 ? "text-success" : "text-destructive"
                )}>
                  R$ {totals.balance.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <ScrollArea className="h-[calc(100vh-24rem)]">
          <div className="space-y-6">
            {groupedTransactions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Nenhuma transação neste período</p>
                </CardContent>
              </Card>
            ) : (
              groupedTransactions.map(([date, dayTransactions]) => {
                const dayTotals = getDayTotals(dayTransactions);
                return (
                  <div key={date} className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border" />

                    {/* Day Header */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center z-10">
                        <Calendar className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <div>
                          <p className="font-semibold capitalize">{getDayLabel(date)}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFullDate(date)}
                          </p>
                        </div>
                        <div className="flex gap-3 text-sm">
                          {dayTotals.income > 0 && (
                            <span className="text-success">+R$ {dayTotals.income.toFixed(2)}</span>
                          )}
                          {dayTotals.expenses > 0 && (
                            <span className="text-destructive">-R$ {dayTotals.expenses.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Transactions */}
                    <div className="ml-12 space-y-2">
                      {dayTransactions.map((transaction) => (
                        <Card key={transaction.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <div
                                className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center p-2 shrink-0 shadow-sm",
                                  !(transaction as any).category?.icon && (
                                    transaction.type === "income"
                                      ? "bg-success text-white"
                                      : "bg-destructive text-white"
                                  )
                                )}
                                style={(transaction as any).category?.icon ? { backgroundColor: (transaction as any).category.color } : {}}
                              >
                                {(transaction as any).category?.icon?.endsWith('.svg') ? (
                                  <img
                                    src={`/icons/categorias/${transaction.type === 'income' ? 'receitas' : 'despesas'}/${(transaction as any).category.icon}`}
                                    alt=""
                                    className="w-full h-full object-contain"
                                  />
                                ) : (transaction as any).category?.icon ? (
                                  <span className="text-xl text-white font-bold">
                                    {(transaction as any).category.icon}
                                  </span>
                                ) : transaction.type === "income" ? (
                                  <Clock className="w-5 h-5 text-white" />
                                ) : (
                                  <Clock className="w-5 h-5 text-white" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{transaction.description}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>{(transaction as any).category?.name || "Sem categoria"}</span>
                                  {transaction.payment_method && (
                                    <>
                                      <span>•</span>
                                      <span className="capitalize">{transaction.payment_method}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p
                                  className={cn(
                                    "font-bold",
                                    transaction.type === "income" ? "text-success" : "text-destructive"
                                  )}
                                >
                                  {transaction.type === "income" ? "+" : "-"}R$ {Number(transaction.amount).toFixed(2)}
                                </p>
                                {transaction.is_recurring && (
                                  <Badge variant="outline" className="text-xs">
                                    Recorrente
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </AppLayout>
  );
}
