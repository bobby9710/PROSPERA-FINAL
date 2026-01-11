import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface BankConnection {
  id: string;
  user_id: string;
  bank_code: string;
  bank_name: string;
  account_number: string | null;
  status: "pending" | "connected" | "disconnected" | "error";
  last_sync_at: string | null;
  created_at: string;
}

export interface ImportedTransaction {
  id: string;
  user_id: string;
  bank_connection_id: string;
  external_id: string;
  amount: number;
  description: string;
  date: string;
  status: "pending" | "matched" | "imported" | "ignored";
  matched_transaction_id: string | null;
  match_score: number | null;
  raw_data: any;
  created_at: string;
}

// Brazilian banks list
export const brazilianBanks = [
  { code: "001", name: "Banco do Brasil", logo: "🏦" },
  { code: "033", name: "Santander", logo: "🔴" },
  { code: "104", name: "Caixa Econômica", logo: "🟦" },
  { code: "237", name: "Bradesco", logo: "🔵" },
  { code: "341", name: "Itaú Unibanco", logo: "🟠" },
  { code: "260", name: "Nubank", logo: "💜" },
  { code: "077", name: "Inter", logo: "🟧" },
  { code: "212", name: "Banco Original", logo: "🟢" },
  { code: "336", name: "C6 Bank", logo: "⬛" },
  { code: "290", name: "PagBank", logo: "💛" },
  { code: "380", name: "PicPay", logo: "💚" },
  { code: "323", name: "Mercado Pago", logo: "💙" },
];

export function useBankConnections() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["bank_connections", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("bank_connections")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BankConnection[];
    },
    enabled: !!user,
  });
}

export function useImportedTransactions(bankConnectionId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["imported_transactions", user?.id, bankConnectionId],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from("imported_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (bankConnectionId) {
        query = query.eq("bank_connection_id", bankConnectionId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ImportedTransaction[];
    },
    enabled: !!user,
  });
}

export function useConnectBank() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ bankCode, bankName }: { bankCode: string; bankName: string }) => {
      if (!user) throw new Error("User not authenticated");

      // In a real implementation, this would initiate OAuth flow
      // For now, we simulate the connection
      const { data, error } = await supabase
        .from("bank_connections")
        .insert({
          user_id: user.id,
          bank_code: bankCode,
          bank_name: bankName,
          status: "connected",
          last_sync_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bank_connections"] });
      toast({
        title: "Banco conectado!",
        description: `${variables.bankName} foi conectado com sucesso.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao conectar banco",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDisconnectBank() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("bank_connections")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank_connections"] });
      toast({
        title: "Banco desconectado",
        description: "A conexão foi removida com sucesso.",
      });
    },
  });
}

export function useSyncBank() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (connectionId: string) => {
      if (!user) throw new Error("User not authenticated");

      // Simulate fetching transactions from bank
      // In a real implementation, this would call the bank's API
      const mockTransactions = generateMockBankTransactions();

      for (const trans of mockTransactions) {
        await supabase
          .from("imported_transactions")
          .insert({
            user_id: user.id,
            bank_connection_id: connectionId,
            external_id: trans.external_id,
            amount: trans.amount,
            description: trans.description,
            date: trans.date,
            status: "pending",
            raw_data: trans,
          });
      }

      // Update last sync time
      await supabase
        .from("bank_connections")
        .update({ last_sync_at: new Date().toISOString() })
        .eq("id", connectionId);

      return mockTransactions.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["bank_connections"] });
      queryClient.invalidateQueries({ queryKey: ["imported_transactions"] });
      toast({
        title: "Sincronização concluída",
        description: `${count} transações importadas.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro na sincronização",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useMatchTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      importedId, 
      transactionId, 
      action 
    }: { 
      importedId: string; 
      transactionId?: string; 
      action: "match" | "ignore" | "create" 
    }) => {
      if (action === "match" && transactionId) {
        const { error } = await supabase
          .from("imported_transactions")
          .update({ 
            status: "matched", 
            matched_transaction_id: transactionId 
          })
          .eq("id", importedId);
        if (error) throw error;
      } else if (action === "ignore") {
        const { error } = await supabase
          .from("imported_transactions")
          .update({ status: "ignored" })
          .eq("id", importedId);
        if (error) throw error;
      } else if (action === "create") {
        const { error } = await supabase
          .from("imported_transactions")
          .update({ status: "imported" })
          .eq("id", importedId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["imported_transactions"] });
      toast({
        title: "Transação processada",
        description: "A transação foi processada com sucesso.",
      });
    },
  });
}

function generateMockBankTransactions() {
  const descriptions = [
    "PIX RECEBIDO",
    "TED ENVIADA",
    "PAGAMENTO BOLETO",
    "COMPRA DEBITO",
    "SAQUE ATM",
    "TRANSFERENCIA",
  ];

  const transactions = [];
  const today = new Date();

  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    transactions.push({
      external_id: `ext_${Date.now()}_${i}`,
      amount: (Math.random() * 500 + 50).toFixed(2),
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      date: date.toISOString().split('T')[0],
    });
  }

  return transactions;
}
