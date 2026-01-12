import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_type: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export function useSubscription() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      // If no subscription exists, create default one
      if (!data) {
        const { data: newSub, error: insertError } = await supabase
          .from("subscriptions")
          .insert({ user_id: user.id })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newSub as Subscription;
      }
      
      return data as Subscription;
    },
    enabled: !!user,
  });
}

export function useIsPremium() {
  const { data: subscription } = useSubscription();
  
  return subscription?.plan_type === "premium" && subscription?.status === "active";
}

export function useCreateCheckout() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (priceId: string) => {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o checkout",
        variant: "destructive",
      });
    },
  });
}

export function useManageSubscription() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("customer-portal", {});

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível acessar o portal de assinatura",
        variant: "destructive",
      });
    },
  });
}
