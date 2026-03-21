---
execution: subagent
agent: frontend_engineer
inputFile: squads/prospera/output/ui-design-spec.md
outputFile: squads/prospera/output/frontend-implementation.md
model_tier: powerful
---

# Passo 03: Implementação Front-end de Alta Fidelidade

## Context Loading
- `squads/prospera/output/ux-briefing.md` — Briefing do Paulo (UX)
- `squads/prospera/output/ui-design-spec.md` — Design da Aline (UI)
- `pipeline/data/research-brief.md` — Base de conhecimento Front
- `pipeline/data/domain-framework.md` — Framework de evolução

## Instructions

### Process
1. **Estrutura de Componente** — Ler o design e o briefing para definir a hierarquia no React.
2. **Escrita do Código (Tailwind)** — Implementar a UI fielmente usando as classes utilitárias.
3. **Animação & Estados** — Adicionar micro-interações (Framer Motion) e lógica de estado (React Query).

## Output Format
```markdown
# Front-end Implementation: [Nome da Funcionalidade]

## Estrutura de Componentes
[Esquema de arquivos/componentes criados]

## Implementação UI (Tailwind Snips)
[Principais trechos de CSS utilitário para review]

## Micro-interações (Animações)
[Descrição das transições implementadas]

## Notas de Performance/Responsividade
[O que foi feito para garantir fluidez]

## Código Completo (TSX)
[Bloco de código funcional]
```

## Output Example
# Front-end Implementation: Card de Saldo
## Estrutura
`src/components/dashboard/BalanceCard.tsx`
## Tailwind Snips
`className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl group transition-all duration-300 transform hover:scale-[1.02] shadow-xl"`
## Animações
`fade-in-up duration-500 delay-100` via Framer Motion.
## Código
```tsx
export const BalanceCard = ({ balance }) => {
  return (/* ... implementação pixel-perfect ... */);
};
```

## Veto Conditions
1. O código contém estilos fixos (hardcoded) sem usar tokens do Tailwind.
2. A responsividade está "quebrada" em resoluções comuns (Mobile/Tablet).

## Quality Criteria
- [ ] O código é pixel-perfect em relação ao design da Aline?
- [ ] A performance de renderização é rápida (60fps)?
- [ ] Os componentes são reutilizáveis e seguem o padrão SOLID?
- [ ] A acessibilidade (Aria-labels, tags semânticas) foi implementada? (WCAG)
