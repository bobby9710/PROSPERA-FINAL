import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  Calendar,
  Loader2,
  Download,
  ChevronLeft,
  ChevronRight,
  Edit,
  Copy,
  ArrowUpDown,
  Filter
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  useTransactions,
  useDeleteTransaction,
  useCreateTransaction,
  useUpdateTransaction,
  Transaction,
  CreateTransactionData
} from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { parseISOToLocal, formatFullDate } from "@/lib/date-utils";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { toast } from "sonner";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const ITEMS_PER_PAGE = 50;

type SortField = "date" | "amount" | "category";
type SortOrder = "asc" | "desc";

export default function Transactions() {
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | "duplicate">("create");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Period filter state
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: transactions, isLoading } = useTransactions();
  const { data: categories } = useCategories();
  const deleteTransaction = useDeleteTransaction();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return formatFullDate(dateString);
  };

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let result = (transactions || []).filter((t) => {
      const transactionDate = parseISOToLocal(t.date);
      const matchesPeriod =
        transactionDate.getMonth() === selectedMonth &&
        transactionDate.getFullYear() === selectedYear;
      const matchesType = filter === "all" || t.type === filter;
      const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.category?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || t.category_id === categoryFilter;
      const matchesPaymentMethod = paymentMethodFilter === "all" || t.payment_method === paymentMethodFilter;

      return matchesPeriod && matchesType && matchesSearch && matchesCategory && matchesPaymentMethod;
    });

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "amount":
          comparison = Number(a.amount) - Number(b.amount);
          break;
        case "category":
          comparison = (a.category?.name || "").localeCompare(b.category?.name || "");
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [transactions, selectedMonth, selectedYear, filter, searchQuery, categoryFilter, paymentMethodFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  // Calculate stats for the filtered period
  const stats = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === "income")
      .reduce((acc, t) => acc + Number(t.amount), 0);
    const totalExpense = filteredTransactions
      .filter(t => t.type === "expense")
      .reduce((acc, t) => acc + Number(t.amount), 0);
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
  }, [filteredTransactions]);

  // Get unique payment methods
  const paymentMethods = useMemo(() => {
    const methods = new Set<string>();
    (transactions || []).forEach(t => {
      if (t.payment_method) methods.add(t.payment_method);
    });
    return Array.from(methods);
  }, [transactions]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTransaction.mutateAsync(deleteId);
      toast.success("Transação excluída com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir transação");
    }
    setDeleteId(null);
  };

  const handleCreate = () => {
    setFormMode("create");
    setSelectedTransaction(null);
    setShowForm(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setFormMode("edit");
    setSelectedTransaction(transaction);
    setShowForm(true);
  };

  const handleDuplicate = (transaction: Transaction) => {
    setFormMode("duplicate");
    setSelectedTransaction(transaction);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: CreateTransactionData) => {
    if (formMode === "edit" && selectedTransaction) {
      await updateTransaction.mutateAsync({ id: selectedTransaction.id, data });
      toast.success("Transação atualizada com sucesso!");
    } else {
      await createTransaction.mutateAsync(data);
      toast.success("Transação criada com sucesso!");
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
    setCurrentPage(1);
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
    setCurrentPage(1);
  };

  const goToCurrentMonth = () => {
    setSelectedMonth(now.getMonth());
    setSelectedYear(now.getFullYear());
    setIsCalendarOpen(false);
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error("Nenhuma transação para exportar");
      return;
    }

    const headers = ["Data", "Descrição", "Categoria", "Tipo", "Valor", "Método de Pagamento", "Notas"];
    const rows = filteredTransactions.map(t => [
      t.date,
      t.description,
      t.category?.name || "Sem categoria",
      t.type === "income" ? "Receita" : "Despesa",
      t.amount.toString().replace(".", ","),
      t.payment_method || "",
      t.notes || ""
    ]);

    const csvContent = [
      headers.join(";"),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(";"))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transacoes_${MONTHS[selectedMonth].toLowerCase()}_${selectedYear}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Transações exportadas com sucesso!");
  };

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    (transactions || []).forEach(t => {
      years.add(parseISOToLocal(t.date).getFullYear());
    });
    years.add(now.getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  const clearFilters = () => {
    setCategoryFilter("all");
    setPaymentMethodFilter("all");
    setFilter("all");
    setSearchQuery("");
    setIsFilterOpen(false);
  };

  const hasActiveFilters = categoryFilter !== "all" || paymentMethodFilter !== "all" || filter !== "all";

  return (
    <AppLayout>
      {/* Decorative blurs */}
      <div className="fixed top-24 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="fixed bottom-20 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse"></div>

      <div className="max-w-[1400px] mx-auto w-full animate-fade-in p-2 pb-24">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Movimentações</h1>
            <p className="text-slate-400 text-sm">Gerencie seu fluxo de caixa e transações recentes.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button onClick={exportToCSV} className="flex items-center justify-center flex-1 md:flex-none gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 transition-all text-sm font-medium rounded-xl text-white">
              <span className="material-symbols-outlined text-[20px]">file_download</span>
              Exportar CSV
            </button>
            <button onClick={handleCreate} className="flex items-center justify-center flex-1 md:flex-none gap-2 px-5 py-2.5 bg-primary text-white hover:opacity-90 transition-all text-sm font-semibold rounded-xl glow-primary">
              <span className="material-symbols-outlined text-[20px]">add</span>
              Nova Transação
            </button>
          </div>
        </header>

        {/* Summary Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <span className="material-symbols-outlined">arrow_downward</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Receitas</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold tracking-tighter text-white">{formatCurrency(stats.totalIncome)}</span>
            </div>
          </div>
          
          <div className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
                <span className="material-symbols-outlined">arrow_upward</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Despesas</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold tracking-tighter text-white">{formatCurrency(stats.totalExpense)}</span>
            </div>
          </div>
          
          <div className="glass p-6 rounded-2xl border border-primary/20 relative overflow-hidden group bg-primary/5">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">account_balance_wallet</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary">Saldo do Período</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold tracking-tighter text-white">{formatCurrency(stats.balance)}</span>
              <span className="text-[11px] text-slate-400 font-medium mt-1">Líquido acumulado</span>
            </div>
          </div>
        </section>

        {/* Filters and List wrapper */}
        <section className="mb-8 flex flex-col xl:flex-row gap-6 items-center justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
            {/* Custom: Period Selector visually integrated as a rounded pill */}
            <div className="flex items-center bg-white/5 p-1 rounded-xl w-full sm:w-auto overflow-hidden shrink-0">
               <button onClick={goToPreviousMonth} className="px-3 py-2 text-slate-400 hover:text-white transition-all flex items-center justify-center">
                 <span className="material-symbols-outlined text-[18px]">chevron_left</span>
               </button>
               <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                 <PopoverTrigger asChild>
                   <button className="px-4 py-2 text-sm font-semibold text-white transition-all min-w-[120px] text-center">
                     {MONTHS[selectedMonth].substring(0,3)} {selectedYear}
                   </button>
                 </PopoverTrigger>
                 <PopoverContent className="w-64 p-4 glass border border-white/[0.05] shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-2xl" align="center">
                   <div className="space-y-4">
                     <div>
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Ano</label>
                       <div className="flex flex-wrap gap-2">
                         {availableYears.map(year => (
                           <Button key={year} variant={selectedYear === year ? "default" : "outline"} size="sm" onClick={() => setSelectedYear(year)} className="rounded-lg h-7">
                             {year}
                           </Button>
                         ))}
                       </div>
                     </div>
                     <div>
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Mês</label>
                       <div className="grid grid-cols-3 gap-2">
                         {MONTHS.map((month, index) => (
                           <Button key={month} variant={selectedMonth === index ? "default" : "outline"} size="sm" 
                             onClick={() => { setSelectedMonth(index); setIsCalendarOpen(false); setCurrentPage(1); }} 
                             className="rounded-lg h-7 text-xs">
                             {month.slice(0, 3)}
                           </Button>
                         ))}
                       </div>
                     </div>
                     <Button variant="secondary" className="w-full rounded-xl mt-2 h-8 text-xs font-bold" onClick={goToCurrentMonth}>
                       Mês Atual
                     </Button>
                   </div>
                 </PopoverContent>
               </Popover>
               <button onClick={goToNextMonth} className="px-3 py-2 text-slate-400 hover:text-white transition-all flex items-center justify-center">
                 <span className="material-symbols-outlined text-[18px]">chevron_right</span>
               </button>
            </div>

            <div className="flex items-center bg-white/5 p-1 rounded-xl w-full sm:w-auto shrink-0 overflow-x-auto hide-scrollbar">
              <button onClick={() => {setFilter("all"); setCurrentPage(1);}} className={cn("px-6 py-2 text-sm transition-all rounded-lg whitespace-nowrap", filter === "all" ? "bg-primary text-white font-semibold shadow-sm" : "font-medium text-slate-400 hover:text-white")}>Todas</button>
              <button onClick={() => {setFilter("income"); setCurrentPage(1);}} className={cn("px-6 py-2 text-sm transition-all rounded-lg whitespace-nowrap", filter === "income" ? "bg-primary text-white font-semibold shadow-sm" : "font-medium text-slate-400 hover:text-white")}>Receitas</button>
              <button onClick={() => {setFilter("expense"); setCurrentPage(1);}} className={cn("px-6 py-2 text-sm transition-all rounded-lg whitespace-nowrap", filter === "expense" ? "bg-primary text-white font-semibold shadow-sm" : "font-medium text-slate-400 hover:text-white")}>Despesas</button>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full xl:w-auto">
            <div className="relative flex-grow xl:w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
              <input value={searchQuery} onChange={e => {setSearchQuery(e.target.value); setCurrentPage(1);}} className="w-full bg-[#11141d] border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50 text-white placeholder:text-slate-400" placeholder="Buscar..." type="text"/>
            </div>
            
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <button className={cn("flex items-center justify-center gap-2 px-4 py-2.5 transition-all rounded-xl text-sm font-medium shrink-0", hasActiveFilters ? "bg-primary/20 text-primary border border-primary/30" : "bg-[#11141d] hover:bg-[#1f2331] text-white border border-white/5")}>
                  <span className="material-symbols-outlined text-[20px]">filter_list</span>
                  <span className="hidden sm:inline">Filtros</span>
                  {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary" />}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4 glass border border-white/[0.05] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]" align="end">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Categoria</label>
                    <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
                      <SelectTrigger className="bg-[#11141d] border-white/5 text-white h-10 rounded-xl">
                        <SelectValue placeholder="Todas as categorias" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[250px] bg-[#11141d] border-white/10 text-white rounded-xl">
                        <SelectItem value="all">Todas as categorias</SelectItem>
                        {categories?.filter(cat => filter === "all" || cat.type === filter).map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: `${cat.color}33`, color: cat.color }}>
                                {cat.icon?.endsWith('.svg') ? (
                                  <img src={`/icons/categorias/${cat.type === 'income' ? 'receitas' : 'despesas'}/${cat.icon}`} alt="" className="w-3 h-3 object-contain" style={{ filter: `drop-shadow(0 0 1px ${cat.color})` }} />
                                ) : (
                                  <span className="text-[10px] sm:text-[12px]">{cat.icon || "📦"}</span>
                                )}
                              </div>
                              <span className="text-sm">{cat.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Método</label>
                    <Select value={paymentMethodFilter} onValueChange={(v) => { setPaymentMethodFilter(v); setCurrentPage(1); }}>
                      <SelectTrigger className="bg-[#11141d] border-white/5 text-white h-10 rounded-xl">
                        <SelectValue placeholder="Todos os métodos" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#11141d] border-white/10 text-white rounded-xl">
                        <SelectItem value="all">Todos</SelectItem>
                        {paymentMethods.map(pm => (
                          <SelectItem key={pm} value={pm}>
                            {pm === "pix" ? "PIX" : pm === "credit" ? "Crédito" : pm === "debit" ? "Débito" : pm === "cash" ? "Dinheiro" : pm === "transfer" ? "Transferência" : pm === "boleto" ? "Boleto" : pm}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {hasActiveFilters && (
                     <Button variant="ghost" className="w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-10 rounded-xl mt-2" onClick={clearFilters}>Limpar Filtros</Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </section>

        {/* Transactions Table */}
        <div className="glass rounded-2xl border border-white/5 overflow-hidden animate-slide-up bg-[#07090f]/30" style={{ animationDelay: '300ms' }}>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 sm:px-8 py-5 text-[10px] uppercase font-bold tracking-widest text-slate-400">Transação</th>
                  <th className="px-4 sm:px-6 py-5 text-[10px] uppercase font-bold tracking-widest text-slate-400">Data</th>
                  <th className="px-4 sm:px-6 py-5 text-[10px] uppercase font-bold tracking-widest text-slate-400">Categoria</th>
                  <th className="px-4 sm:px-6 py-5 text-[10px] uppercase font-bold tracking-widest text-slate-400">Status</th>
                  <th className="px-6 sm:px-8 py-5 text-[10px] uppercase font-bold tracking-widest text-slate-400 text-right">Valor</th>
                  <th className="px-4 py-5 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                    </td>
                  </tr>
                ) : paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <p className="text-lg font-medium text-white mb-2">Nenhuma transação encontrada</p>
                      <p className="text-sm text-slate-400">Não há transações para os filtros aplicados neste período.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => handleEdit(transaction)}>
                      <td className="px-6 sm:px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div 
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                              !transaction.category?.icon ? (transaction.type === "income" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400") : ""
                            )}
                            style={transaction.category?.icon ? { backgroundColor: `${transaction.category.color}20`, color: transaction.category.color } : {}}
                          >
                            {transaction.category?.icon?.endsWith('.svg') ? (
                              <img
                                src={`/icons/categorias/${transaction.type === 'income' ? 'receitas' : 'despesas'}/${transaction.category.icon}`}
                                alt={transaction.category.name}
                                className="w-[18px] h-[18px] sm:w-5 sm:h-5 object-contain"
                                style={{ filter: `drop-shadow(0 0 1px ${transaction.category.color})` }}
                              />
                            ) : transaction.category?.icon ? (
                              <span className="material-symbols-outlined font-bold">{transaction.category.icon}</span>
                            ) : transaction.type === "income" ? (
                              <span className="material-symbols-outlined">arrow_downward</span>
                            ) : (
                              <span className="material-symbols-outlined">arrow_upward</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white truncate max-w-[150px] sm:max-w-xs">{transaction.description}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                              {transaction.category?.name || "Geral"} {transaction.payment_method && `• ${transaction.payment_method.replace('debit', 'Débito').replace('credit', 'Crédito').replace('transfer', 'Transferência')}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-5 text-sm text-slate-400 truncate">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-4 sm:px-6 py-5">
                        <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-slate-300 uppercase tracking-widest truncate max-w-[100px] inline-block">
                          {transaction.category?.name || "Sem cat."}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-5">
                        <div className="flex items-center gap-2 text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span className="text-[11px] font-semibold uppercase">Confirmado</span>
                        </div>
                      </td>
                      <td className={cn(
                        "px-6 sm:px-8 py-5 text-right font-bold whitespace-nowrap",
                        transaction.type === "income" ? "text-emerald-400" : "text-rose-400"
                      )}>
                        {transaction.type === "income" ? "+" : "-"} {formatCurrency(Number(transaction.amount))}
                      </td>
                      {/* Invisible actions column to allow hover actions without shifting table layout */}
                      <td className="px-2 py-5 w-16" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); handleDuplicate(transaction); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10" title="Duplicar">
                             <span className="material-symbols-outlined text-[18px]">file_copy</span>
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setDeleteId(transaction.id); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-400 hover:text-rose-300 hover:bg-rose-500/10" title="Apagar">
                             <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <footer className="p-4 sm:p-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-400 font-medium">Mostrando {Math.min(((currentPage - 1) * ITEMS_PER_PAGE) + 1, filteredTransactions.length)}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} de {filteredTransactions.length} transações</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                
                {/* Dynamically render page buttons matching HTML style */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all",
                        currentPage === pageNum 
                          ? "bg-primary text-white font-bold" 
                          : "bg-white/5 text-slate-400 hover:text-white"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className="text-slate-500 px-1">...</span>
                )}

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </footer>
          )}
        </div>
      </div>

      {/* Transaction Form Modal */}
      <TransactionForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={handleFormSubmit}
        initialData={selectedTransaction}
        isPending={createTransaction.isPending || updateTransaction.isPending}
        mode={formMode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="glass border-white/10 rounded-2xl p-6 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-xl">Excluir transação?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Esta ação não pode ser desfeita. A transação será permanentemente excluída da sua conta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3 sm:gap-2">
            <AlertDialogCancel className="bg-[#11141d] border-white/10 text-white hover:bg-white/5 hover:text-white rounded-xl border">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-500 text-white hover:bg-rose-600 rounded-xl shadow-lg shadow-rose-500/20"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
