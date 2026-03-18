import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export const BANK_ICONS: Record<string, string> = {
  "nubank": "nubank.png",
  "itau": "itau.png",
  "bradesco": "bradesco.png",
  "bb": "bb.png",
  "santander": "santander.png",
  "inter": "intermedium.png",
  "c6": "c6bank.png",
  "neon": "neon.png",
  "pan": "pan.png",
  "pagbank": "pagbank.png",
  "next": "next.png",
  "picpay": "picpay.png",
  "mercadopago": "mercadopago.png",
  "sicoob": "sicoob.png",
  "sicredi": "sicredi.png",
  "agibank": "agibank.png",
  "banrisul": "banrisul.png",
  "visa": "visa.png",
  "mastercard": "mastercard.png",
  "elo": "elo.png",
  "hipercard": "hipercard.png",
  "amazon": "amazon.png",
  "carrefour": "carrefour.png",
  "99pay": "99Pay.png",
  "paypal": "paypal.png",
  "senff": "senff.png",
  "superdigital": "superdigital.png"
};

export interface CreditCard {
  id: string;
  user_id: string;
  name: string;
  last_digits: string;
  brand: string;
  credit_limit: number;
  closing_day: number;
  due_day: number;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCreditCardData {
  name: string;
  last_digits: string;
  brand?: string;
  credit_limit: number;
  closing_day: number;
  due_day: number;
  color?: string;
}

export function useCreditCards() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["credit_cards", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("credit_cards")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      return data as CreditCard[];
    },
    enabled: !!user,
  });
}

export function useCreditCardStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["credit_cards", "stats", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get all credit cards
      const { data: cards, error: cardsError } = await supabase
        .from("credit_cards")
        .select("*")
        .eq("user_id", user.id);

      if (cardsError) throw cardsError;

      // Get current month transactions for each card
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      const { data: transactions, error: transError } = await supabase
        .from("transactions")
        .select("credit_card_id, amount")
        .eq("user_id", user.id)
        .eq("type", "expense")
        .not("credit_card_id", "is", null)
        .gte("date", startOfMonth)
        .lte("date", endOfMonth);

      if (transError) throw transError;

      // Calculate used amount for each card
      return (cards as CreditCard[]).map(card => {
        const used = transactions
          .filter(t => t.credit_card_id === card.id)
          .reduce((acc, t) => acc + Number(t.amount), 0);
        
        return {
          ...card,
          used,
          available: Number(card.credit_limit) - used,
          currentBill: used,
          billStatus: "open" as const,
        };
      });
    },
    enabled: !!user,
  });
}

export function useCreateCreditCard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateCreditCardData) => {
      if (!user) throw new Error("User not authenticated");

      const { data: card, error } = await supabase
        .from("credit_cards")
        .insert({
          user_id: user.id,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      return card;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
      toast({
        title: "Cartão adicionado!",
        description: "Seu cartão foi cadastrado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar cartão",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteCreditCard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("credit_cards")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
      toast({
        title: "Cartão removido",
        description: "O cartão foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover cartão",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
