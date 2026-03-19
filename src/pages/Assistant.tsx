import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, Bot, Lightbulb, Plus, Trash2, MessageSquare } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  useConversations,
  useConversationMessages,
  useCreateConversation,
  useDeleteConversation,
  useSaveMessage,
  useStreamChat
} from "@/hooks/useChat";
import { useFinancialContext } from "@/hooks/useFinancialContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const suggestedQuestions = [
  "Como estou gastando este mês?",
  "Posso comprar um iPhone?",
  "Dicas para economizar",
  "Análise meu perfil financeiro",
];

const welcomeMessage: LocalMessage = {
  id: "welcome",
  role: "assistant",
  content: "Olá! 👋 Sou seu assistente financeiro pessoal. Posso te ajudar a entender melhor suas finanças, dar dicas de economia e responder qualquer dúvida sobre seu dinheiro. Como posso ajudar hoje?",
};

export default function Assistant() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([welcomeMessage]);
  const [inputValue, setInputValue] = useState("");
  const [deleteConversationId, setDeleteConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading: conversationsLoading } = useConversations();
  const { data: dbMessages = [] } = useConversationMessages(activeConversationId);
  const { data: financialContext } = useFinancialContext();

  const createConversation = useCreateConversation();
  const deleteConversation = useDeleteConversation();
  const saveMessage = useSaveMessage();
  const { streamChat, isStreaming } = useStreamChat();

  // Update local messages when DB messages change
  useEffect(() => {
    if (activeConversationId && dbMessages.length > 0) {
      setLocalMessages(dbMessages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
      })));
    } else if (!activeConversationId) {
      setLocalMessages([welcomeMessage]);
    }
  }, [dbMessages, activeConversationId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const handleNewConversation = async () => {
    const newConv = await createConversation.mutateAsync("Nova conversa");
    setActiveConversationId(newConv.id);
    setLocalMessages([welcomeMessage]);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  const handleDeleteConversation = async () => {
    if (deleteConversationId) {
      await deleteConversation.mutateAsync(deleteConversationId);
      if (activeConversationId === deleteConversationId) {
        setActiveConversationId(null);
        setLocalMessages([welcomeMessage]);
      }
      setDeleteConversationId(null);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isStreaming) return;

    const userContent = inputValue.trim();
    setInputValue("");

    // Create conversation if needed
    let conversationId = activeConversationId;
    if (!conversationId) {
      const newConv = await createConversation.mutateAsync(userContent.slice(0, 50));
      conversationId = newConv.id;
      setActiveConversationId(conversationId);
    }

    // Add user message locally
    const userMessage: LocalMessage = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content: userContent,
    };
    setLocalMessages(prev => [...prev, userMessage]);

    // Save user message to DB
    await saveMessage.mutateAsync({
      conversationId,
      role: "user",
      content: userContent,
    });

    // Prepare messages for AI
    const messagesForAI = localMessages
      .filter(m => m.id !== "welcome")
      .concat(userMessage)
      .map(m => ({ role: m.role, content: m.content }));

    // Add assistant message placeholder
    const assistantId = `temp-assistant-${Date.now()}`;
    setLocalMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    let fullResponse = "";

    await streamChat({
      messages: messagesForAI,
      financialContext,
      onDelta: (text) => {
        fullResponse += text;
        setLocalMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, content: fullResponse } : m)
        );
      },
      onDone: async () => {
        // Save assistant message to DB
        if (conversationId && fullResponse) {
          await saveMessage.mutateAsync({
            conversationId,
            role: "assistant",
            content: fullResponse,
          });
        }
      },
      onError: () => {
        setLocalMessages(prev =>
          prev.map(m => m.id === assistantId
            ? { ...m, content: "Desculpe, ocorreu um erro. Por favor, tente novamente." }
            : m
          )
        );
      },
    });
  };

  const handleSuggestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-12rem)] sm:h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] gap-4">
        {/* Sidebar - Conversations */}
        <div className="hidden md:flex flex-col w-64 bg-card rounded-xl border border-border/50 p-4">
          <Button
            onClick={handleNewConversation}
            className="w-full mb-4 gap-2"
            disabled={createConversation.isPending}
          >
            <Plus className="w-4 h-4" />
            Nova Conversa
          </Button>

          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg cursor-pointer group transition-colors",
                    activeConversationId === conv.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  )}
                  onClick={() => handleSelectConversation(conv.id)}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="flex-1 truncate text-sm">{conv.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConversationId(conv.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              ))}
              {conversations.length === 0 && !conversationsLoading && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma conversa ainda
                </p>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4 animate-fade-in">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-primary">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Assistente IA</h1>
              <p className="text-sm text-muted-foreground">
                Seu consultor financeiro pessoal
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto md:hidden"
              onClick={handleNewConversation}
            >
              <Plus className="w-4 h-4 mr-1" />
              Nova
            </Button>
          </div>

          {/* Chat Messages */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 pb-4">
              {localMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 animate-fade-in",
                    message.role === "user" && "flex-row-reverse"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      message.role === "user"
                        ? "bg-primary"
                        : "bg-gradient-to-br from-primary to-secondary"
                    )}
                  >
                    {message.role === "user" ? (
                      <User className="w-4 h-4 text-primary-foreground" />
                    ) : (
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border/50 shadow-card"
                    )}
                  >
                    <p className="whitespace-pre-line text-sm leading-relaxed">
                      {message.content || (
                        <span className="flex gap-1">
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Suggestions */}
          {localMessages.length <= 1 && (
            <div className="mb-4 animate-slide-up">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-warning" />
                <span className="text-sm text-muted-foreground">Sugestões</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestion(question)}
                    className="px-4 py-2 rounded-full bg-muted hover:bg-accent text-sm font-medium transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite sua pergunta..."
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              disabled={isStreaming}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              className="btn-gradient px-4"
              disabled={isStreaming || !inputValue.trim()}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConversationId} onOpenChange={() => setDeleteConversationId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conversa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todas as mensagens serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConversation} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
