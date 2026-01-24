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
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let result = (transactions || []).filter((t) => {
      const transactionDate = new Date(t.date);
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
      years.add(new Date(t.date).getFullYear());
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
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Transações</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie suas receitas e despesas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV} className="flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Exportar</span> CSV
          </Button>
          <Button className="btn-gradient flex-1 sm:flex-none" size="sm" onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-1.5" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex items-center justify-center gap-2 mb-6 animate-fade-in" style={{ animationDelay: '50ms' }}>
        <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[200px]">
              <Calendar className="w-4 h-4 mr-2" />
              {MONTHS[selectedMonth]} {selectedYear}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4" align="center">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Ano</label>
                <div className="flex flex-wrap gap-2">
                  {availableYears.map(year => (
                    <Button
                      key={year}
                      variant={selectedYear === year ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedYear(year)}
                    >
                      {year}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Mês</label>
                <div className="grid grid-cols-3 gap-2">
                  {MONTHS.map((month, index) => (
                    <Button
                      key={month}
                      variant={selectedMonth === index ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedMonth(index);
                        setIsCalendarOpen(false);
                        setCurrentPage(1);
                      }}
                    >
                      {month.slice(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>
              <Button variant="secondary" className="w-full" onClick={goToCurrentMonth}>
                Mês Atual
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <Button variant="ghost" size="icon" onClick={goToNextMonth}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
        <div className="stat-card animate-fade-in p-3 sm:p-4" style={{ animationDelay: '100ms' }}>
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Receitas</p>
          <p className="text-sm sm:text-xl font-bold text-success truncate">{formatCurrency(stats.totalIncome)}</p>
        </div>
        <div className="stat-card animate-fade-in p-3 sm:p-4" style={{ animationDelay: '150ms' }}>
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Despesas</p>
          <p className="text-sm sm:text-xl font-bold text-destructive truncate">{formatCurrency(stats.totalExpense)}</p>
        </div>
        <div className="stat-card animate-fade-in p-3 sm:p-4" style={{ animationDelay: '200ms' }}>
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Saldo</p>
          <p className={cn(
            "text-sm sm:text-xl font-bold truncate",
            stats.balance >= 0 ? "text-success" : "text-destructive"
          )}>
            {formatCurrency(stats.balance)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-6 animate-fade-in" style={{ animationDelay: '250ms' }}>
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar transações..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible">
          {/* Advanced Filters */}
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn(hasActiveFilters && "border-primary text-primary")}>
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                {hasActiveFilters && (
                  <span className="ml-2 w-2 h-2 rounded-full bg-primary" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoria</label>
                  <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {categories?.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Método de Pagamento</label>
                  <Select value={paymentMethodFilter} onValueChange={(v) => { setPaymentMethodFilter(v); setCurrentPage(1); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {paymentMethods.map(pm => (
                        <SelectItem key={pm} value={pm}>
                          {pm === "pix" ? "PIX" : 
                           pm === "credit" ? "Crédito" :
                           pm === "debit" ? "Débito" :
                           pm === "cash" ? "Dinheiro" :
                           pm === "transfer" ? "Transferência" :
                           pm === "boleto" ? "Boleto" : pm}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {hasActiveFilters && (
                  <Button variant="ghost" className="w-full" onClick={clearFilters}>
                    Limpar Filtros
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Type Filter */}
          <div className="flex bg-muted rounded-lg p-1 overflow-x-auto">
            {(["all", "income", "expense"] as const).map((type) => (
              <button
                key={type}
                onClick={() => { setFilter(type); setCurrentPage(1); }}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  filter === type
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {type === "all" ? "Todas" : type === "income" ? "Receitas" : "Despesas"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex gap-2 mb-4 animate-fade-in" style={{ animationDelay: '280ms' }}>
        <span className="text-sm text-muted-foreground flex items-center">Ordenar por:</span>
        {([
          { field: "date" as SortField, label: "Data" },
          { field: "amount" as SortField, label: "Valor" },
          { field: "category" as SortField, label: "Categoria" },
        ]).map(({ field, label }) => (
          <Button
            key={field}
            variant={sortField === field ? "secondary" : "ghost"}
            size="sm"
            onClick={() => toggleSort(field)}
            className="gap-1"
          >
            {label}
            {sortField === field && (
              <ArrowUpDown className={cn("w-3 h-3", sortOrder === "asc" && "rotate-180")} />
            )}
          </Button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: '300ms' }}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">Nenhuma transação encontrada</p>
            <p className="text-sm">Não há transações para {MONTHS[selectedMonth]} de {selectedYear}</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-border/50">
              {paginatedTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0",
                      transaction.type === "income"
                        ? "bg-success/10"
                        : "bg-destructive/10"
                    )}
                  >
                    {transaction.category?.icon ? (
                      <span className="text-xl sm:text-2xl">{transaction.category.icon}</span>
                    ) : transaction.type === "income" ? (
                      <ArrowDownLeft className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate text-sm sm:text-base">
                      {transaction.description}
                    </p>
                    <div className="flex items-center gap-1 sm:gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {formatDate(transaction.date)}
                      </span>
                      <span className="text-muted-foreground/50 hidden sm:inline">•</span>
                      <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                        {transaction.category?.name || "Sem categoria"}
                      </span>
                      {transaction.payment_method && (
                        <>
                          <span className="text-muted-foreground/50 hidden sm:inline">•</span>
                          <span className="text-xs sm:text-sm text-muted-foreground capitalize hidden sm:inline">
                            {transaction.payment_method === "pix" ? "PIX" : 
                             transaction.payment_method === "credit" ? "Crédito" :
                             transaction.payment_method === "debit" ? "Débito" :
                             transaction.payment_method === "cash" ? "Dinheiro" :
                             transaction.payment_method}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={cn(
                        "font-semibold text-sm sm:text-base",
                        transaction.type === "income"
                          ? "text-success"
                          : "text-destructive"
                      )}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(Number(transaction.amount))}
                    </p>
                  </div>

                  {/* Actions - visible on mobile */}
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="shrink-0 h-8 w-8 sm:h-9 sm:w-9"
                      onClick={() => handleEdit(transaction)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 hidden sm:flex"
                      onClick={() => handleDuplicate(transaction)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteId(transaction.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} de {filteredTransactions.length}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "ghost"}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A transação será permanentemente excluída.
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
