---
execution: subagent
agent: qa_critic
inputFile: squads/prospera/output/frontend-implementation.md
outputFile: squads/prospera/output/qa-veredito.md
model_tier: powerful
---

# Passo 04: Veredito de Qualidade & Polimento

## Context Loading
- `squads/prospera/output/ux-briefing.md` — Briefing original do Paulo (UX)
- `squads/prospera/output/ui-design-spec.md` — Design original da Aline (UI)
- `squads/prospera/output/frontend-implementation.md` — Código final do Fabio (Front)
- `pipeline/data/quality-criteria.md` — Critérios de qualidade e pontuação
- `pipeline/data/research-brief.md` — Base de conhecimento Crítica

## Instructions

### Process
1. **Auditoria de Fidelidade** — Comparar o código final com o design e os planos iniciais.
2. **Revisão Técnica & Visual** — Verificar contrastes, animações, responsividade e amadorismo.
3. **Emissão do Veredito** — Atribuir nota de 0 a 100 e listar melhorias críticas.

## Output Format
```markdown
# Relatório de Veredito: [Nome da Funcionalidade]

## Status Final
[PREMIUM | AJUSTES NECESSÁRIOS | REPROVADO]

## Pontuação de Qualidade (0-100)
- UX & Estratégia: [Nota/30]
- UI & Estética: [Nota/30]
- Implementação & Performance: [Nota/20]
- Conversão & Polimento: [Nota/20]
**TOTAL: [SOMA]**

## Críticas & Ajustes (Prioridade Alta/Média/Baixa)
1. **[Alta]** [Descrição do problema + Solução sugerida]
2. **[Média]** [Descrição + Solução]
...

## Checklist de Conformidade
- [x/ ] Fidelidade Visual (Design vs. Código)
- [x/ ] Acessibilidade (WCAG)
- [x/ ] Responsividade Real (Fluidez)
- [x/ ] Micro-detalhes Premium (Stitch)

## Veredito Final
[Texto conclusivo autorizando ou vetando a publicação]
```

## Output Example
# Relatório de Veredito: Card de Saldo
## Status
✅ PREMIUM
## Pontuação
Total: 96/100.
## Críticas
- **[Baixa]** Aumentar o delay da animação em 50ms para sincronia visual.
## Veredito
O componente está impecável, segue todos os tokens Stitch e possui performance excelente. Aprovado para produção.

## Veto Conditions
1. Existem falhas graves de responsividade (elementos sobrepostos).
2. O contraste de cores falha nos padrões mínimos de acessibilidade (WCAG).

## Quality Criteria
- [ ] A crítica é baseada em princípios técnicos e evidências concretas?
- [ ] O relatório aponta exatamente *como* corrigir cada problema encontrado?
- [ ] Foram considerados Edge Cases e visualização em telas extremas? (ex: 320px)
- [ ] O produto final está com cara de "premium" ou "template genérico"? (Vibe Check)
