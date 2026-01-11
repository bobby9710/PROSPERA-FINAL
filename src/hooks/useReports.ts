import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface ReportData {
  period: { start: string; end: string };
  summary: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    transactionCount: number;
  };
  byCategory: Array<{
    category_id: string;
    category_name: string;
    category_icon: string;
    category_color: string;
    total: number;
    percentage: number;
    type: string;
  }>;
  timeline: Array<{
    date: string;
    income: number;
    expense: number;
  }>;
  comparison: {
    previousPeriod: {
      income: number;
      expenses: number;
    };
    changes: {
      incomeChange: number;
      expenseChange: number;
    };
  };
}

export function useReports() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    end: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const { data: reportData, isLoading } = useQuery({
    queryKey: ["reports", user?.id, dateRange, categoryFilter, typeFilter],
    queryFn: async (): Promise<ReportData> => {
      if (!user) throw new Error("User not authenticated");

      // Fetch transactions for current period
      let query = supabase
        .from("transactions")
        .select(`
          *,
          categories (id, name, icon, color, type)
        `)
        .eq("user_id", user.id)
        .gte("date", dateRange.start)
        .lte("date", dateRange.end);

      if (categoryFilter) {
        query = query.eq("category_id", categoryFilter);
      }
      if (typeFilter) {
        query = query.eq("type", typeFilter);
      }

      const { data: transactions, error } = await query.order("date", { ascending: true });
      if (error) throw error;

      // Calculate previous period for comparison
      const startDate = parseISO(dateRange.start);
      const endDate = parseISO(dateRange.end);
      const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const prevStart = format(subMonths(startDate, 1), "yyyy-MM-dd");
      const prevEnd = format(subMonths(endDate, 1), "yyyy-MM-dd");

      const { data: prevTransactions } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", prevStart)
        .lte("date", prevEnd);

      // Calculate summary
      const totalIncome = transactions
        ?.filter(t => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const totalExpenses = transactions
        ?.filter(t => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      // Calculate by category
      const categoryMap = new Map<string, { 
        category_id: string;
        category_name: string;
        category_icon: string;
        category_color: string;
        total: number;
        type: string;
      }>();

      transactions?.forEach(t => {
        if (t.category_id && t.categories) {
          const cat = t.categories as { id: string; name: string; icon: string; color: string; type: string };
          const existing = categoryMap.get(t.category_id);
          if (existing) {
            existing.total += Number(t.amount);
          } else {
            categoryMap.set(t.category_id, {
              category_id: cat.id,
              category_name: cat.name,
              category_icon: cat.icon,
              category_color: cat.color,
              total: Number(t.amount),
              type: cat.type,
            });
          }
        }
      });

      const byCategory = Array.from(categoryMap.values())
        .map(cat => ({
          ...cat,
          percentage: cat.type === "income" 
            ? (totalIncome > 0 ? (cat.total / totalIncome) * 100 : 0)
            : (totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0),
        }))
        .sort((a, b) => b.total - a.total);

      // Calculate timeline
      const timelineMap = new Map<string, { income: number; expense: number }>();
      transactions?.forEach(t => {
        const date = t.date;
        const existing = timelineMap.get(date) || { income: 0, expense: 0 };
        if (t.type === "income") {
          existing.income += Number(t.amount);
        } else {
          existing.expense += Number(t.amount);
        }
        timelineMap.set(date, existing);
      });

      const timeline = Array.from(timelineMap.entries())
        .map(([date, values]) => ({ date, ...values }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Calculate comparison
      const prevIncome = prevTransactions
        ?.filter(t => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const prevExpenses = prevTransactions
        ?.filter(t => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      return {
        period: dateRange,
        summary: {
          totalIncome,
          totalExpenses,
          balance: totalIncome - totalExpenses,
          transactionCount: transactions?.length || 0,
        },
        byCategory,
        timeline,
        comparison: {
          previousPeriod: {
            income: prevIncome,
            expenses: prevExpenses,
          },
          changes: {
            incomeChange: prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome) * 100 : 0,
            expenseChange: prevExpenses > 0 ? ((totalExpenses - prevExpenses) / prevExpenses) * 100 : 0,
          },
        },
      };
    },
    enabled: !!user,
  });

  const exportToPDF = async () => {
    // Simple implementation - in production would use a PDF library
    const content = `
RELATÓRIO FINANCEIRO
Período: ${format(parseISO(dateRange.start), "dd/MM/yyyy", { locale: ptBR })} - ${format(parseISO(dateRange.end), "dd/MM/yyyy", { locale: ptBR })}

RESUMO
- Receitas: R$ ${reportData?.summary.totalIncome.toFixed(2)}
- Despesas: R$ ${reportData?.summary.totalExpenses.toFixed(2)}
- Saldo: R$ ${reportData?.summary.balance.toFixed(2)}
- Total de transações: ${reportData?.summary.transactionCount}

POR CATEGORIA
${reportData?.byCategory.map(c => `${c.category_icon} ${c.category_name}: R$ ${c.total.toFixed(2)} (${c.percentage.toFixed(1)}%)`).join('\n')}
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${dateRange.start}-${dateRange.end}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToExcel = async () => {
    // Simple CSV export
    const headers = ["Data", "Descrição", "Tipo", "Categoria", "Valor"];
    const rows = reportData?.timeline.map(t => [
      t.date,
      "",
      "",
      "",
      (t.income - t.expense).toFixed(2),
    ]) || [];

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${dateRange.start}-${dateRange.end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    reportData,
    isLoading,
    dateRange,
    setDateRange,
    categoryFilter,
    setCategoryFilter,
    typeFilter,
    setTypeFilter,
    exportToPDF,
    exportToExcel,
  };
}
