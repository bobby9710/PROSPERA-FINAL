import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  icon: string;
  color: string;
  deadline: string | null;
  priority: "low" | "medium" | "high";
  status: "active" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface CreateGoalData {
  name: string;
  target_amount: number;
  icon?: string;
  color?: string;
  deadline?: string;
  priority?: "low" | "medium" | "high";
}

export interface ContributeGoalData {
  goal_id: string;
  amount: number;
  notes?: string;
}

export function useGoals(status?: "active" | "completed" | "cancelled") {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["goals", user?.id, status],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Goal[];
    },
    enabled: !!user,
  });
}

export function useActiveGoals(limit?: number) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["goals", "active", user?.id, limit],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("priority", { ascending: false })
        .order("deadline", { ascending: true });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Goal[];
    },
    enabled: !!user,
  });
}

export function useCreateGoal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateGoalData) => {
      if (!user) throw new Error("User not authenticated");

      const { data: goal, error } = await supabase
        .from("goals")
        .insert({
          user_id: user.id,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      return goal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast({
        title: "Meta criada!",
        description: "Sua meta foi criada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar meta",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useContributeGoal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ContributeGoalData) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("goal_contributions")
        .insert({
          user_id: user.id,
          goal_id: data.goal_id,
          amount: data.amount,
          notes: data.notes,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast({
        title: "Contribuição adicionada!",
        description: "Sua contribuição foi registrada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao contribuir",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast({
        title: "Meta excluída",
        description: "A meta foi removida com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir meta",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateGoalStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "active" | "completed" | "cancelled" }) => {
      const { error } = await supabase
        .from("goals")
        .update({ 
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      if (status === "completed") {
        toast({
          title: "🎉 Meta concluída!",
          description: "Parabéns por atingir sua meta!",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar meta",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateGoalData> }) => {
      const { error } = await supabase
        .from("goals")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast({
        title: "Meta atualizada",
        description: "A meta foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar meta",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
