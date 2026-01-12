import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface UserSettings {
  id: string;
  user_id: string;
  currency: string;
  date_format: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  theme: string;
  language: string;
  privacy_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateSettingsData {
  currency?: string;
  date_format?: string;
  notifications_enabled?: boolean;
  email_notifications?: boolean;
  push_notifications?: boolean;
  theme?: string;
  language?: string;
  privacy_mode?: boolean;
}

export function useSettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["settings", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      // If no settings exist, create default ones
      if (!data) {
        const { data: newSettings, error: insertError } = await supabase
          .from("user_settings")
          .insert({ user_id: user.id })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newSettings as UserSettings;
      }
      
      return data as UserSettings;
    },
    enabled: !!user,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateSettingsData) => {
      if (!user) throw new Error("User not authenticated");

      const { data: result, error } = await supabase
        .from("user_settings")
        .update(data)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast({
        title: "Configurações atualizadas",
        description: "Suas preferências foram salvas com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      });
    },
  });
}

export function useUpdatePassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      // First verify current password by trying to sign in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("User not found");

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Senha alterada",
        description: "Sua senha foi atualizada com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível alterar a senha",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteAccount() {
  const { toast } = useToast();
  const { signOut } = useAuth();

  return useMutation({
    mutationFn: async () => {
      // Note: Full account deletion typically requires admin privileges
      // For now, we sign out the user and they would need to contact support
      await signOut();
    },
    onSuccess: () => {
      toast({
        title: "Conta desativada",
        description: "Entre em contato com o suporte para excluir sua conta permanentemente",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível processar a solicitação",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { full_name?: string; avatar_url?: string }) => {
      if (!user) throw new Error("User not authenticated");

      const { data: result, error } = await supabase
        .from("profiles")
        .update(data)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as informações",
        variant: "destructive",
      });
    },
  });
}

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
