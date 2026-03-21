# Global Anti-Patterns — Prospera Evolution

## UX & Estratégia
1. **Páginas sem Objetivo:** Se a página não tem um CTA (Call to Action) principal, ela é um beco sem saída.
2. **Fricção Inútil:** Pedir dados que o sistema já tem ou poderia inferir.
3. **Navegação Surpresa:** Botões ou links que levam o usuário para onde ele não espera.
4. **Excesso de Modais:** Interromper o fluxo do usuário para comunicações não críticas.

## UI & Design
5. **Gradientes Sujos:** Cores que "brigam" ou criam banding visual.
6. **Sombras de Baixa Qualidade:** Usar sombreado preto puro (#000) e opaco no lugar de sombras suaves e coloridas (elevation).
7. **Mistura de Pesos:** Usar pesos tipográficos muito parecidos que não criam contraste (ex: 400 vs 500). Prefira saltos maiores (300 para 600).
8. **Respiro Insuficiente:** Elementos "colados" nas bordas ou uns nos outros, causando claustrofobia visual.

## Front-end
9. **Animações "Travadas":** Qualquer movimento que não rode a 60fps (stuttering).
10. **Hardcoding de Estilos:** Nunca use `px` fixos para cores ou margens se houver tokens/classes do Tailwind.
11. **Responsividade "Remendo":** Consertar o layout apenas em breakpoints específicos, deixando o site "quebrado" nas resoluções intermediárias.
12. **JS Bloqueante:** Scripts pesados que impedem o usuário de interagir enquanto o design carrega.

## Qualidade & Crítica
13. **Relato Vago:** Dizer "está feio" sem explicar o porquê técnico ou visual (Princípios).
14. **Ignorar Acessibilidade:** Aceitar designs que falham no contraste ou na navegabilidade por teclado em nome da "beleza".
15. **Status "Quase Pronto":** Aprovar algo com bugs conhecidos, esperando corrigir "depois". No Prospera, "Depois" nunca chega.

---
*Vigilância constante contra o amadorismo.*
