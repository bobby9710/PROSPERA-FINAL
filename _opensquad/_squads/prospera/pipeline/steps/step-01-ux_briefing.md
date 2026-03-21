---
execution: inline
agent: ux_strategist
inputFile: _opensquad/_memory/company.md
outputFile: squads/prospera/output/ux-briefing.md
---

# Passo 01: Briefing & Estratégia de Produto

## Context Loading
- `_opensquad/_memory/company.md` — Perfil da Prospera.
- `pipeline/data/research-brief.md` — Base de conhecimento UX.
- `pipeline/data/domain-framework.md` — Framework de evolução.

## Instructions

### Process
1. **Análise de Contexto** — Ler o pedido do usuário e o perfil da Prospera.
2. **Desenho de Estrutura** — Definir as seções da página, a hierarquia de informações e o fluxo de navegação.
3. **Escrita do Briefing** — Descrever o "porquê" de cada elemento e qual o objetivo (Job-to-be-Done) de cada seção.

## Output Format
```markdown
# UX Briefing: [Nome da Funcionalidade]

## Objetivo Central
[O que essa tela/fluxo resolve?]

## Hierarquia de Informação
1. [Elemento Primário] — [Razão]
2. [Elemento Secundário] — [Razão]
...

## Fluxo do Usuário
- Passo 1: [Ação] → Passo 2: [Reação/Página] ...

## Detalhes de Seção
### Seção [X]
- Elementos: [Lista]
- Requisito UX: [Ex: Manter contraste alto, botão fixo, etc.]

## Psicololgia & Conversão
[Quais gatilhos ou padrões mentais estamos utilizando?]
```

## Output Example
# UX Briefing: Tela de Dashboard Financeiro
## Objetivo Central
Oferecer ao usuário uma visão imediata da sua saúde financeira para que ele tome decisões rápidas de gasto e economia.
## Hierarquia de Informação
1. **Saldo e Resultado Mensal** — Visibilidade imediata de status.
2. **Gráfico de Saídas** — Identificação de padrões de consumo.
3. **Botão 'Transferir'** — Ação primária de movimentação.
## Fluxos
Abrir App → Visualizar Saldo → Identificar Gasto Alto → Clicar no Gráfico para detalhamento.
## Detalhes de Seção
### Header
- Elementos: Saldo Visível/Invisível (Toggle Eye), Nome do Usuário, Notificações.
- Requisito UX: Deve ser a primeira coisa visível, com contraste máximo.

## Veto Conditions
1. A estrutura não possui um CTA (Call to Action) claro.
2. O fluxo de navegação exige mais de 4 passos para a tarefa principal.

## Quality Criteria
- [ ] O briefing detalha o comportamento esperado em dispositivos mobile?
- [ ] A hierarquia visual está explícita e justificada?
- [ ] Foram considerados casos de erro (Edge Cases)?
