import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, financialContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt with financial context
    const systemPrompt = `Você é um assistente financeiro pessoal inteligente e amigável. Seu nome é FinBot.
    
DADOS FINANCEIROS DO USUÁRIO:
${financialContext ? `
- Saldo Total: R$ ${financialContext.totalBalance?.toFixed(2) || '0.00'}
- Receitas do Mês: R$ ${financialContext.monthlyIncome?.toFixed(2) || '0.00'}
- Despesas do Mês: R$ ${financialContext.monthlyExpenses?.toFixed(2) || '0.00'}
- Total de Metas: ${financialContext.goalsCount || 0}
- Progresso Médio das Metas: ${financialContext.goalsProgress?.toFixed(0) || 0}%
- Cartões de Crédito: ${financialContext.creditCardsCount || 0}
- Limite Total de Crédito: R$ ${financialContext.totalCreditLimit?.toFixed(2) || '0.00'}
- Uso Total de Crédito: R$ ${financialContext.totalCreditUsed?.toFixed(2) || '0.00'}

TRANSAÇÕES RECENTES:
${financialContext.recentTransactions?.map((t: any) => 
  `- ${t.type === 'expense' ? 'Despesa' : 'Receita'}: R$ ${t.amount} - ${t.description} (${t.category || 'Sem categoria'})`
).join('\n') || 'Nenhuma transação recente'}

GASTOS POR CATEGORIA:
${financialContext.categoryBreakdown?.map((c: any) => 
  `- ${c.name}: R$ ${c.total?.toFixed(2)} (${c.percentage?.toFixed(1)}%)`
).join('\n') || 'Sem dados de categorias'}

METAS FINANCEIRAS:
${financialContext.goals?.map((g: any) => 
  `- ${g.name}: R$ ${g.current_amount?.toFixed(2)} / R$ ${g.target_amount?.toFixed(2)} (${((g.current_amount / g.target_amount) * 100).toFixed(0)}%)`
).join('\n') || 'Nenhuma meta definida'}
` : 'Dados financeiros não disponíveis.'}

INSTRUÇÕES:
1. Sempre responda em português brasileiro de forma amigável e acessível
2. Use emojis para tornar a conversa mais agradável
3. Baseie suas respostas nos dados financeiros reais do usuário quando disponíveis
4. Dê dicas práticas e personalizadas
5. Se não souber algo, seja honesto e sugira alternativas
6. Formate suas respostas com markdown quando apropriado (listas, negrito, etc)
7. Seja proativo em sugerir melhorias financeiras
8. Nunca invente dados que não foram fornecidos`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Por favor, adicione créditos à sua conta." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao conectar com o assistente IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Financial assistant error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
