import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReports } from "@/hooks/useReports";
import { useCategories } from "@/hooks/useCategories";
import { 
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  BarChart3,
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Crown
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, LineChart, Line, Legend, Area, AreaChart } from "recharts";

const PRESET_PERIODS = [
  { label: "Este mês", getValue: () => ({ start: format(startOfMonth(new Date()), "yyyy-MM-dd"), end: format(endOfMonth(new Date()), "yyyy-MM-dd") }) },
  { label: "Mês passado", getValue: () => ({ start: format(startOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd"), end: format(endOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd") }) },
  { label: "Últimos 3 meses", getValue: () => ({ start: format(startOfMonth(subMonths(new Date(), 2)), "yyyy-MM-dd"), end: format(endOfMonth(new Date()), "yyyy-MM-dd") }) },
  { label: "Este ano", getValue: () => ({ start: format(startOfYear(new Date()), "yyyy-MM-dd"), end: format(endOfYear(new Date()), "yyyy-MM-dd") }) },
];

export default function Reports() {
  const { 
    reportData, 
    isLoading, 
    dateRange, 
    setDateRange, 
    categoryFilter, 
    setCategoryFilter,
    typeFilter,
    setTypeFilter,
    exportToPDF, 
    exportToExcel 
  } = useReports();
  const { data: categories = [] } = useCategories();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const incomeCategories = reportData?.byCategory.filter(c => c.type === "income") || [];
  const expenseCategories = reportData?.byCategory.filter(c => c.type === "expense") || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-full p-2">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Relatórios
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              </h1>
              <p className="text-muted-foreground">Análise detalhada das suas finanças</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToPDF}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" onClick={exportToExcel}>
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Period Presets - horizontal scroll on mobile */}
              <div className="overflow-x-auto -mx-4 px-4">
                <div className="flex gap-2 min-w-max">
                  {PRESET_PERIODS.map((preset, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => setDateRange(preset.getValue())}
                      className="whitespace-nowrap"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Date Range and Filters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs">De</Label>
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="text-xs">Até</Label>
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <Select value={typeFilter || "all"} onValueChange={v => setTypeFilter(v === "all" ? null : v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="income">Receitas</SelectItem>
                    <SelectItem value="expense">Despesas</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter || "all"} onValueChange={v => setCategoryFilter(v === "all" ? null : v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-8">Carregando relatório...</div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Receitas</p>
                      <p className="text-2xl font-bold text-green-500">
                        {formatCurrency(reportData?.summary.totalIncome || 0)}
                      </p>
                    </div>
                    <div className="bg-green-500/10 rounded-full p-3">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                  {reportData?.comparison.changes.incomeChange !== 0 && (
                    <div className="mt-2 flex items-center text-sm">
                      {reportData.comparison.changes.incomeChange > 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                      <span className={reportData.comparison.changes.incomeChange > 0 ? "text-green-500" : "text-red-500"}>
                        {Math.abs(reportData.comparison.changes.incomeChange).toFixed(1)}%
                      </span>
                      <span className="text-muted-foreground ml-1">vs período anterior</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Despesas</p>
                      <p className="text-2xl font-bold text-red-500">
                        {formatCurrency(reportData?.summary.totalExpenses || 0)}
                      </p>
                    </div>
                    <div className="bg-red-500/10 rounded-full p-3">
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    </div>
                  </div>
                  {reportData?.comparison.changes.expenseChange !== 0 && (
                    <div className="mt-2 flex items-center text-sm">
                      {reportData.comparison.changes.expenseChange > 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-red-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-green-500" />
                      )}
                      <span className={reportData.comparison.changes.expenseChange > 0 ? "text-red-500" : "text-green-500"}>
                        {Math.abs(reportData.comparison.changes.expenseChange).toFixed(1)}%
                      </span>
                      <span className="text-muted-foreground ml-1">vs período anterior</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Saldo</p>
                      <p className={`text-2xl font-bold ${(reportData?.summary.balance || 0) >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {formatCurrency(reportData?.summary.balance || 0)}
                      </p>
                    </div>
                    <div className="bg-primary/10 rounded-full p-3">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Transações</p>
                      <p className="text-2xl font-bold">
                        {reportData?.summary.transactionCount || 0}
                      </p>
                    </div>
                    <div className="bg-primary/10 rounded-full p-3">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <Tabs defaultValue="timeline">
              <TabsList>
                <TabsTrigger value="timeline" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Evolução
                </TabsTrigger>
                <TabsTrigger value="categories" className="gap-2">
                  <PieChart className="h-4 w-4" />
                  Categorias
                </TabsTrigger>
                <TabsTrigger value="comparison" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Comparativo
                </TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Receitas vs Despesas</CardTitle>
                    <CardDescription>Evolução ao longo do período</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={reportData?.timeline || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(v) => format(parseISO(v), "dd/MM")}
                          />
                          <YAxis tickFormatter={(v) => `R$ ${v}`} />
                          <Tooltip 
                            formatter={(value: number) => formatCurrency(value)}
                            labelFormatter={(label) => format(parseISO(label), "dd/MM/yyyy")}
                          />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="income" 
                            name="Receitas" 
                            stackId="1"
                            stroke="#22c55e" 
                            fill="#22c55e" 
                            fillOpacity={0.3}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="expense" 
                            name="Despesas" 
                            stackId="2"
                            stroke="#ef4444" 
                            fill="#ef4444" 
                            fillOpacity={0.3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="categories" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Expenses by Category */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Despesas por Categoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RePieChart>
                            <Pie
                              data={expenseCategories}
                              dataKey="total"
                              nameKey="category_name"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({ category_name, percentage }) => `${category_name} (${percentage.toFixed(0)}%)`}
                            >
                              {expenseCategories.map((entry, index) => (
                                <Cell key={index} fill={entry.category_color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          </RePieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 space-y-2">
                        {expenseCategories.slice(0, 5).map(cat => (
                          <div key={cat.category_id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.category_color }} />
                              <span className="text-sm">{cat.category_icon} {cat.category_name}</span>
                            </div>
                            <span className="text-sm font-medium">{formatCurrency(cat.total)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Income by Category */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Receitas por Categoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RePieChart>
                            <Pie
                              data={incomeCategories}
                              dataKey="total"
                              nameKey="category_name"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({ category_name, percentage }) => `${category_name} (${percentage.toFixed(0)}%)`}
                            >
                              {incomeCategories.map((entry, index) => (
                                <Cell key={index} fill={entry.category_color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          </RePieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 space-y-2">
                        {incomeCategories.slice(0, 5).map(cat => (
                          <div key={cat.category_id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.category_color }} />
                              <span className="text-sm">{cat.category_icon} {cat.category_name}</span>
                            </div>
                            <span className="text-sm font-medium">{formatCurrency(cat.total)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="comparison" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Comparativo com Período Anterior</CardTitle>
                    <CardDescription>Como suas finanças mudaram</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            {
                              name: "Receitas",
                              atual: reportData?.summary.totalIncome || 0,
                              anterior: reportData?.comparison.previousPeriod.income || 0,
                            },
                            {
                              name: "Despesas",
                              atual: reportData?.summary.totalExpenses || 0,
                              anterior: reportData?.comparison.previousPeriod.expenses || 0,
                            },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(v) => `R$ ${v}`} />
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Legend />
                          <Bar dataKey="anterior" name="Período Anterior" fill="#94a3b8" />
                          <Bar dataKey="atual" name="Período Atual" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AppLayout>
  );
}
