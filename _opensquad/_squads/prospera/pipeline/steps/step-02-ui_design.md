---
execution: inline
agent: art_director
inputFile: squads/prospera/output/ux-briefing.md
outputFile: squads/prospera/output/ui-design-spec.md
---

# Passo 02: Direção de Arte & Layout Premium

## Context Loading
- `squads/prospera/output/ux-briefing.md` — Briefing do Paulo Produto (UX).
- `pipeline/data/research-brief.md` — Base de conhecimento UI.
- `pipeline/data/domain-framework.md` — Framework de evolução.

## Instructions

### Process
1. **Tradução Visual** — Ler o briefing de UX e o objetivo da página.
2. **Aplicação do Stitch** — Selecionar os componentes adequados no sistema de design (Cards, Botões, etc.).
3. **Definição Estética** — Definir tons de cor, pesos tipográficos e níveis de elevação (sombras/blurs).

## Output Format
```markdown
# UI Design Spec: [Nome da Funcionalidade]

## Estética Geral
- **Estilo:** [Premium, Minimalista, Glassmorphism, etc.]
- **Tokens (Fundo):** [Cor/Gradiente]
- **Tokens (Componentes):** [Bordas, Sombras, Blurs]

## Layout & Composição
- Grid: [Colunas/Gaps]
- Espaçamento (Padding/Margin): [8/16/24/32px]
- Alinhamento: [Centralizado, Esquerda, etc.]

## Tipografia (Stitch)
- Títulos: [Peso/Cor/Tamanho]
- Corpo: [Peso/Cor/Tamanho]
- Labels: [Peso/Cor/Tamanho]

## Efeitos Premium
- Camadas: [Descrição de profundidade]
- Gradientes: [Cores herdeiras do sistema]
- Micro-detalhes: [Bordas de 1px, inner shadows, etc.]
```

## Output Example
# UI Design Spec: Dashboard Financeiro
## Estética Geral
- Estilo: Dark Mode Premium Stitch.
- Tokens (Fundo): #0F172A (Deep Navy).
- Tokens (Componentes): Card Glassmorphism (bg-white/5, blur-xl, rounded-3xl).
## Layout
- Grid: 12 colunas, Gap 24px.
- Espaçamento: Base 8px.
## Tipografia
- Títulos: Inter Bold, White/90%, 24px.
- Saldo: Inter ExtraBold, Primary/100%, 36px.
## Efeitos Premium
- Adicionar borda de 1px em todos os cards com linear-gradient(to bottom, white/10, transparent).
- Sombra suave (0 4px 12px -2px rgba(0,0,0,0.3)).

## Veto Conditions
1. O design ignora os tokens oficiais do sistema Stitch.
2. Não há distinção clara entre os modos Dark e Light (contrastes).

## Quality Criteria
- [ ] O visual transmite sensação de confiança e produto premium?
- [ ] A hierarquia definida no briefing de UX foi respeitada visualmente?
- [ ] Os ícones são consistentes em estilo e peso? (Material Symbols)
- [ ] O design é acessível por contraste e legibilidade? (WCAG)
