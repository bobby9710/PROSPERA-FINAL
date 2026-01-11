import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!imageBase64) {
      throw new Error("No image provided");
    }

    const prompt = `Você é um sistema de OCR especializado em extrair dados de comprovantes, notas fiscais e recibos brasileiros.

Analise a imagem e extraia as seguintes informações:
1. Valor total da compra/transação
2. Data da compra
3. Nome do estabelecimento/loja
4. Itens comprados (se visível na nota fiscal)
5. Forma de pagamento (se visível)
6. CNPJ do estabelecimento (se visível)

Retorne APENAS um JSON válido com esta estrutura (sem markdown):
{
  "success": true,
  "data": {
    "amount": 123.45,
    "date": "2024-01-15",
    "establishment": "Nome da Loja",
    "items": [
      {"name": "Produto 1", "quantity": 1, "price": 50.00},
      {"name": "Produto 2", "quantity": 2, "price": 36.72}
    ],
    "paymentMethod": "credit_card",
    "cnpj": "12.345.678/0001-90"
  },
  "confidence": 0.85
}

Se não conseguir extrair algum campo, use null.
Se não for um comprovante válido, retorne: {"success": false, "error": "Imagem não é um comprovante válido"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
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
    let result;
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      result = JSON.parse(cleanContent);
    } catch {
      result = { success: false, error: "Não foi possível processar a imagem", raw: content };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Scan receipt error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
