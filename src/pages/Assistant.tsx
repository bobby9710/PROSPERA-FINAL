import { useState } from "react";
import { Send, Sparkles, User, Bot, Lightbulb } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  "Como estou gastando este mês?",
  "Posso comprar um iPhone?",
  "Dicas para economizar",
  "Análise meu perfil financeiro",
];

const mockMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Olá! 👋 Sou seu assistente financeiro pessoal. Posso te ajudar a entender melhor suas finanças, dar dicas de economia e responder qualquer dúvida sobre seu dinheiro. Como posso ajudar hoje?",
    timestamp: new Date(),
  },
];

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simular resposta da IA
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getAIResponse(inputValue),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (question: string): string => {
    const q = question.toLowerCase();
    
    if (q.includes("gastando") || q.includes("gasto")) {
      return "📊 Analisando seus gastos deste mês:\n\n• **Alimentação**: R$ 1.250 (29%)\n• **Transporte**: R$ 850 (20%)\n• **Moradia**: R$ 1.200 (28%)\n• **Lazer**: R$ 430 (10%)\n• **Outros**: R$ 500 (13%)\n\nSeus gastos com alimentação estão 15% acima da média dos últimos 3 meses. Quer algumas dicas para economizar nessa categoria?";
    }
    
    if (q.includes("iphone") || q.includes("comprar")) {
      return "🤔 Vamos analisar se você pode comprar um iPhone:\n\n• **Saldo disponível**: R$ 15.420\n• **iPhone 15 Pro**: ~R$ 8.000\n• **Reserva de emergência**: R$ 8.500 (57% da meta)\n\n⚠️ Comprar agora usaria 52% do seu saldo. Sugiro:\n1. Completar a reserva de emergência primeiro\n2. Ou criar uma meta específica e juntar R$ 800/mês por 10 meses\n\nQuer que eu crie essa meta para você?";
    }
    
    if (q.includes("economizar") || q.includes("dicas")) {
      return "💡 Aqui estão algumas dicas personalizadas para você:\n\n1. **Alimentação** - Você gasta R$ 1.250/mês. Cozinhar em casa pode economizar até 40%\n\n2. **Assinaturas** - Vi que você paga Netflix, Spotify e outros. Já pensou em planos família?\n\n3. **Transporte** - R$ 850/mês em Uber. Considere um cartão de transporte público\n\n4. **Regra 50-30-20** - Tente destinar:\n   • 50% para necessidades\n   • 30% para desejos\n   • 20% para investimentos\n\nQuer que eu monte um orçamento personalizado?";
    }
    
    if (q.includes("perfil") || q.includes("análise")) {
      return "📈 **Análise do seu Perfil Financeiro**\n\n**Pontos Fortes:**\n✅ Renda estável de R$ 8.500/mês\n✅ Metas financeiras definidas\n✅ 57% da reserva de emergência\n\n**Oportunidades:**\n🔶 Gastos variáveis acima da média\n🔶 Sem investimentos ainda\n🔶 Uso alto do cartão de crédito\n\n**Classificação:** Perfil Moderado\n\n**Recomendações:**\n1. Focar em completar a reserva\n2. Reduzir 10% dos gastos variáveis\n3. Começar a investir após a reserva\n\nPosso detalhar algum desses pontos?";
    }
    
    return "Entendi sua pergunta! Para te dar uma resposta mais precisa, preciso analisar seus dados financeiros. Você pode me perguntar sobre:\n\n• Seus gastos e categorias\n• Análise de compras\n• Dicas de economia\n• Seu perfil financeiro\n• Projeções e metas\n\nComo posso te ajudar?";
  };

  const handleSuggestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 animate-fade-in">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-primary">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Assistente IA</h1>
            <p className="text-sm text-muted-foreground">
              Seu consultor financeiro pessoal
            </p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
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
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="bg-card border border-border/50 shadow-card rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
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
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1"
          />
          <Button onClick={handleSend} className="btn-gradient px-4">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
