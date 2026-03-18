import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export const BANKS = {
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
  "amazon": "amazon.png",
  "carrefour": "carrefour.png",
  "99pay": "99Pay.png",
  "paypal": "paypal.png",
  "senff": "senff.png",
  "superdigital": "superdigital.png",
  "other": "credit-card"
};

export const BANK_COLORS: Record<string, string> = {
  "nubank": "#8B5CF6", // Roxo Nubank
  "itau": "#FF5F00", // Laranja Itaú
  "bradesco": "#CC092F", // Vermelho Bradesco
  "bb": "#FCFD01", // Amarelo BB (texto azul)
  "santander": "#EC0000", // Vermelho Santander
  "inter": "#FF7A00", // Laranja Inter
  "c6": "#212121", // Preto C6
  "neon": "#00E5FF", // Azul Neon
  "pan": "#000000", // Azul Pan
  "pagbank": "#FFD700", // Amarelo PagBank
  "next": "#00FF5F", // Verder Next
  "picpay": "#21C25E", // Verde PicPay
  "mercadopago": "#009EE3", // Azul Mercado Pago
  "sicoob": "#003641", // Verde Sicoob
  "sicredi": "#32BC71", // Verde Sicredi
  "agibank": "#00C2FF", // Azul Agibank
  "banrisul": "#0056A4", // Azul Banrisul
  "amazon": "#232F3E", // Azul Escuro Amazon
  "carrefour": "#00358e", // Azul Carrefour
  "99pay": "#FBC02D", // Amarelo 99
  "paypal": "#003087", // Azul PayPal
  "senff": "#111111", // Azul Senff
  "superdigital": "#00AEEF" // Azul Superdigital
};

export const BRANDS = {
  "visa": "visa.png",
  "mastercard": "mastercard.png",
  "master-black": "master-black.png",
  "elo": "elo.png",
  "hipercard": "hipercard.png"
};

export const BANK_ICONS: Record<string, string> = { ...BANKS, ...BRANDS };

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

export function useUpdateCreditCard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateCreditCardData> }) => {
      const { error } = await supabase
        .from("credit_cards")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
      toast({
        title: "Cartão atualizado",
        description: "As informações do cartão foram salvas.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar cartão",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
