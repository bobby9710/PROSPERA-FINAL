import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface Challenge {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: string;
  target_value: number | null;
  target_category_id: string | null;
  target_goal_id: string | null;
  start_date: string;
  end_date: string;
  current_progress: number;
  status: string;
  points_reward: number;
  created_at: string;
  updated_at: string;
}

export interface UserAchievements {
  id: string;
  user_id: string;
  total_points: number;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  user_id: string;
  badge_type: string;
  earned_at: string;
}

const BADGE_INFO: Record<string, { name: string; icon: string; description: string }> = {
  first_challenge: { name: "Primeiro Desafio", icon: "🏆", description: "Completou o primeiro desafio" },
  week_streak: { name: "Semana Perfeita", icon: "🔥", description: "7 dias consecutivos sem falhar" },
  saver_100: { name: "Economizador", icon: "💰", description: "Economizou R$ 100 em desafios" },
  saver_500: { name: "Super Economizador", icon: "💎", description: "Economizou R$ 500 em desafios" },
  five_challenges: { name: "Veterano", icon: "⭐", description: "Completou 5 desafios" },
  ten_challenges: { name: "Mestre", icon: "👑", description: "Completou 10 desafios" },
};

export function useChallenges() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: challenges = [], isLoading: loadingChallenges } = useQuery({
    queryKey: ["challenges", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Challenge[];
    },
    enabled: !!user,
  });

  const { data: achievements } = useQuery({
    queryKey: ["user_achievements", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("user_achievements")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      // Create if doesn't exist
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from("user_achievements")
          .insert({ user_id: user.id })
          .select()
          .single();
        if (insertError) throw insertError;
        return newData as UserAchievements;
      }
      
      return data as UserAchievements;
    },
    enabled: !!user,
  });

  const { data: badges = [] } = useQuery({
    queryKey: ["badges", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false });

      if (error) throw error;
      return data as Badge[];
    },
    enabled: !!user,
  });

  const createChallenge = useMutation({
    mutationFn: async (challenge: Omit<Challenge, "id" | "user_id" | "current_progress" | "status" | "created_at" | "updated_at">) => {
      if (!user) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from("challenges")
        .insert({ ...challenge, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      toast({ title: "Desafio criado!", description: "Boa sorte!" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível criar o desafio", variant: "destructive" });
    },
  });

  const updateProgress = useMutation({
    mutationFn: async ({ id, progress }: { id: string; progress: number }) => {
      const { data, error } = await supabase
        .from("challenges")
        .update({ current_progress: progress })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
    },
  });

  const completeChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      if (!user) throw new Error("User not authenticated");
      
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) throw new Error("Challenge not found");

      // Update challenge status
      const { error: updateError } = await supabase
        .from("challenges")
        .update({ status: "completed" })
        .eq("id", challengeId);

      if (updateError) throw updateError;

      // Add points
      const newPoints = (achievements?.total_points || 0) + challenge.points_reward;
      const newLevel = Math.floor(newPoints / 500) + 1;

      await supabase
        .from("user_achievements")
        .upsert({ 
          user_id: user.id, 
          total_points: newPoints,
          level: newLevel
        });

      // Check for badges
      const completedCount = challenges.filter(c => c.status === "completed").length + 1;
      
      if (completedCount === 1) {
        await supabase.from("badges").upsert({ user_id: user.id, badge_type: "first_challenge" });
      }
      if (completedCount === 5) {
        await supabase.from("badges").upsert({ user_id: user.id, badge_type: "five_challenges" });
      }
      if (completedCount === 10) {
        await supabase.from("badges").upsert({ user_id: user.id, badge_type: "ten_challenges" });
      }

      return challenge;
    },
    onSuccess: (challenge) => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      queryClient.invalidateQueries({ queryKey: ["user_achievements"] });
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      toast({ 
        title: "🎉 Desafio Completo!", 
        description: `Você ganhou ${challenge.points_reward} pontos!` 
      });
    },
  });

  const deleteChallenge = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("challenges").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      toast({ title: "Desafio removido" });
    },
  });

  return {
    challenges,
    loadingChallenges,
    achievements,
    badges,
    badgeInfo: BADGE_INFO,
    createChallenge,
    updateProgress,
    completeChallenge,
    deleteChallenge,
  };
}
