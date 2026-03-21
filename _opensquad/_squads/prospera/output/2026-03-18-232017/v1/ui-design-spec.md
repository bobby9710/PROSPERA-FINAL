# UI Design Spec: Dashboard Financeiro Premium (Stitch)

## Estética Geral
- **Estilo:** Dark Mode Moderno com Glassmorphism e alta profundidade.
- **Tokens (Fundo):** Slate-950 (#020617) como base; Gray-900 (#0f172a) para containers.
- **Tokens (Componentes):** Border-radius de 24px (xl-2xl), bordas sutis (white/10%), sombras difusas com glow primário.

## Layout & Composição
- **Grid:** 12 colunas com Gap de 24px.
- **Espaçamento:** Escala de 8px (p-4, p-6, p-8).
- **Alinhamento:** Flex containers com `items-center` e `justify-between` para clareza máxima.

## Tipografia (Stitch)
- **Títulos:** Inter Semibold, Slate-100, 20px - 24px.
- **Valores Financeiros:** Inter Bold, Slate-50, 24px - 32px.
- **Labels Negativas:** Red-500 (#ef4444) para fácil identificação de saídas.

## Efeitos Premium
- **Glassmorphism:** `bg-white/5 backdrop-blur-xl border-white/10`.
- **Gradientes:** Borda superior dos cards com `bg-gradient-to-r from-transparent via-primary/40 to-transparent`.
- **Interatividade:** Hovers com `scale-105` e `brightness-110` para feedback imediato.

---
*Assinado: Aline Aparência*
