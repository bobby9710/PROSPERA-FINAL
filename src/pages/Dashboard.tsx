import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useTransactionStats, useRecentTransactions, useMonthlyChartData } from "@/hooks/useTransactions";
import { useCategoryStats } from "@/hooks/useCategories";
import { useActiveGoals } from "@/hooks/useGoals";
import { formatCurrency, cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function Dashboard() {
  const { user } = useAuth();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const { data: stats, isLoading: statsLoading } = useTransactionStats(selectedMonth, selectedYear);
  const { data: recentTransactions, isLoading: transactionsLoading } = useRecentTransactions(5, selectedMonth, selectedYear);
  const { data: categoryStats, isLoading: categoriesLoading } = useCategoryStats(selectedMonth, selectedYear);
  const { data: activeGoals, isLoading: goalsLoading } = useActiveGoals(3);
  const { data: chartData, isLoading: chartLoading } = useMonthlyChartData(6);

  const isLoading = statsLoading || transactionsLoading || categoriesLoading || goalsLoading || chartLoading;

  // Navigation functions
  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Hero Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Balance Card */}
              <div className="lg:col-span-2 relative overflow-hidden glass rounded-2xl p-8 flex flex-col justify-between group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-slate-400 text-sm font-medium mb-1 uppercase tracking-wider">Saldo Total</p>
                      <h3 className="text-4xl font-extrabold dark:text-white">
                        {formatCurrency(stats?.balance || 0)}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
                      <span className="material-symbols-outlined text-sm">trending_up</span>
                      2.4%
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Link 
                      to="/transactions?new=true"
                      className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 glow-primary"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      Adicionar
                    </Link>
                    <Link 
                      to="/transactions?transfer=true"
                      className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">upload</span>
                      Transferir
                    </Link>
                  </div>
                </div>
                
                <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/5 pt-6 relative z-10">
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Entradas</p>
                    <p className="text-emerald-400 font-bold">{formatCurrency(stats?.totalIncome || 0)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Saídas</p>
                    <p className="text-rose-400 font-bold">{formatCurrency(stats?.totalExpense || 0)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Investido</p>
                    <p className="text-primary font-bold">{formatCurrency(stats?.balance || 0)}</p>
                  </div>
                </div>
              </div>

              {/* Active Goals */}
              <div className="glass rounded-2xl p-6 flex flex-col">
                <h4 className="text-lg font-bold mb-6 flex items-center justify-between">
                  Metas Ativas
                  <Link to="/goals" className="text-primary text-xs font-bold hover:underline">Ver todas</Link>
                </h4>
                <div className="space-y-6">
                  {activeGoals && activeGoals.length > 0 ? (
                    activeGoals.map((goal) => {
                      const percentage = Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100);
                      return (
                        <div key={goal.id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-300 font-medium">{goal.name}</span>
                            <span className="text-slate-400">{percentage}%</span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-1000" 
                              style={{ 
                                width: `${Math.min(100, percentage)}%`, 
                                backgroundColor: goal.color || "var(--primary)" 
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-slate-500 text-sm py-4 text-center">Nenhuma meta em andamento.</p>
                  )}
                </div>
                <Link 
                  to="/goals?new=true"
                  className="mt-6 border border-dashed border-slate-700 hover:border-primary py-3 rounded-xl text-slate-500 hover:text-primary transition-all text-sm font-medium flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  Nova Meta
                </Link>
              </div>
            </div>

            {/* Charts and Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Spending Chart */}
              <div className="glass rounded-2xl p-6">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h4 className="text-lg font-bold">Gastos Mensais</h4>
                    <p className="text-slate-500 text-xs">Comparativo dos últimos 6 meses</p>
                  </div>
                  <select 
                    className="bg-slate-800 border-none rounded-lg text-xs font-bold px-3 py-1.5 focus:ring-1 focus:ring-primary text-slate-100"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                  >
                    <option value={now.getFullYear()}>{now.getFullYear()}</option>
                    <option value={now.getFullYear() - 1}>{now.getFullYear() - 1}</option>
                  </select>
                </div>
                <div className="h-64 flex items-end justify-between gap-4 px-2">
                  {chartData && chartData.map((d, i) => {
                    const maxVal = Math.max(...chartData.map(item => item.despesas), 1);
                    const heightPercent = Math.max(10, (d.despesas / maxVal) * 100);
                    return (
                      <div key={i} className="flex flex-col items-center gap-2 flex-1 group h-full justify-end">
                        <div 
                          className="w-full bg-gradient-to-t from-primary to-purple-400 rounded-t-lg relative transition-all duration-300 group-hover:scale-x-110 group-hover:brightness-110 bar-animate" 
                          style={{ 
                            "--target-height": `${heightPercent}%`,
                            height: "0%"
                          } as any}
                        >
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm text-[10px] px-3 py-1.5 rounded-lg border border-primary/20 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none text-white font-bold">
                            {formatCurrency(d.despesas)}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold">{d.month.substring(0,3)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="glass rounded-2xl p-6">
                <h4 className="text-lg font-bold mb-6">Gastos por Categoria</h4>
                <div className="space-y-4">
                  {categoryStats && categoryStats.length > 0 ? (
                    categoryStats.slice(0, 4).map((cat, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                            style={{ backgroundColor: `${cat.color}33`, color: cat.color }}
                          >
                            {cat.icon?.endsWith('.svg') ? (
                              <img
                                src={`/icons/categorias/despesas/${cat.icon}`}
                                alt={cat.name}
                                className="w-5 h-5 object-contain"
                                style={{ filter: `drop-shadow(0 0 1px ${cat.color})` }}
                              />
                            ) : (
                              <span className="material-symbols-outlined">{cat.icon || 'category'}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-200">{cat.name}</p>
                            <p className="text-xs text-slate-500">{cat.transactionsCount || 0} Registros</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-200">{formatCurrency(cat.value)}</p>
                          <p className="text-[10px] text-slate-400">{Math.round(cat.percentage || 0)}% do total</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm py-4 text-center">Nenhum registro encontrado no mês</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="glass rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-bold">Últimas Transações</h4>
                <Link to="/transactions" className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all text-slate-200">Ver Histórico Completo</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-slate-800">
                      <th className="pb-4 px-2">Estabelecimento</th>
                      <th className="pb-4 px-2">Data</th>
                      <th className="pb-4 px-2">Categoria</th>
                      <th className="pb-4 px-2">Status</th>
                      <th className="pb-4 px-2 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {recentTransactions && recentTransactions.map((t) => (
                      <tr key={t.id} className="group hover:bg-white/5 transition-colors">
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-100">
                              {t.category?.icon?.endsWith('.svg') ? (
                                <img
                                  src={`/icons/categorias/${t.type === 'income' ? 'receitas' : 'despesas'}/${t.category.icon}`}
                                  alt={t.category.name}
                                  className="w-[18px] h-[18px] object-contain"
                                  style={{ filter: `drop-shadow(0 0 1px ${t.category.color})` }}
                                />
                              ) : t.category?.icon ? (
                                <span className="material-symbols-outlined text-[18px]" style={{ color: t.category.color }}>
                                  {t.category.icon}
                                </span>
                             ) : (
                              <span className="material-symbols-outlined text-[18px] text-slate-500">
                                {t.type === 'income' ? 'payments' : 'local_mall'}
                              </span>
                             )}
                            </div>
                            <span className="text-sm font-semibold text-slate-200">{t.description}</span>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-sm text-slate-400">
                          {new Date(t.date).toLocaleDateString("pt-BR", { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-4 px-2">
                          <span 
                            className="text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wide"
                            style={{ 
                              backgroundColor: `${t.category?.color || '#3b82f6'}1a`, 
                              color: t.category?.color || '#3b82f6'
                            }}
                          >
                            {t.category?.name || "Global"}
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                            Confirmado
                          </div>
                        </td>
                        <td className={cn(
                          "py-4 px-2 text-right text-sm font-bold",
                          t.type === 'income' ? "text-emerald-400" : "text-slate-100"
                        )}>
                          {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <footer className="pt-6 pb-2 text-center shrink-0">
              <p className="text-slate-500 text-xs mt-8 pb-4">© 2024 Prospera Finanças Inteligentes. Todos os dados são criptografados.</p>
            </footer>
          </>
        )}
      </div>
    </AppLayout>
  );
}
