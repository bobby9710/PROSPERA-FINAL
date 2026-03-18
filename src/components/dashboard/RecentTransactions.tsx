import { ArrowDownLeft, ArrowUpRight, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { formatFriendlyDate } from "@/lib/date-utils";

interface Transaction {
  id: string;
  description: string;
  category: string;
  categoryIcon?: string;
  categoryColor?: string;
  amount: number;
  type: "income" | "expense";
  date: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return formatFriendlyDate(dateString);
  };

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-card animate-slide-up opacity-0" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
      <div className="flex items-center justify-between p-6 border-b border-border/50">
        <h3 className="font-semibold text-lg">Últimas Transações</h3>
        <Link
          to="/transactions"
          className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
        >
          Ver todas
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="divide-y divide-border/50">
        {transactions.map((transaction, index) => (
          <div
            key={transaction.id}
            className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
          >
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center p-2.5 shrink-0 shadow-sm",
                !transaction.categoryIcon && (
                  transaction.type === "income"
                    ? "bg-success text-white"
                    : "bg-destructive text-white"
                )
              )}
              style={transaction.categoryIcon ? { backgroundColor: transaction.categoryColor } : {}}
            >
              {transaction.categoryIcon?.endsWith('.svg') ? (
                <img 
                  src={`/icons/categorias/${transaction.type === 'income' ? 'receitas' : 'despesas'}/${transaction.categoryIcon}`} 
                  alt={transaction.category}
                  className="w-full h-full object-contain brightness-0 invert"
                />
              ) : transaction.categoryIcon ? (
                <span className="text-lg text-white font-bold">{transaction.categoryIcon}</span>
              ) : transaction.type === "income" ? (
                <ArrowDownLeft className="w-5 h-5" />
              ) : (
                <ArrowUpRight className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {transaction.description}
              </p>
              <p className="text-sm text-muted-foreground">{transaction.category}</p>
            </div>

            <div className="text-right">
              <p
                className={cn(
                  "font-semibold",
                  transaction.type === "income"
                    ? "text-success"
                    : "text-destructive"
                )}
              >
                {transaction.type === "income" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDate(transaction.date)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
