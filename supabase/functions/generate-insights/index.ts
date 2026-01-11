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
    const { type, financialData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let prompt = "";
    
    if (type === "monthly_analysis") {
      prompt = `Analise os dados financeiros do mês e gere um relatório detalhado em JSON.

DADOS DO MÊS:
- Total de Receitas: R$ ${financialData.income?.toFixed(2) || '0.00'}
- Total de Despesas: R$ ${financialData.expenses?.toFixed(2) || '0.00'}
- Saldo do Mês: R$ ${financialData.balance?.toFixed(2) || '0.00'}
- Mês Anterior - Despesas: R$ ${financialData.previousExpenses?.toFixed(2) || '0.00'}

Gastos por Categoria:
${financialData.categories?.map((c: any) => `- ${c.name}: R$ ${c.total?.toFixed(2)}`).join('\n') || 'Sem dados'}

Retorne APENAS um JSON válido com esta estrutura:
{
  "summary": "Resumo geral do mês em 2-3 frases",
  "comparison": "Comparação com mês anterior",
  "topCategories": [{"name": "categoria", "amount": 0, "trend": "up/down/stable"}],
  "savings": "Oportunidades de economia identificadas",
  "forecast": "Previsão para o próximo mês",
  "score": 0-100
}`;
    } else if (type === "spending_patterns") {
      prompt = `Analise os padrões de gastos e identifique tendências.

TRANSAÇÕES:
${financialData.transactions?.slice(0, 50).map((t: any) => 
  `${t.date} - ${t.description}: R$ ${t.amount} (${t.category})`
).join('\n') || 'Sem transações'}

Retorne APENAS um JSON válido:
{
  "recurringExpenses": [{"description": "nome", "amount": 0, "frequency": "mensal/semanal"}],
  "peakSpendingDays": ["segunda", "sexta"],
  "dominantCategory": "categoria mais gasta",
  "weeklyPattern": "descrição do padrão semanal",
  "monthlyTrend": "tendência mensal",
  "unusualTransactions": [{"description": "nome", "amount": 0, "reason": "motivo"}]
}`;
    } else if (type === "recommendations") {
      prompt = `Baseado nos dados financeiros, gere recomendações personalizadas.

PERFIL FINANCEIRO:
- Renda Mensal: R$ ${financialData.income?.toFixed(2) || '0.00'}
- Despesas Mensais: R$ ${financialData.expenses?.toFixed(2) || '0.00'}
- Reserva de Emergência: ${financialData.emergencyFundProgress || 0}%
- Metas em Andamento: ${financialData.activeGoals || 0}

Maiores Gastos:
${financialData.topExpenses?.map((e: any) => `- ${e.category}: R$ ${e.amount?.toFixed(2)}`).join('\n') || 'Sem dados'}

Retorne APENAS um JSON válido:
{
  "recommendations": [
    {
      "priority": "alta/média/baixa",
      "category": "categoria relacionada",
      "title": "título curto",
      "description": "descrição detalhada",
      "potentialSavings": 0,
      "action": "ação sugerida"
    }
  ],
  "budgetSuggestion": {
    "needs": 50,
    "wants": 30,
    "savings": 20
  },
  "goalSuggestion": "sugestão de nova meta baseada no perfil"
}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { 
            role: "system", 
            content: "Você é um analista financeiro especializado. Sempre retorne APENAS JSON válido, sem markdown ou texto adicional." 
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    
    // Parse JSON from response
    let insights;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      insights = JSON.parse(cleanContent);
    } catch {
      insights = { error: "Não foi possível processar os insights", raw: content };
    }

    return new Response(JSON.stringify({ insights, type }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generate insights error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
