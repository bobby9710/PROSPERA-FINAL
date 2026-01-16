import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/financial-assistant`;

export function useConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["chat_conversations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as Conversation[];
    },
    enabled: !!user,
  });
}

export function useConversationMessages(conversationId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["chat_messages", conversationId],
    queryFn: async () => {
      if (!user || !conversationId) return [];
      
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!user && !!conversationId,
  });
}

export function useCreateConversation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title?: string) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("chat_conversations")
        .insert({
          user_id: user.id,
          title: title || "Nova conversa",
        })
        .select()
        .single();

      if (error) throw error;
      return data as Conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat_conversations"] });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("chat_conversations")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat_conversations"] });
      toast({
        title: "Conversa excluída",
        description: "A conversa foi removida com sucesso.",
      });
    },
  });
}

export function useSaveMessage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, role, content }: { conversationId: string; role: "user" | "assistant"; content: string }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          conversation_id: conversationId,
          user_id: user.id,
          role,
          content,
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation updated_at
      await supabase
        .from("chat_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      return data as Message;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chat_messages", variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["chat_conversations"] });
    },
  });
}

export function useStreamChat() {
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();

  const streamChat = useCallback(async ({
    messages,
    financialContext,
    onDelta,
    onDone,
    onError,
  }: {
    messages: { role: string; content: string }[];
    financialContext: any;
    onDelta: (text: string) => void;
    onDone: () => void;
    onError?: (error: Error) => void;
  }) => {
    setIsStreaming(true);

    try {
      // Get the user's session token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Usuário não autenticado");
      }

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ messages, financialContext }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          toast({
            title: "Limite atingido",
            description: "Muitas requisições. Aguarde alguns segundos.",
            variant: "destructive",
          });
        } else if (response.status === 402) {
          toast({
            title: "Créditos insuficientes",
            description: "Adicione créditos para continuar usando o assistente.",
            variant: "destructive",
          });
        }
        throw new Error(errorData.error || "Failed to start stream");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onDelta(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      onDone();
    } catch (error) {
      console.error("Stream chat error:", error);
      onError?.(error instanceof Error ? error : new Error("Unknown error"));
    } finally {
      setIsStreaming(false);
    }
  }, [toast]);

  return { streamChat, isStreaming };
}
